# Backlog

Goal: turn זמן נקי from a personal app into a free, private, public service for Hebrew speakers in recovery.

Status: [ ] open, [x] done, [?] needs a decision

## P0: Before sharing beyond family

- [?] **Journal privacy decision.** Today journal, gratitude and plans sync to Supabase as plain JSON, readable by the project owner. Options: (a) encrypt on the device with a user passphrase before sync, (b) keep journal local-only and sync only counter and settings. Blocks the privacy page.
- [ ] **Self-host fonts.** Remove Google Fonts so a logged-out user makes no third-party requests.
- [ ] **Security headers.** Add `vercel.json` with CSP (self, cdn.jsdelivr.net, *.supabase.co), `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.
- [ ] **Safe reading links.** Only allow `https:` and `tel:` URLs in user-edited links.
- [ ] **Real cloud deletion.** Delete the `user_data` row and the auth user (Edge Function with service key), not just overwrite with an empty state.
- [ ] **Custom SMTP.** Built-in mailer allows only a few emails per hour.
- [ ] **CAPTCHA on magic link.** Turnstile or hCaptcha via Supabase Auth, to stop abuse of open signup.
- [ ] **RLS test.** With a second account, confirm it cannot select, update or delete another user's row.
- [x] **Domain.** clean-time.app, connected to Vercel, linked from the README. The old host hands local data over (see "Domain move" in CLAUDE.md). Remaining: redirect clean-time-eight.vercel.app to the new domain later, then remove the move code.
- [ ] **Privacy page (Hebrew).** What is stored, where, who can read it, how to delete. Short.
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
