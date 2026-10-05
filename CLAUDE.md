# זמן נקי (Clean Time)

A small Hebrew (RTL) web app: a clean time counter for someone in NA recovery.

- Single static `index.html` with inline CSS/JS. No build step. The only dependency is supabase-js for the optional cloud sync, loaded on demand from jsDelivr (see below).
- `manifest.webmanifest` plus icons (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) enable Android "Install app".
- All user data lives in `localStorage` under the key `cleantime-he-v1`. Changing the shape of saved data needs backward-compatible evolution in `normalize()`, which merges saved data over a deep copy of `DEFAULT`. `load()` and cloud pulls both go through it. A version flag such as `linksV` must not go in `DEFAULT`, or the migration never runs.
- Every data change must go through `save()`, which stamps `updatedAt` and queues a cloud push. UI-only changes (counter `mode`) use `writeLocal()` instead.

## Screens (bottom navigation: היום | כלים | אודות; settings from the gear)

- **Onboarding** (`#onboarding`): guest start date and recovery type; separate Create account (complete profile + email) and Already have an account (email only) paths. Existing users with a date go straight to Today.
- **Today** (`#counter`): clean-time counter and direct links to plan, gratitude, meditation, Step 10 and resources. Tapping the counter still cycles `mode` (0 y/m/d, 1 days, 2 h/m/s).
- **Tools** (`#tools`): all recovery tools, including the retained journal.
- **Planner** (`#planner`): today's checklist; add/edit/delete/check. Past plans are accessible via a selector which appears only when there is history. Only today accepts new items. Local midnight starts a fresh day without removing old plans.
- **Gratitude** (`#gratitude`): each item is an entry, grouped by calendar day, newest first. Inline edit preserves its timestamp and original day. Legacy entries derive the grouping day from `ts` without rewriting them.
- **Meditation** (`#meditation`): deadline-based countdown, pause/resume/reset, `assets/gong.wav` at start/end. Ephemeral state, no statistics or persistence. Visibility/focus reconciles the deadline; browsers may defer screen-lock audio until resume.
- **Inventory** (`#inventory`): daily summary autosaved synchronously via `save()`, with date/history access. Only free-text reflection is exposed. Legacy placeholder answers, questionnaire version and unknown fields remain stored; final prompts can use stable replacement IDs later.
- **Journal** (`#journal`): retained full-screen autosaving editor and Android back behavior.
- **Resources** (`#readings`): existing editable recovery links.
- **Personal links** (`#bookmarks`): initially empty flat list under Tools; explicit add/edit/save/cancel/delete, title + URL + optional note. Stored in `bookmarks` and included in the existing cloud JSON. Shared `safeLinkUrl()` permits only validated `https:` and numeric `tel:` URLs; unsafe imported links are retained but not clickable.
- **About** (`#about`): normal navigation; purpose, free/noncommercial model, guest/optional account storage, existing help links and honest cloud privacy disclosure.
- **Settings** (`#settings`): recovery preferences with an explicit save label. Guests get Create account / backup and Already have an account entries. Registered users get a My Account entry.
- **Account access** (`#auth`): create (optional name, email, recovery profile), convert guest (email and optional missing name), or returning email-only login. Returning login sets `shouldCreateUser:false`, reports missing accounts in Hebrew and offers Create Account. Create/convert set `shouldCreateUser:true`. Creation saves the complete profile locally before sending the link; no cloud writes until authentication and conflict resolution.
- **My Account** (`#account`): name, email, account/sync state, last sync, sign-out and existing device/cloud data deletion. Identity deletion still requires backend work; copy states this explicitly. Future #9 encryption status belongs here, separate from recovery settings.
- Internal screen transitions push History API state; initial rendering replaces state, and Back/Forward restore screens without pushing. Journal adds an editor entry; Back commits/closes it before returning through screens. History state holds screen/auth mode/editor ID only, no recovery content or tokens. Reload retains the normal Today/onboarding landing behavior.
- Recovery-date inputs retain native pickers with Hebrew inline missing/invalid and future-date feedback. Successful magic-link requests include subtle Spam guidance.
- Bump `APP_VERSION` (`YYYY.MM.DD`, near the top of the script) with each user-facing change.

## Data keys (inside `cleantime-he-v1`)

- `name`, `date` (YYYY-MM-DD), `time`, `from`, `color`, `mode`
- `gratitude`: `[{id, text, ts, day?}]`; new items save their local calendar day; legacy timestamps remain unchanged.
- `bookmarks`: `[{id, title, url, note?}]`; additive empty default, no resource-link migration. Counts as user data for first-sign-in conflicts and is refreshed by `applyRemote()`.
- `links`: `[{id, title, url}]`, plus `linksV` (currently 2; not in `DEFAULT`)
- `plans`: `{ "YYYY-MM-DD": [{id, text, done}] }`, keyed by the phone's local date. Past days are kept and accessible from history. Only today accepts new items. A day's key is removed when its list becomes empty.
- `journal`: `[{id, text, created, updated}]`, timestamps in ms
- `inventory`: `{ "YYYY-MM-DD": {questionnaireVersion:"placeholder-v1", answers:{placeholder_1,placeholder_2,placeholder_3}, summary, created, updated} }`; additive default `{}`, included in the existing cloud JSON.
- `updatedAt`: ms timestamp of the last `save()`, used for sync conflicts

New ids come from `uid()`, which is unique even within one millisecond. Delete-by-id depends on this.

## Cloud backup & sync (optional)

Login is optional; without it the app requests only its own local assets. Assistant is self-hosted from assets/fonts; no remote font requests. There are no guest third-party requests.

- Supabase project `aefhjgmiwgajdhgyhelm`, publishable key in `index.html`. supabase-js 2.117.2 from jsDelivr, pinned with an SRI hash. It loads only when a session exists, when returning from a magic link, or when "שליחת קישור" is tapped.
- Login: email magic link (`signInWithOtp` with `emailRedirectTo: location.origin`). The client uses `flowType: 'implicit'` so a link opened in a different browser still works (PKCE would fail). On return, the token is read from the URL hash, the URL is cleaned and the app opens after sync. Failed/expired links open email-only retry. Link errors (`#error_code=otp_expired`) show a Hebrew message. Access remains email magic-link only; do not add passwords or alternate auth paths.
- Every origin used (production `https://www.clean-time.app`, the old `https://clean-time-eight.vercel.app` until it redirects, `http://localhost:8765`, `http://127.0.0.1:8765`) must be in Supabase → Auth → Redirect URLs.
- Production SMTP is configured separately; this account UX change does not modify it.
- Table `public.user_data(user_id uuid pk, data jsonb, updated_at timestamptz)`, RLS own row only. One row per user holds all of `S` except `LOCAL_ONLY` fields (`mode`).
- `localStorage` stays the working copy. `sync()` pulls the row and compares `updatedAt`: remote newer → `applyRemote()` (normalized, keeps local `mode`); local newer → upsert. Runs on app open, sign-in, `focus`/`visibilitychange`, `online`, and 2s after each `save()` (flushed immediately when the app is hidden). Only one `sync()` runs at a time.
- Other localStorage keys: `cleantime-he-auth` (Supabase session) and `cleantime-he-sync` (`uid`, `email`, `lastSync`, `dirty`).
- First sign-in on a device (`M.uid` differs from the user): if both sides have data, a modal asks "לשמור את הנתונים מהמכשיר הזה" / "לטעון את הנתונים מהענן". If only one side has data, that side is used.
- Sign out: confirm, try to flush pending changes, then clear all local data. The cloud copy stays.
- "מחיקת כל הנתונים" when signed in: "device only" clears local data and signs out. "Also cloud" overwrites the row with an empty state (newer `updatedAt`), so other signed-in devices also clear on their next pull.
- Verified in production: first upload, a second device loading cloud data, edit-and-refocus sync, offline edit then sync, sign out clearing local data, and the conflict prompt on first sign-in.

## Domain move (temporary)

The app moved from `clean-time-eight.vercel.app` to `https://clean-time.app`. localStorage is per origin, so a marked block in `index.html` ("Domain move (TEMPORARY)") hands data over.

In Vercel, `clean-time.app` 308-redirects to `www.clean-time.app`, so `www` is the origin that actually holds users' data and receives magic links. Keep `www` as the primary domain: making the apex primary later would strand data on `www` and need another move.


- On an `OLD_HOSTS` host (exact hostname, so preview deployments are unaffected), `moveOut()` runs at the end of Init. No data: redirect to the new origin (keeping a magic-link hash). Signed in and synced: a modal says to sign in on the new domain with the same email. Otherwise: a modal button opens `NEW_ORIGIN/#import=<base64url JSON of S>`. Both modals also say to reinstall the app from the new domain.
- On any other host, `#import=` is decoded before the first render, the URL is cleaned, and the data replaces `S` (after a confirm if local data exists) via `normalize()` and `save()`.
- Remove the whole block and the `moveOut()` call once the old domain redirects to the new one. After that redirect, old-origin localStorage can no longer be read.

## Deploy & layout

- Deployed on Vercel (project `clean-time`). Production: `https://www.clean-time.app` (`clean-time.app` redirects there). Every push to `main` redeploys production automatically.
- The main user is on Android, so the UI must work well at 360px width. Check layout at that width before committing.

## Local 1.0 review

See `docs/UX-1.0-UAT.md` for the additive data evolution, product decisions, browser QA and remaining physical-device/live-auth checks. Malformed local JSON/top-level collection shapes are retained and protected against overwrite; storage write failures show a visible alert.

## Account-model UX (#10)

See `docs/ACCOUNT-QA.md` for synthetic account-flow QA and manual checks, and `docs/UPGRADE-COMPATIBILITY.md` for the current-production active-user compatibility pass. The JSON/localStorage schema and whole-state sync are unchanged. An explicit local conflict choice stamps newer than both clocks, so a future cloud timestamp cannot undo that choice. No encryption or recovery-key UX (#9) is implemented.

## Production UAT fixes

See `docs/UAT-REGRESSION.md` for synthetic-only regression coverage, compatibility and deferred manual checks. No merge, deployment, SMTP change or encryption work is part of this change.
