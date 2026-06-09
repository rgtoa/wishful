// home.jsx — Home overview, ListView, ItemDetail + shared cards.
import React from 'react';
import { I as Ico } from './icons.jsx';
import { Avatar as Av, Photo as Ph, PriorityPips as Pips, Money as M, Pill as Btn } from './primitives.jsx';
import { PRIO as PRIOS } from './theme.js';
import { useApp } from './context.js';
import { seasonOf } from './season.js';
import { Wordmark, Screen, SectionHead, PushBar, navBtn, glassBtn, chip, Reveal } from './shared.jsx';

// ── List cover card
export function ListCard({ list, items, onClick }) {
  const its = items.filter(i => i.list === list.id);
  const cover = its[0];
  const tint = list.owner === 'you' ? 'var(--you)' : 'var(--partner)';
  const reservedCount = list.owner === 'partner' ? its.filter(i => i.reserved).length : 0;
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
      background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 8,
      boxShadow: '0 1px 2px rgba(44,33,24,0.04), 0 8px 22px -14px rgba(44,33,24,0.22)',
      WebkitTapHighlightColor: 'transparent', transition: 'transform .14s',
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.985)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ position: 'relative' }}>
        <Ph label={cover ? cover.photo : 'empty'} src={cover && cover.image} tint={tint} h={108} radius="calc(var(--r-lg) - 5px)" />
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 5 }}>
          {reservedCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--surface)',
              color: 'var(--you)', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
              boxShadow: '0 2px 6px rgba(44,33,24,0.12)' }}>
              <Ico.gift size={12} />{reservedCount}
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: '11px 8px 6px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2, marginBottom: 4 }}>{list.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 500 }}>
            {its.length} item{its.length !== 1 ? 's' : ''}
          </span>
          <span style={{ display: 'flex', marginRight: -3 }}>
            {its.slice(0, 3).map((it, k) => (
              <span key={it.id} style={{ width: 18, height: 18, borderRadius: '50%', marginLeft: k ? -6 : 0,
                border: '2px solid var(--surface)',
                background: `repeating-linear-gradient(135deg, color-mix(in srgb, ${tint} 30%, var(--surface2)) 0 3px, color-mix(in srgb, ${tint} 12%, var(--surface2)) 3px 6px)` }} />
            ))}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Item card (grid)
export function ItemCard({ item, onClick, partnerMode }) {
  const tint = item.owner === 'you' ? 'var(--you)' : 'var(--partner)';
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', padding: 0,
      background: 'transparent', WebkitTapHighlightColor: 'transparent', transition: 'transform .14s',
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ position: 'relative' }}>
        <Ph label={item.photo} src={item.image} tint={tint} h={150} />
        {partnerMode && item.reserved && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r)', background: 'color-mix(in srgb, var(--you) 16%, transparent)',
            display: 'grid', placeItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--you)', color: '#fff',
              fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 999, boxShadow: '0 4px 10px rgba(44,33,24,0.2)' }}>
              <Ico.gift size={13} />You reserved
            </span>
          </div>
        )}
        {item.prio === 2 && !(partnerMode && item.reserved) && (
          <span style={{ position: 'absolute', top: 8, left: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--surface)', color: tint, fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
            boxShadow: '0 2px 6px rgba(44,33,24,0.1)' }}><span className="anim-twinkle" style={{ display: 'inline-flex' }}><Ico.sparkle size={11} /></span>dream</span>
        )}
      </div>
      <div style={{ padding: '9px 3px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.25, marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <M value={item.price} currency={item.currency} style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-soft)' }} />
          <Pips level={item.prio} color={tint} />
        </div>
      </div>
    </button>
  );
}

export function ItemRow({ item, onClick, trailing }) {
  const tint = item.owner === 'you' ? 'var(--you)' : 'var(--partner)';
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
      border: 'none', background: 'var(--surface)', borderRadius: 'var(--r)', padding: 9, cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(44,33,24,0.04)', WebkitTapHighlightColor: 'transparent' }}>
      <div style={{ width: 62, height: 62, flexShrink: 0 }}><Ph label={item.photo} src={item.image} tint={tint} h={62} radius="calc(var(--r) - 4px)" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', marginBottom: 4 }}>{item.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <M value={item.price} currency={item.currency} style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-soft)' }} />
          <Pips level={item.prio} color={tint} />
        </div>
      </div>
      {trailing || <span style={{ color: 'var(--ink-faint)' }}><Ico.chevR size={18} /></span>}
    </button>
  );
}

// Floating decorative graphics behind the home content
function HomeDecor() {
  const bits = [
    { type: 'heart', x: '8%', y: 60, size: 26, color: 'var(--you)', op: 0.10, anim: 'drift 7s ease-in-out infinite' },
    { type: 'sparkle', x: '86%', y: 110, size: 20, color: 'var(--gold)', op: 0.22, anim: 'twinkle 2.6s ease-in-out infinite' },
    { type: 'circle', x: '72%', y: 54, size: 14, color: 'var(--partner)', op: 0.16, anim: 'driftB 8s ease-in-out infinite .4s' },
    { type: 'heart', x: '92%', y: 360, size: 18, color: 'var(--partner)', op: 0.10, anim: 'sway 6s ease-in-out infinite' },
    { type: 'sparkle', x: '12%', y: 300, size: 15, color: 'var(--you)', op: 0.18, anim: 'twinkle 3.2s ease-in-out infinite .6s' },
    { type: 'circle', x: '6%', y: 470, size: 10, color: 'var(--gold)', op: 0.18, anim: 'drift 9s ease-in-out infinite 1s' },
    { type: 'ring', x: '88%', y: 560, size: 30, color: 'var(--you)', op: 0.12, anim: 'driftB 10s ease-in-out infinite' },
    { type: 'heart', x: '20%', y: 620, size: 22, color: 'var(--gold)', op: 0.10, anim: 'sway 7s ease-in-out infinite .8s' },
    { type: 'sparkle', x: '60%', y: 680, size: 17, color: 'var(--partner)', op: 0.18, anim: 'twinkle 2.9s ease-in-out infinite .3s' },
  ];
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {bits.map((b, i) => (
        <span key={i} style={{ position: 'absolute', left: b.x, top: b.y, color: b.color, opacity: b.op, animation: b.anim, display: 'inline-flex' }}>
          {b.type === 'heart' && <Ico.heartFill size={b.size} />}
          {b.type === 'sparkle' && <Ico.sparkle size={b.size} />}
          {b.type === 'circle' && <span style={{ width: b.size, height: b.size, borderRadius: '50%', background: 'currentColor', display: 'block' }} />}
          {b.type === 'ring' && <span style={{ width: b.size, height: b.size, borderRadius: '50%', border: '2.5px solid currentColor', display: 'block' }} />}
        </span>
      ))}
    </div>
  );
}

// Gift graphic that floats beside the greeting
function GiftDoodle() {
  return (
    <div className="anim-floaty" style={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
      <div className="anim-glow" style={{ position: 'absolute', inset: 6, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--you-soft), transparent 70%)', opacity: 0.85 }} />
      <span className="anim-twinkle" style={{ position: 'absolute', top: 2, right: 4, color: 'var(--gold)', display: 'inline-flex' }}><Ico.sparkle size={13} /></span>
      <span className="anim-twinkle" style={{ position: 'absolute', bottom: 6, left: -2, color: 'var(--partner)', display: 'inline-flex', animationDelay: '.7s' }}><Ico.sparkle size={10} /></span>
      <svg viewBox="0 0 80 80" width="70" height="70" style={{ position: 'relative', overflow: 'visible' }}>
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center bottom', animation: 'giftLid 2.8s ease-in-out infinite' }}>
          <rect x="20" y="31" width="40" height="12" rx="4" fill="var(--you)" />
          <rect x="36" y="31" width="8" height="12" fill="color-mix(in srgb, var(--you) 55%, #fff)" opacity="0.8" />
          <circle cx="36" cy="29" r="5" fill="none" stroke="var(--you)" strokeWidth="3.2" />
          <circle cx="44" cy="29" r="5" fill="none" stroke="var(--you)" strokeWidth="3.2" />
        </g>
        <rect x="23" y="43" width="34" height="25" rx="4" fill="color-mix(in srgb, var(--you) 86%, #fff)" />
        <rect x="36" y="43" width="8" height="25" fill="color-mix(in srgb, var(--you) 50%, #fff)" opacity="0.75" />
      </svg>
    </div>
  );
}

// Cute animated empty-state
export function EmptyState({ icon = 'gift', title, body, action, onAction, tint = 'var(--you)' }) {
  return (
    <div style={{ textAlign: 'center', padding: '34px 20px 10px' }}>
      <div className="anim-floaty" style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 18px' }}>
        <div className="anim-glow" style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: `radial-gradient(circle, color-mix(in srgb, ${tint} 24%, transparent), transparent 70%)` }} />
        <span style={{ position: 'absolute', top: -2, right: 8, color: 'var(--gold)', display: 'inline-flex' }} className="anim-twinkle"><Ico.sparkle size={16} /></span>
        <span style={{ position: 'absolute', bottom: 4, left: 2, color: tint, display: 'inline-flex', animationDelay: '.6s' }} className="anim-twinkle"><Ico.sparkle size={12} /></span>
        <span style={{ position: 'absolute', top: 18, left: -4, color: 'var(--partner)', display: 'inline-flex', animationDelay: '1.1s' }} className="anim-twinkle"><Ico.heartFill size={11} /></span>
        <div style={{ position: 'absolute', inset: 14, borderRadius: 22, background: `color-mix(in srgb, ${tint} 14%, var(--surface))`,
          display: 'grid', placeItems: 'center', color: tint, boxShadow: `0 10px 26px -12px ${tint}` }}>
          {icon === 'gift' ? <Ico.gift size={32} /> : icon === 'heart' ? <Ico.heartFill size={30} /> : <Ico.sparkle size={30} />}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 22, marginBottom: 6 }}>{title}</div>
      <p style={{ margin: '0 auto', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.45, maxWidth: 250 }}>{body}</p>
      {action && (
        <button onClick={onAction} style={{ marginTop: 16, border: 'none', cursor: 'pointer', background: tint, color: '#fff',
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, padding: '11px 20px', borderRadius: 999,
          display: 'inline-flex', alignItems: 'center', gap: 8 }}><Ico.plus size={17} />{action}</button>
      )}
    </div>
  );
}

// ───────────────────────────────── HOME
export function Home() {
  const { nav, store } = useApp();
  const [who, setWho] = React.useState('you');
  const lists = store.lists.filter(l => l.owner === who && !l.secret);
  const secretLists = store.lists.filter(l => l.owner === 'you' && l.secret);
  const unreadCount = store.notifications.filter(n => !n.read).length;
  const genieSeason = seasonOf();
  const genieLabel = { santa: 'Festive', cupid: 'Love season', spring: 'Spring', sun: 'Summer', spooky: 'Spooky', genie: 'Ready' }[genieSeason.key] || 'Ready';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen>
      <HomeDecor />
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, position: 'relative', zIndex: 1 }}>
        <Wordmark />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => nav.lock()} title="Lock app" style={{ width: 40, height: 40, borderRadius: '50%', border: 'none',
            background: 'var(--surface)', color: 'var(--ink)', display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(44,33,24,0.08)' }}><Ico.lock size={18} /></button>
          <button onClick={() => nav.push('Notifications')} style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', border: 'none',
            background: 'var(--surface)', color: 'var(--ink)', display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(44,33,24,0.08)' }}>
            <Ico.bell size={18} />
            {unreadCount > 0 && <span style={{ position: 'absolute', top: 6, right: 7, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 99,
              background: 'var(--partner)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px var(--surface)' }}>{unreadCount}</span>}
          </button>
          <button onClick={() => nav.go('Profile')} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
            <Av who="you" size={40} />
          </button>
        </div>
      </div>

      {/* greeting */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h1 style={{ margin: 0, flex: 1, minWidth: 0, fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)',
          fontWeight: 'var(--display-weight)', fontSize: 33, lineHeight: 1.05, letterSpacing: 0.2 }}>
          {greet},<br/>{store.you.name}.
        </h1>
        <GiftDoodle />
      </div>

      {/* couple card */}
      <button onClick={() => nav.push('Genie')} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(120deg, var(--you-soft), var(--partner-soft))', borderRadius: 'var(--r-lg)',
        padding: 16, marginBottom: 26, display: 'flex', alignItems: 'center', gap: 14, WebkitTapHighlightColor: 'transparent' }}>
        <div style={{ display: 'flex' }}>
          <Av who="you" size={42} ring />
          <div style={{ marginLeft: -12 }}><Av who="partner" size={42} ring /></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15.5 }}>{store.you.name} &amp; {store.partner.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Ico.sparkle size={12} />Ask the wish genie
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface)',
          color: 'var(--ink-soft)', fontSize: 12, fontWeight: 700, padding: '6px 11px', borderRadius: 999, whiteSpace: 'nowrap' }}>
          <span className="anim-floaty" style={{ fontSize: 15, lineHeight: 1 }}>{genieSeason.emoji}</span>
          {genieLabel}
        </span>
      </button>

      {/* person segmented control */}
      <div style={{ display: 'flex', background: 'color-mix(in srgb, var(--ink) 6%, transparent)', borderRadius: 999,
        padding: 4, marginBottom: 18, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 4, bottom: 4, width: 'calc(50% - 4px)', borderRadius: 999,
          background: 'var(--surface)', boxShadow: '0 1px 4px rgba(44,33,24,0.1)',
          transform: who === 'you' ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .32s cubic-bezier(.32,.72,0,1)' }} />
        {[['you', store.you.name + "'s lists", 'you'], ['partner', store.partner.name + "'s lists", 'partner']].map(([key, label]) => (
          <button key={key} onClick={() => setWho(key)} style={{ flex: 1, position: 'relative', zIndex: 1, border: 'none',
            background: 'none', cursor: 'pointer', padding: '9px 0', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
            color: who === key ? (key === 'you' ? 'var(--you)' : 'var(--partner)') : 'var(--ink-faint)', transition: 'color .2s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* partner gifting hint */}
      {who === 'partner' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface)', borderRadius: 'var(--r)',
          padding: '11px 13px', marginBottom: 16, boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          <span style={{ color: 'var(--you)', display: 'inline-flex' }}><Ico.lock size={16} /></span>
          <span style={{ fontSize: 12.8, color: 'var(--ink-soft)', lineHeight: 1.35 }}>
            Open a list to <b style={{ color: 'var(--ink)' }}>secretly reserve</b> a gift — {store.partner.name} won't see it.
          </span>
        </div>
      )}

      {/* list grid (or empty state) */}
      {lists.length === 0 ? (
        who === 'you' ? (
          <EmptyState icon="gift" title="Start your first list"
            body={"Make a wishlist — birthday picks, everyday wants, someday splurges. " + store.partner.name + " can see them too."}
            action="New list" onAction={() => nav.openSheet('NewList')} />
        ) : (
          <EmptyState icon="heart" title={store.partner.name + " hasn't shared yet"} tint="var(--partner)"
            body={"When " + store.partner.name + " makes a wishlist, it'll appear here — ready for you to spoil her."} />
        )
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {lists.map((l, k) => (
          <Reveal key={l.id} delay={k * 70}>
            <ListCard list={l} items={store.items}
              onClick={() => nav.push(l.owner === 'you' ? 'ListView' : 'PartnerList', { listId: l.id })} />
          </Reveal>
        ))}
        {who === 'you' && (
          <Reveal delay={lists.length * 70}>
            <button onClick={() => nav.openSheet('NewList')} style={{ width: '100%', minHeight: 200, border: '1.5px dashed var(--line)',
              borderColor: 'color-mix(in srgb, var(--ink) 18%, transparent)', borderRadius: 'var(--r-lg)', background: 'transparent',
              cursor: 'pointer', display: 'grid', placeItems: 'center', gap: 8, color: 'var(--ink-soft)', WebkitTapHighlightColor: 'transparent' }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--you-soft)', color: 'var(--you)',
                display: 'grid', placeItems: 'center' }}><Ico.plus size={20} /></span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>New list</span>
            </button>
          </Reveal>
        )}
      </div>
      )}

      {/* secret gift ideas (yours only) */}
      {who === 'you' && secretLists.length > 0 && (
        <Reveal delay={(lists.length + 1) * 70}>
          <div style={{ marginTop: 26 }}>
            <SectionHead>Secret gift ideas</SectionHead>
            {secretLists.map(l => {
              const cnt = store.items.filter(i => i.list === l.id && !i.bought).length;
              return (
                <button key={l.id} onClick={() => nav.push('SecretList', { listId: l.id })} style={{ width: '100%', textAlign: 'left',
                  border: 'none', cursor: 'pointer', borderRadius: 'var(--r-lg)', padding: 16, display: 'flex', alignItems: 'center', gap: 14,
                  background: 'radial-gradient(130% 130% at 0% 0%, #2c2017, #1a130d)', color: '#F4ECE2', marginBottom: 12,
                  boxShadow: '0 10px 26px -14px rgba(44,33,24,0.5)', WebkitTapHighlightColor: 'transparent' }}>
                  <span style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.07)', color: 'var(--gold)',
                    display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ico.lock size={22} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 2 }}>{l.name}</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(244,236,226,0.55)' }}>{cnt} idea{cnt !== 1 ? 's' : ''} · hidden from {store.partner.name}</div>
                  </div>
                  <span style={{ color: 'rgba(244,236,226,0.5)' }}><Ico.chevR size={18} /></span>
                </button>
              );
            })}
            <button onClick={() => nav.openSheet('NewList', { secret: true })} style={{ width: '100%', border: 'none',
              background: 'transparent', cursor: 'pointer', borderRadius: 'var(--r)', padding: '13px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--ink-soft)', fontFamily: 'var(--font-body)',
              fontWeight: 600, fontSize: 13.5, boxShadow: 'inset 0 0 0 1.5px var(--line)' }}>
              <Ico.plus size={16} />New secret list
            </button>
          </div>
        </Reveal>
      )}
      </div>
    </Screen>
  );
}

// ───────────────────────────────── LIST VIEW (your own)
export function ListView({ listId }) {
  const { nav, store } = useApp();
  const list = store.lists.find(l => l.id === listId);
  const [layout, setLayout] = React.useState('grid');
  const [sort, setSort] = React.useState('prio');
  if (!list) return <Screen><PushBar onBack={() => nav.pop()} /></Screen>;
  let items = store.items.filter(i => i.list === listId);
  items = [...items].sort((a, b) => sort === 'prio' ? b.prio - a.prio : (a.price || 0) - (b.price || 0));
  const total = items.reduce((s, i) => s + (i.price || 0), 0);
  const isYou = list.owner === 'you';
  const tint = isYou ? 'var(--you)' : 'var(--partner)';

  return (
    <Screen>
      <PushBar onBack={() => nav.pop()} title={list.name}
        trailing={<button onClick={() => nav.openSheet('ListMenu', { listId })} style={navBtn}><Ico.dots size={20} /></button>} />
      {/* hero */}
      <div style={{ marginTop: 6, marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)',
          fontWeight: 'var(--display-weight)', fontSize: 32, lineHeight: 1.06 }}>{list.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-soft)', fontSize: 13, fontWeight: 500 }}>
          <Av who={list.owner} size={20} />
          <span>{items.length} items</span>
          <span style={{ width: 3, height: 3, borderRadius: 99, background: 'currentColor', opacity: .5 }} />
          <span><M value={total} /> total</span>
        </div>
      </div>

      {/* controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <button onClick={() => setSort(s => s === 'prio' ? 'price' : 'prio')} style={{ ...chip }}>
          <Ico.arrowR size={14} style={{ transform: 'rotate(90deg)' }} />
          {sort === 'prio' ? 'Priority' : 'Price'}
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', background: 'color-mix(in srgb, var(--ink) 6%, transparent)', borderRadius: 999, padding: 3 }}>
          {[['grid', Ico.grid], ['rows', Ico.rows]].map(([k, IcoC]) => (
            <button key={k} onClick={() => setLayout(k)} style={{ width: 34, height: 30, borderRadius: 999, border: 'none',
              background: layout === k ? 'var(--surface)' : 'transparent', color: layout === k ? 'var(--ink)' : 'var(--ink-faint)',
              display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: layout === k ? '0 1px 3px rgba(44,33,24,0.12)' : 'none' }}>
              <IcoC size={17} />
            </button>
          ))}
        </div>
      </div>

      {/* items */}
      {items.length === 0 ? (
        <EmptyState icon="sparkle" tint={tint}
          title={isYou ? 'This list is empty' : 'Nothing here yet'}
          body={isYou ? 'Add the first wish — paste a link, snap a photo, or just jot down what you love.' : store.partner.name + " hasn't added anything to this list yet."}
          action={isYou ? 'Add a wish' : null} onAction={() => nav.openSheet('AddItem', { listId })} />
      ) : layout === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {items.map(it => <ItemCard key={it.id} item={it} onClick={() => nav.push('ItemDetail', { itemId: it.id })} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(it => <ItemRow key={it.id} item={it} onClick={() => nav.push('ItemDetail', { itemId: it.id })} />)}
        </div>
      )}

      {isYou && items.length > 0 && (
        <button onClick={() => nav.openSheet('AddItem', { listId })} style={{ marginTop: 18, width: '100%', border: 'none',
          background: 'var(--surface)', borderRadius: 'var(--r)', padding: '15px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--you)', fontWeight: 600, fontSize: 14.5,
          fontFamily: 'var(--font-body)', boxShadow: 'inset 0 0 0 1.5px var(--you-soft)' }}>
          <Ico.plus size={18} />Add to this list
        </button>
      )}
    </Screen>
  );
}

// ───────────────────────────────── ITEM DETAIL
export function ItemDetail({ itemId }) {
  const { nav, store } = useApp();
  const item = store.items.find(i => i.id === itemId) || (store.deleted || []).find(i => i.id === itemId);
  if (!item) return <Screen><PushBar onBack={() => nav.pop()} /></Screen>;
  const list = store.lists.find(l => l.id === item.list);
  const tint = item.secret ? 'var(--gold)' : item.owner === 'you' ? 'var(--you)' : 'var(--partner)';

  return (
    <Screen pad={false}>
      {/* big image header */}
      <div style={{ position: 'relative' }}>
        <Ph label={item.photo} src={item.image} tint={tint} h={420} radius="0" />
        <div style={{ position: 'absolute', top: 'calc(40px + env(safe-area-inset-top))', left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => nav.pop()} style={glassBtn}><Ico.chevL size={20} /></button>
          <button onClick={() => nav.openSheet('ItemMenu', { itemId })} style={glassBtn}><Ico.dots size={20} /></button>
        </div>
      </div>

      <div style={{ marginTop: -26, position: 'relative', background: 'var(--bg)', borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        padding: '24px 20px 130px', minHeight: 300 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface)', borderRadius: 999,
            padding: '5px 11px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-soft)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            <Av who={item.owner} size={16} />{list ? list.name : ''}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 500 }}>added {item.added} ago</span>
        </div>

        <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)',
          fontWeight: 'var(--display-weight)', fontSize: 30, lineHeight: 1.08 }}>{item.name}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <M value={item.price} currency={item.currency} style={{ fontSize: 24, fontWeight: 700 }} />
          {item.store && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5,
            color: 'var(--you)', fontWeight: 600 }}><Ico.tag size={14} />{item.store}</span>}
        </div>

        {/* priority block */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>How much I want it</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{PRIOS[item.prio].label}</div>
          </div>
          <Pips level={item.prio} color={tint} size={11} />
        </div>

        {item.note && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Note</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--ink)' }}>{item.note}</p>
          </div>
        )}
        {item.url && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--surface2)', color: 'var(--you)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ico.link size={17} /></span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Shop link</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url.replace(/^https?:\/\//, '')}</div>
            </div>
          </div>
        )}
        {/* actions — inline so the comments thread below is never covered */}
        <div style={{ display: 'flex', gap: 10, margin: '18px 0 6px' }}>
          {item.secret ? (
            <>
              <Btn tone="soft" size="lg" style={{ flex: 1 }} icon={<Ico.edit size={18} />}
                onClick={() => nav.openSheet('AddItem', { itemId })}>Edit</Btn>
              <Btn size="lg" style={{ flex: 1.3, background: item.bought ? 'var(--gold)' : 'var(--ink)', color: '#fff' }}
                icon={<Ico.check size={18} />} onClick={() => store.toggleBought(item.id)}>
                {item.bought ? 'Bought ✓' : 'Mark as bought'}
              </Btn>
            </>
          ) : item.owner === 'you' ? (
            <Btn tone="soft" size="lg" style={{ flex: 1 }} icon={<Ico.edit size={18} />}
              onClick={() => nav.openSheet('AddItem', { itemId })}>Edit wish</Btn>
          ) : (
            <Btn tone="solid" size="lg" style={{ flex: 1 }}
              icon={<Ico.gift size={18} />} onClick={() => nav.push('PartnerList', { listId: item.list })}>
              Reserve this gift
            </Btn>
          )}
        </div>

        {!item.secret && (
          <div style={{ height: 1, background: 'var(--line)', margin: '20px 0 18px' }} />
        )}
        {!item.secret && <CommentsBlock item={item} />}
      </div>
    </Screen>
  );
}

// ── comments thread (inside a wish)
export function CommentsBlock({ item }) {
  const { store } = useApp();
  const [text, setText] = React.useState('');
  const comments = item.comments || [];
  const send = () => { if (!text.trim()) return; store.addComment(item.id, text.trim()); setText(''); };
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
        <Ico.chat size={14} />Comments{comments.length > 0 ? ' · ' + comments.length : ''}
      </div>
      {comments.length === 0 && (
        <div style={{ fontSize: 13.5, color: 'var(--ink-faint)', marginBottom: 14, lineHeight: 1.4 }}>No comments yet — leave {store.partner.name} a little note.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 14 }}>
        {comments.map((c, i) => {
          const mine = c.by === store.currentUser;
          return (
            <div key={i} style={{ display: 'flex', gap: 9, flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              <Av who={mine ? 'you' : 'partner'} size={28} />
              <div style={{ maxWidth: '78%', background: mine ? 'var(--you)' : 'var(--surface)', color: mine ? '#fff' : 'var(--ink)',
                borderRadius: mine ? 'var(--r) var(--r) 5px var(--r)' : 'var(--r) var(--r) var(--r) 5px', padding: '9px 13px',
                boxShadow: mine ? 'none' : 'inset 0 0 0 1px var(--line)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.7, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{store.nameOf(c.by)}</div>
                <div style={{ fontSize: 14, lineHeight: 1.4 }}>{c.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--surface)', borderRadius: 999, padding: '5px 5px 5px 16px', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={'Comment as ' + store.you.name + '…'} style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--ink)' }} />
        <button onClick={send} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0, cursor: 'pointer',
          background: text.trim() ? 'var(--you)' : 'var(--surface2)', color: text.trim() ? '#fff' : 'var(--ink-faint)', display: 'grid', placeItems: 'center', transition: 'all .15s' }}><Ico.send size={18} /></button>
      </div>
    </div>
  );
}
