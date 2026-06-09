// extras.jsx — PatternLock, SecretList, ColorWheel, Personalize, Splash,
// Celebrate, RecentlyDeleted, Notifications, GiftPlans, Genie (seasonal).
import React from 'react';
const { useState, useEffect, useRef, useLayoutEffect } = React;
import { I as Ix } from './icons.jsx';
import { Avatar as Avx, Photo as Phx, PriorityPips as Ppx, Money as Mox } from './primitives.jsx';
import { useApp } from './context.js';
import { Screen, PushBar, Reveal, HeartBurst } from './shared.jsx';
import { SheetHead } from './flows.jsx';
import { seasonOf } from './season.js';

// ───────────────────────────────── PATTERN LOCK (draw to unlock)
export function PatternLock({ onUnlock, onDismiss }) {
  const dotRefs = useRef([]);
  const pressing = useRef(false);
  const [sel, setSel] = useState([]);
  const [centers, setCenters] = useState([]);
  const [done, setDone] = useState(false);
  const [exit, setExit] = useState(false);
  const [hint, setHint] = useState(false);
  const [whoName, setWhoName] = useState('');

  // saved patterns (indices on the 3×3 grid)
  // Rafael: top-left → top-mid → top-right → mid-right → bottom-right
  // Thrisha (diamond): top-mid → mid-right → bottom-mid → mid-left
  const PATTERNS = { rafael: [0, 1, 2, 5, 8], thrisha: [1, 5, 7, 3] };
  const match = (arr) => {
    for (const who in PATTERNS) { const p = PATTERNS[who]; if (p.length === arr.length && p.every((v, i) => v === arr[i])) return who; }
    return null;
  };

  useLayoutEffect(() => {
    const cs = dotRefs.current.map(el => el ? ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 }) : { x: 0, y: 0 });
    setCenters(cs);
  }, []);

  const addAt = (cx, cy) => {
    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < r.width * 0.82) setSel(prev => prev.includes(i) ? prev : [...prev, i]);
    });
  };
  const down = (e) => { if (done) return; pressing.current = true; setSel([]); setHint(false); addAt(e.clientX, e.clientY); };
  const move = (e) => { if (!pressing.current || done) return; addAt(e.clientX, e.clientY); };
  const up = () => {
    if (done || !pressing.current) return;
    pressing.current = false;
    setSel(cur => {
      const who = match(cur);
      if (who) {
        setWhoName(who === 'rafael' ? 'Rafael' : 'Thrisha');
        setDone(true);
        // reveal the next screen UNDER the lock first, then fade the lock into it
        setTimeout(() => onUnlock && onUnlock(who), 720);
        setTimeout(() => setExit(true), 780);
        setTimeout(() => onDismiss && onDismiss(), 1240);
        return cur;
      }
      if (cur.length > 0) { setHint(true); return []; }
      return cur;
    });
  };

  const poly = sel.map(i => centers[i]).filter(Boolean);
  // correct pattern glows green; otherwise the user's accent
  const accent = done ? '#3CC56B' : 'var(--you)';

  return (
    <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
      style={{
        position: 'absolute', inset: 0, zIndex: 400, touchAction: 'none', userSelect: 'none',
        background: 'radial-gradient(120% 90% at 50% 12%, #241a13 0%, #150f0a 60%, #100b07 100%)',
        color: '#F4ECE2', display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 'calc(80px + env(safe-area-inset-top)) 28px calc(50px + env(safe-area-inset-bottom))', fontFamily: 'var(--font-body)',
        opacity: exit ? 0 : 1, transform: exit ? 'scale(1.06)' : 'scale(1)',
        transition: 'opacity .42s ease, transform .42s ease',
      }}>
      {/* secure pill */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 999,
        background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.09)',
        fontSize: 12.5, fontWeight: 700, color: 'rgba(244,236,226,0.8)', marginBottom: 22 }}>
        <span style={{ color: 'var(--gold)', display: 'inline-flex' }}><Ix.lock size={14} /></span>secure entry
      </div>

      <h1 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)',
        fontWeight: 'var(--display-weight)', fontSize: 34, lineHeight: 1.08, letterSpacing: 0.3, textAlign: 'center',
        transition: 'color .4s', whiteSpace: 'nowrap' }}>
        {done ? `Welcome back, ${whoName}` : 'Draw to unlock'}
      </h1>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, textAlign: 'center', color: 'rgba(244,236,226,0.52)', maxWidth: 270, minHeight: 42 }}>
        {done ? 'Opening your wishful world…' : hint ? 'Hmm, that’s not it. Draw your saved pattern to enter.' : 'Two people, two patterns. Your shape tells us whose world to open.'}
      </p>

      {/* grid */}
      <div style={{ position: 'relative', width: 264, height: 264, marginTop: 40 }}>
        <svg width="264" height="264" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
          {poly.length > 1 && (
            <polyline points={poly.map(p => `${p.x},${p.y}`).join(' ')} fill="none"
              stroke={accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 7px ${accent})`, opacity: done ? 0.95 : 0.85, transition: 'opacity .3s' }} />
          )}
        </svg>
        {Array.from({ length: 9 }).map((_, i) => {
          const active = sel.includes(i);
          return (
            <div key={i} ref={el => dotRefs.current[i] = el} style={{
              position: 'absolute', width: 64, height: 64, borderRadius: '50%',
              left: (i % 3) * 100, top: Math.floor(i / 3) * 100,
              display: 'grid', placeItems: 'center',
              background: active ? `color-mix(in srgb, ${accent} 20%, transparent)` : 'rgba(255,255,255,0.025)',
              boxShadow: active ? `inset 0 0 0 1.5px ${accent}, 0 0 16px color-mix(in srgb, ${accent} 50%, transparent)` : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              transform: active ? (done ? 'scale(1.12)' : 'scale(1.06)') : 'scale(1)',
              transition: 'transform .26s cubic-bezier(.34,1.56,.64,1), background .26s, box-shadow .26s',
            }}>
              <span style={{ width: active ? 16 : 11, height: active ? 16 : 11, borderRadius: '50%',
                background: active ? accent : 'rgba(244,236,226,0.32)',
                boxShadow: active ? `0 0 10px ${accent}` : 'none', transition: 'all .26s' }} />
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(244,236,226,0.4)' }}>
        <Avx who="you" size={22} /><span style={{ opacity: .6 }}>or</span><Avx who="partner" size={22} />
      </div>
    </div>
  );
}

// ───────────────────────────────── SECRET LIST (gift ideas for partner)
export function SecretList({ listId }) {
  const { nav, store } = useApp();
  const list = store.lists.find(l => l.id === listId);
  if (!list) return <Screen><PushBar onBack={() => nav.pop()} /></Screen>;
  const items = store.items.filter(i => i.list === listId);
  const forName = store.partner.name;
  const ideas = items.filter(i => !i.bought).length;

  return (
    <div style={{ position: 'relative', height: '100%', background: 'var(--bg)', overflowY: 'auto', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      {/* dark secret header */}
      <div style={{ background: 'radial-gradient(120% 100% at 50% 0%, #2a1f17, #1a130d)', color: '#F4ECE2', padding: 'calc(46px + env(safe-area-inset-top)) 20px 26px', position: 'relative' }}>
        <button onClick={() => nav.pop()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.1)', color: '#F4ECE2', display: 'grid', placeItems: 'center', cursor: 'pointer', marginBottom: 16 }}>
          <Ix.chevL size={20} />
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.08)', fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 12 }}>
          <Ix.lock size={13} />secret · only you can see this
        </div>
        <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 32, lineHeight: 1.05 }}>{list.name}</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(244,236,226,0.55)' }}>{ideas} gift idea{ideas !== 1 ? 's' : ''} for {forName} · hidden from her wishlist</p>
      </div>

      <div style={{ padding: '18px 20px 130px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {items.map((it, k) => (
          <Reveal key={it.id} delay={k * 55}>
            <SecretRow item={it} onOpen={() => nav.push('ItemDetail', { itemId: it.id })} onBought={() => store.toggleBought(it.id)} />
          </Reveal>
        ))}
        <Reveal delay={items.length * 55}>
          <button onClick={() => nav.openSheet('AddItem', { listId, secret: true })} style={{ width: '100%', border: 'none',
            background: 'var(--surface)', borderRadius: 'var(--r)', padding: '15px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--you)', fontWeight: 600, fontSize: 14.5,
            fontFamily: 'var(--font-body)', boxShadow: 'inset 0 0 0 1.5px var(--you-soft)' }}>
            <Ix.plus size={18} />Add a secret idea
          </button>
        </Reveal>
      </div>
    </div>
  );
}

function SecretRow({ item, onOpen, onBought }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 10, display: 'flex', gap: 13, alignItems: 'center',
      boxShadow: '0 1px 2px rgba(44,33,24,0.04)', opacity: item.bought ? 0.62 : 1, transition: 'opacity .2s' }}>
      <button onClick={onOpen} style={{ width: 70, height: 70, flexShrink: 0, border: 'none', padding: 0, background: 'none', cursor: 'pointer', position: 'relative' }}>
        <Phx label={item.photo} src={item.image} tint="var(--gold)" h={70} radius="var(--r)" />
      </button>
      <button onClick={onOpen} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, marginBottom: 4, textDecoration: item.bought ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Mox value={item.price} currency={item.currency} style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-soft)' }} />
          <Ppx level={item.prio} color="var(--gold)" />
        </div>
      </button>
      <button onClick={onBought} title="Mark as bought" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
        border: 'none', display: 'grid', placeItems: 'center', transition: 'all .18s',
        background: item.bought ? 'var(--you)' : 'color-mix(in srgb, var(--ink) 7%, transparent)',
        color: item.bought ? '#fff' : 'var(--ink-faint)' }}>
        <Ix.check size={18} />
      </button>
    </div>
  );
}

// ───────────────────────────────── COLOR WHEEL
function ColorWheel({ hue, onPick, size = 168 }) {
  const ref = useRef();
  const pressing = useRef(false);
  const pick = (e) => {
    const r = ref.current.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
    const h = Math.round((a + 360 + 90) % 360);
    onPick(h);
  };
  const rad = (size - 26) / 2;
  const kx = size / 2 + rad * Math.cos((hue - 90) * Math.PI / 180);
  const ky = size / 2 + rad * Math.sin((hue - 90) * Math.PI / 180);
  return (
    <div ref={ref} onPointerDown={e => { pressing.current = true; ref.current.setPointerCapture?.(e.pointerId); pick(e); }}
      onPointerMove={e => pressing.current && pick(e)} onPointerUp={() => pressing.current = false}
      style={{ position: 'relative', width: size, height: size, margin: '0 auto', touchAction: 'none', cursor: 'pointer' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, hsl(0 60% 52%), hsl(60 60% 52%), hsl(120 60% 52%), hsl(180 60% 52%), hsl(240 60% 52%), hsl(300 60% 52%), hsl(360 60% 52%))',
        WebkitMask: `radial-gradient(circle, transparent ${rad - 16}px, #000 ${rad - 15}px)`,
        mask: `radial-gradient(circle, transparent ${rad - 16}px, #000 ${rad - 15}px)` }} />
      {/* center swatch */}
      <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', background: `hsl(${hue} 58% 52%)`,
        boxShadow: 'inset 0 0 0 4px var(--surface), 0 6px 18px rgba(0,0,0,.16)' }} />
      {/* knob */}
      <div style={{ position: 'absolute', width: 26, height: 26, borderRadius: '50%', left: kx - 13, top: ky - 13,
        background: `hsl(${hue} 58% 52%)`, boxShadow: '0 0 0 3px #fff, 0 2px 8px rgba(0,0,0,.3)' }} />
    </div>
  );
}

// ───────────────────────────────── PERSONALIZE (your own app only)
const PRESETS = [
  { key: 'terracotta', color: '#C25E3C', bg: '#F4EBDD', label: 'Terracotta' },
  { key: 'plum', color: '#A8516E', bg: '#F3E9EC', label: 'Plum' },
  { key: 'sage', color: '#6E8A4F', bg: '#EEEDE1', label: 'Sage' },
  { key: 'dusk', color: '#4F6E9B', bg: '#E9ECF1', label: 'Dusk' },
  { key: 'blush', color: '#C76B6A', bg: '#F6EAE6', label: 'Blush' },
];
function hslToHue(s) { const m = /hsl\((\d+)/.exec(s || ''); return m ? +m[1] : 24; }
export function Personalize() {
  const { nav, store, t, setTweak } = useApp();
  const [name, setName] = useState(store.you.name);
  const [hue, setHue] = useState(() => store.accent ? hslToHue(store.accent) : 24);
  const fileRef = useRef();
  const lab = { fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 9px', display: 'block' };
  const inp = { width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--surface2)', borderRadius: 'var(--r)', padding: '14px 15px', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', outline: 'none' };

  const applyName = (v) => { setName(v); store.setName(v); };
  const applyHue = (h) => { setHue(h); store.setAccent(`hsl(${h} 58% 52%)`); };
  const applyPreset = (p) => { store.setAccent(null); setTweak('palette', p.key); };
  const onFile = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => store.setAvatar(r.result); r.readAsDataURL(f); };

  return (
    <>
      <SheetHead title="Make it yours" onClose={() => nav.closeSheet()} onDone={() => nav.closeSheet()} doneLabel="Done" />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 18px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <button onClick={() => fileRef.current.click()} style={{ position: 'relative', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
            <PreviewAvatar name={name} color={store.accent || 'var(--you)'} ring photo={store.youAvatar} />
            <span style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--you)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px var(--surface)' }}><Ix.camera size={14} /></span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-faint)', margin: '0 0 18px' }}>This is your app — only you see these changes.</p>

        <label style={lab}>Your name</label>
        <input value={name} onChange={e => applyName(e.target.value)} style={{ ...inp, marginBottom: 22 }} />

        <label style={lab}>App theme</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
          {PRESETS.map(p => {
            const active = !store.accent && t.palette === p.key;
            return (
              <button key={p.key} onClick={() => applyPreset(p)} style={{ border: 'none', cursor: 'pointer', borderRadius: 'var(--r)', overflow: 'hidden', padding: 0,
                background: p.bg, boxShadow: active ? `0 0 0 2.5px ${p.color}` : 'inset 0 0 0 1px var(--line)', transition: 'all .15s' }}>
                <div style={{ height: 46, display: 'flex', alignItems: 'flex-end', gap: 4, padding: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: p.color }} />
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'color-mix(in srgb, ' + p.color + ' 55%, #fff)' }} />
                </div>
                <div style={{ background: 'var(--surface)', padding: '6px 8px', fontSize: 11.5, fontWeight: 700, color: active ? p.color : 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {p.label}{active && <Ix.check size={13} />}
                </div>
              </button>
            );
          })}
        </div>

        <label style={lab}>Your accent colour</label>
        <ColorWheel hue={hue} onPick={applyHue} />
        <div style={{ textAlign: 'center', margin: '12px 0 24px' }}>
          {store.accent
            ? <button onClick={() => store.setAccent(null)} style={{ border: 'none', background: 'var(--surface2)', color: 'var(--ink-soft)', borderRadius: 999, padding: '8px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reset to theme colour</button>
            : <span style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>Spin the wheel for a custom colour</span>}
        </div>

        <label style={lab}>Display</label>
        <button onClick={() => setTweak('dark', !t.dark)} style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
          background: 'var(--surface2)', color: 'var(--ink)', borderRadius: 'var(--r)', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0,
            background: t.dark ? 'var(--ink)' : 'var(--surface)', color: t.dark ? 'var(--gold)' : 'var(--ink-faint)' }}><Ix.sparkle size={17} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>Dark mode</div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{t.dark ? 'On' : 'Off'} · easier on the eyes at night</div>
          </div>
          <Toggle on={t.dark} />
        </button>
      </div>
    </>
  );
}
function Toggle({ on }) {
  return (
    <span style={{ width: 46, height: 28, borderRadius: 999, flexShrink: 0, position: 'relative', transition: 'background .25s',
      background: on ? 'var(--you)' : 'color-mix(in srgb, var(--ink) 16%, transparent)' }}>
      <span style={{ position: 'absolute', top: 3, left: 3, width: 22, height: 22, borderRadius: '50%', background: '#fff',
        transform: on ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .25s cubic-bezier(.32,.72,0,1)' }} />
    </span>
  );
}
function PreviewAvatar({ name, color, ring, style, photo }) {
  if (photo) return (
    <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', boxShadow: ring ? `0 0 0 2px var(--surface), 0 0 0 4px ${color}` : 'none', ...style }}>
      <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
  return (
    <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center',
      background: `color-mix(in srgb, ${color} 20%, var(--surface))`, color,
      fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 600, fontSize: 30,
      boxShadow: ring ? `0 0 0 2px var(--surface), 0 0 0 4px ${color}` : 'none', ...style }}>
      {(name || '?').trim()[0]?.toUpperCase() || '?'}
    </div>
  );
}

// ───────────────────────────────── SPLASH (gift-heart graphic)
function GiftHeart({ on }) {
  return (
    <div style={{ width: 104, height: 104, position: 'relative', display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--you-soft)',
        boxShadow: '0 12px 30px -10px color-mix(in srgb, var(--you) 60%, transparent)' }} />
      <svg viewBox="0 0 80 80" width="72" height="72" style={{ position: 'relative', overflow: 'visible' }}>
        {/* heart popping out of the box */}
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center bottom', animation: on ? 'heartFloat 1.8s ease-out infinite' : 'none' }}>
          <path d="M40 30 c -4 -7 -16 -5 -16 4 c 0 7 9 12 16 18 c 7 -6 16 -11 16 -18 c 0 -9 -12 -11 -16 -4 Z" fill="var(--you)" />
        </g>
        {/* box base */}
        <rect x="22" y="44" width="36" height="26" rx="4" fill="var(--you)" />
        <rect x="36" y="44" width="8" height="26" fill="color-mix(in srgb, var(--you) 60%, #fff)" opacity="0.7" />
        {/* lid (pops up) */}
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center bottom', animation: on ? 'lidPop 1.8s ease-out infinite' : 'none' }}>
          <rect x="18" y="38" width="44" height="11" rx="4" fill="color-mix(in srgb, var(--you) 80%, #fff)" />
          <rect x="36" y="38" width="8" height="11" fill="color-mix(in srgb, var(--you) 55%, #fff)" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}
export function Splash({ onDone }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setOn(true), 60);
    const b = setTimeout(() => onDone && onDone(), 2700);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)',
      backgroundImage: 'radial-gradient(120% 80% at 50% 32%, var(--bg-glow), transparent 60%)', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center', transform: on ? 'translateY(0) scale(1)' : 'translateY(14px) scale(.88)',
        opacity: on ? 1 : 0, transition: 'all .85s cubic-bezier(.22,1,.36,1)' }}>
        <div style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', marginBottom: 20 }}>
          <span style={{ position: 'absolute', width: 110, height: 110, borderRadius: '50%', boxShadow: '0 0 0 2px var(--you)',
            transform: on ? 'scale(1.7)' : 'scale(.5)', opacity: on ? 0 : 0.7, transition: 'all 1.8s ease' }} />
          <GiftHeart on={on} />
          <HeartBurst fire={on} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 46, color: 'var(--ink)', lineHeight: 1 }}>wishful</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 8, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>a wishlist for two</div>
      </div>
    </div>
  );
}

// ───────────────────────────────── CELEBRATE (after adding a wish / list)
export function Celebrate({ type, onDone }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setOn(true), 40);
    const b = setTimeout(() => onDone && onDone(), 1750);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  const gift = type === 'list';
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 360, background: 'color-mix(in srgb, var(--ink) 34%, transparent)',
      backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center',
      opacity: on ? 1 : 0, transition: 'opacity .3s' }}>
      <div style={{ position: 'relative', display: 'grid', placeItems: 'center',
        transform: on ? 'scale(1)' : 'scale(.3)', transition: 'transform .6s cubic-bezier(.34,1.56,.64,1)' }}>
        <span style={{ width: 112, height: 112, borderRadius: '50%', background: 'var(--surface)', color: 'var(--you)',
          display: 'grid', placeItems: 'center', boxShadow: '0 18px 44px rgba(0,0,0,.28)' }}>
          {gift ? <Ix.gift size={54} /> : <Ix.heartFill size={54} />}
        </span>
        <HeartBurst fire={on} />
        <div style={{ position: 'absolute', bottom: -46, whiteSpace: 'nowrap', fontFamily: 'var(--font-display)',
          fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 25, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,.45)' }}>
          {gift ? 'List created' : 'Added to your wishes'}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────── RECENTLY DELETED (30-day)
export function RecentlyDeleted() {
  const { nav, store } = useApp();
  const items = store.deleted;
  const daysLeft = (ts) => Math.max(0, 30 - Math.floor((Date.now() - (ts || Date.now())) / 86400000));
  return (
    <Screen>
      <PushBar onBack={() => nav.pop()} />
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 32, lineHeight: 1.05 }}>Recently deleted</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.4 }}>Wishes stay here for 30 days, then they're gone for good.</p>
      </div>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--ink-faint)' }}>
          <div className="anim-floaty" style={{ display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface)', marginBottom: 14 }}><Ix.trash size={26} /></div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-soft)' }}>Nothing here</div>
          <div style={{ fontSize: 13 }}>Deleted wishes will show up here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {items.map((it, k) => (
            <Reveal key={it.id} delay={k * 55}>
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 10, display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 1px 2px rgba(44,33,24,0.04)' }}>
                <div style={{ width: 60, height: 60, flexShrink: 0, filter: 'grayscale(.4)', opacity: .8 }}><Phx label={it.photo} src={it.image} tint="var(--ink-faint)" h={60} radius="var(--r)" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginTop: 3 }}>{daysLeft(it.deletedAt)} days left</div>
                </div>
                <button onClick={() => store.restoreItem(it.id)} title="Restore" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'var(--you-soft)', color: 'var(--you)', display: 'grid', placeItems: 'center' }}><Ix.arrowR size={18} style={{ transform: 'rotate(180deg)' }} /></button>
                <button onClick={() => store.purgeItem(it.id)} title="Delete forever" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'color-mix(in srgb, #C0492F 12%, transparent)', color: '#C0492F', display: 'grid', placeItems: 'center' }}><Ix.trash size={17} /></button>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </Screen>
  );
}

// ───────────────────────────────── NOTIFICATIONS
export function Notifications() {
  const { nav, store } = useApp();
  const notifs = store.notifications;
  useEffect(() => { const t = setTimeout(() => store.markAllNotifsRead(), 900); return () => clearTimeout(t); }, []);
  const open = (n) => { store.markNotifRead(n.id); nav.push('ItemDetail', { itemId: n.itemId }); };
  const ago = (at) => at < 1e9 ? 'recently' : 'just now';
  return (
    <Screen>
      <PushBar onBack={() => nav.pop()} />
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 32, lineHeight: 1.05 }}>Notifications</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)' }}>When {store.partner.name} comments on your wishes, it shows up here.</p>
      </div>
      {notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--ink-faint)' }}>
          <div className="anim-floaty" style={{ display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface)', marginBottom: 14 }}><Ix.bell size={26} /></div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-soft)' }}>All caught up</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {notifs.map((n, k) => (
            <Reveal key={n.id} delay={k * 55}>
              <button onClick={() => open(n)} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start',
                background: n.read ? 'var(--surface)' : 'color-mix(in srgb, var(--partner) 9%, var(--surface))', borderRadius: 'var(--r-lg)', padding: 13,
                boxShadow: n.read ? '0 1px 2px rgba(44,33,24,0.04)' : 'inset 0 0 0 1.5px color-mix(in srgb, var(--partner) 35%, transparent)' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avx who="partner" size={40} />
                  <span style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: 'var(--partner)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px var(--surface)' }}><Ix.chat size={11} /></span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.4, marginBottom: 4 }}>
                    <b>{store.nameOf(n.from)}</b> commented on your wish
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>"{n.text}"</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 5, fontWeight: 600 }}>{ago(n.at)} · tap to view</div>
                </div>
                {!n.read && <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--partner)', flexShrink: 0, marginTop: 4 }} />}
              </button>
            </Reveal>
          ))}
        </div>
      )}
    </Screen>
  );
}

// ───────────────────────────────── YOUR GIFT PLANS (secret + reserved)
export function GiftPlans() {
  const { nav, store } = useApp();
  const secret = store.items.filter(i => i.secret && i.owner === 'you');
  const reserved = store.items.filter(i => i.owner === 'partner' && i.reserved);
  const planned = secret.filter(i => !i.bought).length + reserved.length;
  const Card = ({ it, kind }) => (
    <button onClick={() => nav.push(kind === 'reserved' ? 'PartnerList' : 'ItemDetail', kind === 'reserved' ? { listId: it.list } : { itemId: it.id })}
      style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
      background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 10, boxShadow: '0 1px 2px rgba(44,33,24,0.04)', opacity: it.bought ? 0.6 : 1 }}>
      <div style={{ width: 64, height: 64, flexShrink: 0, position: 'relative' }}>
        <Phx label={it.photo} src={it.image} tint="var(--gold)" h={64} radius="var(--r)" />
        <span style={{ position: 'absolute', top: -6, left: -6, width: 24, height: 24, borderRadius: '50%', background: kind === 'reserved' ? 'var(--you)' : 'var(--gold)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(44,33,24,0.2)' }}>{kind === 'reserved' ? <Ix.gift size={13} /> : <Ix.lock size={12} />}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: it.bought ? 'line-through' : 'none' }}>{it.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Mox value={it.price} currency={it.currency} style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }} />
          <span style={{ fontSize: 11.5, color: kind === 'reserved' ? 'var(--you)' : 'var(--gold)', fontWeight: 700 }}>{kind === 'reserved' ? "you'll get this" : it.bought ? 'bought' : 'secret idea'}</span>
        </div>
      </div>
      <span style={{ color: 'var(--ink-faint)' }}><Ix.chevR size={18} /></span>
    </button>
  );
  return (
    <div style={{ position: 'relative', height: '100%', background: 'var(--bg)', overflowY: 'auto', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      <div style={{ background: 'radial-gradient(120% 100% at 50% 0%, #2a1f17, #1a130d)', color: '#F4ECE2', padding: 'calc(46px + env(safe-area-inset-top)) 20px 26px' }}>
        <button onClick={() => nav.pop()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#F4ECE2', display: 'grid', placeItems: 'center', cursor: 'pointer', marginBottom: 16 }}><Ix.chevL size={20} /></button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 12 }}><Ix.lock size={13} />only you can see this</div>
        <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 32, lineHeight: 1.05 }}>Your gift plans</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(244,236,226,0.55)' }}>{planned} gift{planned !== 1 ? 's' : ''} in motion for {store.partner.name}</p>
      </div>
      <div style={{ padding: '20px 20px 130px' }}>
        {reserved.length > 0 && <>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 2px 12px', display: 'flex', alignItems: 'center', gap: 7 }}><Ix.gift size={14} />Reserved from her wishlist</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>{reserved.map((it, k) => <Reveal key={it.id} delay={k * 55}><Card it={it} kind="reserved" /></Reveal>)}</div>
        </>}
        {secret.length > 0 && <>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 2px 12px', display: 'flex', alignItems: 'center', gap: 7 }}><Ix.lock size={14} />Your secret gift ideas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>{secret.map((it, k) => <Reveal key={it.id} delay={k * 55}><Card it={it} kind="secret" /></Reveal>)}</div>
        </>}
        {planned === 0 && reserved.length === 0 && secret.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--ink-faint)' }}>
            <div className="anim-floaty" style={{ display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--surface)', marginBottom: 14 }}><Ix.gift size={26} /></div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-soft)' }}>No gift plans yet</div>
            <div style={{ fontSize: 13 }}>Reserve a gift from {store.partner.name}'s list, or start a secret list.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────── GENIE (seasonal)
// Fixed floating genie character — its outfit changes with the season/event.
function GenieCharacter({ season, size = 138 }) {
  const tint = season.tint;
  const skin = `color-mix(in srgb, ${tint} 38%, #fff)`;
  const dark = `color-mix(in srgb, ${tint} 58%, #2c2018)`;
  const k = season.key;
  const eye = (cx) => <ellipse cx={cx} cy="48" rx="2.8" ry="3.4" fill={dark} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'blink 4.2s ease-in-out infinite' }} />;
  return (
    <div style={{ position: 'relative', width: size, height: size * 1.12, margin: '0 auto' }}>
      {/* glow */}
      <div className="anim-glow" style={{ position: 'absolute', left: '50%', top: '34%', width: size * 0.78, height: size * 0.78, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, ${tint} 0%, transparent 68%)`, opacity: 0.4, pointerEvents: 'none' }} />
      <div className="anim-floaty" style={{ position: 'relative', width: size, height: size * 1.12 }}>
        <svg viewBox="0 0 140 158" width={size} height={size * 1.12} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={'wispG' + k} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={tint} stopOpacity="0.85" />
              <stop offset="1" stopColor={tint} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {/* wisp tail */}
          <g style={{ transformBox: 'fill-box', transformOrigin: 'center top', animation: 'wispSway 4.5s ease-in-out infinite' }}>
            <path d="M70 94 C 44 110, 36 138, 52 151 C 60 158, 80 158, 88 151 C 104 138, 96 110, 70 94 Z" fill={`url(#wispG${k})`} />
          </g>
          {/* cupid wings (behind body) */}
          {k === 'cupid' && <g fill="#fff" opacity="0.95">
            <path d="M48 78 C 28 66, 22 80, 34 88 C 26 90, 30 100, 44 96 Z" />
            <path d="M92 78 C 112 66, 118 80, 106 88 C 114 90, 110 100, 96 96 Z" />
          </g>}
          {/* arms crossed */}
          <path d="M44 90 q26 13 52 0 l-3 11 q-23 10 -46 0 Z" fill={dark} opacity="0.92" />
          {/* body */}
          <path d="M70 56 C 50 56, 43 74, 47 92 C 59 100, 81 100, 93 92 C 97 74, 90 56, 70 56 Z" fill={tint} />
          <circle cx="70" cy="74" r="3.4" fill="#fff" opacity="0.5" />
          {/* head */}
          <circle cx="70" cy="46" r="24" fill={skin} />
          {/* ears */}
          <circle cx="47" cy="48" r="4.5" fill={skin} />
          <circle cx="93" cy="48" r="4.5" fill={skin} />
          {k !== 'santa' && <circle cx="47" cy="56" r="3" fill="#E8B84B" />}
          {/* face */}
          {k === 'sun'
            ? <g fill={dark}><rect x="54" y="42" width="14" height="10" rx="5" /><rect x="72" y="42" width="14" height="10" rx="5" /><rect x="66" y="45" width="8" height="2.6" /></g>
            : <>{eye(62)}{eye(78)}</>}
          {/* cheeks */}
          <circle cx="57" cy="55" r="3.6" fill={tint} opacity="0.38" />
          <circle cx="83" cy="55" r="3.6" fill={tint} opacity="0.38" />
          {/* smile */}
          <path d="M63 56 q7 6.5 14 0" stroke={dark} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* santa beard */}
          {k === 'santa' && <path d="M50 50 q4 26 20 28 q16 -2 20 -28 q-20 14 -40 0 Z" fill="#fff" />}
          {k === 'santa' && <path d="M63 57 q7 5 14 0" stroke="#E9A0A0" strokeWidth="2.2" fill="none" strokeLinecap="round" />}

          {/* hair topknot (default-ish) */}
          {(k === 'genie' || k === 'sun' || k === 'cupid') && <><path d="M58 27 q12 -9 24 0 q-12 -4 -24 0Z" fill={dark} /><circle cx="70" cy="21" r="6" fill={dark} /></>}

          {/* SEASONAL TOPPERS */}
          {k === 'genie' && <path d="M52 30 q18 -10 36 0 l-3 6 q-15 -7 -30 0 Z" fill="#E8B84B" />}
          {k === 'santa' && <>
            <path d="M48 30 C 58 8, 92 8, 96 28 q-24 -10 -48 2 Z" fill="#C0392B" />
            <rect x="46" y="26" width="52" height="9" rx="4.5" fill="#fff" />
            <circle cx="98" cy="14" r="7" fill="#fff" />
          </>}
          {k === 'cupid' && <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'floaty 2.4s ease-in-out infinite' }}>
            <path d="M70 10 c -5 -7 -15 -2 -15 5 c 0 6 9 11 15 15 c 6 -4 15 -9 15 -15 c 0 -7 -10 -12 -15 -5 Z" fill="#E0467E" transform="scale(0.5) translate(70,6)" />
          </g>}
          {k === 'spring' && <g>
            {[[54, 26], [70, 21], [86, 26]].map(([x, y], i) => <g key={i}>
              {[0, 72, 144, 216, 288].map(a => <circle key={a} cx={x + 6 * Math.cos(a * Math.PI / 180)} cy={y + 6 * Math.sin(a * Math.PI / 180)} r="3.6" fill={i === 1 ? '#F2B6C6' : '#F6C9A0'} />)}
              <circle cx={x} cy={y} r="3" fill="#E8B84B" />
            </g>)}
          </g>}
          {k === 'sun' && <g stroke="#F4C04A" strokeWidth="3" strokeLinecap="round">
            {[200, 225, 250, 290, 315, 340].map(a => <line key={a} x1={70 + 24 * Math.cos(a * Math.PI / 180)} y1={46 + 24 * Math.sin(a * Math.PI / 180)} x2={70 + 33 * Math.cos(a * Math.PI / 180)} y2={46 + 33 * Math.sin(a * Math.PI / 180)} />)}
          </g>}
          {k === 'spooky' && <g>
            <ellipse cx="70" cy="30" rx="26" ry="5" fill="#2E2440" />
            <path d="M70 4 L 84 30 L 56 30 Z" fill="#3B2F57" />
            <path d="M58 26 q12 4 24 0 l-1 4 q-11 4 -22 0 Z" fill="#7E5BBE" />
          </g>}

          {/* twinkles */}
          <g fill="#fff" opacity="0.9">
            <circle cx="34" cy="40" r="1.8" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'twinkle 2s ease-in-out infinite' }} />
            <circle cx="108" cy="64" r="2.2" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'twinkle 2.4s ease-in-out infinite .5s' }} />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function Genie() {
  const { nav, store } = useApp();
  const season = React.useMemo(seasonOf, []);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState(false);
  const youName = store.you.name, themName = store.partner.name;

  React.useEffect(() => {
    let alive = true;
    const youW = store.items.filter(i => i.owner === 'you' && !i.secret).map(i => i.name).join(', ');
    const themW = store.items.filter(i => i.owner === 'partner' && !i.secret).map(i => i.name).join(', ');
    const prompt = `You are ${season.name} ${season.emoji}, a witty, mischievous gift genie inside a couple's wishlist app. You are reading two people's wishlists and roasting them affectionately. Be genuinely funny, clever, and a little cheeky — like a perceptive best friend who teases with love. Stay lightly in-character/seasonal. Max 1 emoji per section. Don't be generic or saccharine; make specific, surprising observations about their actual items.
${youName}'s wishes: ${youW || 'none yet'}.
${themName}'s wishes: ${themW || 'none yet'}.
Return ONLY minified JSON, no markdown, with this exact shape:
{"you":"2 witty sentences reading ${youName}'s personality from their wishes","them":"2 witty sentences reading ${themName}'s personality","compare":"2-3 funny, warm sentences comparing the two of them as a couple based on their lists"}`;
    (async () => {
      try {
        // Optional AI bridge: if a `window.claude.complete` (or `WISHFUL_GENIE`)
        // hook is provided by a host/backend, use it; otherwise fall back to a
        // hand-written reading below. A real deployment can wire `window.WISHFUL_GENIE`
        // to a server endpoint that calls the Claude API (keys must stay server-side).
        const complete = (window.WISHFUL_GENIE && window.WISHFUL_GENIE.complete)
          || (window.claude && window.claude.complete);
        if (!complete) throw new Error('no api');
        const raw = await complete(prompt);
        const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
        if (alive) { setData(json); setLoading(false); }
      } catch (e) {
        if (!alive) return;
        setData({
          you: `${youName}, my friend, your list is a love letter to “I'll use it forever” — quietly fancy, allergic to clutter, and secretly proud of it.`,
          them: `${themName} is building a soft, glowy little universe one ceramic and one gold thing at a time. Cozy maximalist energy, and honestly? Iconic.`,
          compare: `One of you romanticises the everyday, the other romanticises the weekend — together you're a very well-dressed hazard to each other's savings. Your lists basically hold hands.`,
        });
        setErr(true); setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const Block = ({ who, label, text, delay }) => (
    <Reveal delay={delay}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
          {who ? <Avx who={who} size={26} /> : <span style={{ fontSize: 20 }}>{season.emoji}</span>}
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--ink)' }}>{text}</p>
      </div>
    </Reveal>
  );

  return (
    <div style={{ position: 'relative', height: '100%', background: 'var(--bg)', overflowY: 'auto', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      {/* dreamy header */}
      <div style={{ position: 'relative', background: `radial-gradient(120% 120% at 50% -10%, color-mix(in srgb, ${season.tint} 60%, #1a130d), #1a130d)`, color: '#F4ECE2', padding: 'calc(46px + env(safe-area-inset-top)) 20px 34px', overflow: 'hidden' }}>
        <button onClick={() => nav.pop()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.14)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', marginBottom: 18, position: 'relative', zIndex: 2 }}><Ix.chevL size={20} /></button>
        {/* floating sparkles */}
        {[0, 1, 2, 3, 4].map(i => <FloatSpark key={i} i={i} />)}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><GenieCharacter season={season} size={140} /></div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 30, lineHeight: 1.05 }}>{season.name} reads your wishes</h1>
          <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.7)' }}>{season.line}</p>
        </div>
      </div>

      <div style={{ padding: '20px 20px 130px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', width: 60, height: 60, marginBottom: 16 }}>
              <span style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', border: '3px solid var(--line)', borderTopColor: season.tint, animation: 'spin 0.9s linear infinite' }} />
              <span style={{ fontSize: 26 }}>{season.emoji}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-soft)' }}>Summoning insights…</div>
            <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 4 }}>Reading {youName}'s &amp; {themName}'s lists</div>
          </div>
        ) : (
          <>
            <Reveal delay={0}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 14px' }}>
                <span style={{ color: season.tint, display: 'inline-flex', flexShrink: 0 }} className="anim-twinkle"><Ix.sparkles size={18} /></span>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 22, whiteSpace: 'nowrap' }}>Genie's insights</span>
              </div>
            </Reveal>
            <Block who="you" label={`${youName}'s wishes`} text={data.you} delay={60} />
            <Block who="partner" label={`${themName}'s wishes`} text={data.them} delay={150} />
            <Reveal delay={240}>
              <div style={{ background: `color-mix(in srgb, ${season.tint} 12%, var(--surface))`, borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 12, boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${season.tint} 30%, transparent)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                  <span style={{ color: season.tint, display: 'inline-flex' }}><Ix.sparkles size={18} /></span>
                  <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>The two of you</span>
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{data.compare}</p>
              </div>
            </Reveal>
            {err && <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 16 }}>✨ offline reading</div>}
          </>
        )}
      </div>
    </div>
  );
}

function FloatSpark({ i }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setOn(true), i * 200); const id = setInterval(() => setOn(o => !o), 1400 + i * 130); return () => { clearTimeout(t); clearInterval(id); }; }, []);
  const pos = [[14, 40], [80, 30], [24, 80], [70, 78], [48, 20]][i];
  return <span style={{ position: 'absolute', left: pos[0] + '%', top: pos[1], color: 'rgba(255,255,255,0.6)', transition: 'all 1.4s ease-in-out', transform: on ? 'translateY(-10px) scale(1.2)' : 'translateY(4px) scale(0.7)', opacity: on ? 0.9 : 0.3, zIndex: 1 }}><Ix.sparkle size={[14, 11, 16, 12, 10][i]} /></span>;
}
