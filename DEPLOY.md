# Deploying Wishful (backend + app) — all free, no card

Wishful runs in two parts:

1. **The app** — the static PWA in this repo (`npm run build` → `dist/`).
2. **The backend** — `server/main.ts`, which gives the two phones one shared,
   synced data space and sends push notifications. It runs on **Deno Deploy**
   (free, no credit card) using **Deno KV** (free built-in database).

You can run the app *without* the backend — it just works locally on one device
(no sync, no push). The steps below turn on the two-phone features.

---

## 1. Generate your own push keys

Anyone with the private VAPID key can send notifications to your users, so
generate a fresh pair (don't reuse the dev keys in this repo):

```bash
npx web-push generate-vapid-keys
```

Keep the `publicKey` and `privateKey`. The public one is safe to expose; the
private one is a secret.

## 2a. Create a free database (Upstash Redis — no card)

Data lives in Upstash Redis so it **persists across redeploys** (Deno Deploy's
built-in KV is per-deployment and gets wiped on each build — don't use it).

1. Sign up at <https://upstash.com> (GitHub/Google login, no card).
2. **Create Database** → Redis → pick a region near you → Free tier.
3. Open the database → **REST API** panel → copy **`UPSTASH_REDIS_REST_URL`** and
   **`UPSTASH_REDIS_REST_TOKEN`**.

## 2b. Deploy the backend to Deno Deploy (free)

1. Push this repo to GitHub.
2. Go to <https://deno.com/deploy> and sign in with GitHub (no card required).
3. **Create app** → link your repo, branch `main`. Use **No Preset**, leave install
   and build commands empty, set **Runtime → Dynamic App → Entrypoint** to
   `server/main.ts`. (Deno reads `server/deno.json` for the `web-push` dep.)
4. In **Settings → Environment Variables**, add:

   | Key | Value |
   | --- | --- |
   | `UPSTASH_REDIS_REST_URL` | from Upstash (step 2a) |
   | `UPSTASH_REDIS_REST_TOKEN` | from Upstash (secret) |
   | `VAPID_PUBLIC_KEY` | your public key from step 1 |
   | `VAPID_PRIVATE_KEY` | your private key from step 1 |
   | `VAPID_SUBJECT` | `mailto:you@example.com` |
   | `ALLOW_ORIGIN` | the exact origin of your app, or `*` |

5. Deploy. Open `…/health` — it should return
   `{"ok":true,"pushEnabled":true,"store":"redis"}`. If `store` says `memory`,
   the Upstash vars aren't set right (data won't persist).

## 3. Point the app at the backend

Create `.env.local` (for local dev) and set the same values in your app host's
build-environment settings (for production):

```
VITE_API_URL=https://wishful-xxxx.deno.dev
VITE_VAPID_PUBLIC_KEY=<your public key from step 1>
```

## 4. Host the app (free)

```bash
npm run build      # outputs dist/
```

Deploy `dist/` to any free static host — **Cloudflare Pages**, **Netlify**, or
**Vercel** all have no-card free tiers. Point the host at this repo with:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_API_URL`, `VITE_VAPID_PUBLIC_KEY` (from step 3)

PWAs **must be served over HTTPS** for service workers / push to work — all the
hosts above give you HTTPS automatically.

## 5. Pair the two phones

1. Both of you open the app and unlock with your pattern.
2. One taps **Create our space** and shares the 6-character code.
3. The other taps **I have a code to join** and enters it.
4. Tap **Turn on phone notifications** (Profile → the pairing card) on each phone.

Now your lists sync, and when one of you comments on the other's wish, the other
gets a push notification — even with the app closed.

### iOS note

iOS only delivers web push to a PWA that's been **added to the Home Screen**
(Safari → Share → Add to Home Screen), on iOS 16.4+. Open it from the Home Screen
icon, then enable notifications. Android/Chrome works in the browser too.

---

## Running the backend locally (for development)

```bash
# install Deno once: https://deno.com/  (irm https://deno.land/install.ps1 | iex)
cp server/.env.example server/.env     # fill in VAPID keys
cd server
deno task dev                          # serves on http://localhost:8000
```

Then `VITE_API_URL=http://localhost:8000` in `.env.local` and `npm run dev`.

## How sync works (and its limits)

- The shared state (lists, items, notifications, names, avatars) lives in one
  Deno KV document per space, versioned. The app pushes changes with the version
  it last saw; if the partner changed something first, the server returns the
  current truth and the app reconciles (last successful writer wins — fine for two
  people who rarely edit the same field at the same second).
- The app polls every ~4s while open, and uses push for closed-app alerts.
- Personal theme/accent/dark-mode stay **local** to each device by design.
