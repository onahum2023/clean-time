# Track B remaining acceptance (#19, #21, #34)

These are reproducible **unexecuted** manual/live gates, not test results. Never
substitute production for the deleted staging service. Use synthetic recovery
content, disposable profiles and reachable controlled mailboxes. Record commit,
app version, deployment/backend target, browser/device versions and PASS/FAIL/
BLOCKED evidence without tokens, account emails or recovery-key screenshots.

## Isolated Auth, SMTP and ownership (#19)

1. Independently verify Preview's exact backend target and block production in the
   test browser before any account operation. Guest-only Preview is intentionally
   insufficient for this live-service test.
2. With owner-assisted controlled Gmail and non-Gmail inboxes, request one account
   verification/sign-in link per scenario. Check delivery, Spam, link expiry/use,
   canonical redirect and same/different browser return. Do not paste links/tokens
   into public reports or chat. Do not enable password sign-in to simplify QA.
3. With two test Auth sessions, attempt SELECT, INSERT, UPDATE, owner reassignment
   and DELETE across each other's known synthetic row IDs. Verify the documented
   own-row policy and encrypted-envelope guard. A mock is not RLS evidence.
4. Production SMTP configuration/delivery/redirect verification remains a separate
   owner-authorized release check. Do not change production Auth/SMTP to run it.

## Encrypted backup lifecycle (#34)

1. Fresh synthetic guest: date/type plus journal, gratitude, plan, Step 10, links
   and multiple timers. Convert via email; verify no loss or premature upload.
2. Defer key setup, reload, resume, acknowledge saved recovery key and verify first
   encrypted write/readback before the app claims backup active.
3. Simulate initial write and readback failures using browser network controls;
   verify local data/key retry material persist and retry uses the same wrapper.
4. Close the whole browser process, reopen the same persistent profile/origin,
   verify session continuation and no recovery prompt when the key is retained.
5. Start an independent empty profile; sign in, reject a wrong key, unlock with the
   saved key and verify all histories/timers. Check both local/cloud conflict
   choices with disposable synthetic state, without claiming per-timer merging.
6. Confirm network payload/isolated stored row is the v1 envelope only. Do not put
   raw content/keys into diagnostics. The existing live runner hardcodes retired
   staging and must be reviewed/reconfigured before use; never just point it at
   production. Dashboard users with no actual inbox cannot complete this flow.

## Physical Android / installed PWA (#21)

1. Record Android version, device model, Chrome version and standalone/browser mode.
   Use a synthetic profile; validate Hebrew RTL at 360px and chosen appearance.
2. Install, cold-open, fully close/reopen, use system/browser Back/Forward and test
   journal modal keyboard/focus with an external keyboard when available.
3. Load once online, reopen offline, edit all local tools/timers, then reconnect.
   Verify preservation and truthful sync status. Never clear site storage to test
   an upgrade; close all app windows so the waiting worker can activate.
4. Run meditation, background and lock the device, resume and record actual timer
   and gong behavior. Distinguish platform audio restrictions from app defects.
5. Test magic-link return into browser/installed app with owner-assisted test mail;
   distinguish a different browser/profile from trusted-device reopen.
6. For English/Russian, record native-speaker terminology/layout review separately.
   Draft languages remain production-disabled until that acceptance is complete.

No physical device, live SMTP, real Auth/RLS or native-language pass is claimed by
the local synthetic suites. Keep release-gate issues open until supporting evidence
exists. #16/#6 content, #28 PIN, #29 monitoring and #22 legacy-origin retirement stay
outside this implementation scope.
