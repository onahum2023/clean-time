# Track A delivery and reconciliation

GitHub #37 is the coordinated scope. Baseline: main `aafcbe1` (merged #33). No original issue is closed here; acceptance remains with the product owner. Production recovery data, configuration and schema are out of scope.

| Batch | Issues | Baseline finding / delivery |
| --- | --- | --- |
| Daily experience | #35 | Home duplicates Tools; five ordered daily actions and flat supplemental destinations in this PR. Shared Settings/Account moved to footer after owner approval. |
| Appearance / feedback | #36, #27 | Existing accent color belongs to recovery state; device-local background/font preferences absent. Review candidate adds local appearance and Home feedback/fallback; see APPEARANCE-FEEDBACK-QA.md. |
| Recovery flow | #25, #26 | Settings can change date/time without confirmation, already retains history. No milestones. |
| Portability | #24 | No complete JSON download. Unknown/legacy recovery fields must survive export; auth/key stores excluded. |
| Offline | #23 | Manifest/icons exist; no offline service worker. Keep separate from export because updates/auth need independent review. |
| Local privacy | #28 | No PIN. Owner explicitly deferred PIN entirely. |
| Step 10 | #16, #6 | Daily summary, autosave, history and legacy answers exist. Owner explicitly skipped final Hebrew prompts for now; do not invent them. Keep both issues open pending content/acceptance. |

The stale roadmap entries for #30/#31/#32 are implemented in merged PR #33. Live first-backup/failure/independent-browser coverage remains #34; release/security issues #17–#19 and physical Android #21 are separate gates.

## Daily experience candidate

Before: Home offered planner, gratitude, meditation, Step 10 and a resources category; Tools repeated these and journal. After: Home offers **רק להיום → תכנון יומי → הכרת תודה → ככה זה עכשיו → חשבון נפש יומי / צעד 10**. The reading opens the exact NA Israel URL in a separate tab with `noopener noreferrer`; Clean Time state/navigation remain available in the original tab. Footer has Today, Recovery Tools, About and shared Settings/Account. Tools has meditation/bookmarks plus direct safe resource links, excludes the Home daily-reading duplicate, and retains a separate resource-edit action. Saved custom/legacy links are preserved; unsafe links remain visible but cannot open.

Product owner approved moving shared Settings/Account access to the footer; the top gear is removed for both guest and registered users. No data migration or auth/encryption change.

Synthetic Chromium: **649 checks**, zero failed suites. Navigation coverage adds 46 checks for ordered actions, direct destinations, Back/Forward, RTL/no overflow at 320/360/390/1280px in both themes, reload and byte-preserved recovery fixtures. Existing upgrade and encryption suites remain green. JavaScript syntax and diff whitespace pass.

Visual walkthrough: ignored `.playwright-mcp/track-a/{before,after}-{home,tools}.png`, 360×800, synthetic guest. Home's fifth action is visible; the footer remains separate. Browser history checks model installed-app Back, but physical Android/PWA acceptance remains #21. Real external reading return/mobile tab behavior and real staging Auth/backup lifecycle are not implied by mocked checks.
