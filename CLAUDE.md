# זמן נקי (Clean Time)

A small Hebrew (RTL) web app: a clean time counter for someone in NA recovery.

- Single static `index.html` with inline CSS/JS. No build step, no dependencies.
- `manifest.webmanifest` plus icons (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) enable Android "Install app".
- All user data lives in `localStorage` under the key `cleantime-he-v1`. Changing the shape of saved data needs a migration in `load()`, which merges saved data over a deep copy of `DEFAULT`. A version flag such as `linksV` must not go in `DEFAULT`, or the migration never runs.

## Screens (bottom tabs: זמן נקי | תכנית | יומן | תודה | קריאות, plus settings from the gear icon)

Tab labels are short so five fit at 360px. The full name is the screen heading.

- **Counter** (`#counter`): clean time since `date`/`time`. Tapping it cycles `mode` (0 y/m/d, 1 days, 2 h/m/s).
- **Planner** "רק להיום תהיה לי תכנית" (`#planner`): today's to-do list only. A new local date starts empty. A 1s timer and `visibilitychange` switch it to the new day after midnight without a reload.
- **Journal** "ככה זה עכשיו" (`#journal`): entries newest first. The full-screen editor (`#jEditor`) autosaves while typing (debounced) and also saves on close, `pagehide` and when the app is hidden. Empty entries are discarded. It pushes a history state so Android back closes the editor instead of leaving the app.
- **Gratitude** "הכרת תודה" (`#gratitude`), **Readings** "קריאות" (`#readings`), **Settings** (`#settings`, includes "מחיקת כל הנתונים").

## Data keys (inside `cleantime-he-v1`)

- `name`, `date` (YYYY-MM-DD), `time`, `from`, `color`, `mode`
- `gratitude`: `[{id, text, ts}]`
- `links`: `[{id, title, url}]`, plus `linksV` (currently 2; not in `DEFAULT`)
- `plans`: `{ "YYYY-MM-DD": [{id, text, done}] }`, keyed by the phone's local date. Past days are kept but only today is shown. A day's key is removed when its list becomes empty.
- `journal`: `[{id, text, created, updated}]`, timestamps in ms

New ids come from `uid()`, which is unique even within one millisecond. Delete-by-id depends on this.
- Deployed on Vercel. Every push to `main` redeploys production automatically.
- The main user is on Android, so the UI must work well at 360px width. Check layout at that width before committing.
