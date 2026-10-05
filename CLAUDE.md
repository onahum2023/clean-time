# Clean Time — agent guidance

Clean Time (זמן נקי) is a free, Hebrew-first recovery companion. Preserve the product principles: **simplicity, privacy, low cognitive load and zero commercial pressure**.

## Architecture

- Static SPA: `index.html` contains the application CSS/JS. There is no build step.
- Production is deployed on Vercel. `main` auto-deploys.
- PWA metadata/icons live at the repository root; fonts and gong audio are self-hosted under `assets/`.
- Optional registered-user backup uses Supabase. Guest use must remain fully usable without an account.
- Cloud recovery state is encrypted client-side through `assets/sync-crypto.js` before upload.

## Non-negotiable product behavior

- Hebrew-first and RTL; mobile is the primary form factor. Validate at 360px.
- Guest mode requires no registration and keeps recovery data on the device.
- Registered access is email magic-link only. Do not add passwords or silently create an account from the returning-user path.
- Account creation/guest conversion and “I already have an account” are distinct flows.
- Do not add analytics, advertising, tracking, gamification or commercial pressure.
- Do not make medical/treatment claims.

## Data and compatibility

Primary local recovery state is stored under `localStorage["cleantime-he-v1"]`.

Persistent fields include recovery profile, gratitude, bookmarks, readings links, daily plans, journal, daily inventory and `updatedAt`. Counter display mode is local-only.

Rules:
- Persistent user-data changes go through `save()`; UI-only local state uses `writeLocal()`.
- Saved-data changes must remain backward compatible through `normalize()`.
- Never discard unknown/legacy recovery fields merely because the current UI no longer exposes them.
- Existing-user upgrade behavior is a release invariant. Do not force a registered production user back through onboarding or account creation.
- First-device/account conflicts must remain explicit; never silently overwrite local or cloud recovery data.

See `docs/UPGRADE-COMPATIBILITY.md` and `docs/UAT-REGRESSION.md`.

## Authentication and sync

- Supabase project ref: `aefhjgmiwgajdhgyhelm`.
- Auth is passwordless email magic link.
- Returning login uses `shouldCreateUser:false`; explicit create/convert flows may create a user.
- One `public.user_data` row per user stores the whole recovery state. RLS is intended to restrict each user to their own row.
- `localStorage` remains the working copy. Sync preserves the existing newer-timestamp/conflict semantics.
- Sign-out clears local recovery/auth/encryption material after attempting to flush pending changes.
- “Delete cloud data” currently writes an encrypted empty state; actual Auth identity/row deletion is tracked separately in GitHub issues.

## Encryption

Registered cloud recovery data uses a versioned AES-256-GCM envelope with a random DEK and recovery-key-based wrapping. The recovery key is not an account password.

Important:
- Do not introduce plaintext recovery-state uploads.
- Do not weaken envelope/KDF validation.
- A missing recovery key must not be bypassed by silently replacing cloud data.
- Local browser state is intentionally readable by the running app; cloud encryption does not protect against a compromised device or malicious delivered JavaScript.
- Migration/release details and guard SQL are documented in `docs/ENCRYPTION-QA.md` and `docs/migrations/`.

## Current product surfaces

Bottom navigation: Today / Tools / About. Settings is reached from the gear.

Core tools: clean-time counter, Daily Plan checklist, Gratitude log, Journal, Meditation timer, Daily Inventory / Step 10, recovery readings/resources and personal bookmarks. My Account contains identity, sync/encryption status, sign-out and deletion controls.

Step 10 currently exposes the daily free-text reflection/history; final structured question content is still a product backlog item. Preserve legacy placeholder answers until an explicit migration is implemented.

## Safe links and external requests

- User/resource links must pass the shared URL validation; only approved HTTPS and numeric telephone links are clickable.
- Guest mode should not make unnecessary third-party requests.
- Supabase JS is loaded only when account/auth/sync functionality requires it and is pinned with SRI.
- Do not add remote fonts; Assistant is self-hosted.

## QA and release discipline

Before proposing a merge:
- Run the relevant browser regression suites under `tests/`.
- Run JavaScript syntax checks and `git diff --check`.
- For UI changes, inspect Hebrew RTL at mobile widths, especially 360px.
- For storage/auth/sync/encryption changes, run the full compatibility/regression coverage and consult:
  - `docs/UX-1.0-UAT.md`
  - `docs/ACCOUNT-QA.md`
  - `docs/UAT-REGRESSION.md`
  - `docs/UPGRADE-COMPATIBILITY.md`
  - `docs/ENCRYPTION-QA.md`
- Never use or inspect the real active user's recovery data for testing. Use synthetic/test identities and data.
- Do not change production Supabase configuration, SMTP, database policy/schema or live user data unless the task explicitly authorizes it.
- Bump `APP_VERSION` for user-facing application changes.

## Deployment and domain

- Repository: `onahum2023/clean-time`
- Production: `https://clean-time.app` (Vercel)
- The app includes temporary old-origin handoff logic because browser localStorage is origin-scoped. Do not remove that code until the old Vercel origin is redirected and the migration window is intentionally closed.

Use GitHub issues as the source of truth for unfinished product/release work. Do not turn this file into a changelog or duplicate the backlog here.
