// persist.js — tiny localStorage-backed state so wishes, personalization and
// theme survive reloads (the prototype had no backend; this makes it real-ish
// for a single device — a true two-phone sync would need a server).
import React from 'react';

const PREFIX = 'wishful:';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* quota / private mode */ }
}

export function usePersistentState(key, initial) {
  const [value, setValue] = React.useState(() => load(key, typeof initial === 'function' ? initial() : initial));
  React.useEffect(() => { save(key, value); }, [key, value]);
  return [value, setValue];
}

// Theme tweaks (palette / font / radius / dark), persisted.
export function useTweaks(defaults) {
  const [values, setValues] = usePersistentState('tweaks', defaults);
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : { [keyOrEdits]: val };
    setValues(prev => ({ ...prev, ...edits }));
  }, [setValues]);
  return [values, setTweak];
}
