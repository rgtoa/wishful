// shared.jsx — screen scaffolding & motion helpers used across every screen.
import React from 'react';
import { I } from './icons.jsx';

// Wordmark
export function Wordmark({ size = 26 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, fontFamily: 'var(--font-display)',
      fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: size, color: 'var(--ink)', lineHeight: 1 }}>
      wishful
      <span className="anim-heartbeat" style={{ color: 'var(--you)', display: 'inline-flex', transform: 'translateY(1px)', marginLeft: 1 }}>
        <I.heartFill size={size * 0.42} />
      </span>
    </div>
  );
}

// Screen scaffold: warm background + scroll area with safe areas
export function Screen({ children, scroll = true, pad = true, style }) {
  return (
    <div style={{
      position: 'relative', height: '100%', background: 'var(--bg)',
      backgroundImage: 'radial-gradient(120% 80% at 80% -10%, var(--bg-glow) 0%, transparent 55%)',
      overflowY: scroll ? 'auto' : 'hidden', overflowX: 'hidden',
      fontFamily: 'var(--font-body)', color: 'var(--ink)',
      WebkitOverflowScrolling: 'touch', ...style,
    }}>
      <div style={{ padding: pad ? 'calc(44px + env(safe-area-inset-top)) 20px calc(120px + env(safe-area-inset-bottom))' : 0 }}>{children}</div>
    </div>
  );
}

export function SectionHead({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 12px' }}>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)',
        fontWeight: 'var(--display-weight)', fontSize: 23, letterSpacing: 0.2 }}>{children}</h2>
      {action && <button onClick={onAction} style={{ border: 'none', background: 'none', color: 'var(--you)',
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>{action}</button>}
    </div>
  );
}

export const navBtn = { width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'var(--surface)',
  color: 'var(--ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(44,33,24,0.08)' };
export const glassBtn = { width: 40, height: 40, borderRadius: '50%', border: 'none',
  background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
  color: '#2C2118', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(44,33,24,0.14)' };
export const chip = { display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'var(--surface)',
  color: 'var(--ink)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, padding: '8px 13px',
  borderRadius: 999, cursor: 'pointer', boxShadow: '0 1px 2px rgba(44,33,24,0.05)' };

export function PushBar({ onBack, title, trailing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <button onClick={onBack} style={navBtn}><I.chevL size={20} /></button>
      {trailing || <div style={{ width: 40 }} />}
    </div>
  );
}

// Reveal: gentle rise-in (stagger via delay). Resting state is ALWAYS visible
// (opacity:1); the entrance only animates a transform offset.
export function Reveal({ children, delay = 0, y = 13, dur = 540, style }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setOn(true), 30 + delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      opacity: 1,
      transform: on ? 'none' : `translateY(${y}px)`,
      transition: `transform ${dur}ms cubic-bezier(.22,1,.36,1)`,
      ...style,
    }}>{children}</div>
  );
}

// HeartBurst: floating hearts on a trigger
export function HeartBurst({ fire, color = 'var(--you)' }) {
  const [seeds, setSeeds] = React.useState([]);
  React.useEffect(() => {
    if (!fire) return;
    const id = Date.now();
    const made = Array.from({ length: 7 }, (_, i) => ({ id: id + i, x: (Math.random() - 0.5) * 90, r: (Math.random() - 0.5) * 50, s: 0.7 + Math.random() * 0.7, d: Math.random() * 120 }));
    setSeeds(made);
    const t = setTimeout(() => setSeeds([]), 1100);
    return () => clearTimeout(t);
  }, [fire]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 5 }}>
      {seeds.map(s => <Floater key={s.id} {...s} color={color} />)}
    </div>
  );
}
function Floater({ x, r, s, d, color }) {
  const [go, setGo] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setGo(true), 20 + d); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', color,
      transform: go ? `translate(${x}px,-${70 + Math.random() * 30}px) rotate(${r}deg) scale(${s})` : 'translate(0,0) scale(.2)',
      opacity: go ? 0 : 1, transition: 'transform .95s cubic-bezier(.22,1,.36,1), opacity .95s ease' }}>
      <I.heartFill size={22} />
    </div>
  );
}
