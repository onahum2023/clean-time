# Guided daily Home — revised owner review

**Desktop update (issue #75):** At widths of 1024px and above, Today places the recovery summary and milestone beside a vertical list of the five daily actions. Mobile retains the 2×2 grid and full-width Step 10. The fixed bottom navigation remains at all widths. Earlier evidence below describes the preceding layout.

Home shows a compact recovery summary followed by four daily cards in a 2×2 grid and one full-width Step 10 card. This revision addresses the [owner's PR #68 feedback](https://github.com/onahum2023/clean-time/pull/68#pullrequestreview-5723184892).

The subsequent [issue #69 signed-in summary refinement](HOME-SIGNED-IN-SUMMARY.md) removes repeated labels from authenticated Home; the evidence below records PR #68.

## Daily card layout

The DOM, keyboard and reading order is fixed: רק להיום, תכנון יומי, הכרת תודה, ככה זה עכשיו, חשבון נפש יומי / צעד 10. In Hebrew RTL, reading/plan occupy the top right/left, and gratitude/journal the bottom right/left. English and Russian follow the same sequence in LTR. Step 10 spans both columns immediately beneath the four cards, using the same surface, border and corner treatment.

Home retains Welcome’s card surface, 16px corners, title typography and accent icon styling. All five Home cards now use the same soft neutral outline and gentle shadow (0 2px 6px at 6% black), with 16px gaps between rows, columns and the Step 10 card; 320px layouts use 12px gaps to keep useful card widths. Home reuses the established reading, plan, gratitude, journal and inventory illustrations. The first action has an accent title and a short external-reading description; its safe external URL and separate-window behavior are preserved. Native buttons and links retain the shared visible focus outline; Home adds restrained hover/pressed states. Welcome's existing content and responsive composition are unchanged.

The grid stays two columns at 320/360/390px and desktop widths. At 320px, 10px padding and 0.95rem titles keep long Russian labels legible without clipping. Card height can grow with text. At enlarged font sizes or with status notices, the page scrolls normally; the footer does not prevent reaching the fifth card. No completion tracking, forced sequence, wizard or score is introduced.

## Preserved discoverability and functionality

- The compact primary summary always describes the primary path, independent of the counter selected in details. Its start date and calendar duration stay visible.
- A secondary path is a small row; every saved path remains in details. Stored device visibility preferences are respected. New defaults show a compact secondary path; the existing optional second-path setup choice can still be unchecked.
- Settings → “מונים ותצוגות” → “כל המונים והתצוגות” opens the optional counter view, keeping Settings active in the footer. The configuration entry is removed entirely from Home. All three numerical formats, the single/compact/equal-card presentations, path selector and Home visibility checkbox remain accessible. Browser Back/Forward and “חזרה להגדרות” work.
- Recovery-date/path editing stays in Settings. The existing footer retains Today, Tools, About, Settings and Account. Every daily card opens its destination directly.
- The primary-path key-tag milestone is now 52×73px (about 1.8× the former 29×43px), scaling its text proportionally. It remains inside the compact summary, and its Settings visibility preference is respected. Narrow screens use a smaller gap between calendar units to keep the larger badge alongside the counter. The existing palette, Assistant font, appearance settings, Hebrew RTL and English/Russian LTR remain.

No dependency, recovery-data format, schema, authentication, sync or analytics change is introduced by the card revision. Existing guest/offline tools, encrypted backup and unknown/legacy data fields are preserved. Step 10 content stays separate under [issue #16](https://github.com/onahum2023/clean-time/issues/16); no new questions ship here.

## Matched Welcome / signed-in Home evidence

Each comparison uses the same viewport: mobile 390×844 or desktop 1440×900. Welcome is the unchanged reference. “Previous Home” is commit `7cdb9a4`, the list layout rejected in owner review. “Revised Home” is the 2×2 + 1 card implementation. The same synthetic recovery dates and registered account are used for both Home versions, with an actually generated encrypted test envelope and a mocked backend. No real account, recovery content or production service is used.

Real local service-worker registration is enabled. Fresh browser contexts and version-matched workers prevent a cached previous Home from appearing in the revised screenshot. These are local browser captures, not hosted registered-account UAT. Dates are fixed to 31 October 2026 in Europe/Amsterdam.

| View | Unchanged Welcome | Previous signed-in Home | Revised signed-in Home |
| --- | --- | --- | --- |
| Mobile 390×844 | ![Welcome mobile](home-ux-reference/welcome-mobile.png) | ![Previous signed-in Home mobile](home-ux-reference/previous-home-mobile.png) | ![Revised signed-in Home mobile](home-ux-reference/after-mobile.png) |
| Desktop 1440×900 | ![Welcome desktop](home-ux-reference/welcome-desktop.png) | ![Previous signed-in Home desktop](home-ux-reference/previous-home-desktop.png) | ![Revised signed-in Home desktop](home-ux-reference/after-desktop.png) |

[English signed-in Home at 320px](home-ux-reference/after-en-320.png) · [Russian signed-in Home at 320px](home-ux-reference/after-ru-320.png)

[Settings counter-view entry](home-ux-reference/settings-counter-entry.png) · [Counter controls reached from Settings](home-ux-reference/counter-details-from-settings.png) · [Home in dark mode](home-ux-reference/after-dark-mobile.png)

The original large-counter Home references remain available: [mobile](home-ux-reference/before-mobile.png), [desktop](home-ux-reference/before-desktop.png). All documentation images are excluded from the deployment allowlist.

## Validation

- **516 browser assertions across nine relevant suites passed:** Home acceptance (193), navigation (47), milestones (52), timers (25), setup/display (48), i18n/encrypted journeys (64), registered upgrade (57), offline/service-worker (20), security headers (10).
- Home acceptance checks the Settings-only counter entry, active navigation and return focus, display preference/history preservation, no configuration link on Home, consistent outlines/shadows, larger badge and 2×2 + 1 geometry across Hebrew/English/Russian × light/dark × 320/360/390/1440px. Enlarged text and keyboard order remain covered.
- Independent QA passed 18 mobile language/theme combinations and found a no-date account edge case; the counter section now stays hidden until a recovery date exists. Its synthetic reproduction was rerun successfully. Seven publication/hygiene tests, JavaScript syntax, CSP hashes, Preview build and whitespace checks passed. The earlier broad 14-suite baseline and unchanged Welcome checks are recorded in the preceding revision.

Registered flows use synthetic identities and mocked encrypted traffic. The hosted Preview stays guest-only under the existing build isolation. A live registered-account UAT and owner UX approval remain release checks before merge.

## Review and release

Update the same Draft PR #68 and its Vercel Preview. Request owner UX review again on the revised Preview. Keep the PR draft; do not merge or deploy Production automatically.
