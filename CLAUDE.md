# זמן נקי (Clean Time)

A small Hebrew (RTL) web app: a clean time counter for someone in NA recovery.

- Single static `index.html` with inline CSS/JS. No build step, no dependencies.
- `manifest.webmanifest` plus icons (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) enable Android "Install app".
- All user data lives in `localStorage` under the key `cleantime-he-v1`. Changing the shape of saved data needs a migration in `load()`, which merges saved data over `DEFAULT`. A version flag such as `linksV` must not go in `DEFAULT`, or the migration never runs.
- Deployed on Vercel. Every push to `main` redeploys production automatically.
- The main user is on Android, so the UI must work well at 360px width. Check layout at that width before committing.
