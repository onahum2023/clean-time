# Archived staging — historical PR #33 evidence

> **Retired on 2026-10-12.** Supabase project `uffvbfmfsesdhjzzjiyu` was deleted.
> Its deployment URLs, public config, SQL and live runner are historical references,
> not an available test environment. Do not run the old setup or runner.
> Current guidance: [Track B isolation](../TRACK-B.md#preview-isolation-41) and
> [remaining release QA](../TRACK-B-RELEASE-QA.md). Current Preview builds are guest-only.

## Architecture and migration record

The former isolated project used an empty database; no production recovery rows
or Auth users were copied. [user-data.sql](user-data.sql) preserves the bootstrap
contract: UUID ownership key, whole-state JSONB, timestamptz and authenticated
own-row SELECT/INSERT/UPDATE policies with both update predicates. No physical
DELETE grant was added. The [009 encryption guard](../migrations/009-encrypted-sync-guard.sql)
was applied separately. These files preserve engineering evidence and require a
new review before any future isolated environment uses them.

The historical Preview-only public config selected this isolated project and
rejected production/wrong-project config and secret keys. That setup is superseded:
`scripts/build-vercel.js` now always emits disabled backend configuration for
Preview/development, regardless of obsolete branch variables. External Preview
variable cleanup remains [#41](https://github.com/onahum2023/clean-time/issues/41).

## Historical verified results

PR [#33](https://github.com/onahum2023/clean-time/pull/33), implementation commit
[`d6207cd`](https://github.com/onahum2023/clean-time/commit/d6207cddb4c470c062ca6b073ef18a5811691ebd):
**604 passing synthetic checks** locally and on the then-staging-configured Preview,
including 25 build/runtime isolation checks.

The browser verified the staging target before registration and observed real
staging Auth requests. Unused-email rejection, guest setup/use/reload and guest
preservation through registration passed. One synthetic Auth identity and zero
recovery rows were reported. Email verification, initial encrypted activation,
failure/retry and independent-browser restore were incomplete at that point;
synthetic checks do not establish those live results. Remaining coverage is
tracked in [#34](https://github.com/onahum2023/clean-time/issues/34) and #19.

[verify-boundaries.sql](verify-boundaries.sql) passed against the former staging
PostgreSQL database: legacy edits/migration and unchanged-wrapper encrypted
updates permitted; plaintext/mixed-field downgrade and wrapper replacement
rejected; RLS hid peer rows and rejected cross-owner updates/inserts/reassignment.
Physical DELETE was excluded. Fixtures were rolled back, with zero recovery rows
afterward, and the security advisor reported no findings. These SQL checks are
separate from incomplete Auth-session/PostgREST integration coverage.

`tests/live/staging.js` is retained as an archived implementation reference and
fails immediately before loading browser tooling or making requests. Reusing it
requires a separately reviewed isolated backend/configuration change. No result
here implies current service availability or production QA.
