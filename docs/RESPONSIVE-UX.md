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
Bottom navigation remains on phones. From 768px the same five controls move to
one full-width top bar, with the language switcher immediately below. The top
bar reserves space in rem units for enlarged text. Reading order, accessible
labels, active-page semantics, history and focus behavior are unchanged.

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
adaptive navigation, bounded writing widths, long Journal editing across
resizes, 200% text, scrollable confirmations, focus trapping and focus return.
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

Before/after screenshots cover Home, Step 10, Journal list/editor, Settings and
Account at all five requested widths. Synthetic images and logs remain in
ignored `qa-artifacts/responsive/`; an owner-facing comparison is supplied with
the delivery rather than included in the deployed application.

Validation: the final local Chromium run passes all 2,654 browser checks,
including 791 new responsive checks and the expanded Welcome/public-page matrix.
All 7 repository-hygiene/build guard tests pass. Inline JavaScript syntax,
CSP/security headers, `git diff --check`, hygiene scan and Preview build pass.
The deployed Preview HTML/config return HTTP 200; the responsive shell/version
are present and backend configuration remains `url:null`, `key:null`,
`backupDisabled:true`. Browser interaction checks run against the loopback app;
these HTTP checks establish the separate deployed-static-file boundary.

Independent [Nora QA was requested](https://neotixhqworkspace.slack.com/archives/C0CAEEX3C4Q/p1793521200857239)
on draft PR #72. Review is pending. Owner visual acceptance and physical-device
keyboard/PWA acceptance remain release gates; browser viewport emulation does
not establish physical-device acceptance. No merge or Production deployment was
performed.
