// App.jsx — navigation stack, live data store, perspective mapping, lock/splash
// routing, theming, and (when a backend is configured) two-phone sync + push.
import React, { useState, useRef, useEffect } from 'react';
import { AppCtx, PROFILE } from './context.js';
import { buildVars, TWEAK_DEFAULTS } from './theme.js';
import { SEED } from './data.js';
import { SCREENS } from './registry.js';
import { useTweaks, usePersistentState } from './persist.js';
import { I } from './icons.jsx';
import { Sheet } from './primitives.jsx';
import { PatternLock, Splash, Celebrate } from './extras.jsx';
import { Onboarding } from './flows.jsx';
import Pairing from './Pairing.jsx';
import { api, API_CONFIGURED } from './api.js';
import { enablePush } from './push.js';

let _seq = 1;
const uid = (p = 'n') => p + Date.now().toString(36) + (_seq++).toString(36);

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // ── people / perspective (canonical owners: 'rafael' | 'thrisha')
  const [currentUser, setCurrentUser] = useState('rafael');
  const them = currentUser === 'rafael' ? 'thrisha' : 'rafael';
  const [names, setNames] = usePersistentState('names', { rafael: 'Rafael', thrisha: 'Thrisha' });
  const [accent, setAccent] = usePersistentState('accent', null);  // current user's custom accent (local only)
  const [currency, setCurrency] = usePersistentState('currency', 'PHP');
  const [avatars, setAvatars] = usePersistentState('avatars', { rafael: null, thrisha: null });
  const since = 'Together since 2023';

  // ── data store
  const [lists, setLists] = usePersistentState('lists', SEED.lists);
  const [items, setItems] = usePersistentState('items', SEED.items);
  const [notifs, setNotifs] = usePersistentState('notifications', SEED.notifications || []);
  const persp = (o) => (o === currentUser ? 'you' : 'partner');

  // ── sync (only active when a backend is configured AND this device is paired)
  const [space, setSpace] = usePersistentState('space', null);
  const synced = API_CONFIGURED && !!space;
  const versionRef = useRef(0);
  const applyingRemote = useRef(false);

  const applyRemote = (s) => {
    applyingRemote.current = true;
    setLists(s.lists || []);
    setItems(s.items || []);
    setNotifs(s.notifications || []);
    if (s.profiles) {
      setNames({ rafael: s.profiles.rafael?.name || 'Rafael', thrisha: s.profiles.thrisha?.name || 'Thrisha' });
      setAvatars({ rafael: s.profiles.rafael?.avatar || null, thrisha: s.profiles.thrisha?.avatar || null });
    }
    versionRef.current = s.v;
  };

  // adopt server state on (re)pair / reload
  useEffect(() => {
    if (!synced) return;
    let alive = true;
    versionRef.current = 0;
    (async () => {
      const r = await api.getState(space.spaceId);
      if (alive && r.ok && r.data && r.data.v) applyRemote(r.data);
    })();
    return () => { alive = false; };
  }, [synced, space && space.spaceId]);

  // push local edits up (debounced); skip the echo of a change we just pulled
  useEffect(() => {
    if (!synced) return;
    if (applyingRemote.current) { applyingRemote.current = false; return; }
    if (versionRef.current === 0) return; // not loaded yet
    const t2 = setTimeout(async () => {
      const doc = {
        lists, items, notifications: notifs,
        profiles: { rafael: { name: names.rafael, avatar: avatars.rafael }, thrisha: { name: names.thrisha, avatar: avatars.thrisha } },
      };
      const r = await api.putState(space.spaceId, versionRef.current, doc);
      if (r.status === 409 && r.data && r.data.v) applyRemote(r.data); // partner won the race — take theirs
      else if (r.ok && r.data.v) versionRef.current = r.data.v;
    }, 500);
    return () => clearTimeout(t2);
  }, [lists, items, notifs, names, avatars]);

  // poll for the partner's changes while the app is visible
  useEffect(() => {
    if (!synced) return;
    const id = setInterval(async () => {
      if (document.hidden) return;
      const r = await api.getState(space.spaceId, versionRef.current);
      if (r.ok && r.data && !r.data.unchanged && r.data.v) applyRemote(r.data);
    }, 4000);
    return () => clearInterval(id);
  }, [synced, space && space.spaceId]);

  // re-register this device for push if permission was already granted
  useEffect(() => {
    if (synced && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      enablePush(space.spaceId, currentUser);
    }
  }, [synced, space && space.spaceId, currentUser]);

  // keep the avatar singleton fresh for the current perspective
  PROFILE.youName = names[currentUser];
  PROFILE.partnerName = names[them];
  PROFILE.currency = currency;
  PROFILE.youAvatar = avatars[currentUser];
  PROFILE.partnerAvatar = avatars[them];

  const store = {
    currentUser, them,
    you: { name: names[currentUser], who: 'you' },
    partner: { name: names[them], who: 'partner' },
    since, currency, setCurrency, accent, setAccent,
    setName: (nm) => setNames(n => ({ ...n, [currentUser]: nm })),
    nameOf: (canon) => names[canon],
    youAvatar: avatars[currentUser], partnerAvatar: avatars[them],
    setAvatar: (url) => setAvatars(a => ({ ...a, [currentUser]: url })),
    lists: lists.map(l => ({ ...l, owner: persp(l.owner) })),
    items: items.filter(i => !i.deletedAt).map(i => ({ ...i, owner: persp(i.owner) })),
    deleted: items.filter(i => i.deletedAt).map(i => ({ ...i, owner: persp(i.owner) })),
    addItem: (d) => setItems(p => [{ ...d, owner: currentUser, id: uid('n') }, ...p]),
    updateItem: (id, d) => setItems(p => p.map(i => i.id === id ? { ...i, ...d } : i)),
    deleteItem: (id) => setItems(p => p.map(i => i.id === id ? { ...i, deletedAt: Date.now() } : i)),
    restoreItem: (id) => setItems(p => p.map(i => i.id === id ? { ...i, deletedAt: null } : i)),
    purgeItem: (id) => setItems(p => p.filter(i => i.id !== id)),
    toggleReserve: (id) => setItems(p => p.map(i => i.id === id ? { ...i, reserved: !i.reserved } : i)),
    toggleBought: (id) => setItems(p => p.map(i => i.id === id ? { ...i, bought: !i.bought } : i)),
    addList: (d) => { const id = uid('nl'); setLists(p => [...p, { ...d, owner: currentUser, id }]); return id; },
    addComment: (itemId, text) => {
      const it = items.find(i => i.id === itemId);
      setItems(p => p.map(i => i.id === itemId ? { ...i, comments: [...(i.comments || []), { by: currentUser, text, at: Date.now() }] } : i));
      if (it && it.owner !== currentUser) {
        setNotifs(p => [{ id: uid('nt'), itemId, from: currentUser, forUser: it.owner, text, at: Date.now(), read: false }, ...p]);
        if (synced) api.notify(space.spaceId, it.owner, `${names[currentUser]} commented on your wish`, text, itemId);
      }
    },
    notifications: notifs.filter(n => n.forUser === currentUser),
    markNotifRead: (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n)),
    markAllNotifsRead: () => setNotifs(p => p.map(n => n.forUser === currentUser ? { ...n, read: true } : n)),
    // pairing / push surface (used by Profile when a backend is configured)
    apiConfigured: API_CONFIGURED, synced, space,
    enableNotifications: () => synced ? enablePush(space.spaceId, currentUser) : Promise.resolve('unsupported'),
    unpair: () => setSpace(null),
  };

  // ── navigation / routing
  const [locked, setLocked] = useState(true);
  const [showPair, setShowPair] = useState(false);
  const [showOnb, setShowOnb] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [celebrate, setCelebrate] = useState(null);
  const [tab, setTab] = useState('Home');
  const [stack, setStack] = useState([]);
  const [popping, setPopping] = useState(null);
  const [sheet, setSheet] = useState(null);
  const sheetCache = useRef(null);
  if (sheet) sheetCache.current = sheet;

  const nav = {
    go: (name) => {
      if (name === 'Onboarding') { setShowOnb(true); return; }
      setStack([]); setTab(name);
    },
    lock: () => { setStack([]); setSheet(null); setTab('Home'); setShowSplash(false); setShowOnb(false); setShowPair(false); setLocked(true); },
    unlock: (who) => {
      setCurrentUser(who || 'rafael');
      if (API_CONFIGURED && !space) setShowPair(true);
      else setShowOnb(true);
    },
    dismissLock: () => setLocked(false),
    pairComplete: (sp) => { setSpace(sp); setShowPair(false); setShowOnb(true); enablePush(sp.spaceId, currentUser); },
    finishOnboarding: () => { setShowSplash(true); setShowOnb(false); },
    finishSplash: () => setShowSplash(false),
    celebrateThen: (type) => setCelebrate({ type, key: uid('c') }),
    endCelebrate: () => { setCelebrate(null); setStack([]); setTab('Home'); },
    push: (name, params) => setStack(s => [...s, { name, params, key: uid('p') }]),
    pop: () => setStack(s => {
      if (!s.length) return s;
      setPopping(s[s.length - 1]);
      setTimeout(() => setPopping(null), 330);
      return s.slice(0, -1);
    }),
    openSheet: (name, params) => setSheet({ name, params, key: uid('s') }),
    replaceSheet: (name, params) => setSheet({ name, params, key: uid('s') }),
    closeSheet: () => setSheet(null),
  };

  // open a wish when the partner's push notification is tapped
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMsg = (e) => {
      if (e.data && e.data.type === 'open-wish' && e.data.itemId) {
        setLocked(false); setShowPair(false); setShowOnb(false); setShowSplash(false);
        setStack([{ name: 'ItemDetail', params: { itemId: e.data.itemId }, key: uid('p') }]);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMsg);
    return () => navigator.serviceWorker.removeEventListener('message', onMsg);
  }, []);

  const ctx = { nav, store, t, setTweak };
  const vars = buildVars(t.palette, t.font, t.radius, t.dark);
  if (accent) { vars['--you'] = accent; vars['--you-soft'] = `color-mix(in srgb, ${accent} 18%, var(--surface))`; }

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t.dark ? '#1A1512' : (accent || vars['--you']));
  }, [t.dark, accent, vars['--you']]);

  const renderScreen = (entry) => {
    const C = SCREENS[entry.name];
    return C ? <C {...(entry.params || {})} /> : null;
  };

  const Base = SCREENS[tab] || SCREENS.Home;
  const tallSheet = sheet && (sheet.name === 'AddItem' || sheet.name === 'NewList' || sheet.name === 'Personalize');
  const curSheet = sheet || sheetCache.current;

  const tabBarVisible = stack.length === 0 && !showOnb && !showSplash && !locked && !showPair && !celebrate;

  return (
    <AppCtx.Provider value={ctx}>
      <div className="wf-app" style={{ ...vars, fontFamily: 'var(--font-body)', background: 'var(--bg)', color: 'var(--ink)' }}>

        {/* base tab screen */}
        <div key={tab} style={{ position: 'absolute', inset: 0 }}><Base /></div>

        {/* pushed stack */}
        {stack.map((entry, idx) => (
          <PushLayer key={entry.key} zIndex={10 + idx}>
            {renderScreen(entry)}
          </PushLayer>
        ))}
        {popping && (
          <PopLayer key={'pop' + popping.key}>
            {renderScreen(popping)}
          </PopLayer>
        )}

        {/* bottom tab bar */}
        {tabBarVisible && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 80, paddingBottom: 'calc(22px + env(safe-area-inset-bottom))',
            background: 'linear-gradient(transparent, var(--bg) 42%)', pointerEvents: 'none' }}>
            <div style={{ margin: '0 auto', width: 'fit-content', display: 'flex', alignItems: 'center', gap: 6,
              background: 'color-mix(in srgb, var(--surface) 80%, transparent)', backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)', borderRadius: 999, padding: 7,
              boxShadow: '0 6px 22px rgba(44,33,24,0.16), inset 0 0 0 1px var(--line)', pointerEvents: 'auto' }}>
              <TabBtn active={tab === 'Home'} onClick={() => nav.go('Home')} icon={<I.heart size={22} />} aicon={<I.heartFill size={22} />} label="Lists" />
              <button onClick={() => {
                const firstList = lists.find(l => l.owner === currentUser && !l.secret);
                if (firstList) nav.openSheet('AddItem', { listId: firstList.id });
                else nav.openSheet('NewList');
              }}
                className="anim-glow"
                style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: 'var(--you)', color: '#fff',
                  display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <I.plus size={26} />
              </button>
              <TabBtn active={tab === 'Profile'} onClick={() => nav.go('Profile')} icon={<I.user size={22} />} aicon={<I.user size={22} />} label="You" />
            </div>
          </div>
        )}

        {/* sheet */}
        <Sheet open={!!sheet} onClose={() => nav.closeSheet()} tall={tallSheet}>
          {curSheet && <div key={curSheet.key} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '100%' }}>{renderScreen(curSheet)}</div>}
        </Sheet>

        {/* welcome pages (mounts under the lock so its exit reveals it — never home) */}
        {showOnb && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 300 }}>
            <Onboarding />
          </div>
        )}

        {/* splash */}
        {showSplash && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 350 }}>
            <Splash onDone={nav.finishSplash} />
          </div>
        )}

        {/* pairing (only when a backend is configured and not yet paired) */}
        {showPair && <Pairing who={currentUser} onPaired={nav.pairComplete} />}

        {/* celebrate on add */}
        {celebrate && (
          <Celebrate key={celebrate.key} type={celebrate.type} onDone={nav.endCelebrate} />
        )}

        {/* draw-to-unlock gate */}
        {locked && <PatternLock onUnlock={nav.unlock} onDismiss={nav.dismissLock} />}
      </div>
    </AppCtx.Provider>
  );
}

// Transition-driven layers — drive transforms via state so they always settle.
function PushLayer({ children, zIndex }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const r = setTimeout(() => setShown(true), 24); return () => clearTimeout(r); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex, background: 'var(--bg)',
      boxShadow: '-8px 0 30px rgba(44,33,24,0.12)',
      transform: shown ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform .36s cubic-bezier(.32,.72,0,1)' }}>{children}</div>
  );
}
function PopLayer({ children }) {
  const [out, setOut] = useState(false);
  useEffect(() => { const r = setTimeout(() => setOut(true), 24); return () => clearTimeout(r); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'var(--bg)',
      boxShadow: '-8px 0 30px rgba(44,33,24,0.12)',
      transform: out ? 'translateX(100%)' : 'translateX(0)',
      transition: 'transform .32s cubic-bezier(.32,.72,0,1)' }}>{children}</div>
  );
}

function TabBtn({ active, onClick, icon, aicon, label }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 3, padding: '8px 16px', color: active ? 'var(--you)' : 'var(--ink-faint)', transition: 'color .2s' }}>
      <span style={{ display: 'inline-flex', transform: active ? 'scale(1.12) translateY(-1px)' : 'scale(1)', transition: 'transform .3s cubic-bezier(.34,1.56,.64,1)' }}>{active ? aicon : icon}</span>
      <span style={{ fontSize: 10.5, fontWeight: 700 }}>{label}</span>
    </button>
  );
}
