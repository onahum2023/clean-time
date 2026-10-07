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
