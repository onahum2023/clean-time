# SEO/GEO Phase 1: public identity and crawlability

Base: post-Track A main `edd35ee95d19d775b67d2828acace1fd6efa2adf` (merged #46). Preview review only; production acceptance remains pending an explicitly approved release.

The app remains a static, inline SPA. A short, ordinary HTML introduction explains the Hebrew/free/recovery/guest purpose before JavaScript runs. Startup hides that introduction after choosing the existing Welcome, Today or account-loading screen. Existing buttons and history routing remain intact. About and Privacy also have standalone, script-free `/about/` and `/privacy/` pages, linked with ordinary anchors. The in-app About/privacy screen remains available offline as before.

The exact requested title, Hebrew description, canonical, Open Graph, square-icon summary social card and modest WebSite/WebApplication JSON-LD are in initial HTML. Schema has no ratings, medical/treatment claims, people or user-specific content. Public copy retains NA independence and the non-treatment/medical/emergency boundary.

The current canonical origin is `https://clean-time.app/`; the www domain redirects 308 to the apex. Canonicals, social URLs, JSON-LD and the sitemap use HTTPS on the apex. Vercel project mapping: `clean-time`, `prj_6MhMelClmBk0S83h1kXE90rslkjr`. Slash normalization keeps the public directory URLs consistent.

The sitemap contains only `/`, `/about/` and `/privacy/`. Robots permits those documents and public rendering assets, and excludes other paths and callback/query URLs. Robots is crawl guidance, not access control. Privacy comes from the existing browser-local state and authenticated/encrypted sync boundary: no public recovery-state endpoints, snapshots, user routes, exports or data are added. Public information pages contain no scripts, forms or account controls, and cannot read device storage. Preview retains the existing isolated staging backend configuration.

README and public Privacy distinguish optional cloud encryption from plaintext local storage and JSON exports. Signing in alone does not activate backup. Recovery-key acknowledgement plus encrypted write/readback verification remains required. No auth, sync, encryption, SQL or backend behavior is changed.

## Verification

- Local synthetic Chromium full runner: **923 checks**, zero failed suites, including **98** SEO checks and all guest/registered, encryption/sync, offline and Track A suites.
- Final fallback/header refinement: **278** focused SEO/Welcome checks, zero failed suites.
- JavaScript-disabled navigation and RTL layout at 320/390/1280px in light/dark themes; mobile introduction/About/Privacy screenshots inspected. Static build preserves all six public artifacts byte-for-byte. Raw HTML, robots and sitemap return 200 locally.
- Synthetic private sentinel stays absent from public pages; visits and return preserve stored recovery bytes. Robots policy tests exclude account/journal/history/backup/export/settings/auth and callback/query URLs.
- Application logic compared with fetched production HTML is identical after removing the version bump and one public-introduction visibility line. Crypto, dates, appearance, state and sync logic are unchanged. Matching app/worker release versions preserve the safe offline update lifecycle.
- Syntax checks and `git diff --check` pass. The QA runner accepts an exact HTTP loopback origin so an unrelated existing server can remain on port 8765; this worktree was tested on port 8766.

Exact-head hosted Preview evidence is recorded in the PR after deployment. Production raw-HTML/robots/sitemap acceptance, actual search/AI indexing, live account/backup/restore, real email, RLS and physical-device acceptance are not established by synthetic or Preview checks. No production deployment or merge is authorized here.

References: [Google robots specification](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec), [WebApplication schema](https://schema.org/WebApplication), [Vercel slash normalization](https://vercel.com/docs/project-configuration/vercel-json#trailingslash).
