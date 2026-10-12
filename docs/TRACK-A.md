# Track A delivery and reconciliation

GitHub #37 is the coordinated scope. Baseline: main `aafcbe1` (merged #33). No original issue is closed here; acceptance remains with the product owner. Production recovery data, configuration and schema are out of scope.

| Batch | Issues | Baseline finding / delivery |
| --- | --- | --- |
| Daily experience | #35 | Home duplicates Tools; five ordered daily actions and flat supplemental destinations in this PR. Shared Settings/Account moved to footer after owner approval. |
| Appearance / feedback | #36, #27 | Existing accent color belongs to recovery state; device-local background/font preferences absent. Review candidate adds local appearance and About feedback/fallback; see APPEARANCE-FEEDBACK-QA.md. |
| Recovery flow | #25, #26 | Settings can change date/time without confirmation, already retains history. Review candidate adds confirmation/history retention and small calendar milestone badges; see RECOVERY-FLOW-QA.md. |
| Portability | #24 | Review candidate exports complete legacy/unknown recovery fields while excluding auth/key stores; see EXPORT-QA.md. |
| Offline | #23 | Review candidate adds a versioned static-only offline shell with safe waiting updates; see OFFLINE-QA.md. |
| Local privacy | #28 | No PIN. Owner explicitly deferred PIN entirely. |
| Step 10 | #16, #6 | Daily summary, autosave, history and legacy answers exist. Owner explicitly skipped final Hebrew prompts for now; do not invent them. Keep both issues open pending content/acceptance. |

The stale roadmap entries for #30/#31/#32 are implemented in merged PR #33. Live first-backup/failure/independent-browser coverage remains #34; release/security issues #17–#19 and physical Android #21 are separate gates.

## Daily experience candidate

Before: Home offered planner, gratitude, meditation, Step 10 and a resources category; Tools repeated these and journal. After: Home offers **רק להיום → ככה זה עכשיו (יומן) → הכרת תודה → תכנית רק להיום → חשבון נפש יומי / צעד 10**. The reading opens the exact NA Israel URL in a separate tab with `noopener noreferrer`; Clean Time state/navigation remain available in the original tab. Footer has Today, Recovery Tools, About and shared Settings/Account. Tools has meditation/bookmarks plus direct safe resource links, excludes the Home daily-reading duplicate, and retains a separate resource-edit action. Saved custom/legacy links are preserved; unsafe links remain visible but cannot open.

Product owner approved moving shared Settings/Account access to the footer; the top gear is removed for both guest and registered users. No data migration or auth/encryption change.

Synthetic Chromium: **649 checks**, zero failed suites. Navigation coverage adds 46 checks for ordered actions, direct destinations, Back/Forward, RTL/no overflow at 320/360/390/1280px in both themes, reload and byte-preserved recovery fixtures. Existing upgrade and encryption suites remain green. JavaScript syntax and diff whitespace pass.

Visual walkthrough: ignored `.playwright-mcp/track-a/{before,after}-{home,tools}.png`, 360×800, synthetic guest. Home's fifth action is visible; the footer remains separate. Browser history checks model installed-app Back, but physical Android/PWA acceptance remains #21. Real external reading return/mobile tab behavior and real staging Auth/backup lifecycle are not implied by mocked checks.

## Review sequence

PRs are deliberately stacked: #39 (main) → #40 → #42 → #43 → #44. Review each against its immediate predecessor. No merge is authorized. After an approved parent merge, retarget/rebase the next PR onto actual main and reverify its new exact head/Preview before considering the next merge. Draft implementation does not close the original issues or complete release/security/physical-device gates.

PIN #28 is entirely deferred by the owner; #16 and #6 remain open because final Step 10 questions are skipped for now. Approved footer Settings/Account placement is implemented. Curated palette/fonts remain editable review choices, while preference sync is excluded as scoped.

Owner Preview refinement (2026-10-12): Home heading is **התחברות**, centered above the action list, with the labels/order above. This supersedes the original #35 ordering; all other screens and footer destinations are retained. The refinement is a separate commit in cumulative review PR #44.

Owner Preview refinement (2026-10-12): the Feedback entry moves from Home into About. Feedback returns to About, including for fresh visitors before setup. The original milestone opt-in text display (#26, delivery PR #42) is refined by the badge instruction below.

Owner milestone refinement (2026-10-12): a small key-tag style image inspired by the supplied reference appears at Home's upper left once a milestone is reached. It shows the latest period automatically; Settings can hide it and preserves existing explicit hide choices. The prior off-by-default text display is superseded. All original calendar thresholds, recovery history and sync/encryption contracts remain.

The key-tag badge refinement is isolated on `codex/track-a-milestone-badges`, stacked after #44. Initial focused badge/recovery/navigation verification: 52 + 29 + 47 = 128 synthetic checks, zero failed suites. Full regression and exact-head Preview identity will be recorded in its PR.
