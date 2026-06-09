// primitives.jsx — shared UI primitives: Avatar, Photo, PriorityPips, Money, Sheet, Pill.
import React from 'react';
import { I } from './icons.jsx';
import { CURRENCIES, PRIO } from './theme.js';
import { PROFILE } from './context.js';

export function Avatar({ who, size = 36, ring }) {
  const isYou = who === 'you';
  const color = isYou ? 'var(--you)' : 'var(--partner)';
  const soft = isYou ? 'var(--you-soft)' : 'var(--partner-soft)';
  const nm = isYou ? (PROFILE.youName || 'Rafael') : (PROFILE.partnerName || 'Thrisha');
  const initial = (nm.trim()[0] || (isYou ? 'R' : 'T')).toUpperCase();
  const photo = isYou ? PROFILE.youAvatar : PROFILE.partnerAvatar;
  if (photo) return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px var(--surface), 0 0 0 ${2 + size * 0.06}px ${color}` : 'none' }}>
      <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: soft, color,
      display: 'grid', placeItems: 'center', flexShrink: 0,
      fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)',
      fontWeight: 600, fontSize: size * 0.46, lineHeight: 1,
      boxShadow: ring ? `0 0 0 2px var(--surface), 0 0 0 ${2 + size * 0.06}px ${color}` : 'none',
    }}>{initial}</div>
  );
}

// Product imagery: shows the uploaded photo if one exists, otherwise a striped
// warm default background (with an optional lowercase label).
export function Photo({ label, src, tint = 'var(--you)', h = '100%', radius = 'var(--r)', mono = true }) {
  if (src) {
    return (
      <div style={{ position: 'relative', width: '100%', height: h, borderRadius: radius, overflow: 'hidden', background: 'var(--surface2)' }}>
        <img src={src} alt={label || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{
      position: 'relative', width: '100%', height: h, borderRadius: radius, overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, color-mix(in srgb, ${tint} 11%, var(--surface2)) 0 9px, color-mix(in srgb, ${tint} 5%, var(--surface2)) 9px 18px)`,
      display: 'grid', placeItems: 'center',
    }}>
      <span style={{
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 10.5, letterSpacing: 0.3, color: `color-mix(in srgb, ${tint} 78%, var(--ink))`,
        background: 'color-mix(in srgb, var(--surface) 78%, transparent)',
        padding: '3px 7px', borderRadius: 999, textTransform: 'lowercase',
        backdropFilter: 'blur(2px)',
      }}>{mono ? label : ''}</span>
    </div>
  );
}

export function PriorityPips({ level = 0, size = 6, showLabel = false, color = 'var(--you)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: size, height: size, borderRadius: '50%',
            background: i <= level ? color : 'color-mix(in srgb, var(--ink) 14%, transparent)',
          }} />
        ))}
      </div>
      {showLabel && <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>{PRIO[level].label}</span>}
    </div>
  );
}

export function Money({ value, currency, size, style }) {
  const c = CURRENCIES.find(x => x.code === (currency || 'PHP')) || CURRENCIES[0];
  const sp = c.symbol.length > 1 ? ' ' : '';
  return <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
    {value == null ? '—' : c.symbol + sp + value.toLocaleString()}
  </span>;
}

// Bottom sheet — mounts on open, reveals after a tick so the transition runs.
export function Sheet({ open, onClose, children, height = 'auto', tall }) {
  const [mounted, setMounted] = React.useState(open);
  const [reveal, setReveal] = React.useState(false);
  React.useEffect(() => {
    let t;
    if (open) { setMounted(true); t = setTimeout(() => setReveal(true), 24); }
    else { setReveal(false); t = setTimeout(() => setMounted(false), 440); }
    return () => clearTimeout(t);
  }, [open]);
  if (!mounted) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(28,20,14,0.34)',
        opacity: reveal ? 1 : 0, transition: 'opacity .32s ease', backdropFilter: reveal ? 'blur(2px)' : 'none',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--surface)', borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        maxHeight: tall ? '94%' : '88%', height,
        transform: reveal ? 'translateY(0)' : 'translateY(42px)',
        opacity: 1,
        transition: 'transform .44s cubic-bezier(.32,.72,0,1)',
        boxShadow: '0 -12px 40px rgba(28,20,14,0.18)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', paddingTop: 10, flexShrink: 0 }}>
          <div style={{ width: 38, height: 5, borderRadius: 99, background: 'color-mix(in srgb, var(--ink) 16%, transparent)' }} />
        </div>
        {children}
      </div>
    </div>
  );
}

// Soft pill button
export function Pill({ children, onClick, tone = 'ghost', size = 'md', style, icon }) {
  const tones = {
    solid:   { background: 'var(--you)', color: '#fff' },
    soft:    { background: 'var(--you-soft)', color: 'var(--you)' },
    partner: { background: 'var(--partner)', color: '#fff' },
    ghost:   { background: 'color-mix(in srgb, var(--ink) 6%, transparent)', color: 'var(--ink)' },
    outline: { background: 'transparent', color: 'var(--ink)', boxShadow: 'inset 0 0 0 1.5px var(--line)' },
  };
  const sz = size === 'lg' ? { padding: '15px 22px', fontSize: 16 } :
             size === 'sm' ? { padding: '8px 13px', fontSize: 13 } : { padding: '11px 17px', fontSize: 14.5 };
  return (
    <button onClick={onClick} style={{
      border: 'none', borderRadius: 999, fontFamily: 'var(--font-body)', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer', WebkitTapHighlightColor: 'transparent', transition: 'transform .12s ease, filter .15s',
      ...tones[tone], ...sz, ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      {icon}{children}
    </button>
  );
}
