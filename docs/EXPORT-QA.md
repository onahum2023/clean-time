# Portable recovery JSON (#24)

Settings offers a download for guests and registered users. The versioned UTF-8 JSON wrapper contains the full current normalized recovery state: profile, display preferences, all journal/plans/gratitude/inventory/bookmarks/resource history and unknown/legacy recovery fields. Hidden Step 10 answers remain intact. Export flushes any pending journal edit first and does not rewrite the recovery state merely for a download.

Only the recovery object is serialized; auth, crypto, sync and appearance stores are not enumerated. Reserved auth/key property names are removed recursively as defense against legacy imported technical fields (`access_token`, `refresh_token`, `id_token`, `authorization`, `recoveryKey`, `dataKey`, `keyMaterial`, `pendingKey`, `rawDek`, `dek`, `wrappedKey`, `wrapIv`, `kdf`, `auth`, `session`, `crypto`). The original recovery data is untouched by that export-only filter.

The UI states plainly that the file is unencrypted and should be kept private. It includes only content already available on this device; a locked/unopened cloud backup is not promised as part of the download. No importer or remote backup fetch is added. Malformed original storage prevents a misleading defaults-only export. Download failures are visible; mobile users can retry in the device browser.

Focused synthetic Chromium: export **16** + registered upgrade **57** = **73 checks**, no failures. Checks read actual downloaded files at 320/390/1280px, compare every history/unknown field, validate UTF-8/legacy answers and private-store exclusion, verify guest/registered no-write/no-upload behavior, malformed storage and download failure. Full regression and exact deployed Preview evidence are reported in the PR. Real mobile file handling remains a physical-device acceptance check.

Refs #24/#37. No production, sync/encryption-format change, merge or issue closure.
