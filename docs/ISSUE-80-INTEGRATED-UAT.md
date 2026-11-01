# Clean Time #80 — integrated visual UAT

[Draft PR #81](https://github.com/onahum2023/clean-time/pull/81) ·
[Protected application Preview](https://clean-time-du8apw79u-nu-cielo.vercel.app/)

**Integrated owner UAT: HOLD. Desktop balance accepted; final counter polish awaits owner review.**
See the [current Home counter polish and fresh screenshots](PR-81-HOME-BALANCE-UAT.md).
No separate theme/screen approval gates. No Nora review, merge or Production
deployment. Backend integration remains deferred until after visual UAT.

## Baseline, scope and compatibility

Started from latest main `b0fd4ba8cc927b75468b409e8b6981966740de54`, including
merged Welcome #79 and mirrored Home/navigation #78. Implemented #80 as one
coordinated pass covering the remaining #76/#77 scope, preserving the SPA.

The [appearance compatibility design](ISSUE-80-APPEARANCE-COMPATIBILITY.md) was
committed as `b29141e` **before implementation**. Original/Forest/Rainy/Sunny
palettes and independent system/light/dark brightness use only the new local
`cleantime-he-visual-theme` key. All nine legacy backgrounds, five font choices,
six recovery profile colors and five device-accent overrides remain available.
Explicit customization stays authoritative. No default rewrite or automatic
migration of old appearance/recovery keys occurs; reset is an explicit action.

Shared visual tokens, headers, cards, icon treatment, fields, lists, dialogs and
writing surfaces cover every inner screen. Guest setup remains one form, with
native recovery-type radios preserving all five original saved identities,
calendar years/months/days preview, optional second counter and returning-user
entry. No new mandatory fields, backend, architecture or recovery workflow.

At the initial handoff, Original-palette Welcome and Home/navigation were pixel-identical
to main in 12 matched synthetic captures. Owner feedback now explicitly supersedes
the desktop Home composition; the linked revision documents its new hierarchy.
The approved mobile Home and Welcome remain unchanged. All official Step 10
content is unchanged. Public About/Privacy documents retain their existing design.

## Start the integrated review

Use only fictitious dates/text while trying the Preview. Start as a guest,
review setup and Home, then use the rail or bottom navigation to try the screens
below. Settings → Appearance contains the four palettes and brightness control;
the existing background/font/accent controls remain underneath.

The Preview intentionally has disabled backend configuration (`url:null`,
`key:null`, `backupDisabled:true`). Account/login/signup **presentation** is
reviewable; live email, sign-in and cloud-backup acceptance follow the separately
scoped backend/integration work. Existing registered behavior is regression-tested
with synthetic SDK mocks. Do not treat the illustrative active-backup captures
below as a live-service result.

## Owner UAT checklist

All items below await owner review; automated passes are recorded separately.

- [ ] Welcome: approved hierarchy/copy, primary/closing Start, returning-user path and Privacy/About links.
- [ ] Guest setup: recovery choices understandable; date confirmation and live duration clear; primary action reachable; no extra required step.
- [ ] Optional second counter: fields/show-on-Home choice remain understandable and optional; both counters appear after saving.
- [ ] Home/navigation: review revised desktop counter/actions/static cards/reflection; approved mobile layout retained; five destinations clear; desktop RTL rail/LTR mirror and mobile footer remain consistent.
- [ ] Appearance: compare all four palettes in both brightness modes; chooser selection/keyboard behavior clear; image-free defaults appropriate.
- [ ] Existing customization: try saved background, font and accent overrides; palette changes keep them; reset restores Original/system + default/Assistant/profile.
- [ ] Daily Plan: add/edit/toggle/delete, saved-day selection and long items remain usable.
- [ ] Gratitude: add/edit/delete and dated history stay readable.
- [ ] Journal: list, existing/new writing, long text, autosave, Done, Escape and browser Back/Forward remain comfortable.
- [ ] Step 10: all five original sections and closing, history, previous/next, answers/notes, finish/reopen and all official wording remain intact.
- [ ] Print/PDF: print preview and local PDF include the saved selected-day content; try the actual target printer/viewer manually.
- [ ] Meditation: duration, Start/Pause/Resume/Reset, countdown and existing gong behavior remain clear.
- [ ] Recovery Tools, Readings and Bookmarks: direct destinations, links, editing and saved notes remain understandable.
- [ ] Settings: profile/date/color controls, counters, appearance, export and existing reset confirmation remain accessible.
- [ ] Counter/details: numerical formats, primary/secondary selection, compact/equal-card/single views and Home visibility still make sense.
- [ ] Account: guest explanation and distinct returning/create paths; review supplementary synthetic registered/encryption presentation below.
- [ ] About/Feedback: long reading, privacy/resource links, mail/copy actions and return navigation remain legible.
- [ ] Dialogs: visible focus, trapped Tab/Shift+Tab, cancellation and focus return; no obscured actions in short windows.
- [ ] Hebrew RTL / English and Russian LTR: labels, selected navigation and text layout feel coherent; new translation wording remains draft pending native review.
- [ ] 320/390px phones, 1024px rail threshold and 1440px desktop: scroll, writing width and final actions remain comfortable.
- [ ] Native 200% browser zoom, physical keyboard/screen reader, mobile keyboard, installed PWA and actual safe-area cutouts on target devices.
- [ ] Offline reload: after initial loading, local tools and appearance choices stay usable; closing/reopening activates an update without loss.

## Initial deployed screen gallery

**Historical initial-handoff evidence. Desktop Home images below are superseded by
the [current Home balance gallery](PR-81-HOME-BALANCE-UAT.md).** Other screens
retain the design shown here.

The links below are **actual full-viewport screenshots from the protected
application Preview at `03aaa5f91e132a467d9228c93bf9a7bccde20cd6`**, version
`2026.11.01.11`. Final evidence/test-only commits do not change its published
application assets. All data is synthetic. Deployed capture contexts use a fixed
1 November 2026, 13:00 Europe/Amsterdam, loaded self-hosted fonts and blocked
service workers for deterministic captures; the existing offline-preparation
notice is consequently visible. Real offline/cache behavior is tested separately.
No document/asset/backend responses are mocked for these deployed captures.

| Screen | 1440×900 light | 1440×900 dark | 390×844 light | 390×844 dark |
| --- | --- | --- | --- | --- |
| Welcome | [View](issue-80-visuals/welcome-1440-light.png) | [View](issue-80-visuals/welcome-1440-dark.png) | [View](issue-80-visuals/welcome-390-light.png) | [View](issue-80-visuals/welcome-390-dark.png) |
| Guest setup | [View](issue-80-visuals/onboarding-1440-light.png) | [View](issue-80-visuals/onboarding-1440-dark.png) | [View](issue-80-visuals/onboarding-390-light.png) | [View](issue-80-visuals/onboarding-390-dark.png) |
| Optional second counter | [View](issue-80-visuals/onboarding-second-1440-light.png) | [View](issue-80-visuals/onboarding-second-1440-dark.png) | [View](issue-80-visuals/onboarding-second-390-light.png) | [View](issue-80-visuals/onboarding-second-390-dark.png) |
| Home / Today | [View](issue-80-visuals/home-1440-light.png) | [View](issue-80-visuals/home-1440-dark.png) | [View](issue-80-visuals/home-390-light.png) | [View](issue-80-visuals/home-390-dark.png) |
| Daily Plan | [View](issue-80-visuals/plan-1440-light.png) | [View](issue-80-visuals/plan-1440-dark.png) | [View](issue-80-visuals/plan-390-light.png) | [View](issue-80-visuals/plan-390-dark.png) |
| Gratitude | [View](issue-80-visuals/gratitude-1440-light.png) | [View](issue-80-visuals/gratitude-1440-dark.png) | [View](issue-80-visuals/gratitude-390-light.png) | [View](issue-80-visuals/gratitude-390-dark.png) |
| Journal list | [View](issue-80-visuals/journal-1440-light.png) | [View](issue-80-visuals/journal-1440-dark.png) | [View](issue-80-visuals/journal-390-light.png) | [View](issue-80-visuals/journal-390-dark.png) |
| Journal writing | [View](issue-80-visuals/journal-editor-1440-light.png) | [View](issue-80-visuals/journal-editor-1440-dark.png) | [View](issue-80-visuals/journal-editor-390-light.png) | [View](issue-80-visuals/journal-editor-390-dark.png) |
| Step 10 | [View](issue-80-visuals/step10-1440-light.png) | [View](issue-80-visuals/step10-1440-dark.png) | [View](issue-80-visuals/step10-390-light.png) | [View](issue-80-visuals/step10-390-dark.png) |
| Meditation | [View](issue-80-visuals/meditation-1440-light.png) | [View](issue-80-visuals/meditation-1440-dark.png) | [View](issue-80-visuals/meditation-390-light.png) | [View](issue-80-visuals/meditation-390-dark.png) |
| Recovery Tools | [View](issue-80-visuals/tools-1440-light.png) | [View](issue-80-visuals/tools-1440-dark.png) | [View](issue-80-visuals/tools-390-light.png) | [View](issue-80-visuals/tools-390-dark.png) |
| Bookmarks | [View](issue-80-visuals/bookmarks-1440-light.png) | [View](issue-80-visuals/bookmarks-1440-dark.png) | [View](issue-80-visuals/bookmarks-390-light.png) | [View](issue-80-visuals/bookmarks-390-dark.png) |
| Readings / resources | [View](issue-80-visuals/readings-1440-light.png) | [View](issue-80-visuals/readings-1440-dark.png) | [View](issue-80-visuals/readings-390-light.png) | [View](issue-80-visuals/readings-390-dark.png) |
| Settings | [View](issue-80-visuals/settings-1440-light.png) | [View](issue-80-visuals/settings-1440-dark.png) | [View](issue-80-visuals/settings-390-light.png) | [View](issue-80-visuals/settings-390-dark.png) |
| Appearance chooser | [View](issue-80-visuals/appearance-1440-light.png) | [View](issue-80-visuals/appearance-1440-dark.png) | [View](issue-80-visuals/appearance-390-light.png) | [View](issue-80-visuals/appearance-390-dark.png) |
| Counter / details | [View](issue-80-visuals/counter-details-1440-light.png) | [View](issue-80-visuals/counter-details-1440-dark.png) | [View](issue-80-visuals/counter-details-390-light.png) | [View](issue-80-visuals/counter-details-390-dark.png) |
| Guest Account | [View](issue-80-visuals/account-1440-light.png) | [View](issue-80-visuals/account-1440-dark.png) | [View](issue-80-visuals/account-390-light.png) | [View](issue-80-visuals/account-390-dark.png) |
| About | [View](issue-80-visuals/about-1440-light.png) | [View](issue-80-visuals/about-1440-dark.png) | [View](issue-80-visuals/about-390-light.png) | [View](issue-80-visuals/about-390-dark.png) |
| Feedback | [View](issue-80-visuals/feedback-1440-light.png) | [View](issue-80-visuals/feedback-1440-dark.png) | [View](issue-80-visuals/feedback-390-light.png) | [View](issue-80-visuals/feedback-390-dark.png) |
| Returning-account login | [View](issue-80-visuals/auth-1440-light.png) | [View](issue-80-visuals/auth-1440-dark.png) | [View](issue-80-visuals/auth-390-light.png) | [View](issue-80-visuals/auth-390-dark.png) |
| Create-account form | [View](issue-80-visuals/signup-1440-light.png) | [View](issue-80-visuals/signup-1440-dark.png) | [View](issue-80-visuals/signup-390-light.png) | [View](issue-80-visuals/signup-390-dark.png) |
| Confirmation dialog | [View](issue-80-visuals/confirmation-1440-light.png) | [View](issue-80-visuals/confirmation-1440-dark.png) | [View](issue-80-visuals/confirmation-390-light.png) | [View](issue-80-visuals/confirmation-390-dark.png) |

Long views are also available for [Settings desktop](issue-80-visuals/settings-1440-light-full.png),
[Settings mobile](issue-80-visuals/settings-390-light-full.png),
[Step 10 desktop](issue-80-visuals/step10-1440-light-full.png),
[Step 10 mobile](issue-80-visuals/step10-390-light-full.png),
[About desktop](issue-80-visuals/about-1440-light-full.png),
[About mobile](issue-80-visuals/about-390-light-full.png) and
[account creation](issue-80-visuals/signup-390-light-full.png).
These `-full` files are browser full-page captures, distinct from the actual
viewport images in the table. Appearance/optional-counter shots deliberately
scroll the relevant controls into view; the rest show the screen entry state.

### Palette comparisons

Palettes coordinate canvas/cards/foreground/outlines while preserving the
person's accent. Background overrides stay separate. Choosing a palette does
not reset background, font or accent. Brightness follows the device unless
explicitly overridden.

| Palette | Desktop light | Desktop dark | Mobile light | Mobile dark |
| --- | --- | --- | --- | --- |
| Original | [Home](issue-80-visuals/home-1440-light.png) · [Chooser](issue-80-visuals/appearance-1440-light.png) | [Home](issue-80-visuals/home-1440-dark.png) · [Chooser](issue-80-visuals/appearance-1440-dark.png) | [Home](issue-80-visuals/home-390-light.png) · [Chooser](issue-80-visuals/appearance-390-light.png) | [Home](issue-80-visuals/home-390-dark.png) · [Chooser](issue-80-visuals/appearance-390-dark.png) |
| Forest | [Home](issue-80-visuals/palette-forest-home-1440-light.png) · [Chooser](issue-80-visuals/palette-forest-settings-1440-light.png) | [Home](issue-80-visuals/palette-forest-home-1440-dark.png) · [Chooser](issue-80-visuals/palette-forest-settings-1440-dark.png) | [Home](issue-80-visuals/palette-forest-home-390-light.png) · [Chooser](issue-80-visuals/palette-forest-settings-390-light.png) | [Home](issue-80-visuals/palette-forest-home-390-dark.png) · [Chooser](issue-80-visuals/palette-forest-settings-390-dark.png) |
| Rainy | [Home](issue-80-visuals/palette-rainy-home-1440-light.png) · [Chooser](issue-80-visuals/palette-rainy-settings-1440-light.png) | [Home](issue-80-visuals/palette-rainy-home-1440-dark.png) · [Chooser](issue-80-visuals/palette-rainy-settings-1440-dark.png) | [Home](issue-80-visuals/palette-rainy-home-390-light.png) · [Chooser](issue-80-visuals/palette-rainy-settings-390-light.png) | [Home](issue-80-visuals/palette-rainy-home-390-dark.png) · [Chooser](issue-80-visuals/palette-rainy-settings-390-dark.png) |
| Sunny | [Home](issue-80-visuals/palette-sunny-home-1440-light.png) · [Chooser](issue-80-visuals/palette-sunny-settings-1440-light.png) | [Home](issue-80-visuals/palette-sunny-home-1440-dark.png) · [Chooser](issue-80-visuals/palette-sunny-settings-1440-dark.png) | [Home](issue-80-visuals/palette-sunny-home-390-light.png) · [Chooser](issue-80-visuals/palette-sunny-settings-390-light.png) | [Home](issue-80-visuals/palette-sunny-home-390-dark.png) · [Chooser](issue-80-visuals/palette-sunny-settings-390-dark.png) |

### Navigation-threshold and small-phone samples

| Screen | 1024×768 light | 1024×768 dark | 320×568 light | 320×568 dark |
| --- | --- | --- | --- | --- |
| Home / navigation | [View](issue-80-visuals/home-1024-light.png) | [View](issue-80-visuals/home-1024-dark.png) | [View](issue-80-visuals/home-320-light.png) | [View](issue-80-visuals/home-320-dark.png) |
| Guest setup | [View](issue-80-visuals/onboarding-1024-light.png) | [View](issue-80-visuals/onboarding-1024-dark.png) | [View](issue-80-visuals/onboarding-320-light.png) | [View](issue-80-visuals/onboarding-320-dark.png) |
| Appearance | [View](issue-80-visuals/appearance-1024-light.png) | [View](issue-80-visuals/appearance-1024-dark.png) | [View](issue-80-visuals/appearance-320-light.png) | [View](issue-80-visuals/appearance-320-dark.png) |
| Step 10 | [View](issue-80-visuals/step10-1024-light.png) | [View](issue-80-visuals/step10-1024-dark.png) | [View](issue-80-visuals/step10-320-light.png) | [View](issue-80-visuals/step10-320-dark.png) |
| Account | [View](issue-80-visuals/account-1024-light.png) | [View](issue-80-visuals/account-1024-dark.png) | [View](issue-80-visuals/account-320-light.png) | [View](issue-80-visuals/account-320-dark.png) |

### Supplementary local registered-state illustrations

These four images use **local synthetic SDK mocks**, not deployed authentication
or real cloud data. They show the implemented registered-account/verified-backup
presentation with a synthetic `qa@example.invalid` identity. Recovery-key material
was confirmed hidden before capture. They supplement the deployed guest Account,
login and signup images; they do not establish live auth/backup acceptance.

[1440 light](issue-80-visuals/local-registered-account-1440-light.png) ·
[1440 dark](issue-80-visuals/local-registered-account-1440-dark.png) ·
[390 light](issue-80-visuals/local-registered-account-390-light.png) ·
[390 dark](issue-80-visuals/local-registered-account-390-dark.png)

## Automated evidence

| Boundary | Result |
| --- | --- |
| Complete local Chromium regression run | **4,996 assertions; zero failed suites** |
| Node contracts/build guards | **10 tests pass**, including 3,240 startup compatibility cases |
| Actual deployed UI | **1,828 assertions pass**: integrated 200% text/palettes (762), navigation (556), Home (193), Welcome (306), setup (11) |
| Actual deployed guest workflow | **106 checks pass** at 1440px/390px, including Journal reload, Step 10 save/print/PDF, theme + legacy preferences and exact recovery-byte preservation |
| Palette contrast | **3,960 rendered combinations pass** for foreground/secondary text/action/focus against canvas/cards, including every background/font/accent and all six profile colors |
| Legacy values | **1,080 browser preservation cases** plus **3,240 fresh startup contract cases**, with unknown legacy override bytes retained |
| Registered preferences/data | Existing upgrade/account/encryption/sync suites pass with synthetic mocks; palette/mode changes cause no recovery rewrite or upload |
| Initial approved baseline | **12 initial deployed Welcome/Home captures byte-identical** to matched latest-main; desktop Home now intentionally revised by owner request |
| Build/security | Inline/external JS syntax, exact CSP hashes, static Preview build, source/publication hygiene and diff whitespace pass |

The final local run uses Playwright 1.62.1 and a temporary pinned `pdf-lib@1.17.1`
QA dependency, without adding a frontend dependency. Reproduce from a guest-only
build served on loopback:

```
NODE_PATH=/private/tmp/clean-time-80-test-deps/node_modules QA_BASE_URL=http://127.0.0.1:8765 node tests/run-qa.js
node --test tests/visual-preference-contract.test.js tests/repository-hygiene.test.js
QA_BASE_URL=http://127.0.0.1:8765 node tests/deployed-responsive-smoke.js --local-check
```

For deployed checks set `QA_BASE_URL` to the exact protected Preview and supply
an unexpired same-project development OIDC token through the origin-scoped
helper, kept in memory. Existing stale local env files must not override it.
Capture with `tests/integrated-visual-capture.js`; `QA_CAPTURE_OUTPUT`,
`QA_CAPTURE_SCREENS` and `QA_CAPTURE_WIDTHS` control the gallery/sample runs.
Ignored raw QA logs and baseline images remain under `qa-artifacts/`.

### Baseline-known failures versus redesign regressions

- The old `review-feedback-qa.js` expected desktop navigation in one horizontal
  row. This failure was reproduced against unmodified main `b0fd4ba`; its
  assertion now checks the approved desktop column/mobile row and non-overlap.
- The first broad run could not load the existing PDF parser (`pdf-lib`); the
  pinned dependency was installed only in a temporary QA directory, then PDF
  checks passed. This was an environment prerequisite, not a PDF behavior change.
- The offline-upgrade fixture needed the two new static theme assets in its
  explicit allowlist. That fixture was updated and real worker/cache upgrade,
  close/reopen, CSP and recovery-preservation checks pass.
- Genuine enlarged-text issues found in About/Meditation/list actions were fixed
  with wrapping and responsive targets. The final complete run is green.

## Integration and manual acceptance boundaries

No auth/Supabase configuration, database schema, encryption, backup/sync protocol,
analytics semantics or backend infrastructure changes were made. The Preview
remains guest-only by the existing build rule. Live email/session/two-device
backup UAT and additional connections are deliberately deferred until visual UAT.

English/Russian wording remains draft; installed system fonts, physical mobile
keyboard/safe areas, screen readers, native browser zoom and PWA lifecycle need
target-device review. Automation uses real 200% text plus zoom-equivalent CSS
reflow and simulated bottom padding. Existing raster PDF accessibility limits
are unchanged; successful local downloads do not imply physical printing UAT.

**HOLD for integrated owner UAT and iterative fixes on this same Draft PR.**
