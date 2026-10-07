# Isolated staging for PR #33

Organization: `nucielo` (`rnakxdkxzdzohpcfoprv`), Pro. The user selected the existing organization after the Free-plan check. Supabase quoted/confirmed additional project compute of **$10/month**. Project: `clean-time-staging`, `uffvbfmfsesdhjzzjiyu`, Frankfurt (`eu-central-1`). Production remains `aefhjgmiwgajdhgyhelm`; no production data/configuration is copied or modified.

The repository previously documented the `user_data` columns/ownership contract without a bootstrap SQL definition. [user-data.sql](user-data.sql) implements that contract for this empty staging project: UUID primary key, whole-state JSONB, timestamptz, authenticated own-row SELECT/INSERT/UPDATE, with both update predicates. No physical DELETE grant is added. The unchanged [009 guard](../migrations/009-encrypted-sync-guard.sql) is applied separately. Initial verification found RLS enabled, three ownership policies, one encryption guard, zero rows and no security advisor findings. No Auth users or recovery rows were copied from production.

## Preview configuration

`vercel.json` builds the same static app and local assets into ignored `dist/` through `scripts/build-vercel.js`. Only Preview requires:

- `CLEAN_TIME_SUPABASE_URL`: the exact staging project URL.
- `CLEAN_TIME_SUPABASE_PUBLISHABLE_KEY`: staging's modern public/publishable client key. Never a service-role/secret key.

Both variables are scoped only to Preview branch `codex/welcome-backup-date` in `nu-cielo/clean-time`. Production variables/project settings are untouched. A Production build retains the existing public URL/key values even if Preview variables are present. The generated `assets/backend-config.js` contains only public configuration. A Preview build rejects missing/production/wrong-project config and secret-like keys. Preview runtime refuses account access if the config asset is missing/incorrect; local guest tools remain usable. Local source review retains the app's previous defaults and synthetic QA must continue to block/mock all external calls.

Staging Auth Site URL and exact redirect allowlist use `https://clean-time-git-codex-welcome-backup-date-nu-cielo.vercel.app`. Additional immutable deployment origins are added only as required for this PR's QA. No production origin is allowlisted. Default staging SMTP remains in place; no credentials were copied and no additional paid sender was configured. The user designated a controlled mailbox for synthetic staging Auth QA; it is excluded from public reports.

## QA boundary

Before creating accounts/writing synthetic recovery data, verify the deployed Preview config references `uffvbfmfsesdhjzzjiyu`, observe the real request target, and explicitly block `aefhjgmiwgajdhgyhelm` in the test browser. Use disposable contexts, no storage-state exports or secret-bearing traces, and keep recovery keys/magic-link tokens out of logs/screenshots. Live results are recorded in PR #33 after execution; browser mocks do not establish live backend behavior. No merge or production promotion.


## Verified deployment and current live status

Staging-configured Ready Preview: `https://clean-time-fjodwugs0-nu-cielo.vercel.app`, deployment `dpl_CAbekz923NN7cxzvztsbWBY3Rxkr`, implementation commit `d6207cddb4c470c062ca6b073ef18a5811691ebd`. It was rebuilt with the corrected branch-scoped public config; the initial rejected build deployed no app. Local and deployed synthetic regression: **604 passing checks** each, including 25 build/runtime isolation checks.

The live browser verified the deployed staging ref/public config **before** registration, then observed a real staging `/auth/v1/otp` request and unused-email rejection. Guest setup/use/reload and preservation through the real registration request passed. Staging metadata confirms exactly one designated synthetic Auth identity, zero identities for the unused email and zero recovery rows. The first registration email request succeeded. Remaining live verification → key setup → defer/resume → encrypted backup/failure-retry → active-account/second-browser restore is pending access to the designated mailbox. The connected Gmail profile does not match it and targeted searches found no staging verification message. No verification link or token is requested in chat. The private-input runner waits without echoing credentials; browser-manual verification is also supported. The registration request was not repeated when the runner was resumed.

`verify-boundaries.sql` passed against the real staging PostgreSQL database: legacy edits/migration and unchanged-wrapper encrypted updates permitted; plaintext/mixed-field downgrade and wrapper replacement rejected; role/claim RLS checks hide peer rows, reject cross-owner updates/inserts/reassignment and exclude physical DELETE. All synthetic fixtures were rolled back, with zero recovery rows afterward. These real SQL checks are separate from pending real Auth-session/PostgREST integration checks. Security advisor: no findings. No production SQL, Auth/configuration, rows, users, SMTP or deployment were changed.

Live runner: `tests/live/staging.js`, deliberately outside the synthetic suite discovery. It requires the exact PR branch origin and a designated mailbox, blocks production, logs only classifications, and consumes verification URLs through non-echoing private input (never chat/logs). Use a terminal with echo disabled for private input. `QA_REUSE_SIGNUP_EMAIL=1` resumes with an existing unconsumed registration email; `QA_MANUAL_EMAIL=1` opens the QA browser for user verification. Live crypto/database checks must not be reported passed until the runner reaches completion.
