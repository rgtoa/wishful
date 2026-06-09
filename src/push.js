// push.js — register this device for Web Push and report its subscription to the
// server. No-ops gracefully when push isn't supported, configured, or permitted.
import { api, VAPID_PUBLIC_KEY } from './api.js';

export const pushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// Asks permission (if needed), subscribes via the service worker, and registers
// the subscription for this space + user. Returns 'granted' | 'denied' | 'unsupported'.
export async function enablePush(spaceId, user) {
  if (!pushSupported() || !VAPID_PUBLIC_KEY || !spaceId) return 'unsupported';
  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();
  if (permission !== 'granted') return permission; // 'denied' | 'default'
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  await api.subscribePush(spaceId, user, sub.toJSON());
  return 'granted';
}
