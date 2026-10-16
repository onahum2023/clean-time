# Proposed public issue-description edits

These are exact, narrow replacements for owner/reviewer application. Preserve all
other text, comments, technical results, dates, checklists and historical sections.
They do not erase older public issue revisions or Git history.

## Issue #34 — retired backend notice

In **Test environment and controls**, replace the opening sentence with:

> **Environment retired 2026-10-12:** Supabase staging project
> `uffvbfmfsesdhjzzjiyu` was deleted.

Keep the rest of the paragraph and all coverage evidence. Append to that paragraph:

> Current Preview builds are guest-only with backend access disabled and ignore
> obsolete staging variables. See [Track B isolation](https://github.com/onahum2023/clean-time/blob/main/docs/TRACK-B.md#preview-isolation-41)
> and [remaining release QA](https://github.com/onahum2023/clean-time/blob/main/docs/TRACK-B-RELEASE-QA.md).
> External variable cleanup remains #41; these live-service checks remain blocked.

## Issue #41 — historical context

Replace the two sentences under **Context (2026-10-12)** with:

> Supabase project `clean-time-staging` (`uffvbfmfsesdhjzzjiyu`) was deleted.
> The project listing at that time showed only production `clean-time`
> (`aefhjgmiwgajdhgyhelm`) active.

Append after the paragraph describing obsolete Preview variables:

> Current builds ignore these variables and emit guest-only Preview configuration
> (`backupDisabled:true`, `url:null`, `key:null`). This does not prove external
> variable deletion or retroactively rebuild immutable deployments. Follow
> [Track B isolation](https://github.com/onahum2023/clean-time/blob/main/docs/TRACK-B.md#preview-isolation-41).

Keep the actions/safeguards and leave the issue open until external cleanup is verified.

## Issue #50 — public evidence references

Replace only the four paragraphs beginning with the exact labels below, at their
existing positions. Existing SHAs, dates, totals and nested historical records stay.

**`Evidence:`** (language-selector release):

> Evidence: [fix commit 44279ab](https://github.com/onahum2023/clean-time/commit/44279ab0267c57389d825b587e12960fcf42875d)
> and [PR #63](https://github.com/onahum2023/clean-time/pull/63). The developer
> reported 184 focused checks, 17 production-built synthetic guest checks, matching
> public app/worker versions and configured headers. Reproduce browser isolation,
> language switching and headers with `node tests/run-qa.js i18n-qa.js backend-origin-qa.js security-headers-qa.js offline-qa.js`.
> Historical local logs are private artifacts, not public attachments; these
> instructions do not recreate the historical live deployment observation.

**`Local release evidence:`**:

> Release evidence: [PR #62](https://github.com/onahum2023/clean-time/pull/62),
> released main `7989f08c092534fff7adc427331e25a3b2e2e36a` and assembled release
> `783cc2ffae1ddd784dd8a352b0830709f60ad4dc`. Reported public HTTP/config/header
> checks, 149 Analytics checks and 11 production-built synthetic guest checks are
> summarized above. Relevant repository sources: `tests/analytics-qa.js`,
> `tests/security-headers-qa.js`, `tests/backend-config-qa.js` and
> `scripts/build-vercel.js`. Local logs and smoke-output files were not published.

**`Workspace evidence:`** under **Exact final evidence**:

> Review evidence: [PR #61](https://github.com/onahum2023/clean-time/pull/61),
> source `f737c6571c841b2f0178e902d8199559a8b51a01`, combined QA
> `a4b617976dab29a6eb514bf750495b02eae8f23e`. The reported complete run passed
> 1,320 checks and the focused source run passed 221; exact deployment/version,
> isolation and screenshot scope are summarized above. Reproduce the synthetic
> suite with `node tests/run-qa.js` under `docs/TRACK-B.md` controls. Local
> screenshot manifests/logs are private artifacts, not public evidence links.

**`Workspace evidence:`** under the initial eight-PR historical section:

> Initial review evidence: combined QA
> `2a73b752a77b383767015118371866fbc58559a0`, with the reported 1,264 checks and
> exact branch heads in the adjacent table. Reproduce synthetic coverage with
> `node tests/run-qa.js`; verify deployment/config/header observations separately.
> Historical local logs, per-worktree summaries and six synthetic captures were
> not published. Their absence does not establish a new pass or invalidate the
> technical results recorded above.
