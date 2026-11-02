# PR #81 — Home balance and final counter polish

[Draft PR #81](https://github.com/onahum2023/clean-time/pull/81) ·
[Updated protected Preview](https://clean-time-du8apw79u-nu-cielo.vercel.app/) ·
[Integrated UAT checklist](ISSUE-80-INTEGRATED-UAT.md)

**Desktop balance accepted by the owner; final counter polish awaits review.**
PR remains Draft/HOLD. No merge or Production deployment.

## Final counter polish

The accepted two-column balance is preserved: a 360px minimum-height timer and
200px minimum-height supporting-card row fill the existing desktop grid row.
Only the normal 24px gutter (20px at the 1024px threshold) separates the three
cards from the full-width reflection. Long text/secondary counters can grow
naturally; existing mobile summary, actions and fixed footer stay unchanged.

Today's localized date is now in the timer's **physical top-left corner** in all
languages. The content column reads: personal greeting → clean-time label →
main calendar duration → start date. The duration remains the largest text.
The milestone badge grows from 80×112 to **100×140px** at wider desktop sizes
and moves up 16px. At 1024px it grows from 64×90 to **80×112px**, raised 8px,
with a dedicated column to prevent overlap. Mobile retains its original badge.

The greeting uses the existing saved profile name as plain text. With no name,
it shows the greeting without an invented identity or dangling comma. An exact
repetition of that name in the recovery identity line remains visually hidden;
no saved value is changed.

| Device-local time | Hebrew | English | Russian |
| --- | --- | --- | --- |
| 05:00–11:59 | בוקר טוב | Good morning | Доброе утро |
| 12:00–16:59 | צהריים טובים | Good afternoon | Добрый день |
| 17:00–23:59 | ערב טוב | Good evening | Добрый вечер |
| 00:00–04:59 or unavailable hour | שלום | Hello | Здравствуйте |

The greeting reads `Date#getHours()` in the device timezone and refreshes through
the existing one-second Home render. This is the only added dynamic scope:
no new timer, settings, storage keys, scheduling, feed, geolocation, server time
or backend connection. It never changes recovery records or sync timestamps.
Mobile keeps its existing app header/greeting; the new card greeting is desktop-only.

## Fresh actual protected-Preview screenshots

All images below are browser captures from application commit
`5cbe05b2cbe488d6dea66eb8953ed2ae08f28f7e`, version `2026.11.01.15`, at the
protected Preview above. They use synthetic records, primary start date
7 August 2026 and a fixed 1 November 2026, 13:00 Europe/Amsterdam clock.
The named examples use the synthetic saved profile name **נועם**, with
**צהריים טובים** at the fixed 13:00 local capture time; no account
creation, personal identity or backend access is involved.

| 1440×900 desktop | Light | Dark |
| --- | --- | --- |
| Original, named greeting | [View](pr-81-home-balance-visuals/home-named-original-1440-light.png) | [View](pr-81-home-balance-visuals/home-named-original-1440-dark.png) |
| Forest, named greeting | [View](pr-81-home-balance-visuals/home-named-forest-1440-light.png) | [View](pr-81-home-balance-visuals/home-named-forest-1440-dark.png) |
| Original, no saved name | [View](pr-81-home-balance-visuals/home-original-1440-light.png) | [View](pr-81-home-balance-visuals/home-original-1440-dark.png) |
| Forest, no saved name | [View](pr-81-home-balance-visuals/home-forest-1440-light.png) | [View](pr-81-home-balance-visuals/home-forest-1440-dark.png) |

![Revised 1440px Home with greeting and date inside the timer](pr-81-home-balance-visuals/home-named-original-1440-light.png)

Compare with the [previous 1440px composition](pr-81-home-visuals/home-original-1440-light.png):
the new timer and taller supporting cards now reach the same lower edge as the
action column, leaving only the normal gutter above the reflection strip.

| Responsive samples | Light | Dark |
| --- | --- | --- |
| Original / 1024×768 | [View](pr-81-home-balance-visuals/home-original-1024-light.png) | [View](pr-81-home-balance-visuals/home-original-1024-dark.png) |
| Forest / 1024×768 | [View](pr-81-home-balance-visuals/home-forest-1024-light.png) | [View](pr-81-home-balance-visuals/home-forest-1024-dark.png) |
| Original / 390×844 | [View](pr-81-home-balance-visuals/home-original-390-light.png) | [View](pr-81-home-balance-visuals/home-original-390-dark.png) |
| Forest / 390×844 | [View](pr-81-home-balance-visuals/home-forest-390-light.png) | [View](pr-81-home-balance-visuals/home-forest-390-dark.png) |

Separate full-page captures include [1440px named light](pr-81-home-balance-visuals/home-named-original-1440-light-full.png),
[1440px named dark](pr-81-home-balance-visuals/home-named-original-1440-dark-full.png),
[1024px light](pr-81-home-balance-visuals/home-original-1024-light-full.png) and
[1024px dark](pr-81-home-balance-visuals/home-original-1024-dark-full.png).
Optional-secondary-counter views use the prior handoff fixture:
[desktop light](pr-81-home-balance-visuals/home-1440-light.png),
[desktop dark](pr-81-home-balance-visuals/home-1440-dark.png),
[mobile light](pr-81-home-balance-visuals/home-390-light.png),
[mobile dark](pr-81-home-balance-visuals/home-390-dark.png).

Fonts are loaded before capture. These are full browser viewports, with separate
`-full` images for scrollable content. No document/static-asset/backend responses
are mocked. Service workers are blocked for deterministic captures, so the
existing offline-preparation notice remains visible. Real offline/cache upgrades
are checked separately. Origin-scoped Preview credentials stay in memory.

## Validation

- **1,903 local assertions pass**, with zero failed suites in this refinement run:
  local-time greeting (24), Home refinement (151), desktop composition (28), synthetic registered summary
  (53), guided Home/preferences (193), milestone/calendar (56), all-screen 200%
  text/themes (762), navigation (556), offline (21), preference/data upgrades (59).
- **1,770 actual protected-Preview UI assertions pass**, with zero failed suites:
  local-time greeting (24), Home refinement (151), composition (28), guided Home (193), milestone/calendar
  (56), enlarged text/themes (762) and navigation (556).
- **106 deployed workflow checks pass** at 1440px/390px, including appearance
  persistence, exact recovery bytes, Journal reload, Step 10 save/print/PDF and
  the existing guest-only Preview backend boundary.
- **12,096 actual Home text/surface combinations pass** at rest/real hover,
  now including the in-card greeting/date, across all palettes/backgrounds/device
  accents and light/dark. Hebrew RTL and English/Russian LTR, 320/390/1024/1440px,
  keyboard actions, 200% text and existing counter preferences are covered.
- **14 actual deployed preservation images are byte-identical** to the accepted
  balance handoff: Original/Forest mobile Home and optional-secondary examples,
  plus desktop/mobile Welcome viewport/full-page
  captures. The fresh gallery contains 40 deployed PNGs, including named examples.
- **10 Node contract/build tests pass**, including 3,240 startup compatibility
  combinations. Exact CSP hashes, Preview build, publication/source hygiene,
  documentation links, image dimensions and whitespace checks pass.

The new geometry assertions require the larger timer/supporting cards and check
that the supporting-card-to-reflection gap equals the grid gutter in all three
languages, both modes and both desktop widths. Name checks cover safe literal
rendering, missing-name fallback, duplicate-label suppression via the registered
summary regression, and unchanged recovery bytes after rendering/reload.
Greeting tests check the same UTC instant in New York, Jerusalem, Tokyo and
Honolulu, every local time-band boundary, updates without a reload, Hebrew/
English/Russian wording, literal-name safety and unchanged recovery bytes.
Hierarchy tests check the top-left date, greeting/label/duration/start-date order,
duration prominence and larger raised badge. These scoped polish checks supplement the earlier full integrated regression
coverage linked from the UAT checklist; they are not a fresh full-suite run.
No real accounts, cloud data, recovery exports or credentials are published.

English/Russian wording, native browser zoom, physical mobile keyboards/safe
areas, screen readers and installed-PWA behavior remain target-device acceptance
checks. Automation checks 200% text/reflow, keyboard behavior and responsive
bounds; it does not replace owner visual acceptance. The Preview retains its
existing guest-only configuration. Live auth/cloud-backup UAT and all new backend
or dynamic-content work stay deferred.
