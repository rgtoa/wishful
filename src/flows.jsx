// flows.jsx — AddItem, NewList, PartnerList (secret reserve), Share, Profile,
// Onboarding, ItemMenu/ListMenu sheets.
import React from 'react';
import { I as Ic } from './icons.jsx';
import { Avatar as Avt, Photo as Pho, PriorityPips as Pp, Money as Mo, Pill as Bt } from './primitives.jsx';
import { PRIO as PR, CURRENCIES } from './theme.js';
import { useApp } from './context.js';
import { Screen, PushBar, navBtn, Wordmark } from './shared.jsx';

// ───────── shared sheet header
export function SheetHead({ title, onClose, onDone, doneLabel = 'Save', doneDisabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 12px', flexShrink: 0 }}>
      <button onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)',
        fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Cancel</button>
      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 19, whiteSpace: 'nowrap', flexShrink: 0, padding: '0 10px' }}>{title}</div>
      {onDone ? (
        <button onClick={onDone} disabled={doneDisabled} style={{ border: 'none', background: 'none',
          color: doneDisabled ? 'var(--ink-faint)' : 'var(--you)', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
          cursor: doneDisabled ? 'default' : 'pointer', padding: 0 }}>{doneLabel}</button>
      ) : <div style={{ width: 44 }} />}
    </div>
  );
}

const fieldLabel = { fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' };
const Req = () => <span style={{ color: 'var(--you)', marginLeft: 3 }}>*</span>;
const inputStyle = { width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--surface2)', borderRadius: 'var(--r)',
  padding: '14px 15px', fontFamily: 'var(--font-body)', fontSize: 15.5, color: 'var(--ink)', outline: 'none' };

// ───────────────────────────────── ADD / EDIT ITEM
export function AddItem({ listId, itemId, secret, newList }) {
  const { nav, store } = useApp();
  const editing = store.items.find(i => i.id === itemId);
  const [name, setName] = React.useState(editing?.name || '');
  const [price, setPrice] = React.useState(editing?.price != null ? String(editing.price) : '');
  const [storeN, setStoreN] = React.useState(editing?.store || '');
  const [note, setNote] = React.useState(editing?.note || '');
  const [url, setUrl] = React.useState(editing?.url || '');
  const [prio, setPrio] = React.useState(editing?.prio ?? 1);
  const [image, setImage] = React.useState(editing?.image || null); // uploaded photo (data URL)
  const galleryRef = React.useRef();
  const cameraRef = React.useRef();
  const [currency, setCurrency] = React.useState(editing?.currency || store.currency || 'PHP');
  const firstOwnList = store.lists.find(l => l.owner === 'you' && !l.secret);
  const [list, setList] = React.useState(editing?.list || listId || (firstOwnList && firstOwnList.id));
  const myLists = store.lists.filter(l => l.owner === 'you' && !l.secret);
  const targetList = store.lists.find(l => l.id === list);
  const isSecret = !!(secret || newList?.secret || editing?.secret || (targetList && targetList.secret));
  const tint = isSecret ? 'var(--gold)' : 'var(--you)';
  const curObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const curSym = curObj.symbol;
  const canSave = !!(name.trim() && price && storeN.trim());

  const pickPhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result);
    r.readAsDataURL(f);
  };

  const save = () => {
    if (!canSave) return;
    const base = { name: name.trim(), price: price ? Number(price) : null, currency, store: storeN.trim(), url: url.trim(), note: note.trim(), prio, image: image || null };
    if (editing) { store.updateItem(itemId, { ...base, list }); nav.closeSheet(); return; }
    // a brand-new list comes to life only when its first wish is saved
    if (newList) {
      const id = store.addList({ name: newList.name, ...(newList.secret ? { secret: true, forWho: 'partner' } : {}) });
      store.addItem({ ...base, list: id, photo: name.trim().toLowerCase(), added: 'just now', ...(newList.secret ? { secret: true, bought: false } : {}) });
      nav.closeSheet(); nav.celebrateThen('list'); return;
    }
    store.addItem({ ...base, list, photo: name.trim().toLowerCase(), added: 'just now', ...(isSecret ? { secret: true, bought: false } : {}) });
    nav.closeSheet(); nav.celebrateThen('wish');
  };

  const title = editing ? 'Edit item' : newList ? (newList.secret ? 'First secret idea' : 'First wish') : isSecret ? 'New secret idea' : 'New wish';

  return (
    <>
      <SheetHead title={title} onClose={() => nav.closeSheet()} onDone={save} doneDisabled={!canSave} doneLabel={newList ? 'Create list' : 'Save'} />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 18px 30px' }}>
        {newList && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `color-mix(in srgb, ${tint} 12%, var(--surface2))`,
            borderRadius: 'var(--r)', padding: '10px 13px', marginBottom: 16, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 500 }}>
            <span style={{ color: tint, display: 'inline-flex' }}><Ic.gift size={15} /></span>
            Adding the first wish to <b style={{ color: 'var(--ink)' }}>“{newList.name}”</b>.
          </div>
        )}
        {/* photo slot — upload a real photo, or a default background takes over */}
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <Pho label={image ? '' : (name ? name.toLowerCase() : 'add a photo')} src={image} tint={tint} h={150} />
          <input ref={galleryRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} style={{ display: 'none' }} />
          <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 8 }}>
            {image && (
              <button onClick={() => setImage(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--surface)', color: 'var(--ink-soft)', border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 700, padding: '8px 12px', borderRadius: 999, boxShadow: '0 2px 8px rgba(44,33,24,0.12)' }}><Ic.x size={15} />Remove</button>
            )}
            <button onClick={() => galleryRef.current.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--surface)', color: tint, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 700, padding: '8px 12px', borderRadius: 999, boxShadow: '0 2px 8px rgba(44,33,24,0.12)' }}><Ic.tag size={15} />Photo</button>
            <button onClick={() => cameraRef.current.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--surface)', color: tint, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 700, padding: '8px 12px', borderRadius: 999, boxShadow: '0 2px 8px rgba(44,33,24,0.12)' }}><Ic.camera size={15} />Camera</button>
          </div>
        </div>

        {isSecret && !newList && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'color-mix(in srgb, var(--gold) 12%, var(--surface2))',
            borderRadius: 'var(--r)', padding: '10px 13px', marginBottom: 16, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 500 }}>
            <span style={{ color: 'var(--gold)', display: 'inline-flex' }}><Ic.lock size={15} /></span>
            A gift idea for {store.partner.name} — only you will ever see it.
          </div>
        )}

        <label style={fieldLabel}>What is it?<Req /></label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Linen overshirt" style={{ ...inputStyle, marginBottom: 16, fontSize: 17, fontWeight: 600 }} />

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 124 }}>
            <label style={fieldLabel}>Currency</label>
            <div style={{ position: 'relative' }}>
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 28, cursor: 'pointer', fontWeight: 700 }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-faint)' }}><Ic.chevDown size={16} /></span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={fieldLabel}>Price<Req /></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', fontSize: 14, fontWeight: 700 }}>{curSym}</span>
              <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="0" style={{ ...inputStyle, paddingLeft: curSym.length > 1 ? 14 + curSym.length * 9 : 26 }} />
            </div>
          </div>
        </div>

        <label style={fieldLabel}>Store<Req /></label>
        <input value={storeN} onChange={e => setStoreN(e.target.value)} placeholder="Where to buy" style={{ ...inputStyle, marginBottom: 16 }} />

        <label style={fieldLabel}>Shop link <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--ink-faint)' }}>— optional</span></label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', display: 'inline-flex' }}><Ic.link size={17} /></span>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" inputMode="url" style={{ ...inputStyle, paddingLeft: 40, fontSize: 14.5 }} />
        </div>

        {/* priority */}
        <label style={fieldLabel}>How much {isSecret ? 'do they' : 'do you'} want it?<Req /></label>
        <div style={{ display: 'flex', gap: 9, marginBottom: 18 }}>
          {PR.map((p, idx) => (
            <button key={idx} onClick={() => setPrio(idx)} style={{ flex: 1, border: 'none', cursor: 'pointer',
              background: prio === idx ? `color-mix(in srgb, ${tint} 16%, var(--surface2))` : 'var(--surface2)', borderRadius: 'var(--r)', padding: '12px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'background .2s',
              boxShadow: prio === idx ? `inset 0 0 0 1.5px ${tint}` : 'none' }}>
              <Pp level={idx} size={7} color={prio === idx ? tint : 'var(--ink-faint)'} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: prio === idx ? tint : 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.15 }}>{p.label}</span>
            </button>
          ))}
        </div>

        {/* list selector — hidden while creating a brand-new list */}
        {!isSecret && !newList && (<>
          <label style={fieldLabel}>Add to list<Req /></label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {myLists.map(l => (
              <button key={l.id} onClick={() => setList(l.id)} style={{ border: 'none', cursor: 'pointer', borderRadius: 999,
                padding: '9px 14px', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
                background: list === l.id ? 'var(--you)' : 'var(--surface2)', color: list === l.id ? '#fff' : 'var(--ink-soft)', transition: 'all .15s' }}>{l.name}</button>
            ))}
          </div>
        </>)}

        <label style={fieldLabel}>Note <span style={{ textTransform: 'none', fontWeight: 500, color: 'var(--ink-faint)' }}>— optional, the little details</span></label>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add the little details…" rows={3}
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.45 }} />
      </div>
    </>
  );
}

// ───────────────────────────────── NEW LIST
export function NewList({ secret: secretParam }) {
  const { nav, store } = useApp();
  const [name, setName] = React.useState('');
  const [secret, setSecret] = React.useState(!!secretParam);
  const tint = secret ? 'var(--gold)' : 'var(--you)';
  return (
    <>
      <SheetHead title={secret ? 'New secret list' : 'New list'} onClose={() => nav.closeSheet()} doneLabel="Next" doneDisabled={!name.trim()}
        onDone={() => nav.replaceSheet('AddItem', { newList: { name: name.trim(), secret } })} />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 18px 30px' }}>
        <label style={fieldLabel}>List name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={secret ? 'e.g. Gifts for ' + store.partner.name : 'e.g. Apartment things'} autoFocus
          style={{ ...inputStyle, marginBottom: 10, fontSize: 17, fontWeight: 600 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--ink-faint)', margin: '0 2px 18px' }}>
          <Ic.sparkle size={14} style={{ color: tint, flexShrink: 0 }} />Next you'll add your first wish — that's what brings the list to life.
        </div>

        {/* secret toggle */}
        <button onClick={() => setSecret(s => !s)} style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
          background: secret ? 'radial-gradient(130% 130% at 0% 0%, #2c2017, #1a130d)' : 'var(--surface2)', color: secret ? '#F4ECE2' : 'var(--ink)',
          borderRadius: 'var(--r)', padding: '14px 15px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, transition: 'all .25s' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0,
            background: secret ? 'rgba(255,255,255,0.08)' : 'var(--surface)', color: secret ? 'var(--gold)' : 'var(--ink-faint)' }}><Ic.lock size={17} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>Make it a secret list</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 1 }}>Gift ideas for {store.partner.name}, hidden from her</div>
          </div>
          <span style={{ width: 46, height: 28, borderRadius: 999, flexShrink: 0, position: 'relative', transition: 'background .25s',
            background: secret ? 'var(--gold)' : 'color-mix(in srgb, var(--ink) 16%, transparent)' }}>
            <span style={{ position: 'absolute', top: 3, left: 3, width: 22, height: 22, borderRadius: '50%', background: '#fff',
              transform: secret ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .25s cubic-bezier(.32,.72,0,1)' }} />
          </span>
        </button>
      </div>
    </>
  );
}

// ───────────────────────────────── RENAME / EDIT LIST
export function EditList({ listId }) {
  const { nav, store } = useApp();
  const list = store.lists.find(l => l.id === listId);
  const [name, setName] = React.useState(list?.name || '');
  const [coverImage, setCoverImage] = React.useState(list?.coverImage || null);
  const fileRef = React.useRef();
  if (!list) return null;
  const firstItem = store.items.filter(i => i.list === listId)[0];
  const previewSrc = coverImage || (firstItem && firstItem.image) || null;
  const previewLabel = coverImage ? '' : (firstItem ? firstItem.photo : 'no wishes yet');
  const tint = list.secret ? 'var(--gold)' : 'var(--you)';
  const onFile = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => setCoverImage(r.result); r.readAsDataURL(f); };
  const save = () => { if (!name.trim()) return; store.updateList(listId, { name: name.trim(), coverImage: coverImage || null }); nav.closeSheet(); };
  return (
    <>
      <SheetHead title="Edit list" onClose={() => nav.closeSheet()} doneLabel="Save" doneDisabled={!name.trim()} onDone={save} />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 18px 30px' }}>
        <label style={fieldLabel}>List name</label>
        <input value={name} onChange={e => setName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && save()}
          style={{ ...inputStyle, marginBottom: 20, fontSize: 17, fontWeight: 600 }} />

        <label style={fieldLabel}>Cover</label>
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Pho label={previewLabel} src={previewSrc} tint={tint} h={140} />
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
          <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 8 }}>
            {coverImage && (
              <button onClick={() => setCoverImage(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface)', color: 'var(--ink-soft)', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, padding: '8px 12px', borderRadius: 999, boxShadow: '0 2px 8px rgba(44,33,24,0.12)' }}><Ic.x size={15} />Use first wish</button>
            )}
            <button onClick={() => fileRef.current.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface)', color: tint, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, padding: '8px 12px', borderRadius: 999, boxShadow: '0 2px 8px rgba(44,33,24,0.12)' }}><Ic.camera size={15} />Cover photo</button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '0 2px' }}>No cover photo? The list shows your first wish's photo.</p>
      </div>
    </>
  );
}

// ───────────────────────────────── PARTNER LIST (secret reserve)
export function PartnerList({ listId }) {
  const { nav, store } = useApp();
  const list = store.lists.find(l => l.id === listId);
  if (!list) return <Screen><PushBar onBack={() => nav.pop()} /></Screen>;
  const items = [...store.items.filter(i => i.list === listId)].sort((a, b) => b.prio - a.prio);
  const reserved = items.filter(i => i.reserved).length;

  return (
    <Screen>
      <PushBar onBack={() => nav.pop()} />
      {/* hero */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 10, background: 'var(--partner-soft)',
          color: 'var(--partner)', padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
          <Avt who="partner" size={18} />{store.partner.name}'s list
        </div>
        <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)',
          fontWeight: 'var(--display-weight)', fontSize: 32, lineHeight: 1.06 }}>{list.name}</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.4 }}>{items.length} items · she can't see what you reserve</p>
      </div>

      {/* secret banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--ink)', color: 'var(--surface)',
        borderRadius: 'var(--r)', padding: '13px 15px', marginBottom: 20 }}>
        <span style={{ display: 'inline-flex', color: 'var(--surface)' }}><Ic.lock size={18} /></span>
        <div style={{ flex: 1, fontSize: 12.8, lineHeight: 1.35 }}>
          <b>Secret mode.</b> {reserved > 0 ? `You've reserved ${reserved} gift${reserved > 1 ? 's' : ''} here.` : 'Reserve a gift and it stays hidden from her.'}
        </div>
      </div>

      {/* items with reserve */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map(it => <GiftRow key={it.id} item={it} onOpen={() => nav.push('ItemDetail', { itemId: it.id })}
          onReserve={() => store.toggleReserve(it.id)} />)}
      </div>
    </Screen>
  );
}

function GiftRow({ item, onReserve, onOpen }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 10, position: 'relative',
      boxShadow: item.reserved ? 'inset 0 0 0 2px var(--you)' : '0 1px 2px rgba(44,33,24,0.04)', transition: 'box-shadow .2s' }}>
      <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
        <button onClick={onOpen} style={{ width: 76, height: 76, flexShrink: 0, border: 'none', padding: 0, background: 'none', cursor: 'pointer', position: 'relative' }}>
          <Pho label={item.photo} src={item.image} tint="var(--partner)" h={76} radius="var(--r)" />
          {item.reserved && <span style={{ position: 'absolute', top: -7, left: -7, width: 26, height: 26, borderRadius: '50%',
            background: 'var(--you)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 2px 6px rgba(44,33,24,0.2)' }}><Ic.gift size={15} /></span>}
        </button>
        <button onClick={onOpen} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
            <Mo value={item.price} currency={item.currency} style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-soft)' }} />
            <Pp level={item.prio} color="var(--partner)" />
          </div>
          {item.note && <div style={{ fontSize: 12, color: 'var(--ink-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.note}</div>}
        </button>
      </div>
      <button onClick={onReserve} style={{ marginTop: 10, width: '100%', border: 'none', cursor: 'pointer', borderRadius: 'var(--r)',
        padding: '11px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 7, transition: 'all .18s', whiteSpace: 'nowrap',
        background: item.reserved ? 'var(--you)' : 'var(--you-soft)', color: item.reserved ? '#fff' : 'var(--you)' }}>
        {item.reserved ? <><Ic.check size={16} />Reserved · tap to undo</> : <><Ic.gift size={16} />I'll get this one</>}
      </button>
    </div>
  );
}

// ───────────────────────────────── SHARE / INVITE
export function Share() {
  const { nav, store } = useApp();
  const [copied, setCopied] = React.useState(false);
  const code = (store.you.name + '·' + store.partner.name).toUpperCase();
  return (
    <>
      <SheetHead title="Share" onClose={() => nav.closeSheet()} />
      <div style={{ padding: '8px 22px 34px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Avt who="you" size={56} ring />
          <div style={{ display: 'grid', placeItems: 'center', margin: '0 -6px', zIndex: 1 }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface)', display: 'grid', placeItems: 'center', color: 'var(--you)', boxShadow: '0 2px 6px rgba(44,33,24,0.12)' }}><Ic.heartFill size={15} /></span>
          </div>
          <Avt who="partner" size={56} ring />
        </div>
        <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 24 }}>You &amp; {store.partner.name} are paired</h2>
        <p style={{ margin: '0 0 22px', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.45 }}>You share every list, every wish. Only the two of you.</p>

        <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Your pairing code</div>
        <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }} style={{ width: '100%', border: 'none', cursor: 'pointer',
          background: 'var(--surface2)', borderRadius: 'var(--r)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 22, fontWeight: 700, letterSpacing: 4, color: 'var(--ink)' }}>{code}</span>
          <span style={{ color: copied ? 'var(--you)' : 'var(--ink-faint)', display: 'inline-flex' }}>{copied ? <Ic.check size={20} /> : <Ic.copy size={20} />}</span>
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <Bt tone="soft" size="lg" style={{ flex: 1 }} icon={<Ic.share size={18} />}>Send invite</Bt>
          <Bt tone="solid" size="lg" style={{ flex: 1 }} icon={<Ic.heart size={18} />}>Our shared link</Bt>
        </div>
      </div>
    </>
  );
}

// ───────────────────────────────── PROFILE / SETTINGS
export function Profile() {
  const { nav, store } = useApp();
  const total = store.items.filter(i => i.owner === 'you').length;
  const reservedForHer = store.items.filter(i => i.owner === 'partner' && i.reserved).length;
  const secretGifts = store.items.filter(i => i.secret && i.owner === 'you' && !i.bought).length;
  const giftPlans = secretGifts + reservedForHer;
  const unread = (store.notifications || []).filter(n => !n.read).length;
  const photoRef = React.useRef();
  const onPhoto = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => store.setAvatar(r.result); r.readAsDataURL(f); };
  const Row = ({ icon, label, detail, onClick, tint = 'var(--ink)', last }) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', border: 'none', background: 'none',
      padding: '14px 16px', cursor: 'pointer', textAlign: 'left', borderBottom: last ? 'none' : '0.5px solid var(--line)' }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface2)', color: tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 15.5, fontWeight: 500 }}>{label}</span>
      {detail && <span style={{ fontSize: 14, color: 'var(--ink-faint)' }}>{detail}</span>}
      <span style={{ color: 'var(--ink-faint)' }}><Ic.chevR size={17} /></span>
    </button>
  );
  return (
    <Screen>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => nav.go('Home')} style={navBtn}><Ic.chevL size={20} /></button>
        <button onClick={() => nav.lock()} title="Lock app" style={navBtn}><Ic.lock size={18} /></button>
      </div>
      {/* profile head */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
        <button onClick={() => photoRef.current.click()} style={{ position: 'relative', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
          <Avt who="you" size={84} />
          <span style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: 'var(--you)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2.5px var(--bg)' }}><Ic.camera size={15} /></span>
        </button>
        <input ref={photoRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
        <h1 style={{ margin: '14px 0 2px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 28 }}>{store.you.name}</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)' }}>paired with {store.partner.name} · {store.since.toLowerCase()}</p>
      </div>
      {/* stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[[total, 'on your lists'], [reservedForHer, 'gifts reserved'], [store.lists.filter(l => l.owner === 'you').length, 'lists']].map(([n, l], i) => (
          <div key={i} style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--r)', padding: '16px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 30, lineHeight: 1, color: 'var(--you)' }}>{n}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 5, fontWeight: 500 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 16 }}>
        <Row icon={<Ic.user size={18} />} label="Personalise" detail="Name & colour" tint="var(--you)" onClick={() => nav.openSheet('Personalize')} />
        <Row icon={<Ic.bell size={18} />} label="Notifications" detail={unread > 0 ? unread + ' new' : ''} tint="var(--partner)" onClick={() => nav.push('Notifications')} />
        <Row icon={<Ic.gift size={18} />} label="Your gift plans" detail={giftPlans + ''} tint="var(--gold)" onClick={() => nav.push('GiftPlans')} last />
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 16 }}>
        <Row icon={<Ic.trash size={18} />} label="Recently deleted" tint="var(--gold)" onClick={() => nav.push('RecentlyDeleted')} last />
      </div>
      {store.apiConfigured && <SyncCard store={store} />}
      <button onClick={() => nav.lock()} style={{ width: '100%', border: 'none', background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '15px',
        color: 'var(--ink)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
        <Ic.lock size={18} />Lock app
      </button>
    </Screen>
  );
}

// ───────────────────────────────── SYNC & NOTIFICATIONS (Profile card)
function SyncCard({ store }) {
  const { nav } = useApp();
  const [perm, setPerm] = React.useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const enable = async () => { setBusy(true); const res = await store.enableNotifications(); setBusy(false); setPerm(res === 'granted' ? 'granted' : (res === 'unsupported' ? 'unsupported' : 'denied')); };
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: store.synced ? 12 : 0 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center',
          background: !store.synced ? 'var(--surface2)' : store.partnerJoined ? 'var(--you-soft)' : 'color-mix(in srgb, var(--gold) 18%, var(--surface))',
          color: !store.synced ? 'var(--ink-faint)' : store.partnerJoined ? 'var(--you)' : 'var(--gold)' }}>
          {store.partnerJoined ? <Ic.heart size={18} /> : <Ic.lock size={18} />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{!store.synced ? 'Not paired' : store.partnerJoined ? 'Paired & syncing' : 'Waiting for ' + store.partner.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
            {!store.synced ? 'Connect with your partner on next unlock.' : store.partnerJoined ? 'Synced with ' + store.partner.name : store.partner.name + " hasn't joined yet"}
          </div>
        </div>
        {store.synced && <button onClick={() => nav.confirm({ title: 'Unpair this device?', body: `You'll stop syncing with ${store.partner.name} and need a new code to reconnect. Your wishes stay safe on the server.`, confirmLabel: 'Unpair', danger: true, onConfirm: store.unpair })} style={{ border: 'none', background: 'var(--surface2)', color: 'var(--ink-soft)', borderRadius: 999, padding: '7px 12px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>Unpair</button>}
      </div>

      {store.synced && !store.partnerJoined && store.space && store.space.code && (
        <button onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(store.space.code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'var(--surface2)', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 }}>Share this code with {store.partner.name}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 18, fontWeight: 700, letterSpacing: 3, color: 'var(--ink)' }}>{store.space.code}</span>
            <span style={{ color: copied ? 'var(--you)' : 'var(--ink-faint)', display: 'inline-flex' }}>{copied ? <Ic.check size={17} /> : <Ic.copy size={17} />}</span>
          </span>
        </button>
      )}
      {store.synced && perm !== 'granted' && (
        <button onClick={enable} disabled={busy || perm === 'unsupported'} style={{ width: '100%', border: 'none', cursor: perm === 'unsupported' ? 'default' : 'pointer',
          background: perm === 'denied' || perm === 'unsupported' ? 'var(--surface2)' : 'var(--you)', color: perm === 'denied' || perm === 'unsupported' ? 'var(--ink-soft)' : '#fff',
          borderRadius: 'var(--r)', padding: '12px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Ic.bell size={17} />{perm === 'denied' ? 'Notifications blocked — enable in settings' : perm === 'unsupported' ? 'Push not supported on this browser' : busy ? 'Enabling…' : 'Turn on phone notifications'}
        </button>
      )}
      {store.synced && perm === 'granted' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 13, color: 'var(--you)', fontWeight: 600 }}><Ic.check size={16} />Phone notifications on</div>
      )}
    </div>
  );
}

// ───────────────────────────────── ONBOARDING
export function Onboarding() {
  const { nav } = useApp();
  const [step, setStep] = React.useState(0);
  const steps = [
    { tag: 'a wishlist for two', title: 'Everything you both\nwant, in one place.', body: 'Keep your wishes side by side. No more screenshots, no more “what do you want for your birthday?”' },
    { tag: 'priority, not pressure', title: 'Rank what you\nreally want.', body: 'From on-the-radar to dream item — so they always know what would truly land.' },
    { tag: 'the magic part', title: 'Reserve gifts in\nsecret.', body: 'Quietly claim something from their list. They’ll never see it coming — that’s the whole point.' },
  ];
  const s = steps[step];
  const last = step === steps.length - 1;
  const [bob, setBob] = React.useState(false);
  React.useEffect(() => { const id = setInterval(() => setBob(b => !b), 1500); return () => clearInterval(id); }, []);
  return (
    <div style={{ height: '100%', background: 'var(--bg)', backgroundImage: 'radial-gradient(110% 70% at 50% 0%, var(--bg-glow), transparent 60%)',
      display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', color: 'var(--ink)', padding: 'calc(56px + env(safe-area-inset-top)) 26px calc(44px + env(safe-area-inset-bottom))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark size={22} />
        <button onClick={() => nav.finishOnboarding()} style={{ border: 'none', background: 'none', color: 'var(--ink-soft)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Skip</button>
      </div>

      {/* illustration */}
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', width: 230, height: 230 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ position: 'absolute', width: 128, height: 158, borderRadius: 'var(--r-lg)', overflow: 'hidden',
              boxShadow: '0 14px 34px -16px rgba(44,33,24,0.4)', transition: 'transform 1.5s ease-in-out, left .5s cubic-bezier(.32,.72,0,1), top .5s cubic-bezier(.32,.72,0,1)',
              left: 51 + (i - 1) * 54, top: 36 + Math.abs(i - 1) * 14,
              transform: `translateY(${(bob ? 1 : -1) * (i === 1 ? 7 : 4) * (i === 0 ? -1 : 1)}px) rotate(${(i - 1) * 9}deg) scale(${i === 1 ? 1.04 : 0.92})`, zIndex: i === 1 ? 2 : 1 }}>
              <Pho label={['gift', 'dream', 'secret'][i]} tint={i === 2 ? 'var(--you)' : i === 0 ? 'var(--partner)' : 'var(--you)'} h={158} radius="var(--r-lg)" />
            </div>
          ))}
          {/* floating sparkles */}
          <span style={{ position: 'absolute', left: 8, top: 30, color: 'var(--gold)', transition: 'transform 1.5s ease-in-out, opacity 1.5s', transform: bob ? 'translateY(-6px) scale(1.1)' : 'translateY(4px) scale(.9)', opacity: bob ? 1 : 0.5 }}><Ic.sparkle size={22} /></span>
          <span style={{ position: 'absolute', right: 4, bottom: 40, color: 'var(--you)', transition: 'transform 1.6s ease-in-out, opacity 1.6s', transform: bob ? 'translateY(5px) scale(.9)' : 'translateY(-5px) scale(1.1)', opacity: bob ? 0.5 : 1 }}><Ic.sparkle size={16} /></span>
          {step === 2 && <span style={{ position: 'absolute', right: 26, top: 14, width: 42, height: 42, borderRadius: '50%', background: 'var(--you)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 6px 16px rgba(44,33,24,0.3)', zIndex: 3, transition: 'transform 1.5s ease-in-out', transform: bob ? 'translateY(-6px) rotate(-6deg)' : 'translateY(2px) rotate(4deg)' }}><Ic.gift size={22} /></span>}
        </div>
      </div>

      {/* copy */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: 'inline-block', color: 'var(--you)', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>{s.tag}</div>
        <h1 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontStyle: 'var(--display-italic)', fontWeight: 'var(--display-weight)', fontSize: 36, lineHeight: 1.05, whiteSpace: 'pre-line', letterSpacing: 0.2 }}>{s.title}</h1>
        <p style={{ margin: 0, fontSize: 15.5, color: 'var(--ink-soft)', lineHeight: 1.5, maxWidth: 320 }}>{s.body}</p>
      </div>

      {/* dots + cta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {steps.map((_, i) => (
            <span key={i} style={{ height: 7, borderRadius: 99, transition: 'all .3s', width: i === step ? 22 : 7,
              background: i === step ? 'var(--you)' : 'color-mix(in srgb, var(--ink) 16%, transparent)' }} />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Bt tone="solid" size="lg" style={{ paddingLeft: 26, paddingRight: 26 }}
          icon={last ? <Ic.heart size={18} /> : null}
          onClick={() => last ? nav.finishOnboarding() : setStep(step + 1)}>
          {last ? 'Start wishing' : 'Next'}
        </Bt>
      </div>
    </div>
  );
}

// ───────────────────────────────── action-sheet menus
export function ItemMenu({ itemId }) {
  const { nav, store } = useApp();
  const it = store.items.find(i => i.id === itemId) || (store.deleted || []).find(i => i.id === itemId);
  if (!it) return null;
  const opt = (icon, label, onClick, danger) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', border: 'none', background: 'none',
      padding: '15px 18px', cursor: 'pointer', textAlign: 'left', color: danger ? '#C0492F' : 'var(--ink)', fontFamily: 'var(--font-body)',
      fontSize: 16, fontWeight: 500, borderBottom: '0.5px solid var(--line)' }}>{icon}{label}</button>
  );
  return (
    <>
      <SheetHead title={it.name} onClose={() => nav.closeSheet()} />
      <div style={{ padding: '0 0 18px' }}>
        {opt(<Ic.edit size={19} />, 'Edit details', () => nav.replaceSheet('AddItem', { itemId }))}
        {opt(<Ic.bookmark size={19} />, 'Move to another list', () => nav.closeSheet())}
        {opt(<Ic.trash size={19} />, 'Delete', () => nav.confirm({ title: 'Delete this wish?', body: 'It moves to Recently deleted for 30 days — you can restore it from your profile.', confirmLabel: 'Delete', danger: true, onConfirm: () => { store.deleteItem(itemId); nav.closeSheet(); nav.pop(); } }), true)}
      </div>
    </>
  );
}

export function ListMenu({ listId }) {
  const { nav, store } = useApp();
  const l = store.lists.find(x => x.id === listId);
  const opt = (icon, label, onClick, danger) => (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', border: 'none', background: 'none',
      padding: '15px 18px', cursor: 'pointer', textAlign: 'left', color: danger ? '#C0492F' : 'var(--ink)', fontFamily: 'var(--font-body)',
      fontSize: 16, fontWeight: 500, borderBottom: '0.5px solid var(--line)' }}>{icon}{label}</button>
  );
  return (
    <>
      <SheetHead title={l ? l.name : ''} onClose={() => nav.closeSheet()} />
      <div style={{ padding: '0 0 18px' }}>
        {opt(<Ic.plus size={19} />, 'Add an item', () => nav.replaceSheet('AddItem', { listId }))}
        {opt(<Ic.edit size={19} />, 'Edit list', () => nav.replaceSheet('EditList', { listId }))}
        {opt(<Ic.trash size={19} />, 'Delete list', () => nav.confirm({ title: 'Delete this list?', body: 'The list is removed and its wishes move to Recently deleted.', confirmLabel: 'Delete list', danger: true, onConfirm: () => { store.deleteList(listId); nav.closeSheet(); nav.pop(); } }), true)}
      </div>
    </>
  );
}
