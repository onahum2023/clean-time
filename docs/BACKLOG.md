# Backlog

Goal: turn זמן נקי from a personal app into a free, private, public service for Hebrew speakers in recovery.

Status: [ ] open, [x] done, [?] needs a decision

## P0: Clean Time 1.0 product & UX

- [ ] **Home page / Today experience.** Redesign the main screen to reduce clutter and guide the user toward the most relevant recovery actions for today. Keep clean time prominent, then provide simple access to today's plan, gratitude, Step 10, meditation and recovery resources without turning the home screen into a busy dashboard.
- [ ] **About Clean Time.** Add a clearly visible About section outside Settings. Explain what Clean Time is, why it exists, its privacy-first approach, guest vs registered use, and that it is free with no commercial pressure.
- [ ] **Gratitude log.** Replace the current gratitude-entry flow with a chronological log. Users can add any number of separate gratitude items throughout the day. Entries are grouped by calendar day, with today at the top and previous days visible below as history. Newest entries appear first within each day. Adding gratitude creates an item in today's group; there is no separate "create daily entry" action.
- [ ] **Daily plan checklist.** Treat each day as a simple to-do list rather than a stream of separate plan records. Users can add multiple items for today and mark each item complete with a checkbox. Support adding, editing and deleting items.
- [ ] **Meditation timer.** Simple duration-based timer with start, pause/resume and reset. Play a gong at the start and when the timer finishes. No music, voice, guided meditation, content library, streaks or meditation statistics for 1.0. Keep timing accurate when the app is backgrounded or the screen locks where the platform permits.
- [?] **Daily inventory / Step 10.** Add a separate daily reflection page for Step 10 / חשבון נפש יומי: a short set of questions and an end-of-day reflection. Define the page structure now; final question content is still to be supplied.
- [ ] **First-run experience.** Make it obvious that a user can start immediately as a guest. Capture only the minimum needed to establish clean time and recovery context, including what the user is recovering from (alcohol, drugs, smoking, food or other). Registration remains optional.

## P0: Before sharing beyond family

- [?] **Journal privacy decision.** Today journal, gratitude and plans sync to Supabase as plain JSON, readable by the project owner. Options: (a) encrypt on the device with a user passphrase before sync, (b) keep journal local-only and sync only counter and settings. Blocks the privacy page.
- [ ] **Self-host fonts.** Remove Google Fonts so a logged-out user makes no third-party requests.
- [ ] **Security headers.** Add `vercel.json` with CSP (self, cdn.jsdelivr.net, *.supabase.co), `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.
- [ ] **Safe reading links.** Only allow `https:` and `tel:` URLs in user-edited links.
- [ ] **Real cloud deletion.** Delete the `user_data` row and the auth user (Edge Function with service key), not just overwrite with an empty state.
- [?] **Custom SMTP verification.** Custom SMTP is believed to be configured for Supabase Auth; verify it is active and working before public release.
- [ ] **RLS test.** With a second account, confirm it cannot select, update or delete another user's row.
- [x] **Domain.** clean-time.app, connected to Vercel (apex redirects to www.clean-time.app, the primary), linked from the README. The old host hands local data over (see "Domain move" in CLAUDE.md). Remaining: redirect clean-time-eight.vercel.app to the new domain later, then remove the move code.
- [ ] **Supabase redirect URL.** Add `https://www.clean-time.app` to Auth → Redirect URLs, then test a magic-link sign-in on the new domain.
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
