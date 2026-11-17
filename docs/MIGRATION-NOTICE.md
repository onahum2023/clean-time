# New-version notice (CT2 migration)

Home shows one short, dismissible card to people who have recovery data (`hasData(S)`): Clean Time is moving to a new version, recovery history can be transferred, download the JSON and the new version can import it, registered users keep their account, guests can continue without registering, and the file is unencrypted and personal. Two actions: **Download all data as JSON** and **Open the new version** (a plain link), plus a quiet "Not now".

## Behavior

- The export button runs the same `exportRecovery(statusEl)` function as Settings → "Download all data as JSON": same file, same `clean-time-recovery` v1 format, same messages, same `storageError` refusal. Nothing about `portableRecovery` changed. Unreadable saved data hides the notice (no recovery data is shown), and a forced click still refuses to produce a misleading file.
- Registered users see one extra line: the file contains what is available on this device and a cloud backup not yet unlocked here is not included (the existing wording).
- Nothing in the notice deletes or changes data and it never asks users to clear browser storage.
- Dismissal is device-local display state under `localStorage["cleantime-migration-notice"]` (`{"dismissed":true}`). It is not part of `cleantime-he-v1`, is never synced and never appears in the export. Dismissing does not hide the Settings export.
- The destination is the single constant `NEW_VERSION_URL` at the top of the script in `index.html`. A plain `<a href rel="noopener noreferrer" target="_blank">` needs no CSP change.
- Strings are Hebrew-source with English and Russian entries in `assets/messages.js`. The Russian text is a draft that needs native review.

## Before publishing

The owner must confirm the final value of `NEW_VERSION_URL` (it defaults to the CT2 UAT address `https://dev2.clean-time.app`) and approve the Hebrew copy. Merging to `main` publishes to production for every user.

## QA

`tests/migration-notice-qa.js` (synthetic data only): visibility with/without data, Hebrew/English/Russian at 360px and desktop with no overflow, link href/attributes, export from the notice equal to the Settings export, dismissal persistence, no recovery-state or storage writes from showing/exporting/dismissing, storage-error refusal and the registered note.
