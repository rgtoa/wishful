import { createContext, useContext } from 'react';

// App-wide context: { nav, store, t, setTweak }
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// Mutable profile singleton — Avatar reads names/photos from here. App writes it
// on each render (the whole tree re-renders on state change, so avatars stay fresh).
// Mirrors the prototype's window.WISHFUL_PROFILE pattern.
export const PROFILE = { youName: 'Rafael', partnerName: 'Thrisha', currency: 'PHP', youAvatar: null, partnerAvatar: null };
