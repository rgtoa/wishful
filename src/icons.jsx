// icons.jsx — stroke icons drawn with currentColor.

export const Icon = ({ d, fill, size = 22, sw = 1.7, style, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'}
       stroke={fill ? 'none' : 'currentColor'} strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children || <path d={d} />}
  </svg>
);

export const I = {
  heart:   (p) => <Icon {...p} d="M12 20.5C12 20.5 3.5 15 3.5 8.8C3.5 6 5.7 4 8.2 4C9.9 4 11.3 5 12 6.3C12.7 5 14.1 4 15.8 4C18.3 4 20.5 6 20.5 8.8C20.5 15 12 20.5 12 20.5Z" />,
  heartFill:(p) => <Icon {...p} fill d="M12 20.8C12 20.8 3 15 3 8.6C3 5.5 5.4 3.3 8.1 3.3C9.9 3.3 11.4 4.3 12 5.7C12.6 4.3 14.1 3.3 15.9 3.3C18.6 3.3 21 5.5 21 8.6C21 15 12 20.8 12 20.8Z" />,
  plus:    (p) => <Icon {...p} d="M12 5v14M5 12h14" sw={2} />,
  chevL:   (p) => <Icon {...p} d="M15 5l-7 7 7 7" sw={2} />,
  chevR:   (p) => <Icon {...p} d="M9 5l7 7-7 7" sw={2} />,
  chevDown:(p) => <Icon {...p} d="M5 9l7 7 7-7" sw={2} />,
  gift:    (p) => <Icon {...p}><path d="M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7S11 3 8.5 3 5.5 5.5 7 7M12 7s1-4 3.5-4 3 2.5 1.5 4" /></Icon>,
  lock:    (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" /></Icon>,
  share:   (p) => <Icon {...p}><path d="M12 15V4M12 4L8 8M12 4l4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" /></Icon>,
  gear:    (p) => <Icon {...p}><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5l1.4 2.2 2.6-.4.6 2.5 2.3 1.3-1 2.4 1 2.4-2.3 1.3-.6 2.5-2.6-.4L12 21.5l-1.4-2.2-2.6.4-.6-2.5L5.1 15.6l1-2.4-1-2.4 2.3-1.3.6-2.5 2.6.4z" /></Icon>,
  link:    (p) => <Icon {...p}><path d="M9 15l6-6M10.5 6.5l1-1a4 4 0 015.5 5.5l-2 2M13.5 17.5l-1 1a4 4 0 01-5.5-5.5l2-2" /></Icon>,
  camera:  (p) => <Icon {...p}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" /><circle cx="12" cy="13" r="3.4" /></Icon>,
  x:       (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" sw={2} />,
  check:   (p) => <Icon {...p} d="M5 12.5l4.5 4.5L19 7" sw={2} />,
  dots:    (p) => <Icon {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></Icon>,
  sparkle: (p) => <Icon {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></Icon>,
  tag:     (p) => <Icon {...p}><path d="M3 12.5V5a2 2 0 012-2h7.5L21 11.5a1.5 1.5 0 010 2.1l-6.4 6.4a1.5 1.5 0 01-2.1 0L3 12.5z" /><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/></Icon>,
  grid:    (p) => <Icon {...p}><rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/></Icon>,
  rows:    (p) => <Icon {...p}><rect x="4" y="5" width="16" height="5" rx="1.6"/><rect x="4" y="14" width="16" height="5" rx="1.6"/></Icon>,
  bell:    (p) => <Icon {...p}><path d="M6 10a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6zM10 19a2 2 0 004 0" /></Icon>,
  user:    (p) => <Icon {...p}><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></Icon>,
  edit:    (p) => <Icon {...p}><path d="M4 20l4-1L19 8l-3-3L5 16l-1 4zM14.5 6.5l3 3" /></Icon>,
  trash:   (p) => <Icon {...p}><path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M7 7l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12" /></Icon>,
  search:  (p) => <Icon {...p}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></Icon>,
  copy:    (p) => <Icon {...p}><rect x="8" y="8" width="12" height="12" rx="2.4"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></Icon>,
  arrowR:  (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" sw={1.9} />,
  bookmark:(p) => <Icon {...p}><path d="M6 4h12v16l-6-4-6 4z" /></Icon>,
  bookmarkFill:(p) => <Icon {...p} fill><path d="M6 4h12v16l-6-4-6 4z" /></Icon>,
  pin:     (p) => <Icon {...p}><path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></Icon>,
  chat:    (p) => <Icon {...p}><path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z"/></Icon>,
  send:    (p) => <Icon {...p}><path d="M4 11.5 20 4l-7.5 16-2-6.5-6.5-2z"/></Icon>,
  sparkles:(p) => <Icon {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></Icon>,
};
