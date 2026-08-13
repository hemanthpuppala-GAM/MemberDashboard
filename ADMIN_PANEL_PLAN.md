# Golden Age Wisdom — Admin Control Panel Plan

Status: **Draft for discussion** — nothing here is built yet. This document
exists to align on scope, data model, and architecture before writing code.

---

## 1. Why this exists today

Right now every page section (`About`, `Meditation`, `Wellness`, `Events`,
`Our Mission`) is **hardcoded** as React props inside files like
`AboutSection.jsx`, `MeditateSection.jsx`, etc. (all wrapping a shared
`ChakraContentSection`). There is no backend content storage — the Laravel
`backend/` app is still the default scaffold (only a `users` table/model
exist, no API routes).

Goal: replace hardcoded content with an **admin-editable CMS layer**, backed
by a real database and a proper admin UI, without breaking the current
front-of-site look and feel.

---

## 2. Scope Summary

| Area | What the admin can do | Priority |
|---|---|---|
| **About Me** | Edit eyebrow, title, description, bullet points, image | P1 |
| **Meditation** | Edit content block + CTA (label/link/variant) | P1 |
| **Events** | Edit intro block **and** manage a real list of events (date, time, location, link) | P1 |
| **Wellness** | Edit content block | P1 |
| **Our Mission** | Edit content block | P1 |
| **Settings** | Site-wide config: contact email, social links, live-session banner text, maintenance mode | P2 |
| **Contact / Query form** | Public form on the site + admin inbox to view/respond/mark handled | P2 |
| **Admin auth** | Login-gated `/admin`, single admin role to start | P1 (blocking everything else) |

Each content page (About, Meditation, Wellness, Mission) currently shares
the exact same shape:

```text
eyebrow, title, description, points[], cta? {label, href, variant}, reverse?
```

Events is the odd one out — it needs the same intro block **plus** a
structured, repeatable list of actual events (this doesn't exist yet even as
static data).

---

## 3. Architecture

```
frontend/          React (Vite) — current public site
  src/pages/AdminPage.jsx (new)   → /admin, behind login
  src/admin/                      → admin-only components, kept separate
                                     from public site components

backend/           Laravel (existing scaffold)
  routes/api.php (new)            → JSON API, versioned /api/v1/*
  app/Models/                     → Page, PageContent, Event, Setting,
                                     ContactSubmission, AdminUser
  app/Http/Controllers/Api/       → one controller per resource
  database/migrations/            → new tables (see §4)
```

**Auth:** Laravel Sanctum (session or token-based) protecting `/api/v1/admin/*`.
Public read-only endpoints (`/api/v1/content/*`, `/api/v1/events`) stay open;
mutating endpoints require an authenticated admin.

**Frontend admin routing:** either a separate route tree in the existing
Vite app (`/admin/*`) reusing the same build, or a fully separate app if we
want independent deploys later. **Recommend starting with same app, separate
route tree** — less infra overhead, easy to split later if it grows.

---

## 4. Data Model (draft)

### `page_contents`
One row per editable content block (About, Meditation, Wellness, Mission,
Events-intro).

| column | type | notes |
|---|---|---|
| id | bigint | |
| slug | string, unique | `about`, `meditate`, `wellness`, `mission`, `events` |
| eyebrow | string | |
| title | string | |
| description | text | |
| points | json | array of strings |
| cta_label | string, nullable | |
| cta_href | string, nullable | |
| cta_variant | string, nullable | |
| reverse | boolean | layout flag |
| image_path | string, nullable | |
| updated_by | FK → admin_users | |
| timestamps | | |

### `events`
| column | type | notes |
|---|---|---|
| id | bigint | |
| title | string | |
| description | text, nullable | |
| starts_at | datetime | |
| ends_at | datetime, nullable | |
| location | string | e.g. "Online" or city |
| join_url | string, nullable | |
| is_published | boolean | draft vs live |
| timestamps | | |

### `settings`
Simple key-value store for site-wide config.

| column | type | notes |
|---|---|---|
| key | string, unique | `contact_email`, `social_youtube`, `banner_text`, `maintenance_mode`, ... |
| value | text | |
| timestamps | | |

### `contact_submissions`
| column | type | notes |
|---|---|---|
| id | bigint | |
| name | string | |
| email | string | |
| message | text | |
| status | enum | `new`, `read`, `archived` |
| timestamps | | |

### `admin_users`
Reuse/extend Laravel's existing `users` table, or a dedicated `admin_users`
table if public users are ever added later. **Recommend reusing `users`
with a `role` column** for now, since there's no public user system yet.

---

## 5. Admin Panel Features

1. **Login** — single admin account to start (seeded), email+password via
   Sanctum. MFA / multiple roles is a later concern, not now.
2. **Dashboard** — landing page with quick links to each section + recent
   contact submissions count.
3. **Content Editor** — one generic form component reused for About,
   Meditation, Wellness, Mission, Events-intro (since they share a schema).
   Live preview pane optional (nice-to-have, not P1).
4. **Events Manager** — table/list view of events with create/edit/delete,
   publish toggle, sorted by date.
5. **Settings Page** — grouped form (Contact info / Social links / Banner /
   Maintenance mode) backed by the `settings` key-value table.
6. **Contact Inbox** — list of submissions, mark read/archived, no reply
   sending in P1 (just view — email replies happen outside the system).

---

## 6. Public-facing additions needed

- A **Contact/Query form** component on the public site (new — doesn't
  exist today) that POSTs to `/api/v1/contact`.
- Public content sections switch from hardcoded props to fetching from
  `/api/v1/content/{slug}` and `/api/v1/events`.

---

## 7. API Endpoints (draft)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/content/{slug}` | public | fetch one content block |
| GET | `/api/v1/events` | public | list published events |
| POST | `/api/v1/contact` | public | submit contact form |
| POST | `/api/v1/admin/login` | — | admin login |
| PUT | `/api/v1/admin/content/{slug}` | admin | update content block |
| POST | `/api/v1/admin/events` | admin | create event |
| PUT | `/api/v1/admin/events/{id}` | admin | update event |
| DELETE | `/api/v1/admin/events/{id}` | admin | delete event |
| GET | `/api/v1/admin/settings` | admin | fetch all settings |
| PUT | `/api/v1/admin/settings` | admin | bulk update settings |
| GET | `/api/v1/admin/contact-submissions` | admin | list submissions |
| PATCH | `/api/v1/admin/contact-submissions/{id}` | admin | mark read/archived |

---

## 8. "Industrial-grade & maintainable" — what that means concretely

- **Validation** on every write endpoint (Laravel Form Requests), not just
  client-side.
- **Migrations + seeders** for every table, including a seeder that
  populates `page_contents` with today's hardcoded copy so the site doesn't
  go blank on first deploy.
- **Single source of truth**: once live, `AboutSection.jsx` etc. stop
  holding copy — they only hold layout/markup and fetch data.
- **Audit trail**: `updated_by` + `updated_at` on content so we know who
  changed what.
- **Environment config**: API base URL via `.env`, not hardcoded.
- **Tests**: feature tests for each admin endpoint (auth required, validation
  rejects bad input), at least smoke-level.
- **Error handling on the public site**: if the API is unreachable, fall
  back gracefully (cached copy or a default), not a blank page.

---

## 9. Proposed Phased Roadmap

- **Phase 0 — Foundation**: Sanctum auth, `admin_users`/role column, admin
  login page, protected `/admin` route shell.
- **Phase 1 — Content CRUD**: `page_contents` table + migration + seeder
  from existing copy, generic content editor, public site reads from API.
- **Phase 2 — Events**: `events` table, admin events manager, public Events
  page renders real event list instead of static bullets.
- **Phase 3 — Contact**: public contact form + `contact_submissions` +
  admin inbox.
- **Phase 4 — Settings**: `settings` table + admin settings page + wiring
  settings into Header/Footer/LiveSessionBanner where relevant.

---

## 10. Open questions for discussion

1. Do we need **multiple admin roles** (e.g. editor vs super-admin), or is a
   single admin account enough for now?
2. Should **images** for content blocks be uploaded through the admin panel
   (file storage) or just pasted as URLs to start?
3. For Events — do we need recurring events (e.g. "weekly online circle"),
   or is every event a one-off row to start?
4. Contact form — do we want email notifications to the admin on new
   submissions (requires mail setup), or is the in-panel inbox enough for
   now?
5. Where should the admin panel live — same Vite app under `/admin`, or a
   separate app/subdomain? (Recommendation above: same app to start.)
6. Hosting/deploy target for the backend now that it needs a real database
   (currently scaffold-only) — confirm before Phase 0.
