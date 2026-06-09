// sw.js — custom service worker (vite-plugin-pwa injectManifest).
// Precaches the built app for offline use and handles Web Push so the partner
// gets a real notification on their phone even when the app is closed.
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data && event.data.text() }; }
  const title = data.title || 'Wishful 💛';
  const options = {
    body: data.body || 'You have a new note on your wishlist.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.itemId ? 'wish-' + data.itemId : 'wishful',
    data: { itemId: data.itemId || null, url: '/' },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const itemId = event.notification.data && event.notification.data.itemId;
  const target = itemId ? `/?wish=${encodeURIComponent(itemId)}` : '/';
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) { c.postMessage({ type: 'open-wish', itemId }); return c.focus(); }
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  })());
});
