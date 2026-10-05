# Account model (#10) — local QA

Based on `codex/clean-time-1.0-p0` at `d5a7924`. No merge or production deployment.

## Behavior and compatibility

- Guest onboarding remains email-free and fully local. Optional name, time and color remain available in recovery settings.
- Account creation combines optional name, required email, date/type, optional time and color in one form. The complete profile is persisted locally before sending the magic link. Failed email requests preserve it for retry; until authentication this remains local guest data.
- Returning-account login requests email only. Guest conversion requests email and optional name only when absent; all recovery collections are retained.
- My Account separates identity, sync state/last sync, sign-out and deletion from recovery preferences. Name is shown from the existing synced profile; existing JSON shape is unchanged.
- First-sign-in conflicts still require an explicit local/cloud selection. Selecting local stamps newer than both timestamps, including a future-dated cloud record.
- Existing deletion clears device data or overwrites the cloud state with empty data; it does **not** remove the Supabase Auth identity. The account area states this limitation.
- No encryption, key UX, export, dependencies, SMTP changes, passwords or analytics added. Existing plain-JSON privacy disclosure remains visible during account creation.

## Automated checks

The six original browser suites run against `http://127.0.0.1:8765` with synthetic data and blocked or locally mocked external requests. SDK mocks do not send email or write to Supabase.

| Suite | Passed checks |
| --- | ---: |
| `tests/account-qa.js` | 26 |
| `tests/local-qa.js` | 83 |
| `tests/edge-qa.js` | 12 |
| `tests/sync-qa.js` | 8 |
| `tests/bookmarks-qa.js` | 43 |
| `tests/bookmarks-sync-qa.js` | 11 |

Account coverage: registered onboarding color swatches (shared six-color order, accessible radio state, saved-color default, no dropdown, selected-color persistence); guest onboarding; complete registered onboarding; persisted profile on mock magic-link return and cleaned URL; email-only returning login/cloud restoration; conversion with empty/existing cloud; explicit local choice despite future cloud timestamp; existing explicit cloud choice in regression suites; account visibility/identity/status; sign-out preserving cloud; expired links and request-error retry; 360px account/onboarding layout. Existing suites also cover recovery tools, compatibility, offline sync and wider layouts.

JavaScript syntax and `git diff --check` pass. Auth remains exclusively `signInWithOtp`; no password inputs or password auth/reset paths. The existing `URL.password` check only rejects credentials embedded in resource URLs.

The additional [active-user upgrade compatibility pass](UPGRADE-COMPATIBILITY.md) adds 51 checks, bringing all seven suites to 234 passing checks. It documents unchanged persistence and first-load writes.

## Remaining manual checks

- Actual SMTP delivery and Supabase magic-link return on Android Chrome, including a new device/browser and installed app. Use synthetic accounts only.
- A link opened in another browser cannot carry the unsynced local onboarding profile; it signs into the account, restores existing cloud data if present, or allows recovery settings to be completed. The original device retains its local profile and requires the normal explicit conflict choice if cloud data later exists.
- Physical Android 360px keyboard, date/time picker and accessibility review.
- Issue #9 must define encryption and recovery-key lifecycle separately. A recovery key is not an account password. Whole-state sync and the current privacy limitation remain until then.
