// data.js — initial state. The app starts empty: no lists, no items, no
// notifications. Each person builds their own lists from scratch (a list is only
// created once its first wish is added — see the NewList → AddItem flow).
export const SEED = {
  you: { name: 'Rafael', who: 'you' },
  partner: { name: 'Thrisha', who: 'partner' },
  since: 'Together since 2023',
  lists: [],
  items: [],
  notifications: [],
};
