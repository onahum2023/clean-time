# Registered-user encrypted sync (#9)

Refreshed onto current main `88358f2bc40b93d881fcaa416258109328436ae8` (released UAT fixes and live unused-email verification note). Pending review. No merge, deployment, database changes, real-user access or emails performed.

## Format and key lifecycle

`public.user_data(user_id, data, updated_at)` stays one row per user. `data` becomes an exact envelope with `v:1`, `alg:"A256GCM"`, `iv`, `ciphertext`, `wrappedKey`, `wrapIv`, and `kdf:{name:"HKDF",hash:"SHA-256",salt,info:"clean-time/v1/recovery-kek/A256GCM"}`. Binary fields are standard Base64; ciphertext includes the 128-bit authentication tag. All state, including unknown retained fields, is encrypted; only `mode` stays device-only. `updated_at` stays outside for ordering and is authenticated as canonical ISO time.

Web Crypto generates the AES-256-GCM DEK. A separate 256-bit random recovery key is displayed in grouped hexadecimal. HKDF-SHA-256 derives an AES-256 KEK with a fresh 128-bit salt and explicit domain separation; AES-GCM encrypts the raw DEK with a fresh 96-bit wrap IV. Each state encryption independently generates a fresh random 96-bit IV. Randomness comes exclusively from Web Crypto. AAD binds wrapping to the account and the payload to account + timestamp. Unsupported versions/parameters, extra fields, invalid lengths and failed authentication fail closed.

HKDF is natively available in browser Web Crypto without a new crypto library. The recovery key is already uniformly random with 256 bits of entropy; it is not a password/passphrase and there is no human-chosen input path. Password stretching does not add useful resistance to exhaustive search of that key space. HKDF derives a separate-purpose key with `info = UTF8(JSON.stringify(["clean-time/v1/recovery-kek/A256GCM", userId]))`, binding the application, envelope version, algorithm, key purpose and account. Existing AES-GCM account/timestamp AAD and 128-bit tags are unchanged. See [RFC 5869](https://www.rfc-editor.org/rfc/rfc5869) and the [Web Crypto specification](https://www.w3.org/TR/WebCryptoAPI/).

Envelope version remains `v:1`; KDF metadata replaces `iterations` with the exact `info` label. Validation rejects unknown purposes/hashes, iterations/extra fields, and the earlier unreleased PBKDF2 profile. Per the security review, no production encrypted rows exist. The PR's synthetic state fixtures remain unchanged; their envelopes are generated at runtime using HKDF. No production migration or permissive PBKDF2 fallback is added. Outgoing envelopes are validated too, so a stale PBKDF2 QA cache cannot upload an unsupported envelope. Previously persisted local QA envelopes must be regenerated; never reset the recovery-state working copy for this purpose. The SQL guard is unchanged because it validates/fixes the generic envelope/wrapper, not a particular KDF profile.

The account-scoped `cleantime-he-crypto` device cache holds the usable raw DEK + public wrapping metadata and a confirmed flag. The recovery key/KEK is never stored in localStorage, URLs, Supabase, auth metadata, logs, docs or fixtures. Setup/entry fields clear after use. Runtime test keys are generated and kept in memory; screenshots never capture them. Sign-out clears the cache and includes a recovery-key reminder. Cached-key devices work without the recovery key; new devices need it after their normal email magic link. No password authentication is added.

## Migration and failure semantics

- Existing registered users with a recovery date continue directly into Today. Pending legacy migration stays accessible through Settings → My Account; no forced onboarding/account creation. New sign-ins needing setup/unlock open My Account.
- Legacy cloud state is read with existing normalization, newest-timestamp rules and first-sign-in local/cloud selection. Neither side is uploaded until a key is generated and explicitly acknowledged as saved. Guest state never migrates.
- Persist the usable key before writing cloud state. If local key persistence fails, no cloud write occurs. Legacy local recovery collections/unknown fields survive.
- Migration advances `updatedAt` beyond the selected state/read-row timestamp, encrypts the complete authoritative state, and conditionally updates the exact row timestamp last read. An absent row uses INSERT, so concurrent setup hits the primary-key constraint rather than replacing a winner's DEK.
- Success requires a returned affected row, a read-back of the envelope and authenticated decryption equal to the snapshot. JSONB ordering and `Z`/`+00:00` timestamp formatting are handled. Only then is backup active/confirmed. Write failure preserves legacy cloud content and local recovery content. A write-success/read-back-failure retains the key and content for retry; it does not falsely claim migration is complete.
- Conflicting concurrent writes stop safely and retry on the existing triggers or retry button. If another device established a different wrapper, recovery entry for that winning envelope is required. No automatic key replacement.
- New-device decrypt happens before conflict selection or applyRemote. Wrong/missing keys cannot replace local/cloud content. A confirmed cache refuses legacy plaintext downgrade before applying it.
- Normal offline edits/focus/visibility/online/reopen behavior remains. The sync SDK sees only ciphertext. CAS adds protection against stale overwrites; retry may require explicit action after a transient error.
- Cloud deletion preserves existing logical deletion semantics: write and verify an encrypted empty-state tombstone, then reset local data. Other devices clear on their next pull. Failure keeps local content. This is not physical row or Auth-account deletion; it requires an unlocked device. Lost-key reset and rotation remain future work.

## Required additive SQL (not applied)

Apply [009-encrypted-sync-guard.sql](migrations/009-encrypted-sync-guard.sql) before the app release. No new columns/tables, row rewrite or auth/RLS changes. The UPDATE trigger allows legacy→legacy and legacy→encrypted writes, rejects encrypted→plaintext writes and mixed envelope/plaintext fields, and freezes the established encryption wrapper. It protects against old tabs/apps upserting readable state or plaintext deletion after migration. Existing legacy users/sessions keep working until their row migrates. Old clients must refresh after migration to sync again.

The local mock models this guard; it is not evidence of PostgreSQL/RLS execution. Validate the exact SQL and conditional PostgREST writes in a disposable staging project with synthetic accounts before release. Rollback must retain an encryption-capable client and guard once any row migrates. Removing the guard or restoring a plaintext writer is unsafe. No destructive operation is required or executed here.

## Automated QA

Run a localhost server on port 8765, then `node tests/run-qa.js` from the repository root with Playwright available. External browser requests are blocked; Supabase/auth are mocked and use synthetic `.invalid` emails. All actual encryption uses browser Web Crypto, not a crypto mock.

| Suite | Checks |
| --- | ---: |
| account | 26 |
| local | 83 |
| edge | 12 |
| sync | 8 |
| bookmarks | 43 |
| bookmarks sync | 11 |
| upgrade compatibility | 55 |
| UAT | 43 |
| encryption/migration | 97 |
| **Total** | **378** |

Encryption coverage includes guest/no cloud; acknowledged first setup; complete round trip; absence of readable recovery fields/content, raw DEK and recovery key in uploads; missing/wrong/correct keys; trusted reload and sign-out; both timestamp directions; both explicit conflict choices; key-generation/key-persistence/migration/write/read-back/CAS/concurrent-setup failures and retry; deletion success/failure; 360px setup and unlock; random IV independence; modified ciphertext/account/timestamp/version/KDF/extra-field rejection; exact HKDF profile, domain/hash/salt tamper rejection and account-bound unwrap; revised privacy guarantee; key/account isolation; no logging or password APIs. Existing account/local/edge/bookmarks suites retain their original behaviors with ciphertext-aware expectations. Upgrade coverage retains strict direct-Today landing and explicit encrypted migration after acknowledgement. Combined coverage adds create/convert → setup, returning encrypted login with creation forbidden, unused-email rejection, Spam guidance, missing/future dates blocking OTP, setup/unlock history, encrypted Back/Forward and Journal editor, hidden Step 10 controls/legacy answer round trips and 320/360/508/1280px layout. Both plaintext conflict choices are tested through acknowledged migration.

## Remaining release checks and limits

1. Synthetic staging: apply/reapply guard SQL, exercise legacy→encrypted, old-client downgrade/mixed-envelope rejection, wrapper-change rejection, INSERT collision, conditional-update miss, JSONB read-back and own-row RLS from two identities. Confirm trigger errors do not expose content.
2. Physical Android at 360px: recovery-key readability/selection and saved-key acknowledgement, keyboard/scroll/accessibility, HKDF unlock latency, installed-app close/reopen, offline edit and reconnect.
3. Synthetic magic-link accounts: actual SMTP/session continuity, link opened in another browser/device, correct/wrong/missing recovery key, both conflict choices and encrypted deletion propagation. Confirm browser network payload and staging row contain only the envelope. Never inspect an active user's records for QA.
4. Before an authorized production release: confirm backup and guard installation; arrange active-user saved-key onboarding without exposing their content/key; verify migration only on a synthetic account. No automatic production rewrite or forced user sign-out.

Cloud-at-rest protection assumes authentic browser code and intact device storage. Local plaintext/DEK, XSS, a compromised browser or malicious future JS from the operator are outside this P0 protection. A database operator can still delete or replay old valid ciphertext; timestamps/AAD detect modification, not full rollback. Prior plaintext backups, database history/WAL and exports are not retroactively encrypted. The current CDN-loaded Supabase SDK also runs with same-origin script privileges. Recovery loss with no usable device/key makes encrypted content unrecoverable. Do not advertise broader zero-knowledge/device-compromise guarantees.


## KDF performance follow-up

Run `node tests/crypto-performance.js` against the localhost server. Generated keys remain inside the browser; output contains only platform, browser version, payload size and aggregate timings. PBKDF2 appears only in this comparison benchmark and the unsupported-profile rejection test, not application code.

Measured on local desktop Chromium 151.0.7922.34 (macOS), using Web Crypto and a 30,068-byte synthetic state after warm-up:

| Operation | Samples | Median | p95 |
| --- | ---: | ---: | ---: |
| HKDF derivation only | 100 | below 0.1ms timer resolution | below 0.1ms timer resolution |
| Previous PBKDF2 derivation (600,000 iterations) | 10 | 36.7ms | 37.1ms |
| Complete HKDF unlock, including imports, unwrap, authenticated payload decrypt and JSON parse | 50 | 2.5ms | 2.9ms |

These are desktop measurements, not Android measurements; concurrent QA/browser scheduling and coarse timer resolution limit precision. HKDF-SHA-256 for a 32-byte output performs one extract HMAC and one expand HMAC rather than a 600,000-iteration password-stretching loop. Android KEK derivation is expected to be millisecond-scale, with dispatch/import, payload size and JSON processing dominating full unlock; this is an estimate, not a device-specific bound. Physical Android timing remains a staging/manual check. Trusted-device normal sync still does not run a recovery-key KDF.
