# Welcome, backup activation and recovery dates — Preview UAT

2026-10-07. One package for #30, #32 and #31, based on `main` `d93dd9b`. Branch: `codex/welcome-backup-date`. PR and exact Preview evidence are recorded below. Leave unmerged for Nora/Oded acceptance; no production promotion.

## Behavior

- Fresh visitors see Welcome, one **מתחילים** action, a secondary existing-account entry and About/privacy. No settings, app navigation or recovery fields appear yet. Setup asks for date and the existing five recovery types. Visible/browser Back retains draft values during the visit. Guest setup enters Today; recovery tools work without name/email/phone.
- Existing configured guests/accounts bypass Welcome using the existing stored date, without a new onboarding flag. Email callbacks and unconfigured sessions wait for account/sync resolution before ordinary entry routing. The transient startup screen is replaced in browser history; authenticated users without a date return to My Account rather than Welcome from the Settings gear. Locked backups and conflicts retain their existing explicit paths; no replacement key is made over locked cloud data. Sparse registered restores can still reach recovery settings.
- `backupStatus()` derives all status copy (Settings, My Account, Today reminder) from existing session/key/sync state: local, checking, setup, verifying, active, locked, initial error, later attention. Authentication is separate from backup activation. A callback with incomplete setup opens My Account/key setup. Finish later preserves local content and leaves a reminder; reload of a configured device stays on Today. Retry uses cached acknowledged material. An active/verified status requires confirmed encryption material; initial upload continues to use the existing encrypted write/readback/decrypt verification. Later network/sync errors retain the last verified backup status.
- Native date inputs remain in guest setup, explicit account creation and recovery settings. Each shows an immediate Hebrew month-name confirmation. Canonical `YYYY-MM-DD` parsing/storage and counter math are unchanged; formatting uses local calendar components, not UTC parsing. Browser-native placeholder order cannot be guaranteed.
- Recovery data shape, unknown/legacy fields, malformed-storage protection, guest conversion, conflict choices, encryption envelope/KDF and migrations remain intact. App version: `2026.10.07.1`.

## Preview backend inspection and live QA boundary

Vercel project: `nu-cielo/clean-time`, `prj_6MhMelClmBk0S83h1kXE90rslkjr`. Preview environment has no environment variables. This is a static deployment with public Supabase URL/key in `index.html`; Preview therefore uses the production project `aefhjgmiwgajdhgyhelm`, not an isolated database. `signInWithOtp` requests `emailRedirectTo: location.origin`; Supabase must allow that exact origin or links may fall back to its configured site URL. Actual allowlist/fallback behavior has not been verified with live mail.

Read-only project/branch discovery found only the production project/default branch. Oded confirmed there is no dedicated staging/test backend and requested confirmation before any Supabase change. No Supabase settings, SMTP, schema, policies, SQL/migrations or live recovery rows were changed or accessed. No real account was used.

**Live auth/backup QA is pending.** It needs an approved dedicated test Supabase project with compatible `user_data` schema/RLS/encrypted guard, a reviewed Preview-only public configuration path (the app currently hard-codes production configuration), the exact Preview origin in Auth Redirect URLs, and designated existing/new test identities with controlled email inboxes and synthetic recovery content. Do not treat mocked Preview auth as proof of SMTP, redirects, RLS or database guard execution. Broader email/RLS verification stays in #19; physical Android/PWA work stays in #21.

## Smallest staging setup and cost

No suitable existing staging backend was found in connected metadata. Smallest recommended option: one **empty Free-plan project in a Free organization**, if an active-project slot is available. Cost: **$0/month** within Free quotas (500 MB DB, 5 GB egress; two active Free projects maximum; pauses after one week of inactivity). No production project transfer or billing/config change is needed. Quota availability outside the connected project list was not established. [Current Supabase pricing](https://supabase.com/pricing), [billing scope](https://supabase.com/docs/guides/platform/billing-on-supabase).

Required setup, after authorization:

1. Create the empty staging project; install compatible table/RLS/guard definitions from reviewed source, with no production recovery data or Auth users copied.
2. Configure only staging Auth site/redirect URLs for the exact Preview and designated controlled test mailboxes. Default SMTP can test team addresses at two emails/hour; use staging custom SMTP if other addresses or faster testing are required. [SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp). Any provider charge depends on the chosen sender; no paid service is currently required for slow team-mailbox testing.
3. Add a small reviewed Preview-only public-config generation step in this same PR, supply the staging public URL/publishable key only to this PR's Preview branch, redeploy, and verify deployed configuration/network target differs from production **before** creating synthetic accounts or writing fixtures. No service-role credential belongs in frontend config.
4. Run the pending live flows below using synthetic recovery content, then leave PR #33 unmerged for acceptance.

Alternative if the organization already has a paid plan: a data-less Supabase Preview branch starts at **$0.01344/hour** (about **$0.32/day**, **$2.26/week**) plus usage; branching is unavailable on Free. If a paid plan is not already present, Pro starts at **$25/month**. Branch usage is not covered by spend caps or compute credits. No paid branch or plan was created. [Branch costs](https://supabase.com/docs/guides/platform/manage-your-usage/branching), [pricing](https://supabase.com/pricing).

## Automated checks

Run from repository root with Playwright available through `NODE_PATH`:

```sh
node tests/run-qa.js
QA_BASE_URL=https://EXACT-PR-PREVIEW.vercel.app node tests/run-qa.js
QA_ENGINE=webkit QA_BASE_URL=https://EXACT-PR-PREVIEW.vercel.app node tests/run-qa.js welcome-qa.js
```

`QA_BASE_URL` accepts only an exact HTTPS Vercel origin. Each suite uses disposable contexts and synthetic fixtures; external auth/database calls are aborted/mocked. Web Crypto uses deployed `assets/sync-crypto.js` with generated fixture keys kept out of reports/logs. Guest tests use actual deployed HTML/assets. Screenshots with generated key fields are masked. No browser auth state is committed.

First deployed pass: Chromium **480 checks, zero failed suites** against `https://clean-time-oja736rmh-nu-cielo.vercel.app`, Git commit `2d7cf2b388aa294ba43a0070618b27e1b21fb585`, deployment `dpl_2GQ7mn1iyH19Ui4ASFtwrF9CtyvK`, source Git, Ready/Preview. Full local regression also passed; final deployed theme correction will be rechecked below.

| Suite | Passing checks (first Preview pass) |
| --- | ---: |
| account | 27 |
| bookmarks | 43 |
| bookmarks-sync | 11 |
| edge | 12 |
| encryption | 115 |
| local | 83 |
| sync | 8 |
| UAT | 43 |
| upgrade | 55 |
| Welcome/date | 83 |
| **Total** | **480** |

Preview is Vercel-auth protected (anonymous HTTP 302). `tests/preview-access.js` adds the Vercel CLI's short-lived development OIDC header only to the exact Preview origin, in memory; third-party fixture routes remain blocked/mocked. Protection was not disabled, no credential was printed/committed, and no live Supabase request was sent. Run protected QA with `vercel env run` for the linked `nu-cielo/clean-time` project and the commands above. Nora/Oded require Vercel access to open the Preview.

## Browser review and limitations

Visually inspected 24 screenshots of deployed Welcome/setup/Today/guest My Account at 320/360/390px and light/dark themes: all fit in RTL, actions are clear, and Welcome primary/secondary actions remain above the fold at 360×800. The review found dark native date segments/icon needed theme styling; `color-scheme` now follows the existing light/dark theme and the date segments/calendar icon correction was visually verified on deployed commit `d5d5a3f6b139394c860c531259fc3071f49f4b66`; final startup routing will be checked on the next Preview. Screenshots are synthetic local QA artifacts outside Git. This is human inspection of browser-generated screenshots, not an interactive manual or physical-device pass. Automated keyboard/focus/touch/date/time-zone and history checks are distinct from visual browser review. Final local WebKit Welcome/date/theme coverage: **89 passing checks**. WebKit navigation to the protected Preview did not receive any response before timeout, including a focused diagnostic; deployed WebKit coverage remains pending. Chromium protected access works and is the deployed browser evidence. No interactive manual account UAT or physical phone was tested. Live auth/email/database checks listed above remain pending even when their synthetic browser equivalents pass.

## Nora/Oded Preview acceptance checklist

Use a fresh browser profile for guest UAT. Until staging exists, do not submit account forms on this Preview (they point to production).

1. Send only the Preview link to a fresh visitor. Can they understand the purpose and find **מתחילים** without instructions? Can they reach About/privacy and return?
2. Start, choose recovery type and October 1, and confirm **1 באוקטובר 2026**. Check required/future-date messages. Go Back and confirm the draft remains.
3. Continue to Today, add a synthetic gratitude or plan entry, reload and confirm direct Today plus retained content. Traverse tools and Back.
4. Review at 320, 360 and 390px, light/dark, with keyboard focus and enlarged text. Physical Android/date-picker/PWA acceptance remains #21.
5. After a dedicated test backend/Preview callback is approved: existing/unused-email login, guest registration continuity, mail verification → key setup → verified backup, finish-later/reminder/resume, initial failure/retry/reload, active account reopening and second-browser recovery-key restore. Confirm no false active-backup message and no loss of synthetic local content. Do not share keys or recovery data in public feedback.
