# Personal links / bookmarks — local review

2026-10-05 · version `2026.10.05.5`. Local and uncommitted. No commit, push, PR or deployment.

## Behavior

Tools → **הקישורים שלי** opens an initially empty, private flat list. Each bookmark has a required title and URL and an optional note. Users can add, explicitly save, cancel, edit, delete with confirmation, and open a link. HTTPS links open a separate tab with `noopener noreferrer`; telephone links use the device's normal telephone handler. No folders, tags, sharing, recommendations or discovery were added. Existing recovery resources remain separate and unchanged as data.

The shared warm page heading, bookmark line icon, form fields, list style and RTL navigation are reused. Titles, URLs and notes wrap at narrow widths; notes preserve line breaks and all content is rendered as text. Form limits are 200 characters for titles, 2048 for URLs and 2000 for notes. Drafts are only saved on submit. Storage failures retain the draft, restore the in-memory list and show the existing storage warning.

## Persistence and safe links

- Additive `bookmarks: []` default. Existing data without bookmarks receives an empty list; existing resource links are not moved or seeded into it. Entries use `{id, title, url, note?}` and the existing `uid()` helper.
- Changes go through `save()`, so guests use existing localStorage and signed-in users use the existing account-scoped `user_data.data` JSON. No database schema or new provider is needed.
- Bookmarks count as user data during first-sign-in conflict handling. `applyRemote()` refreshes the visible list; reset/sign-out clears bookmarks and the form with the rest of local state. Conflict resolution remains the existing whole-record, newer-timestamp model.
- Malformed bookmark arrays/entries trigger the existing preservation warning instead of overwriting the original saved state.
- `safeLinkUrl()` implements the documented `https:`/`tel:` allowlist. It requires a valid HTTPS hostname, rejects credentials, control characters, spaces, backslashes and ambiguous scheme spelling, and accepts numeric telephone URLs with optional plus/punctuation. There is no remote URL lookup.
- Validation runs both before bookmark saving and before rendering clickable URLs, including data loaded from storage/cloud/import. Unsafe saved entries remain visible and editable but cannot open.
- Existing resource links now use the same validator for URL edits and safe opening. Their editor uses a URL keyboard on a text field so valid `tel:` links are accepted. Unsafe edits do not persist.
- “Private” follows the current app model: guest data remains local; signed-in data is in the existing personal backup. Cloud JSON is not end-to-end encrypted, as already disclosed in About and README.

## Files changed in this pass

- `index.html`: bookmark screen, Tools entry, CRUD, additive normalization, sync/reset integration, shared URL validator and version bump.
- `tests/bookmarks-qa.js`: isolated synthetic guest, safety, storage and responsive checks.
- `tests/bookmarks-sync-qa.js`: isolated mocked account sync checks.
- `README.md`, `CLAUDE.md`, `docs/BACKLOG.md`: feature and persistence documentation; safe-links work marked as local implementation.
- `docs/BOOKMARKS-REVIEW.md`: this report.

Earlier local changes remain intact. No separate assets or new dependencies were added.

## Verification

**157 browser assertions passed:** existing suites 103; bookmark guest/safety suite 43; mocked bookmark sync suite 11. The existing visual runner also passed 48 page/width/theme checks.

Bookmark checks include guest reload, add/edit/cancel/delete/open, optional note removal, title/note injection rendered literally, malformed/unsafe schemes, credentials and malformed URL blocking, telephone URLs, resource-link validation, unsafe imported links, malformed storage preservation, write failure and successful retry, and no JavaScript errors.

Mocked account checks include bookmark-only remote conflict recognition, note download, offline queue/reconnect upload, account identity and local-only field exclusion, remote list refresh, synced edit with stable ID, synced deletion, and sign-out preserving the mock cloud copy.

Responsive checks passed for populated lists with long URLs/notes and open forms at **320, 360, 390 and 1280px**, in light and dark modes, with RTL and no horizontal overflow. Screenshots inspected: list at 360px in both modes and edit form at 320px. Guest app requests remained local; the link-open test fulfilled its destination locally. No real email, login, cloud write or external destination request was made.

`git diff --check` passed. Live-account and physical-device behavior remain untested in this local pass.

Evidence is retained in ignored `.playwright-mcp/bookmarks-review/`.
