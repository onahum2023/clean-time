# Device-local appearance and private feedback (#36, #27)

Stacked after #35 under Track A #37. Settings offers the existing appearance plus sage/sand and self-hosted Assistant / installed Arial / system serif. Choices preview immediately, persist before app styling on reload and reset to the original defaults. Fonts use system fallback when unavailable; no remote font or tracking request is added. Both themes retain coherent foreground/focus colors. Preferences live in `cleantime-he-appearance`, outside recovery state and encrypted sync. A storage failure is visible without discarding recovery data.

Home has a small separate Feedback action below the daily list. Mailto supplies only a static subject, never recovery state or device diagnostics. Hebrew copy discourages sensitive details, exposes a selectable address when no mail app opens and offers copy with an explicit fallback for denied/unavailable clipboard.

Validation: complete synthetic Chromium regression **687 checks** before two additional focused assertions/contrast extensions; final focused appearance suite **56 checks** and registered upgrade **56 checks**. The additional checks verify every curated background/font in both themes meets muted-text contrast >=4.5:1 and a registered equal-state account changes preferences without recovery rewrite/upload. Mobile captures at 320/360/390px light/dark were reviewed; corrected sage contrast is 4.94:1 in light and 7.60:1 in dark. Syntax and diff whitespace pass. Physical mobile mail-client/download/PWA behavior and live staging accounts are not implied by these synthetic tests.

Owner can review/revise the curated palette/fonts in this PR; cross-device preference sync is deliberately absent as scoped by #37. No production changes or issue closures.
