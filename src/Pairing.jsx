// Pairing.jsx — connect the two phones to one shared space. One partner creates
// a space and shares the 6-character code; the other joins with it. Shown only
// when a backend is configured and this device isn't paired yet.
import React from 'react';
import { I as Ico } from './icons.jsx';
import { Pill } from './primitives.jsx';
import { Wordmark } from './shared.jsx';
import { api } from './api.js';

export default function Pairing({ who, onPaired }) {
  const [mode, setMode] = React.useState(null); // null | 'created' | 'join'
  const [code, setCode] = React.useState('');
  const [joinCode, setJoinCode] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [pending, setPending] = React.useState(null); // {spaceId, code}

  const create = async () => {
    setBusy(true); setErr('');
    const r = await api.pairNew();
    setBusy(false);
    if (r.ok && r.data.spaceId) { setPending(r.data); setCode(r.data.code); setMode('created'); }
    else setErr('Could not reach the server. Try again.');
  };
  const join = async () => {
    const c = joinCode.trim().toUpperCase();
    if (c.length < 4) { setErr('Enter the code your partner shared.'); return; }
    setBusy(true); setErr('');
    const r = await api.pairJoin(c);
    setBusy(false);
    if (r.ok && r.data.spaceId) onPaired({ spaceId: r.data.spaceId, code: c });
    else if (r.status === 404) setErr("That code didn't match a space.");
    else setErr('Could not reach the server. Try again.');
  };

  const box = { width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--surface2)', borderRadius: 'var(--r)',
    padding: '15px 16px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 22, fontWeight: 700, letterSpacing: 6,
    textAlign: 'center', color: 'var(--ink)', outline: 'none', textTransform: 'uppercase' };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 360, background: 'var(--bg)',
      backgroundImage: 'radial-gradient(110% 70% at 50% 0%, var(--bg-glow), transparent 60%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', color: 'var(--ink)',
      padding: 'calc(60px + env(safe-area-inset-top)) 26px calc(40px + env(safe-area-inset-bottom))', overflowY: 'auto' }}>
      <Wordmark size={22} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-grid', placeItems: 'center', width: 76, height: 76, borderRadius: '50%',
            background: 'var(--you-soft)', color: 'var(--you)', marginBottom: 16 }} className="anim-floaty"><Ico.heartFill size={34} /></div>
          <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 32, lineHeight: 1.06 }}>
            {mode === 'created' ? 'Share this code' : 'Pair your two phones'}
          </h1>
          <p style={{ margin: '0 auto', fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.5, maxWidth: 300 }}>
            {mode === 'created'
              ? `Send this to your partner. When they enter it on their phone, your wishlists sync — and you'll get notified about each other's comments.`
              : 'One of you starts a shared space; the other joins with the code. Then your lists live in one place on both phones.'}
          </p>
        </div>

        {mode === 'created' ? (
          <>
            <button onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
              style={{ ...box, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
              {code}
              <span style={{ color: copied ? 'var(--you)' : 'var(--ink-faint)', display: 'inline-flex' }}>{copied ? <Ico.check size={20} /> : <Ico.copy size={20} />}</span>
            </button>
            <Pill tone="solid" size="lg" style={{ width: '100%' }} onClick={() => onPaired(pending)}>Continue to Wishful</Pill>
          </>
        ) : mode === 'join' ? (
          <>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6}
              onKeyDown={e => e.key === 'Enter' && join()} autoFocus style={{ ...box, marginBottom: 14 }} />
            {err && <p style={{ color: '#C0492F', fontSize: 13, textAlign: 'center', margin: '0 0 14px' }}>{err}</p>}
            <Pill tone="solid" size="lg" style={{ width: '100%', marginBottom: 10, opacity: busy ? 0.6 : 1 }} onClick={join}>{busy ? 'Joining…' : 'Join'}</Pill>
            <button onClick={() => { setMode(null); setErr(''); }} style={{ width: '100%', border: 'none', background: 'none', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: 10 }}>Back</button>
          </>
        ) : (
          <>
            {err && <p style={{ color: '#C0492F', fontSize: 13, textAlign: 'center', margin: '0 0 14px' }}>{err}</p>}
            <Pill tone="solid" size="lg" style={{ width: '100%', marginBottom: 12, opacity: busy ? 0.6 : 1 }} icon={<Ico.heart size={18} />} onClick={create}>{busy ? 'Creating…' : 'Create our space'}</Pill>
            <Pill tone="soft" size="lg" style={{ width: '100%' }} icon={<Ico.copy size={18} />} onClick={() => { setErr(''); setMode('join'); }}>I have a code to join</Pill>
          </>
        )}
      </div>
    </div>
  );
}
