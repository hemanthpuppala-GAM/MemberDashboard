# Your private preview — how to see the changes

Nothing here touches the team's repo or their staging. You build a copy and upload it to a separate folder.

## One-time
1. Duplicate the frontend: copy `Goldenage_website-main/frontend/` → `goldenage-preview/` (anywhere on your machine).
2. Create `goldenage-preview/.env.production` with one line:
   `VITE_API_URL=https://goldenagewisdom.org/staging/backend/api/v1`
3. In cPanel File Manager create the folder `public_html/goldenagewisdom.org/staging/preview/` (the site root is `public_html/goldenagewisdom.org/`, not `public_html/`).

## Every phase
1. Download the phase zip from chat and extract it. Copy everything under its `frontend/` **over** `goldenage-preview/` (overwrite when asked).
2. In a terminal:
   ```
   cd goldenage-preview
   npm install        # first time only
   npm run build
   ```
3. Copy `deploy/htaccess-frontend` (from the Phase 0 zip) into `dist/.htaccess`.
4. Zip `dist/`, upload the zip to `public_html/goldenagewisdom.org/staging/preview/`, Extract, then move the extracted contents up so `index.html` and the `assets/` folder sit directly in `preview/` (delete the old `assets/` first). Uploading files one by one flattens `assets/` and gives a blank page.
5. Open **https://goldenagewisdom.org/staging/preview/** — hard-refresh once (Ctrl/Cmd+Shift+R).

Login works (same staging API), so you can check /dashboard and /admin too.

## When you're happy
Send the team the same `frontend/` overlay files; they drop them into the real repo, set `base` back to `'/staging/goldenage/'`, and go through DEPLOY.md.
