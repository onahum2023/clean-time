# Track B review record

Tracking issue: #50. Baseline: `fb2d244835ea8adf652dfcffe393943371666347`.
No merge, production deployment, production Supabase changes, or real recovery
data access is authorized. All fixtures and screenshots are synthetic.

## Preview isolation (#41)

The retired staging project is no longer accepted as a live Preview backend.
Preview builds always emit `backupDisabled:true`, `url:null`, `key:null`, ignoring
obsolete branch variables. Guest/local tools work; account/backup operations fail
closed. Production build selection is unchanged. A new isolated backend requires
a separately reviewed configuration change; production is never the substitute.
Historical staging reports remain evidence of past tests, not current setup.

Feature PRs can use this shared Preview foundation as their base until it is
merged by the owner. They remain independent of each other's product changes.

## Reproducible cloud QA

No app build/dependency installation is needed. Start a loopback server at 8765.
Use `QA_CHROMIUM_EXECUTABLE=/usr/bin/chromium QA_NO_SANDBOX=1 node tests/run-qa.js`
in this managed container. Elsewhere, omit these overrides and use Playwright's
installed browser. Synthetic suite screenshots use `/tmp`, not macOS-only paths.
No live staging runner should be invoked against the retired backend.

## Manual release gates

- #19 / #34: live SMTP, Auth/PostgREST/RLS, fresh activation, failure/retry and
  independent-browser restore need an isolated service and owner-assisted email.
- #21: physical Android/PWA close/reopen, background gong/timer and magic links.
- #45: English and Russian native-speaker recovery terminology/UAT.
- #17: any privileged deletion endpoint needs isolated service verification and
  explicit deployment/configuration authorization before production use.
- Nora reviews sensitive changes through the owner's authorized Slack workflow.

Independent review correction: Preview/development/disabled config is now
host-independent and authoritative. Only explicit production configuration on
recognized production hosts can use production. Source review has no backend;
synthetic QA injects an explicit loopback emulator target and mocks the SDK.
Missing build environment produces disabled development output; unknown modes
fail. Foundation app/worker version is 2026.10.15.10. Added 42 origin/startup/build
checks and upgraded the real baseline cached shell to the new disabled shell
across close/reopen (17 offline checks). Configuration/account checks: 25 + 27.
