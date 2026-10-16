# Localization foundation (#45)

Hebrew remains the default/RTL source language. `assets/i18n.js` owns device-local
language selection, locale/direction, explicitly marked static UI strings and
dynamic UI translation. `assets/messages.js` centralizes draft catalogs. The same
interface handles Hebrew, English and Russian—there are no parallel screens.

English has a draft for every extracted static/dynamic UI message. Russian has a
partial draft catalog and falls back to draft English for missing messages. Its
completion is a separate follow-up; do not describe this PR as completed Russian
translation. New languages/catalog entries must receive linguistic review.

All three language choices are enabled on production and Preview. The compact top
selector (`En | עב | рус`) is present from welcome through setup and every main
screen. Its order stays left-to-right; the current choice is bold and announced
as pressed. Language preference is independent of backend availability. Russian
still has English fallback for missing messages; linguistic review/completion
remain tracked in #45 rather than disabling the visible controls. No native
translation-quality approval is claimed here.

Only explicit UI nodes/expressions are translated. Journal, gratitude, plan,
Step 10, custom links/labels, IDs and category codes are not translated or rewritten.
Language changes save only `cleantime-language` and reload to apply all UI/locale
choices; they do not stamp recovery data or trigger an upload. Export excludes
device language preference. Dates use the selected locale; calendar storage keys
and recovery dates remain ISO/language-independent.

Switching language while guest/account setup contains entered fields requires an
explicit discard confirmation before saving the language or reloading. Canceling
keeps every primary/secondary field and the current language intact. No recovery
drafts are copied into additional browser stores.

Existing Hebrew built-in recovery types remain compatibility scalars, while the
timer model uses stable category codes. User-defined labels and resource titles
remain verbatim even if they happen to equal a UI string. Known built-in resource
labels can be translated only when ID/title/URL still match the default resource.
Daily reading is labeled Hebrew for non-Hebrew UI; external content is never
represented as translated. Standalone public About/Privacy remain Hebrew and are
labeled accordingly in draft English. No remote translation/font service or new
dependency is introduced.

## Validation and limits

`i18n-qa.js` checks default Hebrew, every extracted English message, three-language
switch/persistence/direction, unchanged recovery bytes, verbatim user text, dates,
360px Home/Settings, production language switching/persistence and synthetic registered encrypted
activation/trusted reload in English and Russian. The Hebrew regression suite
remains required. Synthetic screenshots are in ignored `.playwright-mcp/track-b/`.

English/Russian native-speaker review, complete Russian copy/plurals, physical
font rendering, assistive technology and real Auth/email continuation remain manual
release requirements. Desktop technical checks cannot approve recovery terminology.
Keep #45 open for those gates and the Russian completion work.

Final review corrections: legacy guest/account option values are pinned before
translating their display text. Duplicate-timer checks compare persisted category
and trimmed custom-label identity; translated category names are presentation
only. Fresh onboarding and the same default/custom `Drugs` timer fixture are
covered in all three languages. Backend config loads before localization. Backend origin restrictions stay
separate from language selection on all hosts. Reading-editor labels and the
last-timer tooltip also pass through the catalog.
