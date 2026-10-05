# Clean Time — companion visual pass

2026-10-05 · local version `2026.10.05.3`. No commit, push, PR or deployment.

This pass changes presentation only, layered on the existing uncommitted work. The inline application script was compared against the pre-pass snapshot: identical except for APP_VERSION. Product copy, flows, storage and Supabase logic are unchanged.

## Page treatments

| Page | Cue | Treatment |
| --- | --- | --- |
| Today | Sunrise and horizon | Small warm line drawing above the counter; nearby spacing tightened to keep daily actions accessible. |
| Gratitude | Two leaves | Soft olive/sage header wash. |
| Daily plan | Winding path and stepping marks | Warm practical green header wash. |
| Meditation | Seated person with crossed legs | Compact 64 × 56px line illustration and muted sage/teal header wash. Duration label aligns with the RTL form language. |
| Step 10 / daily inventory | Crescent and reflection lines | Slightly deeper muted green/teal header wash. |
| About | Open hand and small light | Gentle warm sand header wash. |
| Resources | Open book | Quiet green header wash; Edit stays beside the heading. |
| Journal | Notebook | Soft warm neutral header wash, consistent with the other writing pages. |

Shared Assistant typography, warm base palette, component styles, controls and navigation remain. Each themed page has one primary decorative drawing. No extra visuals were added to Settings, Tools or onboarding. Header colors are deliberately subtle and do not recolor actions or override the saved color preference.

## Local assets and files

- `index.html`: shared theme CSS and eight original inline SVG drawings. Decorative SVGs use `aria-hidden="true"`, `focusable="false"`, and ignore pointer events. No separate image files, font additions, dependencies or remote services.
- `docs/COMPANION-VISUAL-REVIEW.md`: this report.
- Ignored `.playwright-mcp/theme-review/`: screenshots, light/dark contact sheets, JSON results and the two isolated-browser QA runners. These are local review evidence, not application assets.

Other dirty files and untracked assets/tests were present before this pass and were preserved.

## QA

Executed against the existing localhost server at `http://127.0.0.1:8765` in an isolated headless Chrome browser, with synthetic data and all external requests blocked.

- Existing browser assertions: **103 passed** (`local-qa`: 83, `edge-qa`: 12, `sync-qa`: 8). Includes guest flows, CRUD, history, timer/gong, malformed storage protection, and mocked cloud/auth behavior. The existing suite also covers all ten screens at 320, 360, 390 and 1280px.
- Theme checks: **48 page/viewport/theme combinations passed** across all eight pages at 320, 360 and 390px in both light and dark modes. RTL, Assistant typography, one decorative SVG per page, no horizontal overflow and no illustration/control intersections.
- Visual inspection: all eight pages at 360px in light and dark modes. Compact headers, legible title wrapping, consistent icon weight, and main controls remain prominent.
- Contrast: measured headings, secondary copy and visible form/control text across 16 page/theme combinations with the default teal preference. All measured pairs meet **4.5:1**; minimum **4.54:1**. This is a focused contrast check, not a full accessibility audit or a physical-device test.
- Observed guest requests: local document, Assistant font, existing gong, and existing icon only. No external asset/font request and no new asset request.
- Pre-pass versus post-pass application script comparison and `git diff --check` passed.

## Product input

No design decision blocks review. Active users should assess whether the restrained themes feel personal enough, especially the seated figure and sunrise. Final Step 10 questions remain a separate existing product decision; this pass does not change them. Physical-device rendering and subjective response to the artwork remain manual review items.
