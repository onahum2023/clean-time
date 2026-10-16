# Multiple recovery timers (#52)

First-use guest and account-creation forms optionally add a second timer with its
own category, custom label and start date. The additional fields stay disabled
until selected. A separate unchecked checkbox opts into showing it on Home.
Duplicate category/label identities and future dates reject before persistence.
Account-link retries reconcile only the setup-created secondary ID: opting out
removes that timer, preserves unrelated records and revalidates any new choice.
Local deletion/sign-out clears both setup drafts, generated IDs and Home opt-in
so a later setup cannot resurrect deleted timer values.

Home offers one-at-a-time switching, a primary timer with compact secondary cards,
and equal cards. The visibility/layout preference is device-local under
`cleantime-timer-display`; it never changes primary identity, recovery dates,
timestamps or encrypted backup content. Hiding secondary timers leaves them
available in Settings. Existing users start with a single primary display and
can opt in without editing their timer records.

`timersVersion:1`, `timers[]` and `primaryTimerId` are additive fields in the same
local recovery object/encrypted row. Each timer has a stable ID, category code,
optional custom label, date and time. Unknown fields and shared histories remain
intact. IDs/categories are language-independent. No database schema is changed.

Only genuinely unversioned records enter legacy migration. A version marker
without its timer array, or an unsupported version, rejects before migration.

The array is authoritative. Primary date/time/display label are projected into
legacy `date/time/from`, so existing startup, Home, Settings and hasData work.
`timerProjection` records that projection. If an older client retains unknown
fields but edits the scalars, normalization updates only the primary timer from
that detected change. Other timers/unknown fields survive. Whole-record timestamp
conflict selection remains: this is not per-timer concurrent merge. Truly old
clients that discard unknown fields are not compatible writers; preserve the
encrypted-backup guard and require current clients during rollout.

Legacy single-timer state gets deterministic `legacy-primary` in memory. Untouched
legacy bytes/timestamps remain unchanged until a saved action or necessary remote
apply persists the additive model. Repeat normalization is idempotent. Empty-state
onboarding can establish a primary. Unsupported/malformed timer schema throws
before saved raw data can be overwritten. Existing links-version migration keeps
its previous behavior. Failed timer writes restore prior in-memory state and leave
saved data intact. Explicit primary changes/removal update the scalar projection.
The last timer cannot be removed; dates can be changed with confirmation.

Plans, gratitude, journal, Step 10 and bookmarks remain shared, not attributed or
split retrospectively. Secondary counters/milestones sit in a collapsed Home
section. Category duplicates require distinct display labels; changing a date
affects only its selected timer. The main Settings date edits the primary.

## Backup/export compatibility

The v1 envelope, KDF, account/timestamp AAD and wrapper are unchanged. Old encrypted
payloads normalize after authenticated decryption; new payloads encrypt all timer
fields. Full JSON export includes the complete normalized model, unknown fields
and old histories. Legacy exports remain interpretable through normalization and
the existing old-origin handoff. There was no general downloaded-JSON importer on
main; this PR does not add one. Old-origin safeguards remain intact.

## Validation / release gates

`timers-qa.js` covers migration/idempotence, unknown history, older-client scalar
edits, malformed versions/IDs/dates, add/edit/primary/confirmed removal/reload,
same-category custom labels, storage failure, mobile RTL and legacy encrypted
round-trip compatibility. Existing encryption and upgrade suites remain required;
their exact-state expectations now include only the documented additive fields
where migration is persisted/exported. Physical-device and live service acceptance
remain #21/#34. Nora's independent migration review is a merge prerequisite.

Independent-review corrections: remote plaintext and decrypted states are fully
normalized before conflict selection or upload, including when local timestamps
are newer. Unsupported versions/duplicate IDs never become overwrite candidates.
Main Settings binds to the displayed primary, account, crypto generation and
state timestamp; a cloud pull during confirmation rejects the stale edit. Added
13 encryption/integration checks (138 total) plus a real main-normalizer and
serializer round trip in the timer suite (23 total). Focused recovery/upgrade
checks remain 29 + 57. The cache/app version remains 2026.10.15.13 in this draft;
no production release has occurred.
