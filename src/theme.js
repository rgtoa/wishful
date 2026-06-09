// theme.js — design tokens. Palettes drive CSS custom properties on the app root.

export const PALETTES = {
  terracotta: {
    label: 'Terracotta',
    bg: '#F4EBDD', bgGlow: '#EFE2CE',
    surface: '#FFFDF8', surface2: '#FBF4E9',
    ink: '#2C2118', inkSoft: '#75665A', inkFaint: '#A89A8B',
    line: 'rgba(44,33,24,0.09)',
    you: '#C25E3C', youSoft: '#F0D9CC',     // current user — terracotta
    partner: '#9C5A74', partnerSoft: '#EFD9E0', // partner — dusty plum
    gold: '#C39142',
  },
  plum: {
    label: 'Plum & Blush',
    bg: '#F3E9EC', bgGlow: '#ECDCE2',
    surface: '#FFFBFC', surface2: '#FAF0F3',
    ink: '#2A1D23', inkSoft: '#6F5C63', inkFaint: '#A8929A',
    line: 'rgba(42,29,35,0.09)',
    you: '#A8516E', youSoft: '#F0D6DF',
    partner: '#7A6098', partnerSoft: '#E4DAF0',
    gold: '#C0894E',
  },
  sage: {
    label: 'Sage & Sand',
    bg: '#EEEDE1', bgGlow: '#E6E4D3',
    surface: '#FCFCF6', surface2: '#F4F3E8',
    ink: '#23271D', inkSoft: '#5F6557', inkFaint: '#9AA08D',
    line: 'rgba(35,39,29,0.09)',
    you: '#6E8A4F', youSoft: '#DCE6CB',
    partner: '#B07A3E', partnerSoft: '#EEDFC8',
    gold: '#A98A3F',
  },
  dusk: {
    label: 'Dusk & Slate',
    bg: '#E9ECF1', bgGlow: '#DCE1EA',
    surface: '#FBFCFE', surface2: '#EFF2F7',
    ink: '#1E2530', inkSoft: '#5A636F', inkFaint: '#929BA8',
    line: 'rgba(30,37,48,0.09)',
    you: '#4F6E9B', youSoft: '#D3DEEC',
    partner: '#9C6A8E', partnerSoft: '#ECDCE7',
    gold: '#B08A4A',
  },
  blush: {
    label: 'Blush & Cream',
    bg: '#F6EAE6', bgGlow: '#F1DDD6',
    surface: '#FFFBF9', surface2: '#FBEFEB',
    ink: '#2E2120', inkSoft: '#75605C', inkFaint: '#B39A94',
    line: 'rgba(46,33,32,0.09)',
    you: '#C76B6A', youSoft: '#F4D9D6',
    partner: '#A07A55', partnerSoft: '#EEE0CE',
    gold: '#C2924E',
  },
};

const DARK = {
  bg: '#1A1512', bgGlow: '#221A14',
  surface: '#26201B', surface2: '#2E2720',
  ink: '#F4ECE2', inkSoft: '#B6A797', inkFaint: '#7C6E60',
  line: 'rgba(255,244,230,0.10)',
};

export const FONTS = {
  editorial: { label: 'Editorial', display: "'Instrument Serif', Georgia, serif", body: "'Hanken Grotesk', system-ui, sans-serif", displayWeight: 400, italicDisplay: true },
  soft:      { label: 'Soft & round', display: "'Baloo 2', system-ui, sans-serif", body: "'Hanken Grotesk', system-ui, sans-serif", displayWeight: 600, italicDisplay: false },
  modern:    { label: 'Modern', display: "'Hanken Grotesk', system-ui, sans-serif", body: "'Hanken Grotesk', system-ui, sans-serif", displayWeight: 800, italicDisplay: false },
};

export function buildVars(palKey, fontKey, radius, dark) {
  const p = PALETTES[palKey] || PALETTES.terracotta;
  const f = FONTS[fontKey] || FONTS.editorial;
  const base = { ...p, ...(dark ? DARK : {}) };
  return {
    '--bg': base.bg, '--bg-glow': base.bgGlow,
    '--surface': base.surface, '--surface2': base.surface2,
    '--ink': base.ink, '--ink-soft': base.inkSoft, '--ink-faint': base.inkFaint,
    '--line': base.line,
    '--you': p.you, '--you-soft': dark ? 'rgba(194,94,60,0.22)' : p.youSoft,
    '--partner': p.partner, '--partner-soft': dark ? 'rgba(156,90,116,0.24)' : p.partnerSoft,
    '--gold': p.gold,
    '--font-display': f.display, '--font-body': f.body,
    '--display-weight': f.displayWeight,
    '--display-italic': f.italicDisplay ? 'italic' : 'normal',
    '--r-sm': radius * 0.5 + 'px', '--r': radius + 'px',
    '--r-lg': radius * 1.6 + 'px', '--r-xl': radius * 2.2 + 'px',
  };
}

export const CURRENCIES = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
];

// Priority: 0 casual, 1 really, 2 dream
export const PRIO = [
  { label: 'On the radar', short: 'radar', pips: 1 },
  { label: 'Really want', short: 'want', pips: 2 },
  { label: 'Dream item', short: 'dream', pips: 3 },
];

export const TWEAK_DEFAULTS = { palette: 'terracotta', font: 'editorial', radius: 16, dark: false };
