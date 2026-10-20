# Going live — runbook

The new app replaces the old static site at **goldenagewisdom.org** with one instant, reversible switch.

## How it works
- The **production build** (made for the address `goldenagewisdom.org/`) is uploaded to
  `public_html/goldenagewisdom.org/app/`, beside the old site. Nobody sees it until the switch.
- The **switch** (Admin → **Go live**, or `php artisan site:go-live --now`):
  1. runs a final Supabase sync, so no sign-up made on the old site is lost;
  2. backs up the database (`db:backup`);
  3. saves the site's `.htaccess` as `.htaccess.before-live` and writes
     `backend/resources/go-live/htaccess-live` in its place. That file:
     - sends every address into `app/`;
     - redirects the old addresses (`/peace` and `/circle` → `/meditation`, `/desk` → `/support`,
       `/film` and `/launch` → `/`, the old `.dc.html` names);
     - leaves `/staging/` and `/.well-known/` alone;
     - keeps the old security headers and CSP.
- After the switch:
  - Google sign-in and email links point at the main address (`GoLive::frontendUrl()`);
  - the nightly Supabase sync stops;
  - the staging preview stays online for testing, marked `noindex`.
- **Roll back** (Admin → Go live, or `php artisan site:go-live --rollback`) puts `.htaccess.before-live`
  back. Nothing in the database changes.
- The old site's service worker is retired by `frontend/public/sw.js`. Returning visitors' browsers
  fetch it as an update, clear the old caches and reload into the new site.

## Before the day
1. **cPanel cron must use `/usr/local/bin/php`.** Without it a scheduled time never fires.
   "Go live now" still works.
2. GitHub → Actions → **Build deploy zips** → Run workflow → **production**. This uploads to `app/`.
   Run it again whenever main has changed. The checklist warns when staging is newer.
3. Open Admin → Go live and check the list. Red items block the switch; amber ones are reminders.
4. Optional rehearsal: Go live now → open the site → Roll back.

## After going live
- Every change: merge, which deploys staging and the shared backend. Then **Run workflow → production** to update the live site (frontend only; it can run while staging deploys).
- The old site repo's deploy workflow (goldenagewisdom-redesign) can stay as it is. Its files are
  no longer served, but **never upload its `htaccess.txt` as `.htaccess`**: that would bring back
  the old site.
- Set real email (`MAIL_MAILER`) once the domain mailboxes exist.
