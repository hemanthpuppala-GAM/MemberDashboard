# Golden Age Wisdom — Full Admin Control Panel Master Plan

> **Current state:** the full admin **frontend** is built — CMS (Pages, Media,
> Music, Testimonials, Contact Info, Donations), People (Queries, Members +
> per-member Records page, Users, Roles), Engage (Announcements, Broadcasts,
> QR Codes), Reports, Languages, Settings, and a separate Practitioner
> dashboard — all wired to an in-memory mock store standing in for the API
> (see [§16](#16-frontend-only-implementation-pattern)). The Laravel
> `backend/` app is still the original scaffold: no migrations beyond
> `users`, no real routes for any of the above. **The gap to close next is
> backend, not frontend** — build controllers/migrations against the schema
> and endpoints already specified in §11/§12 and swap `AdminDataProvider`'s
> callbacks for real `fetch()` calls per module.
> This document supersedes the original draft and covers the full requested scope.

---

## Table of Contents

1. [Module Map (bird's-eye view)](#1-module-map)
2. [Roles & Permissions (RBAC)](#2-roles--permissions)
3. [Module 1 — CMS: Pages, Content & Media (Multi-language)](#3-module-1--cms)
4. [Module 2 — Query & Practitioner Management](#4-module-2--query--practitioner-management)
5. [Module 3 — Reports & Analytics](#5-module-3--reports--analytics)
6. [Module 4 — Announcements (Internal Communication)](#6-module-4--announcements)
7. [Module 5 — Broadcast System (Website Pop-ups)](#7-module-5--broadcast-system)
8. [Module 6 — QR Code Generator](#8-module-6--qr-code-generator)
9. [Module 7 — Language Manager](#9-module-7--language-manager)
10. [Module 8 — Settings](#10-module-8--settings)
11. [Database Schema (full)](#11-database-schema)
12. [API Endpoints (full)](#12-api-endpoints)
13. [Frontend Route Tree](#13-frontend-route-tree)
14. [Phased Roadmap](#14-phased-roadmap)
15. [Design System & UI Standards](#15-design-system--ui-standards)
16. [Frontend-Only Implementation Pattern (current state, pre-backend)](#16-frontend-only-implementation-pattern)

---

## 1. Module Map

```
Admin Control Panel
│
├── Auth             Login · Session · Role-based redirect
│
├── Dashboard        Stats overview · Quick actions · Recent activity
│
├── CMS              ─┬─ Website Pages (list, add, edit, delete)
│                     ├─ Page Sections (per page, drag-reorder)
│                     ├─ Media Library (images, videos)
│                     ├─ Music Library (audio upload, categories, publish)
│                     ├─ Testimonials (quotes, rating, featured)
│                     ├─ Contact Info (phone/email/social channels, CRUD)
│                     ├─ Donations (bank/UPI/payment methods + QR)
│                     └─ Multi-language Content Editor
│
├── Practitioner Mgmt ─┬─ Roles (create/edit/delete + permissions)
│                      ├─ Users/Practitioners (create, assign role)
│                      ├─ Members (people from query form)
│                      ├─ Assignments (practitioner ↔ member)
│                      ├─ Journey Tracker (notes + timeline per member)
│                      └─ Query Inbox (all contact form submissions)
│
├── Reports          ─┬─ Website signups / visitor stats
│                     ├─ Member statistics per practitioner
│                     ├─ Query category breakdown
│                     └─ Role & user activity log
│
├── Announcements    Internal admin → practitioner communication
│
├── Broadcast        Pop-up / banner for website visitors
│
├── QR Codes         Generate · List · Download
│
├── Languages        Add / enable / disable · Translate labels
│
└── Settings         Site config · Dark/light mode · Admin preferences
```

---

## 2. Roles & Permissions

### 2.1 Built-in Roles

| Role | Description |
|---|---|
| **super_admin** | Everything. Can create other admins, manage roles. |
| **admin** | All content + practitioner management. Cannot delete roles or other admins. |
| **content_manager** | CMS only (pages, media, languages, broadcast). No user management. |
| **practitioner** | Own dashboard only: see assigned members, add journey notes, read announcements from admin. |

### 2.2 Permission Groups

```
cms.*              view, create, edit, delete pages, sections, media
languages.*        view, create, edit, delete languages
users.*            view, create, edit, delete users/practitioners
roles.*            view, create, edit, delete roles
members.*          view, assign, edit, delete members
reports.*          view reports
announcements.*    view, create, edit, delete announcements
broadcast.*        view, create, edit, delete broadcasts
qrcode.*           view, generate, delete QR codes
settings.*         view, edit settings
```

### 2.3 Database

```
roles                  id, name, display_name, description, timestamps
permissions            id, name, group, description, timestamps
role_permissions       role_id FK, permission_id FK
user_roles             user_id FK, role_id FK   (users can have multiple roles)
```

### 2.4 Login flow

- All admin roles share `/admin/login`
- After auth, redirect based on primary role:
  - `super_admin` / `admin` / `content_manager` → `/admin/dashboard`
  - `practitioner` → `/admin/my-dashboard`
- Route guards check permissions, not just roles (future-proof)

---

## 3. Module 1 — CMS

### 3.1 Pages Manager

**Route:** `/admin/cms/pages`

**What it does:**
Lists all website pages (both static built-ins and dynamic new ones) in a table.

**Columns:** Page Name · Slug · Status (published/draft) · Section count ·
Last edited · Language coverage (badge per lang) · Actions

**CRUD:**
- **Create** a new page: title, slug (auto-generated, editable), meta description, status
- **Edit** → opens Section editor for that page
- **Delete** with confirmation (only dynamic pages; built-ins are protected)
- **Publish / Unpublish** toggle inline

Built-in pages (locked from deletion, editable content only):
`home`, `about`, `meditate`, `wellness`, `mission`, `events`, `contact`

---

### 3.2 Section Editor (per page)

**Route:** `/admin/cms/pages/:pageSlug/sections`

Each page has one or more **sections**. Each section has a **type** that dictates its fields.

**Section types & their fields:**

| Type | Fields |
|---|---|
| `hero` | eyebrow, heading, subheading, body text, CTA label+href, background image |
| `content_block` | eyebrow, heading, description, bullet points[], CTA?, image, layout (left/right) |
| `card_grid` | heading, cards[] (each: icon/image, title, body) |
| `event_list` | heading (auto-renders events from events table) |
| `contact_form` | heading, subheading, categories (checkboxes) |
| `media_embed` | heading, video URL or image |
| `custom_html` | raw HTML block (super_admin only) |

**Drag-to-reorder** sections within a page.

---

### 3.3 Multi-language Content Editor

Every text field in every section is **language-aware**.

**UI pattern — tab per language:**

```
┌─────────────────────────────────────────────────────────────┐
│  Section: "About Hero"                                       │
│                                                              │
│  [🇬🇧 English] [🇮🇳 Hindi] [+ Add Language]                  │
│  ─────────────────────────────────────────                   │
│  Eyebrow *     [Spiritual Guide                            ] │
│  Heading *     [Awaken Your Inner Self                     ] │
│  Description   [textarea...                               ]  │
│  Bullet Points [+ Add point]                                 │
│                                                              │
│  CTA Label     [Book a Session    ]  CTA Link [/contact  ]  │
│  Image         [Upload / URL]                                │
│  [Save Draft]  [Publish]                                     │
└─────────────────────────────────────────────────────────────┘
```

- Fields without a translation for the active language show **"⚠ Missing"** badge
- Default fallback language (configurable in Settings, usually English)
- Language tabs only show enabled languages from Language Manager

---

### 3.4 Media Library

**Route:** `/admin/cms/media`

- Grid view of all uploaded images/videos
- Upload (drag-drop or browse) with automatic resize/optimization on backend
- Folder grouping (About, Events, General, etc.)
- CRUD: rename, move to folder, delete (warns if used in content)
- Copy URL / Insert into content from section editor
- Fields: filename, path, alt_text, size, mime_type, folder, uploaded_by

---

### 3.4b Music Library ✅ *Built (frontend, mock data — see §16)*

**Route:** `/admin/cms/music`

Meditation/chanting audio tracks played on the public site. Distinct from Media
Library because tracks need audio-specific metadata (artist, category,
duration) that images don't, and the upload widget needs to probe the file
for its duration rather than just store it.

**List:** cover thumbnail (or music-note fallback icon) · title · category
badge · status badge · artist · duration (`mm:ss`) · inline native
`<audio controls>` preview · reorder (up/down) · edit · delete.

**Upload/edit form:** drag-drop or browse audio file (auto-detects duration
via the browser's own `loadedmetadata` event — no manual entry needed),
title, artist/instructor, category (`meditation` / `chanting` / `nature` /
`sleep` / `instrumental`), description, optional cover art, status
(draft/published).

**Categories:** `MUSIC_CATEGORIES` in `mock/mockData.js` — extend that array
to add more.

---

### 3.4c Testimonials ✅ *Built (frontend, mock data — see §16)*

**Route:** `/admin/cms/testimonials`

Member/practitioner quotes for social proof on the public site.

**List:** card grid — photo (or initials avatar fallback) · name · role ·
star rating (read-only) · quote excerpt · status badge · "Featured" badge ·
edit/delete.

**Add/edit form:** name, role/description, quote (required), optional
photo, 1–5 star rating (click-to-set), status (draft/published), **Featured**
toggle (featured testimonials are meant for the homepage; everything else
lives on a dedicated testimonials page/section).

---

### 3.4d Contact Info ✅ *Built (frontend, mock data — see §16)*

**Route:** `/admin/cms/contact`

Full CRUD list of public contact channels (phone, WhatsApp, email, address,
website, social links) — replaces trying to cram every channel into fixed
Settings fields. Each entry: type, label, value, visibility toggle (hide
without deleting), order (up/down reorder).

---

### 3.4e Donations ✅ *Built (frontend, mock data — see §16)*

**Route:** `/admin/cms/donations`

CRUD for one or more donation methods (e.g. domestic bank transfer +
international PayPal side by side): account holder, bank name, account
number, IFSC/routing code, branch, SWIFT, UPI ID, payment link, notes,
uploaded QR code image, active/inactive toggle (deactivate instead of
deleting to preserve history). Every copyable field (account number, UPI ID,
etc.) has a one-click copy-to-clipboard button.

---

### 3.5 Add New Page (CMS)

**Route:** `/admin/cms/pages/new`

Wizard-style (4 steps):
1. Basic Info — title (per language), slug, meta description, status
2. Add Sections — pick section types, set order
3. Fill Content — inline multi-language editor per section
4. Review & Publish

---

## 4. Module 2 — Query & Practitioner Management

Lifecycle: someone submits a query on the website → admin assigns to a practitioner →
practitioner manages their journey.

---

### 4.1 Query Inbox

**Route:** `/admin/queries/inbox`

All contact form submissions from the website.

**Columns:** Name · Email · Category · Message (truncated) · Submitted on ·
Status · Assigned To · Actions

**Statuses:** `new` → `assigned` → `in_progress` → `resolved` → `archived`

**Actions per row:** View full message · Assign to practitioner · Change status ·
Convert to Member · Archive

**Filters:** Category · Status · Date range · Assigned practitioner · Search

---

### 4.2 Members

**Route:** `/admin/members`

A "member" is a person converted from a query submission and actively managed by a practitioner.

**Columns:** Name · Email · Phone · Assigned Practitioner · Category ·
Join Date · Last Contact · Status · Actions

**Member Profile:**
- Personal info (editable)
- Assigned practitioner + reassign option
- Query category tags
- Journey timeline
- All past messages/notes

**CRUD:** Create manually · Edit · Delete (soft delete) · Export CSV

---

### 4.3 Journey Tracker

**Route:** `/admin/members/:id/journey`
**Practitioner view:** `/admin/my-dashboard/members/:id/journey`

Timeline view of all interactions, notes, and status changes.

Each entry: Date/time · Type (note / status_change / session_completed) ·
Content · Added by

---

### 4.4 Users / Practitioners

**Route:** `/admin/users`

**Columns:** Name · Email · Role · Status · Members Assigned ·
Last Login · Created · Actions

**Create/Edit form fields:**
- Name, Email, Password (auto-generate option), Role, Active toggle
- Practitioner-specific: Specialty, Bio, Max member capacity

---

### 4.5 Practitioner's Own Dashboard

**Route:** `/admin/my-dashboard`  (practitioner role only)

**Dashboard cards:** Total members · New queries · Members by status

**My Members table:** Name · Category · Status · Last Activity · Actions

**My Reports:** Members over time graph · Status pie · Activity log

---

### 4.6 Role Manager

**Route:** `/admin/roles`

- List roles with permission badges
- Create custom roles by picking permissions
- Edit/Delete custom roles
- Built-in roles are protected from deletion

---

## 5. Module 3 — Reports & Analytics

**Route:** `/admin/reports`

### 5.1 Website Stats
Contact form submissions total/monthly/by category/peak hours

### 5.2 Member & Practitioner Report
- Members per practitioner (bar chart)
- Member status breakdown (pie)
- New vs resolved this month
- Practitioner workload table

### 5.3 User Activity Log
Audit trail — user · action · target · IP · timestamp.
Filterable by user, action type, date range.

### 5.4 Export
Every report view: **Export CSV** and **Export PDF**.

---

## 6. Module 4 — Announcements

**Route:** `/admin/announcements`

Internal one-way communication: admin → practitioners.

**Columns:** Title · Type (info/warning/alert) · Target · Sent on · Read count · Actions

**Create form:**
- Title, Body (rich text), Target (all / role / specific users), Priority, Schedule send

**Practitioner view:**
Bell-icon notification in top-bar with unread count badge → notification drawer.

---

## 7. Module 5 — Broadcast System

**Route:** `/admin/broadcasts`

Broadcast a pop-up / banner to **website visitors**.

| Type | Description |
|---|---|
| `text_banner` | Sticky top/bottom banner with text + optional CTA |
| `popup_card` | Modal with title, body, optional image, CTA |
| `media_popup` | Full-screen modal with image or embedded video |
| `news_ticker` | Scrolling ticker text across top of site |

**Broadcast form:** title, type, content, CTA, target pages, audience,
schedule from/until, delay (seconds), frequency (every visit / once per session / once ever),
status (draft/active/paused).

**Preview panel** shows live render before publishing.

**Public site:** polls `/api/v1/broadcasts/active` on load → renders modals/banners.
LocalStorage tracks frequency rules per visitor.

---

## 8. Module 6 — QR Code Generator

**Route:** `/admin/qr-codes`

| QR Type | Input fields |
|---|---|
| `url` | URL |
| `text` | Plain text |
| `email` | Address + subject + body |
| `phone` | Phone number |
| `sms` | Phone + message |
| `vcard` | Name, email, phone, address, website |
| `wifi` | SSID, password, encryption |
| `location` | Lat/lng or Google Maps URL |

**Customization:** size, foreground/background colors, center logo upload,
error correction level.

**Output:** PNG download · SVG download · Copy to clipboard

**Saved list:** Title · Type · Created · Downloads · Preview · Actions

---

## 9. Module 7 — Language Manager

**Route:** `/admin/languages`

**List columns:** Language name · Native name · Code · Status · Default flag ·
Completeness % · Actions

**Add/Edit:** name, ISO code, native name, text direction (LTR/RTL), enabled toggle, set as default.

**How it integrates into CMS:**
- Adding a language here immediately adds a new tab in all section content editors.
- "Completeness %" shows how many section fields have been filled in that language.
- Missing fields are flagged with **"⚠ Missing"** badge in the section editor.

**UI Label Translations:**
Admin can override public-facing UI strings per language
(e.g. "Submit" → Hindi equivalent on the contact form).
Stored in `ui_translations (language_id, key, value)`.

---

## 10. Module 8 — Settings

**Route:** `/admin/settings` (tabbed layout)

| Tab | Contents |
|---|---|
| **General** | Site name/tagline (per language), admin email, default language, timezone |
| **Social & Contact** | YouTube, Instagram, Facebook, WhatsApp, phone, address (per language) |
| **Live Session Banner** | Enable toggle, banner text (per language), CTA label+URL |
| **Maintenance Mode** | Enable toggle, maintenance message (per language), allowed IP whitelist |
| **Appearance** | Admin dark/light mode, primary accent color, logo upload, favicon upload |
| **Email / Notifications** | SMTP config, test email button, new-submission alert toggle |
| **Advanced** | Clear cache, storage usage, app version |

---

## 11. Database Schema

### Already migrated
`users` (with `role` column), `page_contents`, `events`, `settings`,
`contact_submissions`, `personal_access_tokens`

### New migrations

#### `languages`
```
id, name, native_name, code UNIQUE, direction (ltr/rtl),
is_enabled BOOL, is_default BOOL, timestamps
```

#### `roles`
```
id, name UNIQUE, display_name, description, is_system BOOL, timestamps
```

#### `permissions`
```
id, name UNIQUE, group, description, timestamps
```

#### `role_permissions` (pivot)
```
role_id FK, permission_id FK
```

#### `user_roles` (pivot — replaces single `role` column)
```
user_id FK, role_id FK
```

#### `pages`
```
id, slug UNIQUE, is_builtin BOOL, status (published/draft),
sort_order, created_by FK → users, timestamps
```

#### `page_translations`
```
id, page_id FK, language_id FK, title, meta_description, timestamps
UNIQUE (page_id, language_id)
```

#### `page_sections`
```
id, page_id FK, type ENUM, sort_order, status (active/hidden), timestamps
```

#### `section_content`
```
id, section_id FK, language_id FK, field_key, field_value TEXT,
field_type (text/json/image_path), timestamps
UNIQUE (section_id, language_id, field_key)
```

#### `media`
```
id, filename, original_name, path, url, mime_type, size_bytes,
alt_text, folder, uploaded_by FK → users, timestamps
```

#### `music_tracks`
```
id, title, artist, category ENUM (meditation/chanting/nature/sleep/instrumental),
description TEXT nullable, cover_path nullable, file_path, duration_seconds INT,
status ENUM (draft/published), sort_order, created_by FK → users, timestamps
```

#### `testimonials`
```
id, name, role, photo_path nullable, quote TEXT, rating TINYINT (1-5),
status ENUM (draft/published), is_featured BOOL, sort_order,
created_by FK → users, timestamps
```

#### `contact_channels`
```
id, type ENUM (phone/whatsapp/email/address/website/social), label, value,
is_visible BOOL, sort_order, timestamps
```

#### `donation_methods`
```
id, label, account_holder nullable, bank_name nullable, account_number nullable,
ifsc nullable, branch nullable, swift nullable, upi_id nullable,
payout_link nullable, qr_image_path nullable, notes TEXT nullable,
is_active BOOL, sort_order, timestamps
```

#### `members`
```
id, name, email, phone, category ENUM (meditation/kundalini/health/general),
notes TEXT, assigned_practitioner_id FK → users,
source_submission_id FK → contact_submissions,
status ENUM (new/active/in_progress/resolved/archived),
deleted_at (soft delete), timestamps
```

#### `member_journeys`
```
id, member_id FK, added_by FK → users,
entry_type ENUM (note/status_change/session_completed/message_sent),
content TEXT, meta JSON, timestamps
```

#### `announcements`
```
id, title, body TEXT, type ENUM (info/warning/alert),
target_type ENUM (all/role/users), target_ids JSON,
priority ENUM (normal/urgent), scheduled_at DATETIME nullable,
sent_at DATETIME nullable, created_by FK → users, timestamps
```

#### `announcement_reads`
```
id, announcement_id FK, user_id FK, read_at DATETIME, timestamps
```

#### `broadcasts`
```
id, title, type ENUM, content_text TEXT, content_image_path,
content_video_url, cta_label, cta_url, target_pages JSON,
audience ENUM (all/new_visitors/returning), show_after_seconds INT,
frequency ENUM (every_visit/once_per_session/once_per_day/once_ever),
active_from DATETIME, active_until DATETIME,
status ENUM (draft/active/paused/expired),
created_by FK → users, timestamps
```

#### `qr_codes`
```
id, title, type ENUM, input_data JSON, options JSON,
file_path, download_count INT, created_by FK → users, timestamps
```

#### `activity_logs`
```
id, user_id FK nullable, action, target_type, target_id,
meta JSON, ip_address, timestamps
```

#### `ui_translations`
```
id, language_id FK, key, value, timestamps
UNIQUE (language_id, key)
```

#### Update `contact_submissions`
Add: `category` ENUM, `status` extended, `assigned_to` FK → users,
`converted_to_member_id` FK → members nullable

---

## 12. API Endpoints

All admin endpoints require Bearer token. Public endpoints marked *(public)*.

### Auth
```
POST   /api/v1/admin/login
POST   /api/v1/admin/logout
GET    /api/v1/admin/me
```

### Languages
```
GET    /api/v1/admin/languages
POST   /api/v1/admin/languages
PUT    /api/v1/admin/languages/{id}
DELETE /api/v1/admin/languages/{id}
GET    /api/v1/languages/enabled          (public)
```

### CMS — Pages
```
GET    /api/v1/admin/pages
POST   /api/v1/admin/pages
GET    /api/v1/admin/pages/{slug}
PUT    /api/v1/admin/pages/{slug}
DELETE /api/v1/admin/pages/{slug}
PATCH  /api/v1/admin/pages/{slug}/status
```

### CMS — Sections
```
GET    /api/v1/admin/pages/{slug}/sections
POST   /api/v1/admin/pages/{slug}/sections
PUT    /api/v1/admin/pages/{slug}/sections/{id}
DELETE /api/v1/admin/pages/{slug}/sections/{id}
PUT    /api/v1/admin/pages/{slug}/sections/reorder
```

### CMS — Section Content
```
GET    /api/v1/admin/sections/{id}/content
PUT    /api/v1/admin/sections/{id}/content
GET    /api/v1/content/{slug}?lang={code}   (public)
```

### Media
```
GET    /api/v1/admin/media
POST   /api/v1/admin/media                  (multipart upload)
PUT    /api/v1/admin/media/{id}
DELETE /api/v1/admin/media/{id}
```

### Music
```
GET/POST/PUT/DELETE  /api/v1/admin/music/{id?}      (POST is multipart: audio file + fields)
PUT    /api/v1/admin/music/reorder
GET    /api/v1/music                                 (public, published only)
```

### Testimonials
```
GET/POST/PUT/DELETE  /api/v1/admin/testimonials/{id?}
GET    /api/v1/testimonials                          (public, published only)
GET    /api/v1/testimonials/featured                 (public, homepage)
```

### Contact channels
```
GET/POST/PUT/DELETE  /api/v1/admin/contact-channels/{id?}
PUT    /api/v1/admin/contact-channels/reorder
GET    /api/v1/contact-channels                      (public, visible only)
```

### Donation methods
```
GET/POST/PUT/DELETE  /api/v1/admin/donation-methods/{id?}
GET    /api/v1/donation-methods                      (public, active only)
```

### Users & Roles
```
GET/POST/PUT/DELETE  /api/v1/admin/users/{id?}
GET/POST/PUT/DELETE  /api/v1/admin/roles/{id?}
GET                  /api/v1/admin/permissions
```

### Members
```
GET/POST/PUT/DELETE  /api/v1/admin/members/{id?}
POST   /api/v1/admin/members/{id}/assign
GET    /api/v1/admin/members/{id}/journey
POST   /api/v1/admin/members/{id}/journey
```

### Queries
```
GET    /api/v1/admin/queries
GET    /api/v1/admin/queries/{id}
PATCH  /api/v1/admin/queries/{id}/status
PATCH  /api/v1/admin/queries/{id}/assign
POST   /api/v1/admin/queries/{id}/convert-to-member
POST   /api/v1/contact                       (public form submit)
```

### Practitioner (own scope)
```
GET    /api/v1/practitioner/dashboard-stats
GET    /api/v1/practitioner/members
GET    /api/v1/practitioner/members/{id}/journey
POST   /api/v1/practitioner/members/{id}/journey
GET    /api/v1/practitioner/announcements
PATCH  /api/v1/practitioner/announcements/{id}/read
```

### Announcements
```
GET/POST/PUT/DELETE  /api/v1/admin/announcements/{id?}
POST   /api/v1/admin/announcements/{id}/send
```

### Broadcasts
```
GET/POST/PUT/DELETE  /api/v1/admin/broadcasts/{id?}
PATCH  /api/v1/admin/broadcasts/{id}/status
GET    /api/v1/broadcasts/active             (public)
```

### QR Codes
```
GET    /api/v1/admin/qr-codes
POST   /api/v1/admin/qr-codes/generate
DELETE /api/v1/admin/qr-codes/{id}
GET    /api/v1/admin/qr-codes/{id}/download
```

### Reports
```
GET    /api/v1/admin/reports/overview
GET    /api/v1/admin/reports/members
GET    /api/v1/admin/reports/practitioners
GET    /api/v1/admin/reports/queries
GET    /api/v1/admin/reports/activity-log
GET    /api/v1/admin/reports/export?type={}&format={csv|pdf}
```

### Settings
```
GET/PUT  /api/v1/admin/settings
POST     /api/v1/admin/settings/test-email
POST     /api/v1/admin/settings/clear-cache
```

---

## 13. Frontend Route Tree

```
/admin
│
├── login                                LoginPage (existing)
│
├── (ProtectedRoute — admin/content_manager/super_admin)
│   │
│   ├── (index)                          DashboardPage (existing, extend)
│   │
│   ├── cms/
│   │   ├── pages                        PagesListPage
│   │   ├── pages/new                    NewPageWizard
│   │   ├── pages/:slug                  PageDetailPage (sections list)
│   │   ├── pages/:slug/sections/:id     SectionEditorPage (multi-lang tabs)
│   │   ├── media                        MediaLibraryPage
│   │   ├── music                        MusicLibraryPage     ✅ built
│   │   ├── testimonials                 TestimonialsPage     ✅ built
│   │   ├── contact                      ContactInfoPage      ✅ built
│   │   └── donations                    DonationsPage        ✅ built
│   │
│   ├── queries/
│   │   └── inbox                        QueryInboxPage
│   │
│   ├── members/
│   │   ├── (index)                      MembersListPage
│   │   ├── :id                          MemberProfilePage
│   │   └── :id/journey                  JourneyPage
│   │
│   ├── users/
│   │   ├── (index)                      UsersListPage
│   │   └── :id                          UserDetailPage
│   │
│   ├── roles/                           RolesPage
│   │
│   ├── reports/
│   │   ├── (index)                      ReportsOverviewPage
│   │   ├── members                      MemberReportPage
│   │   ├── practitioners                PractitionerReportPage
│   │   └── activity                     ActivityLogPage
│   │
│   ├── announcements/                   AnnouncementsPage
│   │
│   ├── broadcasts/                      BroadcastsPage
│   │
│   ├── qr-codes/                        QrCodesPage
│   │
│   ├── languages/                       LanguagesPage
│   │
│   └── settings/                        SettingsPage (tabbed, existing, extend)
│
└── (ProtectedRoute — practitioner role only)
    └── my-dashboard/
        ├── (index)                      PractitionerDashboardPage
        ├── members                      MyMembersPage
        ├── members/:id                  MyMemberProfilePage
        ├── members/:id/journey          MyMemberJourneyPage
        └── announcements                MyAnnouncementsPage
```

---

## 14. Phased Roadmap

### Phase 0 — Already Built ✓ (backend, original scaffold)
- [x] Sanctum auth, `role` column on users table
- [x] Admin login page + ProtectedRoute + AdminLayout
- [x] Basic controllers: Auth, Content, Events, Settings, Contact
- [x] Migrations: page_contents, events, settings, contact_submissions
- [x] Admin route tree + 6 admin pages (Dashboard, ContentEdit, Events, Settings, ContactInbox, Login)

### Phase 0b — Full Admin Frontend ✓ (frontend, mock data — see §16)
Everything below has a real, working admin UI today, backed by the
in-memory mock store rather than the backend controllers above:
- [x] CMS: Pages, Sections (multi-lang), Media Library
- [x] CMS: Music Library, Testimonials, Contact Info, Donations (§3.4b–§3.4e)
- [x] People: Query Inbox → assign to practitioner, Members (+ per-member
      Records page: summary + note/Q&A journal), Users, Roles
- [x] Practitioner-only dashboard + "viewing as" role preview switcher
- [x] Engage: Announcements, Broadcasts, QR Codes
- [x] Reports (charts + CSV export), Languages, Settings (tabbed)
- [x] Admin theming (light/dark/system, text size, font, accent color)
- [x] Dev-only mock-auth bypass (`VITE_DEV_MOCK_AUTH`) to preview the whole
      panel before Sanctum login is wired to a seeded user — see
      `frontend/.env.example`

**Not done yet:** none of the above persists past a page refresh, and the
public site doesn't read any of it (see §16.2). Closing that gap is
Phase 1 onward below, which was written before Phase 0b existed — read it
as "what the backend needs to expose," not "what the frontend still needs."

---

### Phase 1 — RBAC + Language + CMS Core
*Unblocks all other modules.*

**Backend:**
- Migrations: `roles`, `permissions`, `role_permissions`, `user_roles`, `languages`, `pages`, `page_sections`, `section_content`
- Seeders: default 4 roles + permissions, EN + HI languages, 7 built-in pages
- Controllers: `RoleController`, `PermissionController`, `LanguageController`, `PageController`, `SectionController`, `SectionContentController`
- Middleware: `CheckPermission` replacing current simple role check

**Frontend:**
- Upgrade `AuthContext` to carry roles + permissions array
- Permission-aware route guard `<RequirePermission perm="cms.edit" />`
- `LanguagesPage` (CRUD table)
- `PagesListPage` (table with status + lang badge)
- `SectionEditorPage` with **language tabs** (the core multi-lang form)
- Sidebar nav — collapsible groups: CMS / People / Engage / Reports

---

### Phase 2 — Media Library
- `media` table + `MediaController`
- Image upload, local disk or S3 (env-configured)
- `MediaLibraryPage` — grid, folder tabs, insert-from-SectionEditor
- **Frontend already built for this phase and the next few:** `MusicLibraryPage`,
  `TestimonialsPage`, `ContactInfoPage`, `DonationsPage` (§3.4b–§3.4e) are done
  and just need the real upload endpoint + the `music_tracks` /
  `testimonials` / `contact_channels` / `donation_methods` tables and
  controllers (schema in §11, endpoints in §12) — no new frontend work
  required, just swap `AdminDataProvider`'s mock callbacks for real calls
  (§16.1) and wire the file inputs to a real upload endpoint (§16.3).

---

### Phase 3 — User / Role Manager + Practitioner System
- `user_roles` pivot, `UserController`, `RoleController`
- `UsersListPage`, `RolesPage` (permission checkboxes matrix)
- `PractitionerDashboardPage` (practitioner-role-only protected route)

---

### Phase 4 — Query Management + Members + Journey
- `members`, `member_journeys` migrations
- Update `contact_submissions` (category, assigned_to, status)
- `MemberController`, `JourneyController`, `QueryController`
- `QueryInboxPage`, `MembersListPage`, `MemberProfilePage`, `JourneyPage`
- Practitioner: `MyMembersPage`, `MyMemberJourneyPage`

---

### Phase 5 — Announcements
- `announcements`, `announcement_reads` migrations + controllers
- `AnnouncementsPage` (admin create/manage)
- Bell notification in practitioner top-bar
- `MyAnnouncementsPage`

---

### Phase 6 — Broadcast System
- `broadcasts` migration + `BroadcastController`
- `BroadcastsPage` with preview panel
- Public site renders active broadcasts (modal/banner/ticker components)

---

### Phase 7 — QR Code Generator
- `qr_codes` migration
- Backend: `endroid/qr-code` PHP package
- `QrCodesPage` — type/field form + saved list + download

---

### Phase 8 — Reports & Analytics
- `activity_logs` migration + `LogActivity` trait on all controllers
- `ReportController` (aggregation queries)
- `ReportsOverviewPage` with Recharts cards
- `ActivityLogPage` (filterable table)
- Export CSV (`barryvdh/laravel-dompdf` for PDF)

---

### Phase 9 — Settings Extended + Email
- SMTP, appearance, maintenance tabs on `SettingsPage`
- `ui_translations` table + Language Manager completeness %
- Connect contact submission email notifications

---

### Phase 10 — Polish & Production
- Admin dark mode (CSS variable swap, persisted to localStorage)
- Skeleton loaders, toast notifications, empty states
- Feature test coverage per controller
- Redis caching for public content endpoints
- Rate limiting on public form POST endpoints
- Security headers, CORS finalization

---

## 15. Design System & UI Standards

### Layout Structure
```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR:  Logo  |  [search...]  |  [🔔 3]  |  [Avatar ▾]    │
├─────────────┬────────────────────────────────────────────────┤
│             │  Breadcrumb: CMS > Pages > About               │
│  SIDEBAR    │──────────────────────────────────────────────  │
│             │                                                 │
│  Dashboard  │  PAGE CONTENT AREA                             │
│  ▾ CMS      │  (table / form / cards)                        │
│    Pages    │                                                 │
│    Media    │                                                 │
│  ▾ People   │                                                 │
│    Queries  │                                                 │
│    Members  │                                                 │
│    Users    │                                                 │
│    Roles    │                                                 │
│  ▾ Engage   │                                                 │
│    Announce │                                                 │
│    Broadcast│                                                 │
│    QR Codes │                                                 │
│  Reports    │                                                 │
│  Languages  │                                                 │
│  Settings   │                                                 │
└─────────────┴────────────────────────────────────────────────┘
```

### Component Standards

| Component | Standards |
|---|---|
| **Tables** | Sortable columns, row hover, inline status badge, icon action buttons, bulk-select, pagination (10/25/50), search + filter chips above |
| **Forms** | Label above field, validation error below field, required *, auto-save draft (debounced 1.5s), Publish / Save Draft split-button |
| **Dashboard cards** | Icon top-left, large metric number, trend arrow + % vs last month, muted subtitle |
| **Status badges** | Colour-coded pill: new=blue, active=green, resolved=teal, archived=grey, urgent=red |
| **Modals** | For delete confirm, quick-edit, media picker |
| **Toasts** | Top-right, success auto-dismiss 4s, error stays until dismissed |

### Colour Tokens (admin panel)

| Token | Light | Dark |
|---|---|---|
| `--bg-base` | `#F8F9FC` | `#0F1117` |
| `--bg-surface` | `#FFFFFF` | `#1A1D27` |
| `--bg-surface-2` | `#F1F3F9` | `#222534` |
| `--accent` | `#6C63FF` | `#7C74FF` |
| `--accent-muted` | `#EEF0FF` | `#2A2845` |
| `--text-primary` | `#111827` | `#F1F3F9` |
| `--text-muted` | `#6B7280` | `#9CA3AF` |
| `--danger` | `#EF4444` | `#F87171` |
| `--success` | `#10B981` | `#34D399` |
| `--warning` | `#F59E0B` | `#FBBF24` |
| `--border` | `#E5E7EB` | `#2D3244` |

### Typography
- Font: **Inter**
- Page title: `24px / 700`
- Section heading: `16px / 600`
- Table header: `12px / 600 uppercase`
- Body: `14px / 400`
- Label: `13px / 500`

### Frontend Libraries to Add

| Purpose | Library |
|---|---|
| Charts | `recharts` |
| Rich text editor | `@tiptap/react` |
| QR code preview | `qrcode.react` |
| Drag-to-reorder sections | `@dnd-kit/core` |
| Date picker | `react-day-picker` |
| Toast notifications | `react-hot-toast` |
| Data table | `@tanstack/react-table` |
| Color picker | `react-colorful` |

### Backend Packages to Add

| Purpose | Package |
|---|---|
| QR code generation | `endroid/qr-code` |
| PDF export | `barryvdh/laravel-dompdf` |
| Image processing | `intervention/image` |

---

## 16. Frontend-Only Implementation Pattern

*(current state, pre-backend — read this before wiring any of §3.4b–§3.4e to a real API)*

As of this writing, `backend/` is still a scaffold with no real routes for
any of CMS/People/Engage — so **every module built so far (Pages, Media,
Contact Info, Donations, Music, Testimonials, Members, Queries, Roles,
Users, Announcements, Broadcasts, QR Codes, Settings) is a fully working
admin UI wired to an in-memory mock store, not a real API.** This section
documents that pattern so it's obvious what to change when the Laravel
backend catches up, and so new modules stay consistent.

### 16.1 The mock data layer

- `frontend/src/admin/mock/mockData.js` — one exported array/object per
  resource (`PAGES`, `MEDIA`, `MUSIC_TRACKS`, `TESTIMONIALS`,
  `CONTACT_CHANNELS`, `DONATION_METHODS`, `MEMBERS`, `QUERIES`, ...). This is
  the seed data — think of it as a "fixture" a Laravel seeder would produce.
- `frontend/src/admin/store/AdminDataProvider.jsx` — one `useState` per
  resource, seeded from the mock array, plus CRUD callbacks
  (`addX`/`updateX`/`deleteX`/`reorderX`) that mutate local React state. This
  stands in for the future API client — **every callback here is the exact
  shape a real `fetch()`-based call would have** (same params, same
  optimistic-update semantics), so swapping the body from
  `setX(prev => ...)` to `await api.updateX(id, patch)` + refetch is a
  mechanical change, not a redesign.
- `frontend/src/admin/store/useAdminData.js` — the `useContext` hook every
  page calls to reach the store. Pages never import mock data directly.
- IDs are assigned client-side via a monotonically increasing counter
  (`nextId()` in `AdminDataProvider.jsx`) starting above the seed data's
  highest ID, so new records never collide with seeded ones during a
  session.

### 16.2 Where the public site fits in

The public site (`frontend/src/pages`, `frontend/src/components`) does
**not** currently read from `AdminDataProvider` — `HomePage` and `AdminApp`
are separate route trees under the same `<BrowserRouter>` in `App.jsx`, and
only `AdminApp` is wrapped in `AdminDataProvider`. So today, editing Music,
Testimonials, Contact Info, or Donations in the admin panel does **not**
change anything a visitor sees — there's no public consumer wired up yet.
That's a deliberate, small scope cut: building the public-facing player /
testimonials section / contact block was out of scope for this pass, which
was "give admin control over the data," not "render it publicly." When that
public wiring happens, either:
- (real backend path) the public components fetch from the new public GET
  endpoints in §12, or
- (quick preview path, no backend yet) lift `<AdminDataProvider>` from
  `AdminApp.jsx` up into `App.jsx` so both route trees share one instance —
  useful for demoing "admin edit shows up live on the site" before the API
  exists, but remember to drop this once real fetching is in place so the
  public site isn't holding admin-only state.

### 16.3 File uploads (images & audio)

There is no upload endpoint yet, so every uploader in the admin panel uses
`URL.createObjectURL(file)` to get a browser-local blob URL for immediate
preview — it works perfectly for the current session but **the URL dies on
page refresh and is never actually persisted anywhere.** This is the one
piece of every CRUD page here that is not a mechanical swap to a real API —
uploads need genuine multipart `POST` handling
(`MediaController`-equivalent) before they survive a reload.

Two shared components implement this pattern — reuse them for any future
upload field instead of writing another drag-drop zone:

- **`frontend/src/admin/ui/ImageUploader.jsx`** — generic single-image
  drag-drop-or-browse uploader with preview + remove button. Used by
  Donations (QR code), Music (cover art), Testimonials (photo). Swap
  `onChange(URL.createObjectURL(file))` for a real upload call when the
  Media API exists.
- **`AudioUploader`** (currently local to `MusicLibraryPage.jsx` — extract
  it if a second audio-upload use case shows up) — same drag-drop pattern,
  plus it auto-detects track duration by rendering a real `<audio>` element
  and reading its `loadedmetadata` event (`e.currentTarget.duration`) rather
  than asking the admin to type it in. No library needed for this — it's a
  native browser capability.

### 16.4 Reorderable lists

Contact Info and Music both support up/down reordering (`reorderContactChannel`,
`reorderMusicTrack` in `AdminDataProvider.jsx`) via a plain `order` integer
field + swap-adjacent-values logic — deliberately **not** `@dnd-kit` drag-and-drop
(that library is still only listed as a "to add" dependency in §15 for the
CMS section-reorder use case, which has more complex nested drag targets).
For a simple flat list, up/down buttons are simpler, fully keyboard/
accessible by default, and need zero new dependencies. Keep using this
pattern for future flat reorderable lists; reach for `@dnd-kit` only when
Section Editor drag-reorder (§3.2) actually gets built.

### 16.5 Adding a new "public content" CRUD module

If you're adding another simple content module (same shape as Music/
Testimonials/Contact Info/Donations — a flat list of records the public
site will eventually read), the fastest correct path is:

1. Add the seed array to `mock/mockData.js`.
2. Add `useState` + CRUD callbacks to `AdminDataProvider.jsx` (copy the
   Music or Contact Info block — they're the two shortest, cleanest
   examples), and thread the new values through the `value`/deps arrays at
   the bottom of that file (easy to forget one of the two).
3. Build the page under `pages/cms/` reusing `Card`, `Modal`, `ConfirmModal`,
   `Field`/`TextInput`/`TextArea`/`Select`, `Toggle`, `StatusBadge`,
   `IconButton`, `EmptyState`, and `ImageUploader` if it needs a photo —
   don't rebuild any of these.
4. Wire it into `layout/navConfig.js` (`NAV` array + a `BREADCRUMB_RULES`
   entry — the breadcrumb regex list is order-sensitive, more specific
   paths must come before their parent path) and `AdminApp.jsx` (import +
   `<Route>`).
5. Add the DB table, API endpoints, and route-tree entry to this document
   (§11/§12/§13) so the backend implementation has a spec to build against.

---

*End of plan. Implementation starts at Phase 1.*

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
