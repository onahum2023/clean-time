# Vercel traffic and product usage analytics

## Integration and build repair

`assets/analytics.js` owns the vanilla HTML Vercel command API, one provider script, manual page views and allowlisted custom events. No npm dependency, tracking database or additional vendor is added. `index.html`, `/about/` and `/privacy/` load the module. Public documents remain readable without JavaScript.

Production reads only the public `analytics.scriptSrc`, `viewEndpoint` and `eventEndpoint` fields in `VERCEL_OBSERVABILITY_CLIENT_CONFIG`. Resilient Intake paths are opaque: dotted/versioned filenames, relative paths and ingestion paths without `/view` or `/event` suffixes are accepted. The old validator required a leading slash and fixed suffixes; it rejected relative provider paths and caused production deployment `dpl_D7S9dhB2pT862N9z4V1EEr1XXACM` at `d98bb556c9d12cde040baf04524fb9727c38e95a` to fail. The replacement requires short same-origin paths and rejects remote/protocol-relative URLs, traversal, encoded characters, query strings, fragments, whitespace and attribute injection. Absent fields use Vercel's documented legacy endpoints. Present malformed fields fail the production build. Only the validated public paths are logged.

Preview remains disabled for analytics and requires the existing isolated staging URL and publishable key. Its unused Analytics configuration cannot block a staging build, including malformed JSON. The two public staging variables are scoped only to Preview on `codex/analytics-product-usage` in the existing `nu-cielo/clean-time` project. No Supabase project, Auth, SQL, encryption format or recovery-state changes are needed.

The automatic Git Preview at implementation SHA `a2c8b303269d58fe8083fef348b55de7c9fbe546` logged Vercel's actual generated configuration, before normalization:

```json
{"scriptSrc":"0d7fd8e8f05ff8e1/script.js","viewEndpoint":"0d7fd8e8f05ff8e1/view","eventEndpoint":"0d7fd8e8f05ff8e1/event"}
```

The regression feeds these exact public values into the **production-mode** build and verifies success. The generated provider script is identical to the current script fetched from the production fallback. The historical failed deployment's resolved build value could not be retrieved through the public configuration API; the raw-format evidence above comes from this project's new automatic Git build. The next automatic production build itself remains a post-merge acceptance gate.

### Navigation and counting

Automatic provider tracking is disabled with `data-disable-auto-track="1"`. `show()` reports each change to a semantic screen. The module deduplicates consecutive identical screens; Back/Forward to a different screen counts, while editor history, rendering and startup restoration do not emit tool action events. A document reload is a new startup, not proof of a distinct person/session. During initial script loading, only the latest visible screen is reported. Public documents produce one view each.

| App screen | Analytics path | Tool identifier |
| --- | --- | --- |
| Welcome | `/` | — |
| Today | `/app/today` | — |
| Planner | `/app/daily-plan` | `daily_plan` |
| Gratitude | `/app/gratitude` | `gratitude` |
| Journal | `/app/journal` | `journal` |
| Meditation | `/app/meditation` | `meditation` |
| Inventory | `/app/inventory` | `inventory` |
| Readings | `/app/readings` | `readings` |
| Bookmarks | `/app/bookmarks` | `bookmarks` |
| Other screens | Fixed `/app/{screen}` allowlist | — |
| Public About / Privacy | `/about/`, `/privacy/` | — |

These are reporting paths, not new HTTP routes. Actual URL queries/fragments, history state, selected dates and journal entry IDs never construct a path. Callback URLs are measured only through a fixed screen URL.

## Event definitions

| Event | Trigger | Properties / deduplication |
| --- | --- | --- |
| `app_started` | Once after local init and attempted session restoration | `mode`: `visitor`, `guest`, `registered`, `unknown`; `entry`: `new_guest`, `returning_guest`, `registered`, `unknown`. Once per document. |
| `guest_started` | Guest form validated and local save succeeded | None. Once per document; restoration never counts. |
| `registration_started` | Enter create/convert form through explicit navigation | None. Reopening counts; rerender/Back restoration does not. |
| `registration_completed` | Authenticated return following a successful registration request in this browser tab, and account creation timestamp consistent with that request | None. Anonymous bounded intent consumed once. Sending an email alone does not count. Older accounts are excluded. |
| `backup_activated` | First transition from unconfirmed key material to a verified encrypted backup, following successful write/readback/decrypt or verification retry | None. Once per document. Already confirmed startup/sync and new-device key unlock never count. |
| `tool_opened` | Explicit screen transition, including Back/Forward, to a tool | One fixed `tool` property. Initial restoration and same-screen rerenders excluded. |
| `guest_upgraded` | Confirmed new registration as above with convert intent | None. Once per document. |
| `export_completed` | Recovery JSON generated and handed to browser download | None. Each successful handoff; cannot establish final disk save. |

Registration intent uses a separate `sessionStorage` key containing only `create`/`convert` and a request time, expires after one hour and is removed on confirmation. No email, account identity, token or recovery information is stored there. It survives same-tab reload; another browser/tab may not have it. Account creation time is checked in memory and never emitted. If the session callback finishes before the deferred local module loads, that scalar observation is retained only in memory for the same bounded check. Missing timestamps, blocked storage and clock skew may undercount. This measures observed completions, not an exact identity-bound funnel. An existing account's login never counts as new registration when its creation predates the intent.

## Provider capabilities and limits

Checked 2026-10-12: existing team `NuCielo` (`nu-cielo`) is **Pro**; Web Analytics is enabled for project `clean-time`, linked to `onahum2023/clean-time`, production branch `main`. No upgrade or new service was created. Pro supports custom events with **two** properties per event; this taxonomy uses at most two. If the project later uses a plan without custom events, `CLEAN_TIME_ANALYTICS_CUSTOM_EVENTS=false` builds pageviews-only instrumentation. Tool usage remains visible as semantic pageviews, while guest/account breakdown and conversion events are unavailable. Do not encode actions as fake pageviews to evade a plan limit.

Native reports include views/visitors, pages, referrers, country/geography, browser, OS and device, with date trends and supported hostname filtering. Referrer origins are retained, but full referring paths and all UTM/query parameters are intentionally excluded. Current documented UTM reporting requires Analytics Plus and is not enabled here. The payload's sanitized URL retains the public hostname. Vercel's daily request hash is reset; reliable cross-day returning-person counts, retention cohorts, visit frequency per individual, multi-device identity and exact guest conversion funnels cannot be derived. `returning_guest` means an already configured guest in this browser at startup, not a unique returning person. Blocks, bots, offline use and incomplete callbacks undercount actions. Pro usage follows the existing team's billing; no paid add-on was enabled.

Official references:

- [Vanilla HTML quickstart](https://vercel.com/docs/analytics/quickstart)
- [Current configuration and build variable](https://vercel.com/docs/analytics/package)
- [Official command implementation](https://github.com/vercel/analytics/blob/main/packages/web/src/generic.ts) and [script options](https://github.com/vercel/analytics/blob/main/packages/web/src/utils.ts)
- [Custom events](https://vercel.com/docs/analytics/custom-events)
- [Current plan limits](https://vercel.com/docs/analytics/limits-and-pricing)
- [Privacy and daily visitor hashing](https://vercel.com/docs/analytics/privacy-policy)

## Privacy, failure and offline boundary

The module only accepts fixed event names, tool identifiers and startup enum values. Other properties are discarded. It receives no recovery content or account IDs. `beforeSend` strips URL queries/fragments, extra payload fields, flags and CDP attribution. It rejects unknown paths and event names. No identify/group/cookie commands are issued.

Vercel's current hosted script adds referrer and persisted attribution outside `beforeSend`. The module exposes an origin-only `document.referrer` getter before loading that script and issues its supported `reset` command before each send, clearing only the provider's optional attribution. Existing attribution and external referrals never suppress legitimate visits. The browser referrer getter affects this document only; the app has no other referrer consumer. `no-referrer` prevents the actual callback URL from being included in request headers. The provider still receives ordinary network metadata; Clean Time stores no raw IPs or fingerprints and the Analytics dashboard does not expose individual IP addresses. Provider changes must be rechecked against this compatibility test.

Analytics exceptions are contained. Provider requests/script are never cached by the service worker; the local bootstrap is part of the versioned shell. The existing shell version is advanced so installed clients get the matching HTML/module after safely closing old windows. Offline product events are dropped. Reconnection reports only the currently visible screen, plus the document's one startup if it has not yet been sent. At most 20 online events may wait in memory for the initial script load; they are cleared on offline transition or script failure. There is no durable analytics queue and no analytics in recovery storage/encrypted backups.

## Validation and release gates

Run from the repository root with a loopback server serving this checkout:

```sh
QA_BASE_URL=http://127.0.0.1:8784 NODE_PATH=/path/to/playwright/node_modules node tests/run-qa.js
```

`tests/analytics-qa.js` fulfills all apex requests locally, with synthetic recovery/account/referrer/attribution sentinels, never a live account. It covers build paths/guards, property rejection, navigation/editor history, Back/Forward, guest creation, old/new auth classification, conversion, export download, offline reconnection and blocked Analytics. Set `CT_ANALYTICS_PROVIDER_SCRIPT` to a locally fetched, unmodified public Vercel script for actual provider-payload compatibility. Its bot classification is neutralized only in that completely locally fulfilled synthetic fixture; this cannot prove hosted ingestion. `tests/encryption-qa.js` separately observes the event hook during synthetic verified/pending/failed backup cases.

Local/hosted evidence is recorded in the PR. A successful build, downloaded script or synthetic provider request is not production acceptance. Preview analytics are deliberately disabled.

### Recorded pre-merge evidence (2026-10-12)

Implementation head: `a2c8b303269d58fe8083fef348b55de7c9fbe546`, [PR #49](https://github.com/onahum2023/clean-time/pull/49).

- Full local synthetic Chromium regression: **1,078 checks, zero failed suites**, including **149 Analytics** and **123 encryption/backup** checks. All existing suites passed. Inline/script syntax and `git diff --check` passed.
- Focused synthetic WebKit Analytics: **149 checks, zero failed suites**. Chromium and WebKit both execute the unmodified current provider script fetched from this project's generated path, with all traffic fulfilled locally. No live intake is claimed.
- Automatic Git Preview: **READY**, deployment `dpl_FJ5HNUabxgbigiFVxA7qYxKusDS8`, [exact implementation Preview](https://clean-time-lwnvf9mth-nu-cielo.vercel.app). GitHub's Vercel check passed. Protected HTTP inspection verified the app version, disabled analytics and isolated staging config.
- Hosted synthetic checks on that exact Preview: backend isolation **25**, Welcome/guest/account mocks **180**, navigation/Back/Forward **47**, export **16** = **268 checks, zero failed suites**. Access used the existing short-lived Vercel credential scoped to this exact origin, without exporting browser state or using live Supabase accounts.
- Pro/Analytics enablement and Git mapping were verified read-only. Only two existing public staging values were added as branch-scoped Preview overrides. No production deployment, Supabase changes, live-account actions or migrations were performed.

Production ordinary-browser ingestion, dashboard traffic/custom-event panels, real registered lifecycle, and physical-device evidence remain **pending**. The failed production deployment remains unchanged until review and merge. The documentation-only delivery commit preserves the tested runtime; its final automatic Preview identity is recorded in the PR.

After review and authorized merge:

1. Record the exact merge SHA and automatic **production** deployment ID; require READY and confirm the public script/view/event paths from its build output match the rendered tags on all three documents. A PR Preview does not establish a successful production build.
2. In a fresh ordinary browser with synthetic data, visit the apex through a normal external referral. Confirm one successful configured pageview POST, origin-only referrer, fixed URL and no query, fragment, account ID, persisted attribution or content. Do not forge ingestion or reuse personal browser state.
3. Complete guest onboarding; open each tool; exercise editor history and Back/Forward; verify the eight event definitions where applicable and correct duplicate behavior. Verify only successful exports/registrations/backup activations count.
4. In an authorized synthetic registered flow, verify `app_started` mode, same-tab registration and conversion, and confirmed encrypted backup activation. Failed/deferred backup, returning login and session restoration must not count as completions. Recheck network payloads, headers and storage boundaries.
5. Go offline, use local tools and return online. Require only the current screen and no historical offline actions. Verify normal local function when Analytics is blocked.
6. After dashboard intake delay, require visible production pageviews, paths, hostname, referrer origin, device/browser/OS and geography panels and custom events/properties. Record observed values and any empty/unavailable panels. Vercel bot filtering means headless browser results cannot satisfy this gate.
7. Keep production acceptance pending if dashboard intake or ordinary-browser POSTs are not proven. No automatic merge, promotion or plan upgrade.
