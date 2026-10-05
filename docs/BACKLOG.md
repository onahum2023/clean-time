# Backlog

Goal: turn זמן נקי from a personal app into a free, private, public service for Hebrew speakers in recovery.

GitHub Issues are the source of truth for active work. This file is a compact roadmap, not a second issue tracker.

## Clean Time 1.0 — delivered

- [x] Focused Today/Home experience (#1)
- [x] Visible About section (#2)
- [x] Chronological Gratitude log (#3)
- [x] Daily Plan checklist (#4)
- [x] Meditation timer with local gong (#5)
- [x] Guest-first onboarding (#7)
- [x] Guest/registered account model and My Account (#10)
- [x] Passwordless returning-account protection and production UAT fixes (PR #14)
- [x] Client-side encrypted registered-user backup with recovery keys (PR #13)
- [x] Personal links/bookmarks
- [x] Self-hosted Assistant font and safe external-link handling
- [x] Privacy/About copy and feedback address polish (PR #15)

## P0 — before wider public promotion

- [ ] **#6 Daily Inventory / Step 10:** daily reflection/history exists; final structured content remains incomplete.
- [ ] **#16 Complete Step 10 reflection content.**
- [ ] **#17 Real account/cloud deletion:** remove the user's cloud row and Auth identity, not only replace recovery state with an encrypted empty state.
- [ ] **#18 Production security headers:** CSP, frame protection, referrer policy and nosniff without breaking auth/sync/PWA behavior.
- [ ] **#19 Production auth/SMTP/RLS verification:** live delivery/redirect checks and cross-account isolation using test accounts only.
- [ ] **#21 Physical Android/PWA validation.**
- [ ] **#22 Retire legacy Vercel-origin handoff safely.**

## P1 — soon after

- [ ] **#23 Offline app-shell support.**
- [ ] **#24 Export all recovery data as JSON.**
- [ ] Supabase plan/backup operational review.
- [ ] **#25 Gentle clean-date reset flow.**
- [ ] **#26 Recovery milestones without streak pressure.**
- [ ] **#27 In-app feedback entry point.**
- [ ] **#28 Optional local PIN lock.**
- [ ] **#29 Privacy-safe error monitoring.**

## P2 — later

- [ ] CAPTCHA on magic-link flow if abuse becomes a real problem.
- [ ] Legal/privacy review for sensitive recovery data.
- [ ] Accessibility review (including Israeli standard IS 5568).
- [ ] Russian and English UI.
- [ ] Daily check-in/reminders.
- [ ] Quick sponsor-call action.
- [ ] Meeting finder, ideally using a feed agreed with NA Israel.

## Established foundations

- Hebrew RTL SPA and Android-installable PWA.
- Guest-local use with no registration.
- Optional email magic-link account and multi-device backup/sync.
- Client-side encrypted cloud recovery state with recovery key.
- Supabase RLS design: one row per user, own row only.
- No ads or analytics.
- NA Israel links/helpline and explicit non-affiliation disclaimer.

For implementation/QA history, see the focused documents in `docs/` rather than adding release narrative here.
