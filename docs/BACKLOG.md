# Backlog

Goal: turn זמן נקי from a personal app into a free, private, public service for Hebrew speakers in recovery.

Status: [ ] open, [x] done, [?] needs a decision

## P0: Clean Time 1.0 product & UX — implemented locally, pending merge

Checkmarks in this section mean implemented and tested locally, pending PR review and merge. They do not indicate a production release or issue closure. See [implementation, compatibility and QA notes](UX-1.0-UAT.md).

- [x] **#1 Home / Today.** Prominent clean-time counter and direct access to daily recovery tools.
- [x] **#2 About Clean Time.** Main navigation section with purpose, free/noncommercial use and guest/account privacy disclosure.
- [x] **#3 Gratitude log.** Separate entries grouped by calendar day, newest first, with add/edit/delete and retained history.
- [x] **#4 Daily plan checklist.** Daily add/edit/delete/check, persistent completion and accessible previous days.
- [x] **#5 Meditation timer.** Deadline-based start/pause/resume/reset and local start/end gong; physical screen-lock/audio checks remain manual.
- [x] **#6 Daily inventory / Step 10 structure.** Autosaved daily summary, history; unfinished question UI removed while saved answers remain compatible.
- [?] **Final Step 10 questions.** Product-owner content remains to be supplied; existing placeholder answers must be preserved.
- [x] **#7 Guest-first onboarding.** Minimum start date/recovery type, with optional existing magic-link account flow.
- [x] **Visual warmth and thematic treatment.** Self-hosted Assistant, warm shared components, page-specific decorative icons/backgrounds and light/dark treatment.
- [x] **Personal links / bookmarks.** Private flat list with title, URL and optional note; guest-local persistence and existing registered sync.
- [ ] **Manual UAT.** Product-owner review, live Supabase account sync and physical Android/mobile screen-lock/audio behavior.

## P0: Account model (#10) — implemented locally, pending review

- [x] First-class guest onboarding, complete account creation, and returning email-only magic-link login.
- [x] Guest conversion preserves local recovery data and explicit local/cloud conflict protection.
- [x] Separate My Account with identity, sync state, sign-out and existing data deletion entry.
- [x] Recovery settings cleanup and synthetic 360px account-flow QA. See [account QA notes](ACCOUNT-QA.md).
- [ ] Live magic-link and physical Android checks; no production deployment in this change.
- [x] **#9 Encryption (implemented on dedicated branch, pending review/release).** Whole-state Web Crypto envelope, acknowledged recovery key, new-device unlock and retry-safe plaintext migration. Recovery key is not an account password. Required unapplied database guard and release checks: [encryption QA](ENCRYPTION-QA.md).

## P0: Production UAT UX fixes — retained in encryption refresh

- [x] Returning-account login cannot create users; missing-account feedback and Create Account route.
- [x] Internal browser Back/Forward, including Journal editor and Settings/My Account.
- [x] Step 10 summary-only UI with preserved legacy answers and narrow-width layout checks.
- [x] Hebrew inline recovery-date errors for guest, registered onboarding and settings.
- [x] Magic-link waiting guidance mentions Spam; provider settings unchanged.
- [x] Synthetic registered-user upgrade and unchanged storage/sync compatibility coverage.
- [ ] Physical Android and live delivery recheck after an explicitly authorized release.
- [x] **Live unused-email verification.** Verified in production: an unused email on “כבר יש לי חשבון” does not create an identity, shows the Hebrew missing-account message, and offers the Create Account route.
- [ ] **Auth email deliverability follow-up.** Recheck magic-link delivery with at least one additional Gmail account and one non-Gmail provider; keep current Spam-folder guidance unless broader evidence suggests a provider/configuration issue.

See [UAT regression evidence](UAT-REGRESSION.md). Encryption PR #13 is refreshed onto main `88358f2bc40b93d881fcaa416258109328436ae8` and retains the released UAT behavior. Encryption remains pending review/release; no merge, deployment or SQL application in this refresh.

## P0: Before sharing beyond family

- [x] **Cloud privacy model (pending #9 release).** Entire registered-user recovery state is encrypted on device. Existing rows remain legacy until saved-key acknowledgement and verified migration. Guest data stays local. Prior plaintext backups are not retroactively encrypted.
- [x] **Self-host fonts (implemented locally, pending merge).** Assistant is bundled with its OFL license; Google Fonts requests removed.
- [ ] **Security headers.** Add `vercel.json` with CSP (self, cdn.jsdelivr.net, *.supabase.co), `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.
- [x] **Safe reading links (implemented locally, pending merge).** Shared `https:` / numeric `tel:` validation for resources and bookmarks; unsafe imported links remain visible but cannot open. See [bookmark review](BOOKMARKS-REVIEW.md).
- [ ] **Real cloud deletion.** Delete the `user_data` row and the auth user (Edge Function with service key), not just overwrite with an empty state.
- [?] **Custom SMTP verification.** Custom SMTP is believed to be configured for Supabase Auth; verify it is active and working before public release.
- [ ] **RLS test.** With a second account, confirm it cannot select, update or delete another user's row.
- [x] **Domain.** clean-time.app, connected to Vercel (apex redirects to www.clean-time.app, the primary), linked from the README. The old host hands local data over (see "Domain move" in CLAUDE.md). Remaining: redirect clean-time-eight.vercel.app to the new domain later, then remove the move code.
- [ ] **Supabase redirect URL.** Add `https://www.clean-time.app` to Auth → Redirect URLs, then test a magic-link sign-in on the new domain.
- [x] **Privacy disclosure (pending #9 release).** About/account copy describes guest-local data, on-device encryption, email/minimal technical metadata and unrecoverable lost keys. Legal review remains separate.
- [x] **License.** AGPL-3.0 (see `LICENSE`).

## P1: Soon after

- [ ] **Offline open.** Service worker caching the app shell.
- [ ] **Export.** Download all data as JSON.
- [ ] **Supabase plan check.** Free tier pausing and backup limits.
- [ ] **Gentle reset.** Changing the clean date keeps history, uses non-judgmental wording.
- [ ] **Milestones.** NA style: 30, 60, 90 days, 6 and 9 months, 1 year, 18 months, then yearly.
- [ ] **In-app feedback.**
- [ ] **Optional PIN lock.**
- [ ] **Error monitoring** that strips personal data.

## P2: Later

- [ ] **CAPTCHA on magic link.** Turnstile or hCaptcha via Supabase Auth if signup abuse becomes a real problem.
- [ ] Legal review against Israeli privacy law (recovery data is likely sensitive data).
- [ ] Accessibility review (Israeli standard IS 5568).
- [ ] Russian and English UI.
- [ ] Daily check-in and reminders.
- [ ] Quick "call my sponsor" button.
- [ ] Meeting finder, ideally with a data feed agreed with NA Israel.

## Done

- [x] Hebrew RTL counter, planner, journal, gratitude, readings
- [x] Installable on Android
- [x] Optional magic-link login with Supabase sync
- [x] RLS: one row per user, own row only
- [x] supabase-js loaded on demand and pinned with SRI
- [x] Delete all data (device, and cloud overwrite)
- [x] NA Israel links and helpline in readings
- [x] No analytics
