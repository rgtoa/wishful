# Wishful — a wishlist for two 💛

An intimate, **two-person shared wishlist**, built as an installable mobile-first
PWA. You and your partner keep your wishes side by side, rank what you really
want, leave comments on each other's items — and secretly **reserve gifts** (and
keep private gift-idea lists) that the other person never sees.

This is the production implementation of the **Wishful** design prototype
(handed off from Claude Design). The prototype was a single-file React app wrapped
in an iOS device frame for presentation; this is the real thing — a full-viewport,
installable web app with persistence and an offline-ready service worker.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Build & preview the production PWA:

```bash
npm run build
npm run preview
```

App icons are generated from `public/favicon.svg`:

```bash
npm run icons      # regenerate PWA icon PNGs (192 / 512 / maskable / apple-touch)
```

## Using it

The app opens on a **draw-to-unlock** screen. Two people, two patterns — your
shape decides whose world opens (and unlocks *their* perspective, including only
*their* secret lists):

- **Rafael** — top-left → top-mid → top-right → mid-right → bottom-right
- **Thrisha** — a diamond: top-mid → mid-right → bottom-mid → mid-left

A correct pattern glows **green**, then flows: lock → welcome pages → splash → home.

> The lock is a delightful demo gate, not real auth.

### What's built

- **Home** — greeting, the *Rafael & Thrisha* card that opens the seasonal **Wish
  Genie**, a You ↔ partner toggle, list grid, and a dark **Secret gift ideas** section.
- **Lists & items** — grid/list layouts, priority (radar → really want → dream),
  per-wish currency (15 options), notes, shop links, striped photo placeholders.
- **Add / edit a wish** — required fields (what, price, store, priority, list),
  optional shop link & note, photo/camera choice, a celebratory animation on save.
- **Partner list (secret reserve)** — quietly claim a gift; hidden from them.
- **Secret wishlists** — private gift ideas *for* your partner, with mark-as-bought.
- **Comments & notifications** — comment on each other's wishes; the owner gets
  notified, and the thread lives inside that wish.
- **Wish Genie** — a seasonal character (Santa / Cupid / Spring / Summer / Pumpkin /
  Genie) that reads and playfully compares both wishlists. See *AI* note below.
- **Your gift plans** — a private view of everything you're planning (reserved +
  secret ideas).
- **Recently deleted** — soft-delete with a 30-day window (restore / delete forever).
- **Personalise** — name, profile photo, 5 app themes, a custom-hue colour wheel,
  and dark mode. Each person personalises only their own app.

## Architecture

Vite + React (no device frame, no build-time JSX-in-browser). Source in `src/`:

| File | Responsibility |
| --- | --- |
| `App.jsx` | Navigation stack, data store, perspective mapping, lock/splash routing, theming |
| `theme.js` | Palettes, fonts, `buildVars`, currencies, priority levels |
| `context.js` | `AppCtx` + the `PROFILE` singleton avatars read from |
| `persist.js` | `localStorage`-backed state + the theme (`useTweaks`) hook |
| `data.js` | Seed lists / items / notifications |
| `primitives.jsx` | Avatar, Photo, PriorityPips, Money, Sheet, Pill |
| `shared.jsx` | Screen scaffold, PushBar, `Reveal`, `HeartBurst` |
| `home.jsx` | Home, ListView, ItemDetail, cards, comments |
| `flows.jsx` | AddItem, NewList, PartnerList, Share, Profile, Onboarding, menus |
| `extras.jsx` | PatternLock, Splash, Celebrate, SecretList, Personalize, RecentlyDeleted, Notifications, GiftPlans, Genie |
| `registry.js` | Route name → component map used by the navigator |
| `api.js` / `push.js` | Backend client + Web Push subscription helpers |
| `Pairing.jsx` | Pair-your-two-phones screen (create/join a shared space) |
| `sw.js` | Custom service worker — offline precache + push + notification click |
| `server/main.ts` | The backend (Deno Deploy + Upstash Redis + Web Push) |

### Persistence & sync

Wishes, personalization, and theme persist to `localStorage`, so everything
survives a reload **on that device**, and the app runs fully standalone when no
backend is configured.

When you set `VITE_API_URL`, the app turns on **two-phone sync**: the two of you
pair into one shared space (a 6-char code), your lists/items/comments live in a
versioned document in **Upstash Redis** (persists across deploys), and changes flow both ways (optimistic write +
~4s polling). Comments on your partner's wish fire a **Web Push** notification to
their phone even when the app is closed. Personal theme/accent/dark-mode stay
local to each device by design. The lock screen still gates every launch.

See **[DEPLOY.md](DEPLOY.md)** for the full free, no-card deployment guide
(Deno Deploy backend + Cloudflare Pages/Netlify/Vercel for the app).

### AI (the Wish Genie)

The Genie ships with a witty hand-written fallback so it works offline with no
keys. To use a live model, provide `window.WISHFUL_GENIE = { complete: (prompt) => Promise<string> }`
that proxies to a **server-side** endpoint calling the Claude API (never embed an
API key in the client). See the hook in `src/extras.jsx`.

## Install as an app

Open the built site on a phone and choose **Add to Home Screen** — it installs
with an icon and launches full-screen (manifest + service worker via
`vite-plugin-pwa`). No App Store required.
