# Phase 0 — files to add to the repo

Copy each file to the same path inside `Goldenage_website-main/`:

- `DEPLOY.md` → repo root
- `deploy/htaccess-frontend`, `deploy/htaccess-backend-root` → repo root `deploy/`
- `.github/workflows/build.yml` → repo root
- `.gitignore` → replaces the existing one (adds env/build/vendor ignores)

Then remove the committed junk before first push:
`git rm --cached backend.zip frontend/dist.zip oauthsetup.env` (move the OAuth notes into DEPLOY.md §6 — they contain no secrets, but the filename suggests otherwise).

Also fix before staging dry-run: `frontend/src/lib/api.js` line 1 logs the API URL to the console on every load — delete it.
