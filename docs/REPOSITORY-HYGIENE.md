# Public repository hygiene and Cloud Git identity

## Cloud identity investigation (2026-10-16)

Before any new commit, both `git var GIT_AUTHOR_IDENT` and
`git var GIT_COMMITTER_IDENT` resolved to the older account's email, originating
from Cloud's `/home/agent/.gitconfig`. No system config file, identity includes,
local/worktree identity settings, `EMAIL`, `GIT_AUTHOR_*`, `GIT_COMMITTER_*` or
`GIT_CONFIG_*` overrides were present. Worktree config only selected sparse-checkout
behavior. Raw author and committer metadata of
[`44279ab`](https://github.com/onahum2023/clean-time/commit/44279ab0267c57389d825b587e12960fcf42875d)
matched that older email; GitHub associated both with `onahum2018`. The GitHub
connector authenticated as `onahum2023` (ID `143781302`).

The observed cause is Cloud's independent global Git identity. GitHub associates
commit emails with accounts independently of the account pushing the commit.
Changing GitHub CLI authentication cannot fix this metadata. The mechanism that
originally populated Cloud's global config is not exposed here; the timing of
Cloud enablement alone does not establish its upstream source.

This worker's global config and this checkout's local config now use
`Oded Nahum <143781302+onahum2023@users.noreply.github.com>`; global
`user.useConfigOnly=true` prevents fallback to a generated machine identity.
No Mac settings or published commits were modified.

During validation the global email reverted once while other Cloud commands were
running; the writer was not identified and later probes did not reproduce it.
The checkout-local override remained correct throughout. After reapplying the
global setting, a fresh local clone resolved both identities to the noreply email.
That is evidence for this worker only, not a fresh-session persistence pass.

## Required durable Cloud setup

Changing a running worker does **not** update the saved environment template.
This session has no tool for changing that template or starting an independent
fresh Cloud environment, so persistence across sessions is still unverified.

In the Codex Cloud environment editor for this repository, append the following
to its setup script (and maintenance script if restored/cached environments use
that path). Save the environment configuration. These commands are for this
owner's Cloud environment, not a required identity for other contributors:

```sh
git config --global user.name 'Oded Nahum'
git config --global user.email '143781302+onahum2023@users.noreply.github.com'
git config --global user.useConfigOnly true
```

Because a global-only correction reverted once, also save these non-secret
environment variables in the same Cloud environment configuration:

```text
GIT_AUTHOR_NAME=Oded Nahum
GIT_AUTHOR_EMAIL=143781302+onahum2023@users.noreply.github.com
GIT_COMMITTER_NAME=Oded Nahum
GIT_COMMITTER_EMAIL=143781302+onahum2023@users.noreply.github.com
```

Inspect `EMAIL`, `GIT_CONFIG_COUNT`, `GIT_CONFIG_PARAMETERS`, `GIT_CONFIG_GLOBAL`
and `GIT_CONFIG_SYSTEM` for stale identity overrides. Do not print unrelated
configuration or credential values.
Repository/worktree config and included config files can also override globals;
inspect their identity entries before committing.

Start a **new Cloud task/environment with a fresh checkout**, then run:

```sh
git config --includes --show-origin --show-scope --get-regexp '^(user\.|author\.|committer\.|include)'
git var GIT_AUTHOR_IDENT
git var GIT_COMMITTER_IDENT
```

Both must show the requested name/noreply email. On a disposable branch, make a
small meaningful documentation commit, push it and inspect GitHub's commit page
or commit API: both GitHub author and committer must be `onahum2023`. Delete the
disposable branch when no longer needed. Do not amend historical commits or commit
tests to main. A new worktree/clone on the current worker checks global precedence
only; it is not evidence of a new Cloud session.

## Private artifacts and publication

Keep environment files, sessions, browser profiles, recovery exports, local DBs,
recordings and screenshots in ignored local directories. Use `.playwright-mcp/`
or `qa-artifacts/` for synthetic QA output. Ignore rules cover common names but
cannot recognize sensitive content inside an arbitrarily named image or JSON file.
Never force-add real recovery exports or private artifacts. Deliberately synthetic
fixtures may live in `tests/fixtures/`; review their content even though the path
exception permits committing them. `.env.example`, `.env.sample` and `.env.template`
are allowed only with placeholder values.

Run before committing and in CI:

```sh
node scripts/repository-hygiene.js
node --test tests/repository-hygiene.test.js
VERCEL_ENV=preview node scripts/build-vercel.js
```

The guard checks current tracked paths, working-tree content and recognizable
privileged credential signatures and recovery-export JSON shapes without printing
values. It is a lightweight
check, not exhaustive secret detection or a Git history scan. Review the staged
diff separately before committing. Public Supabase publishable keys/project IDs
and legitimate public contributor/support contact details are intentional.

Vercel publishes `dist/` using **only** `scripts/public-files.json`. Adding an
application asset requires explicitly updating that manifest. It includes the
font's OFL license. Source docs/tests/agent guidance and unlisted assets are not
copied. Symlinked assets/output and unexpected stale output files fail the build;
use a clean dedicated output directory. No recursive directory publication remains.
The build leaves source application assets and production/Preview backend selection
unchanged. Preview/development remain guest-only with backend access disabled.

## Public QA references and remaining work

Reference the tested SHA/PR, repository-relative suite and a sanitized PASS/FAIL/
BLOCKED summary. Reproduce synthetic suites with a loopback server and
`node tests/run-qa.js`; see [Track B](TRACK-B.md#reproducible-cloud-qa).
Do not treat ignored workspace logs/screenshots as public evidence attachments.
Never upload raw browser profiles, auth state, recovery JSON or verification links.

[Precise proposed issue edits](PUBLIC-ISSUE-EDITS.md) preserve the chronology and
technical evidence in #34, #41 and #50. Existing issue descriptions/revisions and
Git history have not been erased. External Preview-variable cleanup remains #41;
live Auth/restore and physical-device acceptance remain separate release gates.
