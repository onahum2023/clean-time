# Complete Step 10 daily inventory — issue #16 / draft PR #71

The owner’s complete-inventory specification supersedes the earlier six-question
and dual-view design. Five question-section screens follow the original NA IP #9
statements, then a sixth screen contains the original prayer and personal notes.
No production merge/deployment is authorized.

## Official content and expanded permission

On 1 November 2026 the owner explicitly confirmed: **the complete 36-question
inventory, all five section statements and closing prayer/material in all three
official editions are covered by reproduction permission**. Issue #16 records the
exact expanded confirmation separately from the earlier six-question permission.
This is an owner confirmation; no separate permission instrument was supplied.

| Language | Authoritative edition | Copyright |
| --- | --- | --- |
| Hebrew | [HE-3109, Hebrew 8/05](https://na.org/wp-content/uploads/2024/05/he3109-IP-9-Hebrew.pdf) | 2005 NAWS |
| English | [EN-3109, English 3/21](https://na.org/e-lit/ip-9-living-the-program/) | 1983 NAWS |
| Russian | [RU-3109, Russian 2/12](https://na.org/e-lit/ip-9-%D0%B6%D0%B8%D1%82%D1%8C-%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%BE%D0%B9/) | 2012 NAWS |

`assets/inventory-content.js` contains the official localized statements, questions
and prayer. English/Russian were checked against NAWS’s full-text edition pages;
Hebrew was checked against the official PDF. Original spelling, punctuation and
wording are retained; app controls/guidance are separate UI copy.

The pamphlets do **not** print question numbers. The owner-approved 36-group
organization preserves every original subquestion, in order, without inventing
headings or shortening statements:

| Section | Stable numeric suffixes | Answer fields |
| --- | --- | --- |
| 1 | 01–07 | 7 |
| 2 | 08–12 | 5 |
| 3 | 13–21 | 9 |
| 4 | 22–29 | 8 |
| 5 | 30–36 | 7 |

Composite Q7 includes good-day/happy/serene; Q18 includes amends/owe (Russian’s
original second clause asks about fully repaying); Q35 includes happy/peaceful.
All follow-ups are retained, including Q3 how, Q6 how, Q9 where, Q25 what and Q27
impact. The meanings of the earlier selected IDs 6/10/17/25/31/36 are unchanged.
Source titles/links and copyright attribution follow the app language.

## Flow and storage

- Each section shows its complete statement and every corresponding question.
  Optional fields start at two rows and expand. Next/Previous need no answers.
  No mode selector, single-question navigation, hiding, favorites or scores.
- The closing screen has the official prayer and a separate optional `notes`
  field on the same dated inventory. Older `summary` content remains separately
  editable on that screen; it is never moved into notes or discarded.
- All recovery changes use existing `save()`. Finish writes `finishedAt` only on
  screen six, including when all answers are blank. Autosave precedes Finish.
  Finished entries open a calm confirmation with review/print/download actions.
  Review alone preserves finished state; editing returns the same entry to draft.
- Partial history entries can also be printed/downloaded. Blank answers are
  explicitly marked unanswered; no answers are inferred.
- Neutral IDs `na_ip9_qNN` are reused. Earlier `na_ip9_he_2005_qNN` values remain
  read-through aliases. A canonical empty string takes precedence over an alias.
  Unknown/legacy answers remain readable on the closing screen and in output.
- New records use `questionnaireVersion: na-ip9-full-v1`. Existing record versions,
  creation times, aliases and unknown fields remain intact. Structured edits and
  notes stamp `dailyQuestionnaireVersion: na-ip9-full-v1` additively.
- Device-local `cleantime-inventory-view` schema 2 stores section per date and
  dismissed guidance. Earlier six-question cursors are mapped to their full section
  without touching answers. Mode/cursor changes do not sync or alter timestamps.
  Language reload retains the dated inventory/section and review state.
- Device reset/sign-out clears the local presentation preferences. No change to
  backend schema, encryption, conflict policy or recovery-action telemetry.

## Print and local PDF

`assets/inventory-output.js` receives a snapshot of the current dated inventory.
Both outputs use the same complete document model: title, ISO date, five full
statements, all 36 questions and answers, prayer, notes, preserved legacy text and
edition-specific source attribution. No buttons, navigation or unrelated app
content is printed. User text is inserted with `textContent`, never interpreted
as HTML. Paragraphs wrap, long tokens split, and page breaks retain questions with
at least an answer line and statements with their first question.

Print uses semantic HTML and print CSS. **Download PDF creates an actual local
A4 PDF**, with browser-shaped Hebrew/Cyrillic/mixed-direction glyphs rasterized at
2× resolution, then packaged into PDF pages. No service, external font or PDF
library is loaded. Static content/output code is explicitly in the publication
allowlist and offline shell cache.

**PDF limitation:** downloaded pages are raster images: readable/printable, but
not searchable, selectable or tagged for PDF screen readers. The HTML print
route provides semantic/selectable content and can use the browser’s Save as PDF.
This distinction is an owner-review limitation, not an encrypted PDF guarantee.
Export privacy copy states that downloaded files can contain readable personal
information outside the app’s encrypted-backup protection. Nothing is auto-shared,
uploaded, logged or sent in analytics. PDFs contain no PDF JavaScript.

## Synthetic verification and independent QA

Reproduce with a loopback server at 8766 (override ports as needed):

```sh
QA_BASE_URL=http://127.0.0.1:8766 QA_CHROMIUM_EXECUTABLE=/usr/bin/chromium QA_NO_SANDBOX=1 node tests/run-qa.js
node scripts/repository-hygiene.js
node --test tests/repository-hygiene.test.js
VERCEL_ENV=preview node scripts/build-vercel.js
git diff --check
```

The dedicated inventory suites exercise all 36 IDs/wording/order, five statements,
all six screens, blank/partial navigation, section resume/reload, notes, language
switches, finish/review/edit, old aliases/versions/summaries, quota failures/retry,
expanding fields, 320/360/508/1280px fit, real PDF downloads, complete print output,
A4 pagination, safe literal script-like text and absence of external requests.
Existing encryption/offline/sync suites verify notes/answers/status through mocked
encrypted restore and real offline reload; other recovery tools remain covered.

An independent agent reviewed original content and ran separate synthetic browser,
download and pagination checks in all three languages. Findings fixed before
publication: missing Hebrew היום in Q35, sticky-language-bar clipping on section
navigation, and PDF orphan questions/section statements. Final independent checks
found zero orphan headings/questions across six language/title combinations,
valid real A4 PDF downloads, no external requests and unchanged finished bytes
when reviewing. The raster-PDF limitation above remains explicit.

## Owner acceptance before merge

Review exact official content and the full daily experience with the owner/Gila.
Check section 1, longest section 3, closing/notes and finished state on a physical
mobile device, including keyboard, screen reader and installed-PWA behavior.
Review representative print/downloaded PDFs and the raster-PDF limitation.
Preview is intentionally guest-only; live account/backup access is disabled.
Encrypted registered-user evidence uses synthetic SDK mocks, never live users.

## Validation record — 1 November 2026

All browser suites pass: **1,725 checks** across the full regression run and
affected-suite reruns. Legacy test journeys were updated to visit the closing
screen and distinguish new notes from retained summaries. Dedicated suites passed
33 inventory, 84 multilingual and 28 output checks; encryption passed 147, offline
21 and upgrade 57. Syntax/CSP, diff checks, Preview build, repository hygiene and
all seven hygiene/build guard tests passed. Independent QA passed after its
content, navigation and pagination findings were corrected.

Synthetic review artifacts are kept outside Git: mobile section 1, section 3,
closing and finished screenshots; a representative HTML-print PDF and actual
downloaded PDF; and a separate independent-QA report. No real recovery data was
read or used. Physical-device/owner acceptance and the PDF limitation above remain
review gates, not claims of production acceptance.
