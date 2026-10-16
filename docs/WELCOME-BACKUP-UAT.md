# Archived PR #33 — Welcome, backup activation and recovery dates — Preview UAT

> **Historical QA record; staging retired on 2026-10-12.** The old staging
> backend and Preview setup below are unavailable and superseded. Use
> [Track B isolation](TRACK-B.md#preview-isolation-41) and
> [current release QA](TRACK-B-RELEASE-QA.md). Preview is now guest-only;
> live Auth/backup checks remain blocked pending a reviewed isolated environment.

2026-10-07. One package for #30, #32 and #31, based on `main` `d93dd9b`. Branch: `codex/welcome-backup-date`. PR: [#33](https://github.com/onahum2023/clean-time/pull/33). Exact Preview evidence is recorded below. Leave unmerged for Nora/Oded acceptance; no production promotion.

## Behavior

- Fresh visitors see a centered high-resolution favicon logo and selectable Hebrew wordmark, purpose/origin copy, then four non-interactive feature explanations using the actual app names/icons, followed by one **מתחילים** action, secondary existing-account access, storage reassurance and About/privacy. The revised #32 content order supersedes the earlier above-the-fold action requirement; phone scrolling is expected and desktop features use two columns. No settings, app navigation or recovery fields appear yet. Setup asks for date and the existing five recovery types. Visible/browser Back retains draft values during the visit. Guest setup enters Today; recovery tools work without name/email/phone.
- Existing configured guests/accounts bypass Welcome using the existing stored date, without a new onboarding flag. Email callbacks and unconfigured sessions wait for account/sync resolution before ordinary entry routing. The transient startup screen is replaced in browser history; authenticated users without a date return to My Account rather than Welcome from the Settings gear. Locked backups and conflicts retain their existing explicit paths; no replacement key is made over locked cloud data. Sparse registered restores can still reach recovery settings.
- `backupStatus()` derives all status copy (Settings, My Account, Today reminder) from existing session/key/sync state: local, checking, setup, verifying, active, locked, initial error, later attention. Authentication is separate from backup activation. A callback with incomplete setup opens My Account/key setup. Finish later preserves local content and leaves a reminder; reload of a configured device stays on Today. Retry uses cached acknowledged material. An active/verified status requires confirmed encryption material; initial upload continues to use the existing encrypted write/readback/decrypt verification. Later network/sync errors retain the last verified backup status.
- Native date inputs remain in guest setup, explicit account creation and recovery settings. Each shows an immediate Hebrew month-name confirmation. Canonical `YYYY-MM-DD` parsing/storage and counter math are unchanged; formatting uses local calendar components, not UTC parsing. Browser-native placeholder order cannot be guaranteed.
- Recovery data shape, unknown/legacy fields, malformed-storage protection, guest conversion, conflict choices, encryption envelope/KDF and migrations remain intact. App version: `2026.10.07.2`.

## Archived backend and live QA boundary

The former staging project `uffvbfmfsesdhjzzjiyu` was deleted on 2026-10-12.
See the [archived architecture, SQL and historical live results](staging/README.md).
PR #33 reported **604 local and deployed synthetic checks** plus live unused-email
rejection, guest setup/reload and registration continuity. At that point real
email verification and subsequent crypto/restore checks were incomplete. Later
reported evidence and remaining lifecycle gaps are recorded chronologically in
[#34](https://github.com/onahum2023/clean-time/issues/34); broader live coverage
remains #19 and physical Android/PWA coverage remains #21.

Before isolated config was introduced, early immutable Previews used production
public configuration. Do not use those URLs for account QA. Current source builds
explicitly disable Preview/development backup and ignore retired staging variables.
Mocked browser results do not establish SMTP, redirects, RLS or SQL guard behavior.

## Automated checks

Run from repository root with Playwright available through `NODE_PATH`:

```sh
node tests/run-qa.js
QA_BASE_URL=https://EXACT-PR-PREVIEW.vercel.app node tests/run-qa.js
QA_ENGINE=webkit QA_BASE_URL=https://EXACT-PR-PREVIEW.vercel.app node tests/run-qa.js welcome-qa.js
```

`QA_BASE_URL` accepts only an exact HTTPS Vercel origin. Each suite uses disposable contexts and synthetic fixtures; external auth/database calls are aborted/mocked. Web Crypto uses deployed `assets/sync-crypto.js` with generated fixture keys kept out of reports/logs. Guest tests use actual deployed HTML/assets. Screenshots with generated key fields are masked. No browser auth state is committed.

Initial three-issue implementation, before revised #32: Chromium **488 checks, zero failed suites**, both locally and against [the tested immutable Preview](https://clean-time-edw7jztkl-nu-cielo.vercel.app). Git commit `5d6d9a305240b10085b7f1faea998bbd2ce2d607`; deployment `dpl_2ZcZtfyM4CVpPXddwSGZKKPowsUT`; Git source, Ready, Preview. Native dark controls and authenticated startup/Back findings were fixed in this PR; affected local suites passed and the entire deployed suite was rerun. All **15 JavaScript syntax checks** and `git diff --check` passed. Documentation-only follow-up commits do not change tested application code. The PR description links the latest checked Preview.

| Suite | Passing checks (before revised #32) |
| --- | ---: |
| account | 27 |
| bookmarks | 43 |
| bookmarks-sync | 11 |
| edge | 12 |
| encryption | 117 |
| local | 83 |
| sync | 8 |
| UAT | 43 |
| upgrade | 55 |
| Welcome/date | 89 |
| **Total** | **488** |

Preview is Vercel-auth protected (anonymous HTTP 302). `tests/preview-access.js` adds the Vercel CLI's short-lived development OIDC header only to the exact Preview origin, in memory; third-party fixture routes remain blocked/mocked. Protection was not disabled, no credential was printed/committed, and no live Supabase request was sent. Run protected QA with `vercel env run` for the linked `nu-cielo/clean-time` project and the commands above. Nora/Oded require Vercel access to open the Preview.

## Browser review and limitations

Visually inspected 24 screenshots of deployed Welcome/setup/Today/guest My Account at 320/360/390px and light/dark themes: all fit in RTL and actions are clear. The original sparse entry-screen screenshots are historical only and do not establish acceptance of the revised #32 landing. The review found dark native date segments/icon needed theme styling; `color-scheme` now follows the existing light/dark theme and the date segments/calendar icon correction was visually verified on deployed commit `d5d5a3f6b139394c860c531259fc3071f49f4b66`; authenticated startup/Back routing subsequently passed the full deployed regression. Screenshots are synthetic local QA artifacts outside Git. This is human inspection of browser-generated screenshots, not an interactive manual or physical-device pass. Automated keyboard/focus/touch/date/time-zone and history checks are distinct from visual browser review. Final local WebKit Welcome/date/theme coverage: **89 passing checks**. WebKit navigation to the protected Preview did not receive any response before timeout, including a focused diagnostic; deployed WebKit coverage remains pending. Chromium protected access works and is the deployed browser evidence. No interactive manual account UAT or physical phone was tested. Live auth/email/database checks listed above remain pending even when their synthetic browser equivalents pass.

## Nora/Oded Preview acceptance checklist

For current UAT use a fresh disposable profile and synthetic guest content under the [Track B release QA controls](TRACK-B-RELEASE-QA.md). The PR #33 staging Preview is retired; do not submit account forms to historical deployments. The checklist below preserves the original acceptance criteria.

1. Send only the revised Preview link to a fresh visitor. Check centered logo/name → purpose/origin → four feature explanations → start/sign-in → reassurance → About/privacy. Can they understand the app and scroll naturally to **מתחילים** without instructions? Feature items must not open tools before setup. The former above-the-fold action check is superseded. Can they reach About/privacy and return?
2. Start, choose recovery type and October 1, and confirm **1 באוקטובר 2026**. Check required/future-date messages. Go Back and confirm the draft remains.
3. Continue to Today, add a synthetic gratitude or plan entry, reload and confirm direct Today plus retained content. Traverse tools and Back.
4. Review at 320, 360 and 390px, light/dark, with keyboard focus and enlarged text. Physical Android/date-picker/PWA acceptance remains #21.
5. After a dedicated test backend/Preview callback is approved: existing/unused-email login, guest registration continuity, mail verification → key setup → verified backup, finish-later/reminder/resume, initial failure/retry/reload, active account reopening and second-browser recovery-key restore. Confirm no false active-backup message and no loss of synthetic local content. Do not share keys or recovery data in public feedback.


## Revised #32 landing — 2026-10-07

The issue was reread after Oded changed the landing acceptance criteria. The prior sparse entry screen is replaced within the same branch/PR. Reuses existing `icon-512.png` (512 px source, displayed at 88 px); no original vector logo is present in the repository. The ordinary top-right header is hidden only on Welcome to avoid duplicating the wordmark. The four features use the exact existing counter/planner/journal/gratitude SVGs and names; their list items are explanatory and non-interactive. No family names/details or new recovery tools were added. Version: `2026.10.07.2`.

`tests/welcome-qa.js` replaces the above-the-fold assertion with actual visual/content order, centered accessible branding, high-resolution local logo, exact icon/name reuse, non-interactive features, readable light/dark contrast, keyboard access, normal scrolling, phone/desktop fit and enlarged-text checks. Existing guest/date/Back/reload/continuity checks remain. Full local regression: **579 checks, zero failed suites**. Revised landing: **180 checks** in Chromium and **180 in local WebKit**; 15 syntax checks and `git diff --check` pass. Revised deployed Chromium regression: **579 checks, zero failed suites**, including **180 revised landing checks**, against [the revised Preview](https://clean-time-mlp6127rf-nu-cielo.vercel.app), commit `f79d4dbd7a7b871ce9848577e433cc9a7092cf0e`, deployment `dpl_JBAR9x1aeHL6Z8ESo8YyoQfwdwBV` (Git source, Ready, Preview). **16 fresh deployed screenshots** cover Welcome/setup at 320/360/390/1280px in light/dark; all eight landing captures were visually reviewed. They show the revised hierarchy, readable shared icons/names and ordinary scrolling, without clipped content or horizontal overflow. Captures/manifest are retained as ignored local QA artifacts under `.playwright-mcp/pr33-landing-f79d4db/`, with phone comparison sheets and desktop views. The screenshots were taken from this deployed URL, not localhost. PR #33 records the latest documentation-only Preview/source-match checks. Fresh-visitor product acceptance remains pending; earlier screenshots do not count as acceptance of this revision. At that revision live auth/backup remained paused; current remaining coverage is tracked in #34 and #19.
