# Canonical origin and minimal Vercel Web Analytics

Base: merged PR #47, `580b7bc4004a4e89445039f659f667c9c489b2e8`.

Home, About, Privacy, social image URLs, JSON-LD identifiers/URLs, sitemap and robots use `https://clean-time.app`. The public www origin redirects 308 to the apex (verified 2026-10-12). The standalone information pages remain script-free and work without JavaScript.

## Integration and privacy boundary

The shared HTML entry loads `assets/analytics.js`, a small dependency-free bootstrap. Its production build reads the current public `analytics.scriptSrc` and `analytics.viewEndpoint` from `VERCEL_OBSERVABILITY_CLIENT_CONFIG`. Only validated same-origin paths are accepted. Without that configuration, it uses `/_vercel/insights/script.js` and `/_vercel/insights/view`: the script endpoint returned HTTP 200 and Vercel JavaScript, and Vercel's current official SDK still uses that fallback. The current docs show project-specific paths; the legacy path was verified rather than assumed.

References inspected 2026-10-12:

- [Current HTML quickstart](https://vercel.com/docs/analytics/quickstart)
- [Current configuration and build variable](https://vercel.com/docs/analytics/package)
- [HTML beforeSend filtering](https://vercel.com/docs/analytics/redacting-sensitive-data)
- [Vercel's official SDK implementation](https://github.com/vercel/analytics/blob/main/packages/web/src/generic.ts) and [script options](https://github.com/vercel/analytics/blob/main/packages/web/src/utils.ts)
- [Vercel Analytics privacy](https://vercel.com/docs/analytics/privacy-policy)

Only a document load at the HTTPS apex `/`, without any query or fragment, is eligible. Preview builds explicitly disable Analytics; the origin guard also excludes Vercel aliases/local development. About and Privacy are not instrumented. Callback, private and unknown paths are excluded before loading the provider script. `data-disable-auto-track` prevents Vercel from modifying history or listening for SPA route changes. One manual initial pageview is queued after `beforeSend`; the filter rejects custom events, extra fields, non-public URLs and subsequent views.

Current Vercel scripts append a referrer and persisted vendor attribution outside `beforeSend`. The bootstrap therefore skips external/invalid referrers and any existing `__va_attribution` record. This deliberately undercounts referred visits and favors privacy. Same-origin referrers are omitted by the verified provider implementation; the home document's `no-referrer` policy prevents sensitive HTTP Referer headers. No recovery storage is read, no custom event/identity/group/cookie command is used, and no tracking cookie is enabled. Vercel retains its normal aggregate device/browser/geography information. Requests still reach Vercel infrastructure; this is not a claim that the hosting provider sees no network metadata.

The local bootstrap is part of the versioned offline shell. Vercel's provider script and intake are excluded from CacheStorage. Auth, encryption, recovery data, routing and Supabase configuration remain unchanged.

## Evidence before review

- Production static build, inline/script JavaScript syntax and `git diff --check` passed.
- Full local synthetic Chromium regression: **965 checks, zero failed suites**, including **42 Analytics** and **98 SEO/no-JavaScript** checks. Guest/registered mocks, encryption/sync, existing-user compatibility, export, offline updates and RTL rendering are covered; real accounts and physical devices were not exercised.
- The unmodified provider script fetched from production was executed in a synthetic VM, with its headless guard naturally false in that simulated environment. Direct and same-origin-referrer cases each emitted exactly one simulated POST to `/_vercel/insights/view`. Payload fields were public origin `o`, script version `sv`, timestamp `ts`, and an empty `r` for direct visits. No identity, content, query, fragment or dynamic route was present. Custom-event/duplicate-view probes emitted nothing; history was unchanged; recovery storage was unread. This is payload compatibility evidence, not a real browser or hosted intake result.
- Before release, production HTML still contains the old www canonical and no bootstrap/provider integration. Production Analytics API and dashboard both report **zero views** and the dashboard displays Getting Started.

## Preview and production gates

The Vercel project is `clean-time`, `prj_6MhMelClmBk0S83h1kXE90rslkjr`, linked to `onahum2023/clean-time`, production branch `main`. Protection remains `all_except_custom_domains`. PR #48's automatic Git Preview uses `CLEAN_TIME_SUPABASE_URL` and `CLEAN_TIME_SUPABASE_PUBLISHABLE_KEY` scoped only to Preview on `codex/canonical-domain-web-analytics`, copied from the existing isolated `codex/seo-geo-phase-1` staging configuration. It no longer needs the prebuilt workaround. Only these two branch-scoped Vercel variables were added; production variables, production deployment and Supabase project configuration were not changed.

The build-time guard remains unchanged: a Preview build requires the exact isolated staging URL and a publishable key, and rejects missing values, the production URL, any other project URL and secret-like/invalid keys. The automatic deployment, latest commit, Vercel check and hosted QA results are recorded in PR #48.

Keep this PR unmerged until reviewed. Production acceptance is pending the approved deployment:

1. Verify deployed apex HTML, metadata, sitemap and actual configured script path match the reviewed release.
2. In a fresh ordinary browser session, open `https://clean-time.app/` directly. Confirm one successful pageview POST to the deployed configured `/view` endpoint and inspect only its anonymous payload. Do not use personal recovery data or manually forge intake requests. Vercel suppresses webdriver/Headless clients.
3. Confirm recovery navigation produces no further Analytics requests; callback/query/fragment/private loads and external referrers produce none.
4. Check the production Analytics dashboard after at least 30 seconds (longer if needed), verifying views appear and Getting Started clears. Record the deployed SHA and actual dashboard result. A Preview/script HTTP 200 alone does not satisfy this gate.
