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
- [x] Branded Welcome and focused guest setup (#32, PR #33)
- [x] Truthful verified encrypted-backup state (#30, PR #33)
- [x] Hebrew written-month recovery-date confirmation (#31, PR #33)

## P0 — before wider public promotion

- [ ] **#6 Daily Inventory / Step 10:** daily reflection/history exists; final structured content remains incomplete.
- [ ] **#16 Complete Step 10 reflection content.**
- [ ] **#17 Real account/cloud deletion:** remove the user's cloud row and Auth identity, not only replace recovery state with an encrypted empty state.
- [ ] **#18 Production security headers:** CSP, frame protection, referrer policy and nosniff without breaking auth/sync/PWA behavior.
- [ ] **#19 Production auth/SMTP/RLS verification:** live delivery/redirect checks and cross-account isolation using test accounts only. One fresh Gmail Inbox delivery has passed; broader provider/RLS verification remains.
- [ ] **#34 Remaining backup activation/failure/independent-browser QA.** The former paid staging backend was deleted; isolated live-service testing is blocked until a suitable test environment exists.
- [ ] **#21 Physical Android/PWA validation.**
- [ ] **#22 Retire legacy Vercel-origin handoff safely.**

## Track A — delivery reconciled 2026-10-12

Completed and closed: #35 (Home/navigation; PR #39), #36 and #27 (appearance/feedback; PR #40), #25 (date reset; PR #42), #26 (milestones; PRs #42/#46), #24 (JSON export; PR #43), #23 (offline PWA; PR #44), and #38 (Web Analytics; PRs #48/#49). Production Vercel Analytics is receiving metrics; detailed custom-event reporting is still a monitoring check, not a release blocker. See [delivery reconciliation](TRACK-A.md) and coordinating #37, retained open solely for pending #28 (optional PIN decision) and #16/#6 (approved final Step 10 content).

## P1 — soon after

- [ ] Supabase plan/backup operational review.
- [ ] **#28 Optional local PIN lock.**
- [ ] **#29 Privacy-safe error monitoring.**
- [ ] **#41 Retire obsolete branch-scoped Vercel Preview references to the deleted staging backend.**

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
- No advertising. Vercel Web Analytics measures public pageviews, fixed SPA screens and allowlisted aggregate product events, without transmitting recovery content or account identifiers.
- NA Israel links/helpline and explicit non-affiliation disclaimer.

For implementation/QA history, see the focused documents in `docs/` rather than adding release narrative here.
