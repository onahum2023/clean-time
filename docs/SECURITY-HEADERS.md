# Static deployment headers (#18)

Vercel responses receive CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`,
`Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` and a narrow
Permissions-Policy. CSP permits self-hosted assets, exact hashes for inline static
scripts, and the existing version-pinned/SRI Supabase SDK path. Inline event
handlers/eval and arbitrary script CDNs are excluded. Styles still permit inline
declarations because the current app uses style attributes and runtime variables.
Connect destinations retain only self and the existing production Supabase origin;
Preview runtime isolation still disables that backend independently.

After editing inline HTML/scripts, run `node scripts/security-headers.js --write`
and review the resulting hashes. The build refuses stale configuration. This is an
integration prerequisite when merging other HTML-changing PRs; it prevents a
successful deployment that silently breaks the app under CSP. External reading
links remain navigation, not subresource loads. No Supabase or production setting
is changed by this PR.

Local synthetic browser verification uses the actual configured response headers.
Production-response and real magic-link/sync acceptance remain unexecuted until an
authorized release. Do not close #18 based on Preview/local evidence alone.

Cached-client correction: app/worker now advance together to 2026.10.15.16. The
actual baseline cached installation upgrades after all app windows close; the
reopened cached HTML retains/enforces CSP, blocks an unhashed script and still
loads offline with synthetic history intact. Updated verification: 20 offline/
upgrade + 10 fresh HTTP/CSP checks passed. Hashes were regenerated for this version.
