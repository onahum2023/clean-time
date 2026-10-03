# זמן נקי (Clean Time)

A small Hebrew (RTL) web app: a clean time counter for someone in NA recovery.

- Single static `index.html` with inline CSS/JS. No build step. The only dependency is supabase-js for the optional cloud sync, loaded on demand from jsDelivr (see below).
- `manifest.webmanifest` plus icons (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) enable Android "Install app".
- All user data lives in `localStorage` under the key `cleantime-he-v1`. Changing the shape of saved data needs a migration in `normalize()`, which merges saved data over a deep copy of `DEFAULT`. `load()` and cloud pulls both go through it. A version flag such as `linksV` must not go in `DEFAULT`, or the migration never runs.
- Every data change must go through `save()`, which stamps `updatedAt` and queues a cloud push. UI-only changes (counter `mode`) use `writeLocal()` instead.

## Screens (bottom tabs: זמן נקי | תכנית | יומן | תודה | קריאות, plus settings from the gear icon)

Tab labels are short so five fit at 360px. The full name is the screen heading.

- **Counter** (`#counter`): clean time since `date`/`time`. Tapping it cycles `mode` (0 y/m/d, 1 days, 2 h/m/s).
- **Planner** "רק להיום תהיה לי תכנית" (`#planner`): today's to-do list only. A new local date starts empty. A 1s timer and `visibilitychange` switch it to the new day after midnight without a reload.
- **Journal** "ככה זה עכשיו" (`#journal`): entries newest first. The full-screen editor (`#jEditor`) autosaves while typing (debounced) and also saves on close, `pagehide` and when the app is hidden. Empty entries are discarded. It pushes a history state so Android back closes the editor instead of leaving the app.
- **Gratitude** "הכרת תודה" (`#gratitude`), **Readings** "קריאות" (`#readings`), **Settings** (`#settings`, includes "מחיקת כל הנתונים").

## Data keys (inside `cleantime-he-v1`)

- `name`, `date` (YYYY-MM-DD), `time`, `from`, `color`, `mode`
- `gratitude`: `[{id, text, ts}]`
- `links`: `[{id, title, url}]`, plus `linksV` (currently 2; not in `DEFAULT`)
- `plans`: `{ "YYYY-MM-DD": [{id, text, done}] }`, keyed by the phone's local date. Past days are kept but only today is shown. A day's key is removed when its list becomes empty.
- `journal`: `[{id, text, created, updated}]`, timestamps in ms
- `updatedAt`: ms timestamp of the last `save()`, used for sync conflicts

New ids come from `uid()`, which is unique even within one millisecond. Delete-by-id depends on this.

## Cloud backup & sync (optional)

Login is optional; without it nothing loads from the network and the app is local only.

- Supabase project `aefhjgmiwgajdhgyhelm`, publishable key in `index.html`. supabase-js 2.117.2 from jsDelivr, pinned with an SRI hash. It loads only when a session exists, when returning from a magic link, or when "שליחת קישור" is tapped.
- Login: email magic link (`signInWithOtp` with `emailRedirectTo: location.origin`). The client uses `flowType: 'implicit'` so a link opened in a different browser still works (PKCE would fail). On return, the token is read from the URL hash, the URL is cleaned and Settings opens. Link errors (`#error_code=otp_expired`) show a Hebrew message. Switching to a 6-digit code means adding a `verifyOtp({email, token, type:'email'})` step next to `sendLogin()`.
- Every origin used (production, `http://localhost:8765`, `http://127.0.0.1:8765`) must be in Supabase → Auth → Redirect URLs.
- Supabase's built-in mailer allows only a few emails per hour. Set up custom SMTP before relying on it.
- Table `public.user_data(user_id uuid pk, data jsonb, updated_at timestamptz)`, RLS own row only. One row per user holds all of `S` except `LOCAL_ONLY` fields (`mode`).
- `localStorage` stays the working copy. `sync()` pulls the row and compares `updatedAt`: remote newer → `applyRemote()` (normalized, keeps local `mode`); local newer → upsert. Runs on app open, sign-in, `focus`/`visibilitychange`, `online`, and 2s after each `save()` (flushed immediately when the app is hidden). Only one `sync()` runs at a time.
- Other localStorage keys: `cleantime-he-auth` (Supabase session) and `cleantime-he-sync` (`uid`, `email`, `lastSync`, `dirty`).
- First sign-in on a device (`M.uid` differs from the user): if both sides have data, a modal asks "לשמור את הנתונים מהמכשיר הזה" / "לטעון את הנתונים מהענן". If only one side has data, that side is used.
- Sign out: confirm, try to flush pending changes, then clear all local data. The cloud copy stays.
- "מחיקת כל הנתונים" when signed in: "device only" clears local data and signs out. "Also cloud" overwrites the row with an empty state (newer `updatedAt`), so other signed-in devices also clear on their next pull.

### Not yet tested

Supabase's email rate limit stopped testing partway. These sync paths have not been verified yet:

- A second browser signing in and loading the cloud data
- Editing in one browser, refocusing the other, and seeing the change
- Sign out clearing local data
- The conflict prompt on first sign-in when both sides have data

Tested: local-only behavior, first upload from a fresh browser, debounced push, offline edit then sync, Hebrew errors (invalid email, expired link, rate limit), 360px layout.

## Deploy & layout

- Deployed on Vercel. Every push to `main` redeploys production automatically.
- The main user is on Android, so the UI must work well at 360px width. Check layout at that width before committing.
