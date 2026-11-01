# PR #72 — finish deployed verification on a local laptop

Continue the existing draft PR, not a new implementation:
https://github.com/onahum2023/clean-time/pull/72
Branch: `codex/responsive-ux`, based on main after PR #71.

Application code is complete at `7c4f096`, version `2026.11.01.5`. Later commits
add only evidence, documentation and the deployed browser runner. Preserve the
wider responsive layouts and the original centered fixed bottom navigation at
all widths. Do not include issue #73's Lovable-inspired design work. Skip Nora
review per owner instruction. Keep the PR Draft; no merge or Production deploy.

## The one blocked task

Run actual browser interaction tests against the deployed Preview at desktop
1440px and mobile 390px, using synthetic guest data only:
https://clean-time-jyjp69cuk-nu-cielo.vercel.app

Cloud Chromium cannot reach it because the managed proxy returns HTTP 403 on
CONNECT (`ERR_TUNNEL_CONNECTION_FAILED`). This is an environment network block,
not an observed application or Vercel protection failure. No deployed interaction
checks have completed. Do not report local tests/HTTP fetches as deployed tests.

## Ready-to-run browser runner

`tests/deployed-responsive-smoke.js` makes actual browser requests without
mocking application documents, assets or backend responses. It uses fresh
synthetic guest contexts and covers all six requested screens, daily-action and
navigation order, scrolling/overflow, Journal persistence, Settings dialogs and
focus, preferences/languages, and Step 10 saving/printing/PDF downloads.

Ensure Playwright and Chromium are available. On a laptop, the runner uses
Playwright's installed Chromium by default. `QA_CHROMIUM_EXECUTABLE` optionally
selects an existing browser. Install missing QA dependencies outside the
repository; do not add an application package/build system just for this check.

From the repository root:

```
node tests/deployed-responsive-smoke.js
```

Optionally set `QA_BASE_URL` to another exact approved HTTPS Vercel Preview
origin. Never use Production or real recovery/account data. If Vercel protection
intervenes, use the existing short-lived, origin-scoped OIDC access workflow;
do not disable Deployment Protection. The script supports `VERCEL_OIDC_TOKEN`
without printing it. Keep generated reports/PDFs/browser material in ignored
`qa-artifacts/responsive/final-smoke/`.

Fix any actionable findings within PR #72 scope, rerun affected tests, and
update the PR with the actual deployed results and final commit/Preview URL.
Replace/augment the published after images with deployed synthetic captures
where helpful, labeling their provenance accurately. If app code is changed,
bump app/worker versions and regenerate the CSP hash as required.

## Already completed

- Full local browser regression: 2,654 passed; 791 responsive checks included.
- Fresh local preservation rerun: 489 passed (Account, Encryption, Inventory,
  original-language content, print/PDF, Appearance, i18n and Navigation).
- Deployed runner validated locally: 102 passed, not deployed evidence.
- Seven hygiene/build guard tests, syntax/CSP/build/diff checks and CI pass.
- Accessible synthetic Hebrew RTL before/after gallery:
  https://github.com/onahum2023/clean-time/blob/codex/responsive-ux/docs/responsive-review/README.md
- Screen audit, exact evidence boundaries and remaining physical-device risks:
  `docs/RESPONSIVE-UX.md`.

Registered/encrypted backup compatibility is covered by synthetic SDK tests.
The Preview is intentionally guest-only; do not repoint it at Production to
exercise real registered services. Native keyboard/PWA/safe-area, screen-reader
and physical-printing acceptance remain separate manual release gates.
