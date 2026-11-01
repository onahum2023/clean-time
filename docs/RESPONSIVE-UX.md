# Responsive application UX

Baseline: `bcb72c4` on main, after PR #71. All QA uses synthetic local data.
Production deployment and merge require owner approval.

## Audit and decisions

| Screens | Baseline constraint | Responsive behavior |
| --- | --- | --- |
| Home | 520px shell and navigation on desktop | 960px content ceiling; same ordered 2×2 daily cards and full-width Step 10 action; quiet summary retained |
| Tools | Single narrow list | Two columns from 768px; reading order follows locale |
| Step 10 | All writing constrained to mobile column | 800px ceiling, paired date/history controls from 600px; statements and questions remain in one linear reading/editing flow |
| Journal list/editor | 520px list and full-screen editor measure | 760px list, 800px editor; scrollable text area preserves toolbar and save status in short/landscape windows |
| Settings | Long 480px form on desktop; appearance fields only as wide as their text | 960px ceiling, recovery/account and appearance/export groups in two columns from 1024px; controls fill their group |
| Account/encryption | Narrow identity, status and recovery-key controls | 680px ceiling; wrapped identity/status text and full-width controls; existing guest and registered flows retained |
| Planner, Gratitude, Bookmarks, Readings | Narrow content/forms even with room available | 760px ceiling; flexible input/action rows; long text and links wrap |
| Counter details | Mobile-only measure | 760px ceiling with existing display modes preserved |
| About, Feedback | Narrow prose | 760px ceiling; wrapping headings and links |
| Meditation, Auth, Onboarding, Startup | Short forms need a modest measure | 560px ceiling; timer actions wrap |
| Welcome | Already responsive at 880px | Existing feature grid and entry hierarchy preserved |
| Public About/Privacy | Separate responsive public stylesheet | Existing readable layout retained; covered by existing public-page/browser checks |
| Confirmations | Centered dialog could exceed short/enlarged viewport | Bounded by dynamic viewport height; dialog contents scroll without losing keyboard focus trapping |

Shared shell: 1120px ceiling, 16/20px mobile gutters and 32px from 600px.
Fixed bottom navigation remains at every viewport width, with the original five
options, order and active-page highlighting. Its items sit in a centered 520px
container, independently of the wider content shell. Bottom content and scroll
padding grow in rem units for enlarged text and include the device safe area.
The language switcher retains its original sticky position. Reading order,
accessible labels, history and focus behavior are unchanged.

Writing width grows modestly rather than stretching to the whole desktop.
No sidebars, extra choices or decorative features were added. Settings groups
follow DOM order in both RTL and LTR; no CSS visual reordering is used.

The implementation changes CSS and two structural grouping wrappers only.
Application/worker versions and the inline-script CSP hash are updated. No
recovery wording, model, auth, encryption, backup or sync logic changes.

## Validation and owner comparison

`tests/responsive-qa.js` exercises every SPA destination in Hebrew RTL and
English/Russian LTR, light/dark, at 320×568, 390×844, 768×1024, 1024×768,
1440×900, 844×390 and 568×320. It checks controls and document overflow,
centered bottom navigation and content clearance, bounded writing widths, long
Journal editing across resizes, 200% text, scrollable confirmations, focus trapping and focus return.
Welcome/Onboarding and static public-page suites also cover all five requested
widths. Existing appearance suites cover all saved backgrounds/fonts/accent options.
Existing suites cover registered Account states with synthetic SDK mocks;
Preview remains guest-only and is never pointed at Production services.

Run with a loopback server at port 8765:

```
QA_BASE_URL=http://127.0.0.1:8765 QA_CHROMIUM_EXECUTABLE=/usr/bin/chromium QA_NO_SANDBOX=1 node tests/run-qa.js
node scripts/repository-hygiene.js
node --test tests/repository-hygiene.test.js
VERCEL_ENV=preview node scripts/build-vercel.js
```

The [published Hebrew RTL comparison](responsive-review/README.md) contains
reviewed synthetic before/after PNGs for desktop Home, Settings, Journal
list/editor and Step 10, plus mobile Home and Step 10. These repository-hosted
images are accessible through GitHub and are excluded from the deployed app by
the existing asset allowlist. Captures are local Chromium evidence at the
baseline and application commit `7c4f096`, not deployed-browser evidence.

Validation: the final local Chromium run passes all 2,654 browser checks,
including 791 new responsive checks and the expanded Welcome/public-page matrix.
All 7 repository-hygiene/build guard tests pass. Inline JavaScript syntax,
CSP/security headers, `git diff --check`, hygiene scan and Preview build pass.
The deployed Preview HTML/config return HTTP 200; the responsive shell/version
are present and backend configuration remains `url:null`, `key:null`,
`backupDisabled:true`. Browser interaction checks run against the loopback app;
these HTTP checks establish the separate deployed-static-file boundary.

## Final owner handoff (2026-11-01)

Nora review is skipped at the owner's request. Issue #73's Lovable-inspired
visual work is outside this PR. This finalization adds evidence/documentation
and a reproducible deployed-browser smoke runner; application code remains at
`7c4f096` / version `2026.11.01.5`.

**Deployed browser smoke: BLOCKED by the Cloud environment network policy.**
The actual Chromium attempt against the owner-requested
`https://clean-time-jyjp69cuk-nu-cielo.vercel.app` failed before loading the app:
`page.goto: net::ERR_TUNNEL_CONNECTION_FAILED`. A separate connection probe
returned `CONNECT tunnel failed, response 403` from the environment's proxy.
This is not a finding against the app or Vercel Deployment Protection. HTTP
connector fetches and local tests do not substitute for this release gate.
The environment must allow the Preview hostname before it can be completed.

Reproduce actual browser interactions (no document/asset/backend mocks):

```
QA_BASE_URL=https://clean-time-jyjp69cuk-nu-cielo.vercel.app QA_NO_SANDBOX=1 node tests/deployed-responsive-smoke.js
```

The runner uses fresh synthetic guest contexts at 1440×900 and 390×844. It
checks Home/daily-action order, all five bottom-nav options, Journal writing,
scrolling and reload persistence, Step 10 answers/finish/print/PDF download,
Settings dialogs/focus/last-action clearance, appearance persistence, all three
language directions, guest Account, Recovery Tools and dark-mode layout.
If needed, the existing short-lived Vercel OIDC credential is attached only to
the exact tested origin; no credentials or browser profiles are published.

Runner validation against loopback passes **102 checks**. This confirms the
runner's interactions are executable; it does not establish deployed behavior.
Fresh preservation rerun: **489 checks pass, zero failed suites**:

| Preserved behavior | Local browser evidence |
| --- | --- |
| Five daily actions/order and bottom navigation | Navigation: 47; runner validation also checks both orders and viewport clearance |
| Appearance/languages | Appearance: 59; i18n: 64 |
| Guest storage | Runner validation includes Journal save/reload and appearance persistence |
| Registered account/encrypted backup compatibility | Account: 27; Encryption: 147, using synthetic SDK mocks |
| Step 10 content/save/print/PDF | Inventory: 33; original-language content: 84; print/PDF: 28 |

Registered account/encrypted backup coverage uses synthetic SDK mocks; live
registered sign-in/backup cannot be exercised on the intentionally guest-only
Preview and was not pointed at Production.

Owner visual acceptance and physical-device keyboard/PWA/safe-area acceptance
remain release gates. Native mobile keyboard resizing, installed-PWA lifecycle,
screen readers and physical printing require device/manual acceptance. Existing
Step 10 downloaded PDFs use raster pages; their prior accessibility limitations
are unchanged. Keep PR #72 in Draft. No merge or Production deployment performed.
