# Step 10 daily inventory — issue #16 draft

Scope: six owner-approved selections, in review-question order 6, 10, 17, 25,
31, 36. Full bank, question customization and production release are deferred.

## Content and approval

The owner confirmed Gila's content approval and reproduction permission in the
implementation chat on 1 November 2026, and requested that confirmation be
recorded in issue #16. The issue now records that confirmation; no separate
permission instrument was supplied to the implementation chat.

Authoritative wording: [NA Hebrew IP #9, Living the Program](https://na.org/wp-content/uploads/2024/05/he3109-IP-9-Hebrew.pdf),
HE-3109, Hebrew 8/05, copyright 2005 Narcotics Anonymous World Services, Inc.
The selected Hebrew text was reconciled with pages 1–2 of that PDF, rather than
the other app's transcription in the issue. The six selected prompts retain the
official words and punctuation; the first and fourth include their original
follow-up questions. The UI credits NAWS, links the source and distinguishes
Clean Time's selection from NA endorsement. Prompts use the official edition for the selected application language.

## Behavior and compatibility

- Focused mode opens one question; the alternative shows all six daily questions.
  Both use the same `inventory[date].answers` and existing `save()` pipeline.
- Language-independent IDs `na_ip9_qNN` bind answers to the six matching question
  meanings across editions. New records use `questionnaireVersion: na-ip9-daily-v1`. Additions to
  legacy records retain their original version and add `dailyQuestionnaireVersion`.
  Unknown fields and answers are preserved. Legacy text answers can be read in a
  separate expandable section without inventing their missing original prompts.
- Typing saves immediately. Skip changes position only. Finish accepts empty or
  partial entries and writes `finishedAt`; reopen or editing clears that marker.
  Saved status and finished status are separate.
- Mode and position per day are device-local under `cleantime-inventory-view`;
  they contain no answers, do not update recovery timestamps and do not sync.
  Device reset/sign-out clears this presentation state.
- Complete recovery-state encryption/export continues to include inventory fields.
  No backend schema, SDK, sync policy, telemetry or production settings change.

## Reproduction

Use only synthetic fixtures, with a loopback server on port 8765:

```sh
QA_BASE_URL=http://127.0.0.1:8765 QA_CHROMIUM_EXECUTABLE=/usr/bin/chromium QA_NO_SANDBOX=1 node tests/run-qa.js
node scripts/repository-hygiene.js
node --test tests/repository-hygiene.test.js
VERCEL_ENV=preview node scripts/build-vercel.js
git diff --check
```

`inventory-qa.js` covers switching mid-answer, exact question order, local position,
skip, partial finish/reopen/reload, day separation, legacy records, 320/360/508/1280px
fit, offline edits, quota failures/retry, browser errors and external requests.
`encryption-qa.js` additionally restores a selected answer and finish state from an
encrypted synthetic backup, edits it, verifies decryption and checks for plaintext
leakage. `offline-qa.js` verifies a structured answer and finish after offline reload.
Existing upgrade, export, sync and security suites remain required.

## Review before merge

Owner/Gila should check the official text in all three languages, question order, manageable
daily flow, skip/finish and both views in the Preview. Physical mobile keyboard
and installed-PWA checks remain manual. Preview intentionally disables live
account/backup access; encrypted restore evidence uses the synthetic SDK, not
production users. No production merge or rollout is authorized by this draft.

## Synthetic validation — 1 November 2026

All browser suites: **1,603 passed, zero failed suites**, including 24 inventory,
146 encryption, 21 offline and 57 upgrade checks. JavaScript syntax, CSP hashes,
`git diff --check`, repository hygiene, seven hygiene/build guard tests and the
Preview static build passed. Focused/all-question Hebrew layouts were visually
inspected at 360px with synthetic/empty entries. Screenshots remain outside Git.


## Official editions addendum — 1 November 2026

The owner explicitly confirmed that reproduction permission covers the six selected
questions in **all three editions**. Issue #16 records that confirmation. Owner/Gila
content acceptance and explicit merge review remain required.

| Language | Official source / edition | Copyright |
| --- | --- | --- |
| Hebrew | [HE-3109, Hebrew 8/05](https://na.org/wp-content/uploads/2024/05/he3109-IP-9-Hebrew.pdf) | 2005 NAWS |
| English | [EN-3109, English 3/21](https://na.org/e-lit/ip-9-living-the-program/) | 1983 NAWS |
| Russian | [RU-3109, Russian 2/12](https://na.org/e-lit/ip-9-%D0%B6%D0%B8%D1%82%D1%8C-%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%BE%D0%B9/) | 2012 NAWS |

English and Russian questions were taken directly from the NAWS edition pages,
which identify themselves as the complete pamphlet text. They were matched by
meaning within the five corresponding sections, preserving the approved review
order below. These review numbers are not printed question numbers in IP #9;
multiple short subquestions in the pamphlet are grouped in the app's review.
Original follow-up questions remain with the self-kindness and harm questions.
No question was translated from another language by Clean Time.

| Review selection | Shared ID | Corresponding question subject in all editions |
| --- | --- | --- |
| 6 | `na_ip9_q06` | Kindness to self, including how |
| 10 | `na_ip9_q10` | Sharing experience, strength and hope |
| 17 | `na_ip9_q17` | Learning about oneself today |
| 25 | `na_ip9_q25` | Harm to self or another, including what |
| 31 | `na_ip9_q31` | Fear in one's life today |
| 36 | `na_ip9_q36` | Consciously remembering one's choice today |

The Hebrew version is unchanged. English and Russian use each official edition's
wording and punctuation, even where the editions differ in phrasing. Prompt and
page direction follow Hebrew RTL / English-Russian LTR; answer text uses `dir=auto`.
The source link, title, copyright year and attribution follow the selected edition.
Application controls have English/Russian UI text; these are separate from the
official question text and retain the repository's native-speaker QA convention.

Compatibility with the earlier draft: `na_ip9_he_2005_qNN` answers are read through
as aliases for the corresponding neutral ID. Opening entries or switching language
never rewrites recovery data, timestamps or completion. Editing writes the neutral
ID; original aliases/versions and unknown fields remain preserved. A canonical
empty answer takes precedence over an old nonempty alias. The separate
`dailyQuestionnaireVersion` identifies new edits as `na-ip9-daily-v1`.

`inventory-language-qa.js` covers every selected ID/order in all three languages,
official first/closing prompts, source links, direction, mobile layout, earlier-draft
aliases, canonical precedence (including empty answers), mid-answer switching and
unchanged recovery bytes/completion across repeated language changes.

Localized draft validation: **1,646 browser checks passed, zero failed suites**,
including all 43 new language/alias/completion checks. The complete regression
suite was rerun after localization. Syntax/CSP, Preview build, repository hygiene
and all seven hygiene/build guard tests passed. Hebrew, English and Russian mobile
layouts were inspected at 360px. All test data and screenshots are synthetic.
