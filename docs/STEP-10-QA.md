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
Clean Time's selection from NA endorsement. Prompts remain in official Hebrew.

## Behavior and compatibility

- Focused mode opens one question; the alternative shows all six daily questions.
  Both use the same `inventory[date].answers` and existing `save()` pipeline.
- Namespaced IDs `na_ip9_he_2005_qNN` bind answers to these exact prompt meanings.
  New records use `questionnaireVersion: na-ip9-he-2005-daily-v1`. Additions to
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

Owner/Gila should check the exact official Hebrew text, question order, manageable
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
