# PR #11: active registered-user compatibility pass

Date: 2026-10-05. Synthetic accounts and recovery data only. No production Supabase operations, real email, merge or deployment.

## Current production baseline

Read only the anonymous public HTML from `https://clean-time.app`. It reports app version `2026.10.05.5` and byte-matches `origin/main:index.html` in the local snapshot at `c27a6c1a933cb5be48f126a6074921d05fb7b81b`.

HTML SHA-256: `9140e387538aea6aa6a1c32cceac198c6b0d166b2b754144e64544a91a0d64af`.

Compared production with the PR source: persistent keys, DEFAULT definitions, normalization/load functions, and upload serialization are unchanged. This verifies the public source model, not any real user's data/session or a production account test.

## Regression evidence

`tests/upgrade-qa.js` adds **51 checks** using a pre-existing synthetic session envelope, matching sync `uid`/email, `dirty=false`, and a populated local/cloud state. The fixture includes name, date/time, recovery type, color, gratitude history, plans/history, journal, inventory, bookmarks, links/linksV, timestamp, device-only mode and an unknown retained field. Cloud state excludes `mode`, matching the current serialization.

The SDK is mocked. Context-level cloud state survives page refresh/reopen; local fixtures seed only once and cannot mask data clearing by re-seeding. Storage writes/removals, cloud selects/upserts/deletes, email calls, sign-out calls and confirmations are observed. External requests are blocked.

Verified:

- Direct Today entry with no onboarding, account flow, conflict modal, email, unsolicited sign-out, deletion or local clearing.
- Identical account/timestamps: byte-for-byte original recovery localStorage and unchanged cloud JSON, with zero uploads.
- Existing keys/session remain readable; My Account recognizes identity, displays authenticated email (even with stale metadata email), and reports sync normally.
- A normal time-preference edit preserves all other fields/history and syncs through the same `user_data` envelope and account scope.
- Refresh and closing/reopening a page in the same browser context retain session/data without extra uploads.
- Sign-out is explicit: cancel retains everything; confirmation clears device/session only and preserves cloud.
- Remote newer pulls normally; local newer uploads the complete newer state once; neither prompts a same-account conflict.
- Sparse valid legacy state retains profile/history, IDs, timestamps and unknown fields. Existing defaults/links migration is additive and idempotent, without cloud upload or timestamp bump.

The remote-newer test first failed on an existing bookkeeping bug: after `applyRemote()`, `synced` still held the older local timestamp, incorrectly marking a successful pull dirty. The fix records the pulled timestamp as synced. It changes no persistence shape, winner selection, recovery data, upload envelope or conflict policy.

## First-load writes

| Starting condition | Automatic behavior |
| --- | --- |
| Same account, identical state/timestamps | Read cloud; write normal sync metadata (`lastSync`, email, dirty). No recovery/auth storage write from app code and no cloud upload. |
| Cloud newer | Replace working local recovery copy with the newer cloud state; write sync metadata. No cloud upload. |
| Local newer, even if metadata says `dirty=false` | Existing timestamp-based sync uploads the whole local record; write sync metadata. |
| Missing cloud row and populated local state | Existing sync code can upload local data as the initial cloud record. |
| Legacy state without `linksV` | Existing local normalization writes defaults and migrated links; preserves timestamp. With equal timestamps it does not upload cloud. |

Thus first load is **not universally read-only**. None of these writes is triggered by `APP_VERSION` or the new account UI. The authenticated Supabase SDK may separately refresh session tokens, as before; token refresh is outside this mock's evidence.

## Validation and limits

All seven suites passed: upgrade **51**, account **26**, local **83**, edge **12**, sync **8**, bookmarks **43**, bookmarks-sync **11** — **234 checks total**. Inline/test JavaScript syntax and `git diff --check` passed. No persistent schema or new migration was introduced.

No upgrade-specific data-loss or forced-authentication behavior was observed for these fixtures. Live token renewal/expiry, SMTP, production RLS/network availability and physical Android behavior remain untested. The real active account was not inspected or exercised. Existing whole-record newer-timestamp sync can replace an older same-account copy and does not merge simultaneous edits; that behavior is unchanged. Existing malformed-storage protection and first-sign-in account conflicts remain covered by the other suites; this is not a complete offline/conflict matrix. Encryption stays in #9.
