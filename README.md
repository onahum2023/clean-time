# זמן נקי (Clean Time)

אפליקציה חינמית בעברית למי שנמצא/ת בהחלמה מהתמכרות. סופרת את הזמן הנקי, ועוזרת לחיות יום אחד בכל פעם: תכנית להיום, יומן, הכרת תודה וקישורים לקריאות. בלי פרסומות, בלי מעקב אחר פעולות החלמה, ובלי צורך בהרשמה.

A free Hebrew app for people in recovery from addiction. It counts your clean time and helps you take it one day at a time. No ads, no tracking, no account needed.

**Open the app: https://clean-time.app**

The canonical production origin is `https://clean-time.app/`; the www domain redirects to it with HTTP 308. Public [About](https://clean-time.app/about/) and [Privacy](https://clean-time.app/privacy/) pages and a short initial-HTML introduction work without JavaScript. Interactive recovery tools require JavaScript. These public pages ship with SEO/GEO Phase 1 after its approved production release.

> Not affiliated with or endorsed by Narcotics Anonymous or NA Israel.
> This app is not a treatment product, medical or emergency service. NA Israel info line: 033-747474.

## What's inside

**Clean time (זמן נקי).** Your clean time since the date you choose. Signed-in Home shows the personalized greeting once, with the compact primary duration and date. Guest Home retains its optional secondary summary. In Settings → Counters and views, open “All counters and views” to switch between years, months and days, total days, or hours, minutes and seconds, and to choose the counter presentation.

**First visit.** Welcome introduces the app with its existing logo and Hebrew wordmark, a short purpose/origin paragraph and four non-interactive feature explanations before the entry actions; **מתחילים** opens a separate setup asking only for a recovery date and type. No name, email or phone is required. Existing configured users open Today. Native date pickers show a Hebrew confirmation with the month written out. About/privacy is available before setup.

**Today (היום).** A compact recovery summary and four daily cards in a 2×2 grid followed by a full-width Step 10 card, all directly accessible in order: daily reading, Daily Plan, Gratitude, Journal and Step 10. Counter presentation controls live in the optional counter detail view reached from Settings. Recovery Tools, About and shared Settings/Account stay in the footer. Feedback is reached from About.

**Daily plan (התכנית שלי להיום).** One checklist per calendar day. Add, edit, delete and check items. Each new day starts empty; previous plans remain accessible.

**Journal (ככה זה עכשיו).** A private place to write how things are right now. It saves as you type.

**Gratitude (הכרת תודה).** Individual entries grouped by day, newest first. Add throughout the day, edit or delete, and revisit earlier days.

**Meditation (מדיטציה).** A simple countdown with pause, resume, reset and a local gong at the start and end. No content library or history.

**Daily inventory / Step 10 (חשבון נפש יומי / צעד 10).** An autosaved daily reflection with previous-day access. The current release uses a concise free-text reflection; the final structured question set is still being designed.

**About (אודות).** Purpose, guest mode, optional backup, and privacy, accessible from the main navigation.

**Readings (קריאות).** Quick links to the daily reading, NA Israel meetings, literature and the NA info line. You can add your own links.

**Personal links (הקישורים שלי).** A private, flat list under Tools. Save a title, an HTTPS or telephone URL, and an optional note; edit, delete or open each link. Bookmarks stay on the device and join the complete recovery-state backup only after encrypted backup is activated.

## Your privacy

- You don't need an account. Guest onboarding asks only for a start date and recovery type. Without an account, data stays in this device's browser. Local recovery data is not encrypted at rest in this release; cloud-backup encryption does not extend to browser storage or the unencrypted JSON export.
- Registered accounts use email magic links. Once you save your recovery key and activate encrypted backup, the complete recovery state is encrypted on your device before sync. The stored cloud copy is not readable from Supabase alone without the encryption key. This guarantee excludes device compromise or malicious JavaScript delivered in the future. Email and minimal authentication/sync metadata remain available. Existing legacy backups are migrated only through the guarded recovery-key flow.
- Email verification opens recovery-key setup; it does not activate backup. You may finish later and continue locally, with a reminder on Today/My Account. Settings and My Account share the same backup status. Backup is active only after encrypted write/readback verification; failures retain local data and retry material. A later sync error retains the last verified backup status.
- New devices need the recovery key. Clean Time cannot recover encrypted cloud content without it or a working trusted device. Local data and the trusted device key remain stored on your device for this release.
- There are no ads and personal information is not sold or shared for commercial purposes. Cookie-free Vercel Web Analytics measures public visits, fixed application screens, and allowlisted aggregate product actions, including coarse guest/account usage. Recovery content and account identifiers are excluded. See [Analytics validation](docs/ANALYTICS-QA.md).
- Device and cloud-data deletion are available from settings/My Account. Cloud deletion requires an unlocked backup and writes an encrypted empty state; it does not delete the login account. See [encryption and migration notes](docs/ENCRYPTION-QA.md) for design, migration and limitations.

## How to use it

Open the app in your phone's browser. After one successful connected load, its static shell and local tools are available offline. Updates wait until all app windows close; a notice explains when one is ready. On Android, choose "Install app" (התקנת אפליקציה) to add it to your home screen.

## Local review

No build or new dependencies are required. From the repository:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765`. See [current Track B isolation](docs/TRACK-B.md), [remaining release QA](docs/TRACK-B-RELEASE-QA.md), and [repository hygiene](docs/REPOSITORY-HYGIENE.md). The [Welcome/backup/date report](docs/WELCOME-BACKUP-UAT.md) preserves historical PR #33 evidence; its staging backend is retired.

## Local preferences and portability

Settings offers a small device-local background/font palette, reset to the existing appearance, small milestone key-tag badges on Home (hideable in Settings), and confirmed recovery-date/time updates that retain all history. Preferences require no account and appearance/milestone choices do not sync. A full portable JSON download includes legacy/unknown recovery fields but excludes login/key stores. The export is unencrypted; keep the file private.

Track A delivery/reconciliation and acceptance boundaries: [docs/TRACK-A.md](docs/TRACK-A.md), [offline checks](docs/OFFLINE-QA.md). PIN is deferred and final Step 10 questions remain pending owner content.

## Feedback

This app was built for one person in recovery and is growing from there. Feedback is welcome, especially from people in recovery. Please don't share personal recovery details in public issues.

## License

AGPL-3.0. See LICENSE.
