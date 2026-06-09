// api.js — thin client for the Wishful backend. When VITE_API_URL is unset the
// app runs fully local (no sync, no push); everything here is simply unused.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const API_CONFIGURED = !!BASE;
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

async function req(method, path, body) {
  const r = await fetch(BASE + path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, ok: r.ok, data };
}

export const api = {
  pairNew: () => req('POST', '/pair/new'),
  pairJoin: (code) => req('POST', '/pair/join', { code }),
  presence: (spaceId, user) => req('POST', '/pair/presence', { spaceId, user }),
  getState: (spaceId, v) => req('GET', `/state?spaceId=${encodeURIComponent(spaceId)}${v ? `&v=${v}` : ''}`),
  putState: (spaceId, baseV, doc) => req('PUT', '/state', { spaceId, baseV, ...doc }),
  subscribePush: (spaceId, user, subscription) => req('POST', '/push/subscribe', { spaceId, user, subscription }),
  notify: (spaceId, toUser, title, body, itemId) => req('POST', '/notify', { spaceId, toUser, title, body, itemId }),
};
