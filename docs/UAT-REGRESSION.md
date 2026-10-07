# Production UAT UX regression

The next combined #30/#32/#31 wave and deployed Preview evidence are recorded in [WELCOME-BACKUP-UAT.md](WELCOME-BACKUP-UAT.md). The tables below remain historical evidence.

2026-10-05. Based on current `main` (`aed56bc69f6271219423e4ca0bc4df2e394ac3a0`). Implemented on `codex/uat-ux-fixes`; pending review and explicitly authorized release. No merge or deployment.

## Fixed behavior

- Returning email-only login sends `shouldCreateUser:false`; missing accounts show Hebrew feedback and a Create Account button. Explicit creation and guest conversion send `true`. Passwordless authentication and the current-origin redirect remain unchanged. Supabase's current [OTP handler](https://github.com/supabase/auth/blob/master/internal/api/otp.go) returns `otp_disabled` when creation is forbidden for an unknown email; this code is covered by the mock regression.
- Internal screen changes participate in browser history without changing the URL or interfering with magic-link/import hashes. Back/Forward traverse Today, tools and account screens; Journal Back first commits/closes its editor. Initial/reload rendering replaces history state. Repeated rendering does not push entries. History contains only screen, auth mode and editor ID.
- Step 10 exposes daily free-text reflection and history. Placeholder controls and preparation copy are removed. Summary saves retain existing answers, questionnaire version, timestamps and unknown inventory fields; no migration or historical rewrite.
- Native recovery-date inputs have visible Hebrew missing/invalid and future-date feedback in settings and both onboarding paths, with accessible error associations. Invalid submissions do not save or send links.
- Successful email-link requests include a short Spam-folder hint. SMTP, DNS and providers are unchanged.

## Automated verification

All suites use localhost `http://127.0.0.1:8765`, synthetic identities/data and blocked or mocked external requests. No real email, real account data or production Supabase writes. Suites are async Playwright functions evaluated from their files, each with a fresh browser context; scenario contexts are also isolated. Start the static server with `python3 -m http.server 8765 --bind 127.0.0.1` and run every `tests/*-qa.js` against it with Playwright.

| Suite | Passing checks |
| --- | ---: |
| account | 26 |
| local | 83 |
| edge | 12 |
| sync | 8 |
| bookmarks | 43 |
| bookmarks-sync | 11 |
| upgrade | 54 |
| UAT | 43 |
| **Total** | **280** |

New UAT checks cover unknown/existing returning emails, explicit creation, conversion, inline date messages, Spam guidance, Back/Forward and editor behavior, preserved placeholder answers, and Step 10 field/page overflow at 320, 360, 508 and 1280px. The retained local suite now verifies summary persistence instead of interacting with removed question controls. Registered upgrade coverage adds Settings/My Account Back/Forward to existing direct-Today landing, no onboarding/registration, retained session/storage/cloud JSON and normal sync checks. The 360px Step 10 screenshot was visually inspected. Inline application JavaScript and every test file pass syntax compilation; `git diff --check` passes.

## Deferred and boundaries

- Final Step 10 question content is still deferred; preserved answer fields allow later introduction.
- Actual email delivery, native Android Back/date picker/keyboard and installed-app behavior require manual checks after release authorization. Browser editor/history coverage is automated Chromium evidence, not physical-device verification.
- Storage keys, state/JSON shape, account model, SDK configuration and sync logic remain unchanged. No identity/schema migration is introduced.
- Encryption PR #13 now refreshes onto main `88358f2bc40b93d881fcaa416258109328436ae8`. This document’s 280-check table records the UAT-only baseline; the combined run and current encryption/migration coverage are recorded in [ENCRYPTION-QA.md](ENCRYPTION-QA.md). Returning login, history, summary-only Step 10, date feedback, Spam guidance and existing-user direct-Today entry remain covered. No production SQL, merge, deployment or live account operation was performed during the refresh.
