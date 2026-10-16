# Trusted Chrome close/reopen (#51)

The current design already persists the account-scoped data-encryption key (DEK)
and public wrapper in `cleantime-he-crypto`. The recovery key is not persisted.
`clearEncryption()` clears in-memory handles on authentication changes, while
`loadMaterial()` reimports the account's persisted key and checks the wrapper.
Explicit sign-out removes device data/auth/key material intentionally.

`tests/trusted-device-qa.js` closes the actual Chromium process and relaunches an
ephemeral persistent profile, with synthetic resumed Auth and an encrypted remote
row. It then tests missing-key reopen, incorrect/correct recovery, no cloud rewrite
and sign-out. No real SMTP, session expiry/refresh, mobile Chrome or physical-device
claim follows from this mock. The temporary profile is removed after the test.

The full-reopen report is not reproduced by changing only the browser process.
Do not introduce recovery-key plaintext storage or remove wrapper/account checks
to mask it. Browser site-data deletion, private-mode lifetime, different Chrome
profiles/origins and real Auth continuation remain reproduction candidates.

## Threat model

Automatic trusted-device unlock protects the cloud copy against database-only
exposure, not a compromised/unlocked device or same-origin malicious JavaScript.
The local working recovery state and usable DEK were already readable in this
release. Keeping that existing persistence does not add a new cloud decryption
path or change v1 envelopes/KDF/AAD. A cleared/missing key still requires recovery;
the app cannot safely recover it from authentication alone. Optional PIN is out of
scope and must not be confused with backup encryption.

Release recommendation: keep #51 open until the owner's Chrome reproduction and
real Auth continuation can be checked on an isolated service/device. Regression
evidence alone is not a demonstrated fix for the reported prompt.
