# זמן נקי (Clean Time)

אפליקציה חינמית בעברית למי שנמצא/ת בהחלמה מהתמכרות. סופרת את הזמן הנקי, ועוזרת לחיות יום אחד בכל פעם: תכנית להיום, יומן, הכרת תודה וקישורים לקריאות. בלי פרסומות, בלי מעקב, ובלי צורך בהרשמה.

A free Hebrew app for people in recovery from addiction. It counts your clean time and helps you take it one day at a time. No ads, no tracking, no account needed.

**Open the app: https://clean-time.app**

> Not affiliated with or endorsed by Narcotics Anonymous or NA Israel.
> This app is not a medical or emergency service. NA Israel info line: 033-747474.

## What's inside

**Clean time (זמן נקי).** Your clean time since the date you choose. Tap the counter to switch between years, months and days, total days, or hours, minutes and seconds.

**Today (היום).** The clean-time counter and direct access to your daily recovery tools.

**Daily plan (התכנית שלי להיום).** One checklist per calendar day. Add, edit, delete and check items. Each new day starts empty; previous plans remain accessible.

**Journal (ככה זה עכשיו).** A private place to write how things are right now. It saves as you type.

**Gratitude (הכרת תודה).** Individual entries grouped by day, newest first. Add throughout the day, edit or delete, and revisit earlier days.

**Meditation (מדיטציה).** A simple countdown with pause, resume, reset and a local gong at the start and end. No content library or history.

**Daily inventory / Step 10 (חשבון נפש יומי / צעד 10).** An autosaved daily reflection with previous-day access. Final questions are pending; optional question slots are explicitly temporary.

**About (אודות).** Purpose, guest mode, optional backup, and privacy, accessible from the main navigation.

**Readings (קריאות).** Quick links to the daily reading, NA Israel meetings, literature and the NA info line. You can add your own links.

**Personal links (הקישורים שלי).** A private, flat list under Tools. Save a title, an HTTPS or telephone URL, and an optional note; edit, delete or open each link. Guest bookmarks stay on the device; signed-in bookmarks use the existing personal backup.

## Your privacy

- You don't need an account. Guest onboarding asks only for a start date and recovery type. Without an account, data stays in this device's browser.
- Registered accounts use email magic links. Once you save your recovery key and activate encrypted backup, the complete recovery state is encrypted on your device before sync. The stored cloud copy is not readable from Supabase alone without the encryption key. This guarantee excludes device compromise or malicious JavaScript delivered in the future. Email and minimal authentication/sync metadata remain available. Legacy backups remain in their previous format until migration is completed.
- New devices need the recovery key. Clean Time cannot recover encrypted cloud content without it or a working trusted device. Local data and the trusted device key remain stored on your device for this release.
- There are no ads, no analytics and nothing is sold or shared.
- Device and cloud-data deletion are available from settings/My Account. Cloud deletion requires an unlocked backup and writes an encrypted empty state; it does not delete the login account. See [encryption and migration notes](docs/ENCRYPTION-QA.md) for release status and limitations.

## How to use it

Open the app in your phone's browser. On Android, choose "Install app" (התקנת אפליקציה) to add it to your home screen.

## Local review

No build or new dependencies are required. From the repository:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765`. See [the UX update and UAT report](docs/UX-1.0-UAT.md) for storage changes, automated QA, and remaining manual checks.

## Feedback

This app was built for one person in recovery and is growing from there. Feedback is welcome, especially from people in recovery. Please don't share personal recovery details in public issues.

## License

AGPL-3.0. See LICENSE.
