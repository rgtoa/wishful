// Wishful backend — Deno Deploy + Upstash Redis (persistent) + Web Push (VAPID).
//
// Storage is Upstash Redis (free, no card) so paired spaces and data survive
// every redeploy. Deno Deploy's built-in KV turned out to be per-deployment here
// (wiped on each build), which is why pairing codes stopped working — Redis fixes
// that. Falls back to an in-memory store locally when Upstash isn't configured.
//
// Env vars (set in Deno Deploy → Settings → Environment Variables):
//   UPSTASH_REDIS_REST_URL    - from the Upstash database "REST API" panel
//   UPSTASH_REDIS_REST_TOKEN  - from the same panel (keep secret)
//   VAPID_PUBLIC_KEY          - public VAPID key (same one the client uses)
//   VAPID_PRIVATE_KEY         - private VAPID key (secret)
//   VAPID_SUBJECT             - "mailto:you@example.com"
//   ALLOW_ORIGIN              - your app origin, or "*"

import webpush from 'web-push';

// ── push config
const PUB = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const PRIV = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@wishful.app';
const ALLOW_ORIGIN = Deno.env.get('ALLOW_ORIGIN') || '*';
const pushEnabled = !!(PUB && PRIV);
if (pushEnabled) webpush.setVapidDetails(SUBJECT, PUB, PRIV);

// ── storage: Upstash Redis REST, or in-memory locally
const RURL = (Deno.env.get('UPSTASH_REDIS_REST_URL') || '').replace(/\/+$/, '');
const RTOK = Deno.env.get('UPSTASH_REDIS_REST_TOKEN') || '';
const useRedis = !!(RURL && RTOK);

async function redis(...cmd: (string | number)[]) {
  const r = await fetch(RURL, { method: 'POST', headers: { Authorization: `Bearer ${RTOK}` }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error('redis: ' + j.error);
  return j.result;
}

const mem = { kv: new Map<string, string>(), sets: new Map<string, Set<string>>() };

const store = {
  async get(key: string): Promise<string | null> {
    if (useRedis) return (await redis('GET', key)) ?? null;
    return mem.kv.has(key) ? mem.kv.get(key)! : null;
  },
  async set(key: string, val: string) {
    if (useRedis) { await redis('SET', key, val); return; }
    mem.kv.set(key, val);
  },
  async sadd(key: string, member: string) {
    if (useRedis) { await redis('SADD', key, member); return; }
    if (!mem.sets.has(key)) mem.sets.set(key, new Set());
    mem.sets.get(key)!.add(member);
  },
  async smembers(key: string): Promise<string[]> {
    if (useRedis) return (await redis('SMEMBERS', key)) || [];
    return [...(mem.sets.get(key) || [])];
  },
  async srem(key: string, member: string) {
    if (useRedis) { await redis('SREM', key, member); return; }
    mem.sets.get(key)?.delete(member);
  },
};

// ── http helpers
const CORS = {
  'access-control-allow-origin': ALLOW_ORIGIN,
  'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...CORS } });

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () => Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

function freshSpace(code: string) {
  return {
    code, v: 1, createdAt: Date.now(), updatedAt: Date.now(),
    lists: [], items: [], notifications: [],
    profiles: { rafael: { name: 'Rafael', avatar: null }, thrisha: { name: 'Thrisha', avatar: null } },
  };
}
const getSpace = async (id: string) => { const s = await store.get('space:' + id); return s ? JSON.parse(s) : null; };
const putSpace = (id: string, doc: unknown) => store.set('space:' + id, JSON.stringify(doc));

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  try {
    if (path === '/' || path === '/health') return json({ ok: true, pushEnabled, store: useRedis ? 'redis' : 'memory' });
    if (path === '/vapidPublicKey') return json({ key: PUB });

    // create a new shared space
    if (path === '/pair/new' && req.method === 'POST') {
      let code = makeCode();
      for (let i = 0; i < 5; i++) { if (!(await store.get('code:' + code))) break; code = makeCode(); }
      const spaceId = crypto.randomUUID();
      await putSpace(spaceId, freshSpace(code));
      await store.set('code:' + code, spaceId);
      return json({ spaceId, code });
    }

    // join an existing space by code
    if (path === '/pair/join' && req.method === 'POST') {
      const { code } = await req.json().catch(() => ({}));
      if (!code) return json({ error: 'code required' }, 400);
      const spaceId = await store.get('code:' + String(code).toUpperCase().trim());
      if (!spaceId) return json({ error: 'not found' }, 404);
      if (!(await getSpace(spaceId))) return json({ error: 'not found' }, 404);
      return json({ spaceId });
    }

    // read shared state (cheap version check for polling)
    if (path === '/state' && req.method === 'GET') {
      const spaceId = url.searchParams.get('spaceId') || '';
      const since = Number(url.searchParams.get('v') || 0);
      const d = await getSpace(spaceId);
      if (!d) return json({ error: 'not found' }, 404);
      if (since && since === d.v) return json({ unchanged: true, v: d.v });
      return json({ v: d.v, lists: d.lists, items: d.items, notifications: d.notifications, profiles: d.profiles });
    }

    // write shared state (optimistic concurrency on version)
    if (path === '/state' && req.method === 'PUT') {
      const { spaceId, baseV, lists, items, notifications, profiles } = await req.json().catch(() => ({}));
      const d = await getSpace(spaceId);
      if (!d) return json({ error: 'not found' }, 404);
      if (typeof baseV === 'number' && baseV !== d.v) {
        return json({ conflict: true, v: d.v, lists: d.lists, items: d.items, notifications: d.notifications, profiles: d.profiles }, 409);
      }
      const next = {
        ...d,
        lists: lists ?? d.lists, items: items ?? d.items,
        notifications: notifications ?? d.notifications, profiles: profiles ?? d.profiles,
        v: d.v + 1, updatedAt: Date.now(),
      };
      await putSpace(spaceId, next);
      return json({ v: next.v });
    }

    // register a device for push
    if (path === '/push/subscribe' && req.method === 'POST') {
      const { spaceId, user, subscription } = await req.json().catch(() => ({}));
      if (!spaceId || !user || !subscription?.endpoint) return json({ error: 'bad request' }, 400);
      await store.sadd(`subs:${spaceId}:${user}`, JSON.stringify(subscription));
      return json({ ok: true, pushEnabled });
    }

    // send a push to the partner (called when a comment is left on their wish)
    if (path === '/notify' && req.method === 'POST') {
      const { spaceId, toUser, title, body, itemId } = await req.json().catch(() => ({}));
      if (!spaceId || !toUser) return json({ error: 'bad request' }, 400);
      if (!pushEnabled) return json({ sent: 0, disabled: true });
      const payload = JSON.stringify({ title: title || 'Wishful', body: body || '', itemId: itemId || null });
      const key = `subs:${spaceId}:${toUser}`;
      let sent = 0;
      for (const raw of await store.smembers(key)) {
        try { await webpush.sendNotification(JSON.parse(raw), payload); sent++; }
        catch (err: any) { if (err?.statusCode === 404 || err?.statusCode === 410) await store.srem(key, raw); }
      }
      return json({ sent });
    }

    return json({ error: 'not found' }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: 'server error' }, 500);
  }
}

Deno.serve({ port: Number(Deno.env.get('PORT') || 8000) }, handler);
