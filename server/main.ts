// Wishful backend — Deno Deploy + Deno KV + Web Push (VAPID).
//
// Free to host: deploy this file to https://deno.com/deploy (no credit card).
// It gives the two-person app a shared, synced data space and sends real push
// notifications to the other partner's phone when you comment on their wish.
//
// Env vars (set in the Deno Deploy dashboard → Settings → Environment Variables):
//   VAPID_PUBLIC_KEY   - public VAPID key (same one the client uses)
//   VAPID_PRIVATE_KEY  - private VAPID key (keep secret)
//   VAPID_SUBJECT      - a "mailto:you@example.com" or your site URL
//   ALLOW_ORIGIN       - (optional) exact origin of your web app, or "*" (default)
//
// Storage model (Deno KV):
//   ['space', spaceId]            -> { code, v, lists, items, notifications, profiles, ... }
//   ['code', code]                -> spaceId           (for joining by code)
//   ['subs', spaceId, user, hash] -> PushSubscription   (a device's push endpoint)

import webpush from 'web-push';

const kv = await Deno.openKv();

const PUB = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const PRIV = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@wishful.app';
const ALLOW_ORIGIN = Deno.env.get('ALLOW_ORIGIN') || '*';
const pushEnabled = !!(PUB && PRIV);
if (pushEnabled) webpush.setVapidDetails(SUBJECT, PUB, PRIV);

const CORS = {
  'access-control-allow-origin': ALLOW_ORIGIN,
  'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...CORS } });

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no easily-confused chars
const makeCode = () => Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

function freshSpace(code: string) {
  return {
    code, v: 1, createdAt: Date.now(), updatedAt: Date.now(),
    lists: [], items: [], notifications: [],
    profiles: { rafael: { name: 'Rafael', avatar: null }, thrisha: { name: 'Thrisha', avatar: null } },
  };
}

async function hash(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  try {
    // ── health / config
    if (path === '/' || path === '/health') return json({ ok: true, pushEnabled });
    if (path === '/vapidPublicKey') return json({ key: PUB });

    // ── pairing: create a new shared space
    if (path === '/pair/new' && req.method === 'POST') {
      let code = makeCode();
      for (let i = 0; i < 5; i++) { if (!(await kv.get(['code', code])).value) break; code = makeCode(); }
      const spaceId = crypto.randomUUID();
      const doc = freshSpace(code);
      await kv.atomic().set(['space', spaceId], doc).set(['code', code], spaceId).commit();
      return json({ spaceId, code });
    }

    // ── pairing: join an existing space by code
    if (path === '/pair/join' && req.method === 'POST') {
      const { code } = await req.json().catch(() => ({}));
      if (!code) return json({ error: 'code required' }, 400);
      const found = await kv.get<string>(['code', String(code).toUpperCase().trim()]);
      if (!found.value) return json({ error: 'not found' }, 404);
      const doc = await kv.get(['space', found.value]);
      if (!doc.value) return json({ error: 'not found' }, 404);
      return json({ spaceId: found.value });
    }

    // ── read shared state (with cheap version check for polling)
    if (path === '/state' && req.method === 'GET') {
      const spaceId = url.searchParams.get('spaceId') || '';
      const since = Number(url.searchParams.get('v') || 0);
      const entry = await kv.get<any>(['space', spaceId]);
      if (!entry.value) return json({ error: 'not found' }, 404);
      const d = entry.value;
      if (since && since === d.v) return json({ unchanged: true, v: d.v });
      return json({ v: d.v, lists: d.lists, items: d.items, notifications: d.notifications, profiles: d.profiles });
    }

    // ── write shared state (optimistic concurrency on version)
    if (path === '/state' && req.method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const { spaceId, baseV, lists, items, notifications, profiles } = body;
      const key = ['space', spaceId];
      const entry = await kv.get<any>(key);
      if (!entry.value) return json({ error: 'not found' }, 404);
      const d = entry.value;
      if (typeof baseV === 'number' && baseV !== d.v) {
        // caller is behind — hand back the current truth so it can reconcile
        return json({ conflict: true, v: d.v, lists: d.lists, items: d.items, notifications: d.notifications, profiles: d.profiles }, 409);
      }
      const next = {
        ...d,
        lists: lists ?? d.lists, items: items ?? d.items,
        notifications: notifications ?? d.notifications, profiles: profiles ?? d.profiles,
        v: d.v + 1, updatedAt: Date.now(),
      };
      const res = await kv.atomic().check({ key, versionstamp: entry.versionstamp }).set(key, next).commit();
      if (!res.ok) return json({ conflict: true, v: d.v, lists: d.lists, items: d.items, notifications: d.notifications, profiles: d.profiles }, 409);
      return json({ v: next.v });
    }

    // ── register a device for push
    if (path === '/push/subscribe' && req.method === 'POST') {
      const { spaceId, user, subscription } = await req.json().catch(() => ({}));
      if (!spaceId || !user || !subscription?.endpoint) return json({ error: 'bad request' }, 400);
      const h = await hash(subscription.endpoint);
      await kv.set(['subs', spaceId, user, h], subscription);
      return json({ ok: true, pushEnabled });
    }

    // ── send a push to the partner (called when a comment is left on their wish)
    if (path === '/notify' && req.method === 'POST') {
      const { spaceId, toUser, title, body, itemId } = await req.json().catch(() => ({}));
      if (!spaceId || !toUser) return json({ error: 'bad request' }, 400);
      if (!pushEnabled) return json({ sent: 0, disabled: true });
      const payload = JSON.stringify({ title: title || 'Wishful', body: body || '', itemId: itemId || null });
      let sent = 0;
      const dead: Deno.KvKey[] = [];
      for await (const e of kv.list<any>({ prefix: ['subs', spaceId, toUser] })) {
        try { await webpush.sendNotification(e.value, payload); sent++; }
        catch (err: any) { if (err?.statusCode === 404 || err?.statusCode === 410) dead.push(e.key); }
      }
      for (const k of dead) await kv.delete(k);
      return json({ sent });
    }

    return json({ error: 'not found' }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: 'server error' }, 500);
  }
}

Deno.serve({ port: Number(Deno.env.get('PORT') || 8000) }, handler);
