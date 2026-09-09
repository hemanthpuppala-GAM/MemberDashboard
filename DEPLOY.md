> **Document root:** the live site is served from `public_html/goldenagewisdom.org/` — every server path below is relative to that folder, not `public_html/`. Upload the *contents* of `dist/` (keep the `assets/` subfolder intact — zip, upload, extract), never the `dist` folder itself.

# Golden Age Wisdom — Deploy guide (cPanel, manual upload)

One codebase, two deployables:

| Part | Folder | Lives on server at | Serves |
|---|---|---|---|
| Frontend (public site + /dashboard + /admin) | `frontend/` → `dist/` | **staging:** `public_html/goldenagewisdom.org/staging/goldenage/` · **prod:** `public_html/goldenagewisdom.org/` | the React app |
| Backend (Laravel API) | `backend/` | **staging:** `public_html/goldenagewisdom.org/staging/backend/` · **prod:** `public_html/goldenagewisdom.org/backend/` | `/api/v1/*` |

Rule: **every change goes to staging first.** Production only ever receives a zip that has already been verified on staging. Never rebuild for production — promote the same artefact.

---

## 0. One-time setup

### On one team machine (or let GitHub Actions do it — see §5)
- Node 20+ and npm — `node -v`
- PHP 8.3 and Composer 2 — `php -v`, `composer -V`

### On cPanel
- PHP version selector → **8.3** for the domain.
- MySQL database + user created (cPanel → MySQL Databases). Note db name / user / password.
- cPanel **Terminal** enabled (Advanced → Terminal). Needed only for `php artisan migrate`.

---

## 1. Build the frontend

```bash
cd frontend
cp .env.example .env.production      # first time only
```

Edit `.env.production`:

| Target | `VITE_API_URL` |
|---|---|
| staging | `https://goldenagewisdom.org/staging/backend/api/v1` |
| production | `https://goldenagewisdom.org/backend/api/v1` |

Edit `vite.config.js` `base` to match where the app is served from:

| Target | `base` |
|---|---|
| staging | `'/staging/goldenage/'` |
| production | `'/'` |

Then:

```bash
npm ci
npm run build          # → frontend/dist/
```

Copy `deploy/htaccess-frontend` into `dist/.htaccess` (see §4). Zip the *contents* of `dist/` (not the folder) → `frontend-YYYY-MM-DD.zip`.

> Tip: the two targets differ only in `base` + `VITE_API_URL`. Build twice if you need both zips; label them clearly.

## 2. Prepare the backend

```bash
cd backend
composer install --no-dev --optimize-autoloader
```

Zip everything in `backend/` **except** `.env`, `node_modules/`, `storage/logs/*`, `tests/` → `backend-YYYY-MM-DD.zip`. `vendor/` **is** included — cPanel does not run Composer.

## 3. Upload (cPanel File Manager)

### Frontend
1. Go to the target folder (`public_html/goldenagewisdom.org/staging/goldenage/` or `public_html/goldenagewisdom.org/`).
2. Delete the old `assets/` folder and `index.html` (leave `backend/`, `staging/`, `.well-known/` alone).
3. Upload the zip → right-click → **Extract** → delete the zip.
4. Confirm `.htaccess` is present (File Manager → Settings → *Show hidden files*).

### Backend
1. Go to the target folder (`public_html/goldenagewisdom.org/staging/backend/` or `public_html/goldenagewisdom.org/backend/`).
2. **Keep the existing `.env`** — do not overwrite it.
3. Upload the zip → Extract → delete the zip.
4. First deploy only: copy `.env.example` → `.env` and fill in (see §6), then in **Terminal**:
   ```bash
   cd ~/public_html/goldenagewisdom.org/staging/backend   # or ~/public_html/goldenagewisdom.org/backend
   php artisan key:generate
   php artisan storage:link
   ```
5. Every deploy, in Terminal:
   ```bash
   php artisan migrate --force
   php artisan config:cache && php artisan route:cache && php artisan view:cache
   ```
6. Make sure `storage/` and `bootstrap/cache/` are writable (755 on folders is fine on cPanel).

> The backend's web root is `backend/public/`. On this host the API is reached as `/staging/backend/api/...`, so a small `.htaccess` in `backend/` forwards into `public/` — see `deploy/htaccess-backend-root`.

## 4. `.htaccess` files (in `deploy/`)

- `htaccess-frontend` → goes to `dist/.htaccess`. SPA rewrite to `index.html`, **no-cache on `index.html`**, 1-year cache on hashed `assets/*`. This is what makes a fresh upload show immediately (the old 1-hour cache is why the WhatsApp number looked stale earlier).
- `htaccess-backend-root` → goes to `backend/.htaccess`. Forwards everything into `public/`.
- `backend/public/.htaccess` already exists in the repo; leave it.

## 5. Zero-tooling option: GitHub Actions builds the zips

`.github/workflows/build.yml` builds both zips on every push to `main` (and on demand via *Actions → Build → Run workflow*, where you choose **staging** or **production**). Download the artefacts from the workflow run and follow §3. Nobody needs Node or Composer locally.

## 6. Backend `.env` checklist (staging → production differences)

| Key | Staging | Production |
|---|---|---|
| APP_ENV | `staging` | `production` |
| APP_DEBUG | `true` | **`false`** |
| APP_URL | `https://goldenagewisdom.org/staging/backend` | `https://goldenagewisdom.org/backend` |
| FRONTEND_URL | `https://goldenagewisdom.org` | `https://goldenagewisdom.org` |
| DB_* | staging database | production database |
| OAUTH_DEV_BYPASS | `false` | `false` |
| GOOGLE_/MICROSOFT_/FACEBOOK_/APPLE_* | staging OAuth client | production OAuth client |
| MAIL_* | real SMTP (cPanel mail or provider) | same |
| SESSION_DRIVER / CACHE_STORE / QUEUE_CONNECTION | `database` | `database` |

OAuth redirect URIs must be registered per environment, e.g. `https://goldenagewisdom.org/backend/api/v1/auth/google/callback`.

Queue: with `QUEUE_CONNECTION=database`, add a cPanel **Cron Job** every minute:
`cd ~/public_html/goldenagewisdom.org/backend && php artisan schedule:run >> /dev/null 2>&1`
and `php artisan queue:work --stop-when-empty` on the same schedule.

## 7. Smoke test after every upload

Staging URL prefix: `https://goldenagewisdom.org/staging/goldenage`

- [ ] `/` loads, hero + mandala render, no console errors
- [ ] `/#wisdom`, `/#about` … open the right section
- [ ] `/join` → Google sign-in → lands on `/dashboard`
- [ ] `/dashboard` shows real name; Sit & Scribe timer counts; Journal saves
- [ ] `/admin/login` → admin logs in, CMS page edit saves and appears on the public page
- [ ] API health: `GET /staging/backend/api/v1/pages` returns JSON
- [ ] Hard refresh a deep URL (e.g. `/dashboard/journal`) → no 404 (SPA rewrite working)
- [ ] Phone: hero readable, mandala tappable (≥44px targets)

## 8. Promote staging → production (cut-over day)

1. Rebuild frontend once with `base:'/'` + production `VITE_API_URL` (this is the only production-specific build). Verify it against the **staging backend** first by temporarily pointing `VITE_API_URL` at staging — optional but cheap insurance.
2. Move the current static site to `public_html/goldenagewisdom.org/legacy/` (keep 30 days).
3. Upload frontend zip to `public_html/goldenagewisdom.org/`, backend zip to `public_html/goldenagewisdom.org/backend/`, `.env` per §6, migrate.
4. Update OAuth redirect URIs to production paths.
5. Run §7 against `https://goldenagewisdom.org`.
6. Rollback = move `legacy/` contents back. Five minutes.

## 9. Where things live (for future edits)

| Change | File |
|---|---|
| Site colours / fonts | `frontend/src/theme/theme.css` (+ mirror in `theme/colors.js`) |
| Admin panel colours | `frontend/src/admin/theme/admin-theme.css`, `displayPresets.js` |
| Homepage hero | `frontend/src/components/sections/HeroSection.jsx` (photo/video/focal point are CMS fields) |
| Mandala | `frontend/src/components/mandala/`, nav mapping in `src/data/chakras.js` |
| Header / footer | `frontend/src/components/layout/Header.jsx`, `Footer.jsx` |
| Public page content | Admin → CMS → Pages (no code) |
| Member dashboard | `frontend/src/user/` |
| API routes | `backend/routes/api.php` |
