# New-version notice (CT2 migration)

Home shows one compact, collapsed announcement to people who have recovery data (`hasData(S)`). It sits **after** the primary daily actions (and the reflection line on desktop), so it never pushes the recovery clock or the daily actions down. Collapsed it shows a short title (זמן נקי מתחדש) and one sentence (a new version is available) with an expand control. Expanded it explains the transfer in one sentence, warns that the file is personal and unencrypted, and offers **Download backup file**, **Open the new version** (a plain link) and **Not now**. Expansion is per visit only and is never stored.

## Behavior

- The export button runs the same `exportRecovery(statusEl)` function as Settings → "Download all data as JSON": same file, same `clean-time-recovery` v1 format, same messages, same `storageError` refusal. `portableRecovery` and every storage/auth/sync/migration format are untouched. No new analytics event (the shared function already emits the existing `export_completed`).
- Registered users also see the existing wording that a cloud backup not yet unlocked on this device is not included. The copy deliberately makes **no promise about how registered users sign in to the new version**: CT2 keeps the Supabase identity but uses a different sign-in mechanism, and account-migration instructions belong in CT2.
- Nothing in the notice deletes or changes data and it never asks users to clear browser storage.
- Dismissal ("Not now") is device-local display state under `localStorage["cleantime-migration-notice"]` (`{"dismissed":true}`). It is not part of `cleantime-he-v1`, is never synced and never appears in the export. Settings export stays available.
- Strings are Hebrew-source with English and Russian entries in `assets/messages.js`. The Russian text is a draft that needs native review.

## Release gate (important)

The CT2 importer (CT2 PR #83) and the same-origin recovery for returning CT1 guests are not finished, so no production user may be pointed at the new version yet.

- `NEW_VERSION_NOTICE_PUBLISHED` (top of the script in `index.html`) is `false`. While it is `false` the notice is shown only on non-production builds (Preview and local), so it can be reviewed, and stays hidden on production (`CleanTimeI18n.production`).
- `NEW_VERSION_URL` is the single destination constant. `https://dev2.clean-time.app` is a **UAT placeholder, not the final address**.
- To publish: confirm readiness and the final URL on CT2 issue #81, set the URL, flip `NEW_VERSION_NOTICE_PUBLISHED` to `true`, run `node scripts/security-headers.js --write`, bump `APP_VERSION` and the service-worker `VERSION`, and obtain explicit owner approval before merging to `main`.

## QA

`tests/migration-notice-qa.js` (synthetic data only, no dismissal workaround): collapsed layout in Hebrew, English and Russian at 320, 360 and 1280px (notice after the daily actions, clock and first daily action on the first screen, compact height, bottom-navigation clearance, no horizontal overflow, clock/actions not moved by the notice); expansion by keyboard; link href/attributes; export from the notice equal to the Settings export; dismissal, reload and unchanged Settings export; no recovery-state or storage writes from showing/exporting; storage-error refusal; registered note; production gate. Existing Home layout suites pass unchanged with the notice visible. Screenshots: `docs/ct2-notice-visuals/`.
