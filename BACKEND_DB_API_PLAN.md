# Golden Age Wisdom — Backend Database & API Implementation Plan

> **Companion document to [`ADMIN_PANEL_PLAN.md`](./ADMIN_PANEL_PLAN.md).**
> That document describes the admin panel **frontend**, which is fully built
> (see its §16 for how). This document is the **backend counterpart**: the
> complete MySQL schema and Laravel API surface needed to make every screen
> in the frontend real, with nothing missing. Planning only — no migrations
> or controllers have been written yet. Build against this document; don't
> re-derive scope from the frontend code as you go, so nothing gets missed.

**Stack:** Laravel (existing scaffold in `backend/`) + MySQL 8 + Sanctum
(token-based, not SPA-cookie — see §7.1 for why that distinction matters
here).

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Entity Overview](#2-entity-overview)
3. [Complete Table Reference](#3-complete-table-reference)
4. [Migration Order](#4-migration-order)
5. [Seeders](#5-seeders)
6. [API Route Map](#6-api-route-map)
7. [Auth & Permission Architecture](#7-auth--permission-architecture)
8. [File Storage Plan](#8-file-storage-plan)
9. [Validation Notes](#9-validation-notes)
10. [Frontend ↔ Backend Traceability Matrix](#10-frontend--backend-traceability-matrix)
11. [Known Gaps / Open Items](#11-known-gaps--open-items)
12. [Suggested Build Order](#12-suggested-build-order)

---

## 1. Conventions

- **Table names:** snake_case, plural (`music_tracks`, not `MusicTrack` or `music_track`).
- **Primary keys:** `id BIGINT UNSIGNED AUTO_INCREMENT` on every table (Laravel's `$table->id()`), except `settings` which is keyed by `key`.
- **Foreign keys:** `{singular}_id BIGINT UNSIGNED`, always indexed, always with an explicit `onDelete` behavior — never left to default (see rule below).
- **`onDelete` rule of thumb:**
  - Parent literally owns the child row (page → sections → content; role/permission pivots) → `cascadeOnDelete()`.
  - Reference is informational / audit-trail (`created_by`, `added_by`, `uploaded_by`, `assigned_to`, `assigned_practitioner_id`) → `nullOnDelete()`, column nullable. Deleting a user must never silently delete content they created or people they were guiding.
- **Strings:** `VARCHAR(255)` unless noted otherwise. Slugs and other MySQL-indexed strings that could exceed InnoDB's utf8mb4 index-key limit use `VARCHAR(191)`.
- **Enums:** MySQL native `ENUM(...)`, values written out explicitly per table below — copy them exactly, they must match the frontend's literal string values (`mock/mockData.js`) or the UI will silently break on unrecognized values.
- **Structured/array data:** MySQL `JSON` column type (not TEXT+manual encode) — `points`, `target_pages`, `target_ids`, `input_data`, `options`, `meta`.
- **Booleans:** `BOOLEAN` (`TINYINT(1)`), always with an explicit `default()`.
- **Timestamps:** `timestamps()` (`created_at`/`updated_at`) on every table unless noted. `members` additionally gets `softDeletes()` per the frontend's "soft delete" requirement (§4.2 of the admin plan) — no other table needs soft deletes today.
- **Charset/collation:** `utf8mb4_unicode_ci` throughout (multi-language content, emoji in quotes/testimonials).
- **Money/counters:** unsigned integers, no `DECIMAL` needed anywhere in this schema (no priced transactions — donations are informational bank details, not a payment gateway).

---

## 2. Entity Overview

Grouped by the same modules `ADMIN_PANEL_PLAN.md` uses, so you can jump between the two documents by section name.

```
Auth & RBAC        users ─┬─< user_roles >─┬─ roles ─┬─< role_permissions >─┬─ permissions
                           │                │         │
                           └─ primary_role_id (FK → roles, denormalized "main" role for login redirect)

Languages          languages ─< ui_translations
                   languages ─< page_translations
                   languages ─< section_content

CMS — Pages        pages ─< page_translations
                   pages ─< page_sections ─< section_content
                   media (standalone; referenced by URL/path from section_content, not FK — see §3.3)

CMS — Content      music_tracks
modules            testimonials
                   contact_channels
                   donation_methods
                   events                          (⚠ see §11 — no admin UI yet)

People             contact_submissions ─┬─ assigned_to (FK → users)
                                        └─ converted_to_member_id (FK → members)
                   members ─┬─ assigned_practitioner_id (FK → users)
                             ├─ source_submission_id (FK → contact_submissions)
                             └─< member_journeys ─ added_by (FK → users)

Engage             announcements ─< announcement_reads ─ user_id (FK → users)
                   broadcasts
                   qr_codes

Reports            activity_logs ─ user_id (FK → users)   [written by all modules, read only by Reports]

Settings           settings (flat key/value, no relations)
```

---

## 3. Complete Table Reference

### 3.1 Auth & RBAC

#### `users` (extend Laravel's default table)
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| name | VARCHAR(255) | |
| email | VARCHAR(255) UNIQUE | |
| email_verified_at | TIMESTAMP NULL | |
| password | VARCHAR(255) | |
| remember_token | VARCHAR(100) NULL | |
| avatar_path | VARCHAR(500) NULL | |
| specialty | VARCHAR(255) NULL | practitioner-only, e.g. "Kundalini & Breathwork" |
| bio | TEXT NULL | practitioner-only |
| max_capacity | INT UNSIGNED NULL | practitioner-only, max members they can carry |
| status | ENUM('active','inactive') DEFAULT 'active' | |
| primary_role_id | BIGINT UNSIGNED NULL, FK → roles.id, `nullOnDelete` | drives login redirect (§7.2); the *set* of a user's roles is `user_roles`, this is just "which one to treat as primary" |
| last_login_at | TIMESTAMP NULL | set on every successful login |
| timestamps | | |

> **`members_assigned` is NOT a column.** The frontend shows it as a count per practitioner — compute it (`COUNT(members) WHERE assigned_practitioner_id = users.id`) via an Eloquent `withCount` or accessor, never store it (it would drift out of sync the moment a member is reassigned).

#### `roles`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| name | VARCHAR(100) UNIQUE | machine name: `super_admin`, `admin`, `content_manager`, `practitioner`, or custom |
| display_name | VARCHAR(150) | |
| description | VARCHAR(255) NULL | |
| is_system | BOOLEAN DEFAULT false | built-ins (`super_admin`/`admin`/`content_manager`/`practitioner`) = true, protected from deletion |
| timestamps | | |

#### `permissions`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| name | VARCHAR(150) UNIQUE | e.g. `cms.view`, `members.assign` — matches `ADMIN_PANEL_PLAN.md` §2.2 groups |
| group | VARCHAR(50) | `cms`, `languages`, `users`, `roles`, `members`, `reports`, `announcements`, `broadcast`, `qrcode`, `settings`, plus new groups for §3.4: `music`, `testimonials`, `contact_channels`, `donations` |
| description | VARCHAR(255) NULL | |
| timestamps | | |

#### `role_permissions` (pivot)
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| role_id | BIGINT UNSIGNED, FK → roles.id, `cascadeOnDelete` | |
| permission_id | BIGINT UNSIGNED, FK → permissions.id, `cascadeOnDelete` | |
| timestamps | | |

`UNIQUE(role_id, permission_id)`.

#### `user_roles` (pivot — replaces a flat `role` string column)
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| user_id | BIGINT UNSIGNED, FK → users.id, `cascadeOnDelete` | |
| role_id | BIGINT UNSIGNED, FK → roles.id, `cascadeOnDelete` | |
| timestamps | | |

`UNIQUE(user_id, role_id)`. Today's mock data only ever gives a user one role — seed one `user_roles` row per demo user and point `primary_role_id` at the same row's role. The schema supports more without any migration changes later.

*(Laravel defaults, unchanged: `personal_access_tokens`, `password_reset_tokens`, `sessions`, `cache`, `jobs`.)*

---

### 3.2 Languages & Translations

#### `languages`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| name | VARCHAR(100) | English display name, e.g. "Hindi" |
| native_name | VARCHAR(100) | e.g. "हिन्दी" |
| code | VARCHAR(10) UNIQUE | ISO code, e.g. `en`, `hi`, `es`, `ar` |
| direction | ENUM('ltr','rtl') DEFAULT 'ltr' | |
| is_enabled | BOOLEAN DEFAULT true | |
| is_default | BOOLEAN DEFAULT false | exactly one row should be true — enforce in `LanguageController@setDefault`, not the DB |
| timestamps | | |

#### `ui_translations`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| language_id | BIGINT UNSIGNED, FK → languages.id, `cascadeOnDelete` | |
| key | VARCHAR(191) | e.g. `nav.contact`, `form.submit` |
| value | TEXT | |
| timestamps | | |

`UNIQUE(language_id, key)`.

---

### 3.3 CMS — Pages, Sections, Media

#### `pages`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| slug | VARCHAR(191) UNIQUE | `home`, `about`, `meditate`, `wellness`, `events`, `mission`, `contact`, or custom |
| title | VARCHAR(255) | admin-facing label (not per-language — see `page_translations` for the public, per-language title) |
| is_builtin | BOOLEAN DEFAULT false | built-ins protected from deletion at the controller level |
| status | ENUM('draft','published') DEFAULT 'draft' | |
| sort_order | INT UNSIGNED DEFAULT 0 | |
| created_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| timestamps | | |

#### `page_translations`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| page_id | BIGINT UNSIGNED, FK → pages.id, `cascadeOnDelete` | |
| language_id | BIGINT UNSIGNED, FK → languages.id, `cascadeOnDelete` | |
| title | VARCHAR(255) | public-facing, per-language (SEO `<title>`) |
| meta_description | VARCHAR(500) NULL | |
| timestamps | | |

`UNIQUE(page_id, language_id)`.

#### `page_sections`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| page_id | BIGINT UNSIGNED, FK → pages.id, `cascadeOnDelete` | |
| type | ENUM('hero','content_block','card_grid','event_list','contact_form','media_embed','custom_html') | |
| sort_order | INT UNSIGNED DEFAULT 0 | drag-reorder persists here |
| status | ENUM('active','hidden') DEFAULT 'active' | |
| timestamps | | |

#### `section_content`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| section_id | BIGINT UNSIGNED, FK → page_sections.id, `cascadeOnDelete` | |
| language_id | BIGINT UNSIGNED, FK → languages.id, `cascadeOnDelete` | |
| field_key | VARCHAR(100) | `eyebrow`, `heading`, `description`, `points`, `cta_label`, `cta_href`, `cards`, ... — free-form per section type, not an enum (keeps section types extensible without a migration) |
| field_value | TEXT NULL | NULL/empty = the "⚠ Missing" badge trigger in the section editor |
| field_type | ENUM('text','json','image_path') DEFAULT 'text' | `json` for arrays like `points`/`cards` (app layer `json_decode`s on read) |
| timestamps | | |

`UNIQUE(section_id, language_id, field_key)`.

#### `media`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| filename | VARCHAR(255) | stored filename (post-normalization) |
| original_name | VARCHAR(255) | as uploaded |
| disk | VARCHAR(50) DEFAULT 'public' | see §8 |
| path | VARCHAR(500) | disk-relative path |
| url | VARCHAR(500) | resolved public URL, written at upload time |
| mime_type | VARCHAR(100) | |
| size_bytes | INT UNSIGNED | |
| alt_text | VARCHAR(255) NULL | |
| folder | VARCHAR(100) DEFAULT 'General' | plain string, not a FK — `MEDIA_FOLDERS` is a fixed list today, no folder-management UI exists to justify a table |
| uploaded_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| timestamps | | |

---

### 3.4 CMS — Music, Testimonials, Contact Info, Donations

#### `music_tracks`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| title | VARCHAR(255) | |
| artist | VARCHAR(255) NULL | defaults to "Golden Age Wisdom" at the UI layer if blank |
| category | ENUM('meditation','chanting','nature','sleep','instrumental') | matches `MUSIC_CATEGORIES` exactly |
| description | TEXT NULL | |
| cover_path | VARCHAR(500) NULL | |
| file_path | VARCHAR(500) | the audio file itself |
| duration_seconds | INT UNSIGNED DEFAULT 0 | server should also probe the uploaded file's duration (e.g. `getid3` or `ffprobe`) as a source of truth, not just trust the client's `loadedmetadata` reading |
| status | ENUM('draft','published') DEFAULT 'draft' | |
| sort_order | INT UNSIGNED DEFAULT 0 | |
| created_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| timestamps | | |

#### `testimonials`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| name | VARCHAR(255) | |
| role | VARCHAR(255) NULL | e.g. "Practitioner, 2 years" |
| photo_path | VARCHAR(500) NULL | |
| quote | TEXT | |
| rating | TINYINT UNSIGNED DEFAULT 5 | validate `1–5` at the app layer (Laravel `in:1,2,3,4,5`); a MySQL `CHECK` constraint is optional defense-in-depth on MySQL 8+ |
| status | ENUM('draft','published') DEFAULT 'draft' | |
| is_featured | BOOLEAN DEFAULT false | |
| sort_order | INT UNSIGNED DEFAULT 0 | |
| created_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| timestamps | | |

#### `contact_channels`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| type | ENUM('phone','whatsapp','email','address','website','social') | |
| label | VARCHAR(255) | |
| value | VARCHAR(500) | |
| is_visible | BOOLEAN DEFAULT true | hide without deleting |
| sort_order | INT UNSIGNED DEFAULT 0 | |
| timestamps | | |

#### `donation_methods`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| label | VARCHAR(255) | |
| account_holder | VARCHAR(255) NULL | |
| bank_name | VARCHAR(255) NULL | |
| account_number | VARCHAR(100) NULL | keep as string — leading zeros, non-numeric formats in some countries |
| ifsc | VARCHAR(20) NULL | |
| branch | VARCHAR(255) NULL | |
| swift | VARCHAR(20) NULL | |
| upi_id | VARCHAR(100) NULL | |
| payout_link | VARCHAR(500) NULL | PayPal.me / Stripe link etc. |
| qr_image_path | VARCHAR(500) NULL | |
| notes | TEXT NULL | |
| is_active | BOOLEAN DEFAULT true | deactivate instead of delete, per the frontend's own UI copy |
| sort_order | INT UNSIGNED DEFAULT 0 | |
| timestamps | | |

---

### 3.5 Events ⚠

#### `events`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| title | VARCHAR(255) | |
| description | TEXT NULL | |
| starts_at | DATETIME | |
| ends_at | DATETIME NULL | |
| location | VARCHAR(255) NULL | e.g. "Online" or a city |
| join_url | VARCHAR(500) NULL | |
| is_published | BOOLEAN DEFAULT false | |
| created_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| timestamps | | |

This table is listed in the original draft as "already migrated," but as of
this writing **no admin page manages it** — the old `EventsPage.jsx` was
deleted during the admin rebuild and never replaced; today's `event_list`
page-section type (§3.2 of `ADMIN_PANEL_PLAN.md`) has nothing to render
because there's no way to create an event row. See §11.

---

### 3.6 People — Queries & Members

#### `contact_submissions` (extend existing table)
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| name | VARCHAR(255) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(50) NULL | **add this** — captured by the public contact form and required by the practitioner's dashboard to actually reach the person; missing from the original draft's schema |
| category | ENUM('meditation','kundalini','health','general') DEFAULT 'general' | `general` is labeled "Other problem" in the UI — keep the DB value as `general`, only the display label differs |
| message | TEXT | |
| status | ENUM('new','assigned','in_progress','resolved','archived') DEFAULT 'new' | |
| assigned_to | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| converted_to_member_id | BIGINT UNSIGNED NULL, FK → members.id, `nullOnDelete` | added in a later migration, once `members` exists (§4) |
| timestamps | | |

#### `members`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| name | VARCHAR(255) | |
| email | VARCHAR(255) NULL | |
| phone | VARCHAR(50) NULL | |
| category | ENUM('meditation','kundalini','health','general') | |
| summary | TEXT NULL | the practitioner's running "about this person" overview — the Records-page summary field |
| assigned_practitioner_id | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| source_submission_id | BIGINT UNSIGNED NULL, FK → contact_submissions.id, `nullOnDelete` | null when created manually rather than converted from a query |
| status | ENUM('new','active','in_progress','resolved','archived') DEFAULT 'new' | |
| join_date | DATE | |
| last_contact_date | DATE NULL | |
| deleted_at | TIMESTAMP NULL | soft delete |
| timestamps | | |

#### `member_journeys`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| member_id | BIGINT UNSIGNED, FK → members.id, `cascadeOnDelete` | |
| added_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| entry_type | ENUM('note','status_change','session_completed','message_sent','qa') | `qa` added for the structured Q&A journal entries — not in the original draft |
| content | TEXT NULL | used by `note`/`status_change`/`session_completed`/`message_sent` |
| question | TEXT NULL | only populated when `entry_type = 'qa'` |
| answer | TEXT NULL | only populated when `entry_type = 'qa'` |
| meta | JSON NULL | free-form extra data per entry type, e.g. `{"previous_status": "new"}` for `status_change` |
| timestamps | | |

---

### 3.7 Engage

#### `announcements`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| title | VARCHAR(255) | |
| body | TEXT | rich text HTML |
| type | ENUM('info','warning','alert') DEFAULT 'info' | |
| target_type | ENUM('all','role','users') DEFAULT 'all' | |
| target_ids | JSON NULL | role IDs or user IDs depending on `target_type` |
| priority | ENUM('normal','urgent') DEFAULT 'normal' | |
| scheduled_at | DATETIME NULL | |
| sent_at | DATETIME NULL | |
| created_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| timestamps | | |

#### `announcement_reads`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| announcement_id | BIGINT UNSIGNED, FK → announcements.id, `cascadeOnDelete` | |
| user_id | BIGINT UNSIGNED, FK → users.id, `cascadeOnDelete` | |
| read_at | DATETIME | |
| timestamps | | |

`UNIQUE(announcement_id, user_id)`.

#### `broadcasts`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| title | VARCHAR(255) | |
| type | ENUM('text_banner','popup_card','media_popup','news_ticker') | |
| content_text | TEXT NULL | |
| content_image_path | VARCHAR(500) NULL | |
| content_video_url | VARCHAR(500) NULL | |
| cta_label | VARCHAR(100) NULL | |
| cta_url | VARCHAR(500) NULL | |
| target_pages | JSON NULL | array of page slugs |
| audience | ENUM('all','new_visitors','returning') DEFAULT 'all' | |
| show_after_seconds | INT UNSIGNED DEFAULT 0 | |
| frequency | ENUM('every_visit','once_per_session','once_per_day','once_ever') DEFAULT 'once_per_session' | |
| active_from | DATE NULL | |
| active_until | DATE NULL | |
| status | ENUM('draft','active','paused','expired') DEFAULT 'draft' | |
| created_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| timestamps | | |

#### `qr_codes`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| title | VARCHAR(255) | |
| type | ENUM('url','text','email','phone','sms','vcard','wifi','location') | |
| input_data | JSON | shape depends on `type` (e.g. `{"url": "..."}`, `{"ssid": "...", "password": "...", "encryption": "WPA"}`) |
| options | JSON NULL | `{"fg": "#111827", "bg": "#FFFFFF", "size": 256, "errorCorrection": "M", "logoPath": "..."}` |
| file_path | VARCHAR(500) NULL | generated PNG/SVG, cached so repeat downloads don't regenerate |
| download_count | INT UNSIGNED DEFAULT 0 | |
| created_by | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| timestamps | | |

---

### 3.8 Reports

#### `activity_logs`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED PK | |
| user_id | BIGINT UNSIGNED NULL, FK → users.id, `nullOnDelete` | |
| action | VARCHAR(255) | e.g. "published page", "assigned query" |
| target_type | VARCHAR(100) NULL | e.g. "page", "member" |
| target_id | BIGINT UNSIGNED NULL | not a FK — target could be any table, and rows the log references may later be deleted while the log entry must persist |
| meta | JSON NULL | |
| ip_address | VARCHAR(45) NULL | IPv6-safe length |
| timestamps | | `updated_at` unused in practice but kept for consistency; logs are append-only |

Populate this via a `LogsActivity` trait/observer hooked into every other
controller's write actions — don't hand-write a log call in each method
individually, it will get forgotten.

---

### 3.9 Settings

#### `settings`
| Column | Type | Notes |
|---|---|---|
| key | VARCHAR(191) PRIMARY KEY | dot-notation, e.g. `general.site_name` |
| value | TEXT NULL | |
| timestamps | | |

Flat key-value by design — the admin `SettingsPage` has seven groups with a
long tail of fields (and will likely grow more), and a key-value table
avoids a wide, mostly-null `settings` table or a migration every time a
field is added. The API groups keys back into the nested shape the frontend
expects (§6). Full key catalogue to seed:

```
general.site_name              general.tagline               general.admin_email
general.default_language       general.timezone
social.youtube                 social.instagram               social.facebook
social.whatsapp                social.phone                   social.address
banner.enabled                 banner.text                    banner.cta_label
banner.cta_url
maintenance.enabled            maintenance.message            maintenance.allowed_ips
appearance.logo_url            appearance.favicon_url
email.smtp_host                email.smtp_port                email.smtp_user
email.smtp_password            email.notify_on_submission
```

`email.smtp_password` must **never** be included in the `GET /admin/settings`
response — write-only field, masked/omitted on read (same pattern as any API
key field).

`advanced.storage_used_mb` and `advanced.app_version` shown on the frontend
are **not** settings rows — they're computed at request time
(disk usage query, `config('app.version')`) and don't belong in this table.

---

## 4. Migration Order

Numbered so foreign keys always reference a table that already exists.
Each line is one migration file.

```
 1. add_profile_fields_to_users_table        (specialty, bio, max_capacity, status, last_login_at, avatar_path)
 2. create_roles_table
 3. create_permissions_table
 4. create_role_permissions_table
 5. create_user_roles_table
 6. add_primary_role_id_to_users_table       (FK → roles, now that roles exists)
 7. create_languages_table
 8. create_ui_translations_table
 9. create_pages_table
10. create_page_translations_table
11. create_page_sections_table
12. create_section_content_table
13. create_media_table
14. create_music_tracks_table
15. create_testimonials_table
16. create_contact_channels_table
17. create_donation_methods_table
18. create_events_table
19. add_phone_category_assigned_to_to_contact_submissions_table
20. create_members_table
21. add_converted_to_member_id_to_contact_submissions_table   (FK → members, now that it exists)
22. create_member_journeys_table
23. create_announcements_table
24. create_announcement_reads_table
25. create_broadcasts_table
26. create_qr_codes_table
27. create_activity_logs_table
28. create_settings_table
```

---

## 5. Seeders

Run in this order (respects the same dependencies as §4):

1. **`RolesAndPermissionsSeeder`** — insert every `permissions` row from the
   `PERMISSION_GROUPS` shape in `mock/mockData.js` (§2.2 of the admin plan),
   plus new `music.*`, `testimonials.*`, `contact_channels.*`, `donations.*`
   groups. Insert the four built-in `roles`. Expand each role's mock
   `permissions` array into concrete `role_permissions` rows — where the
   mock uses a wildcard like `"cms.*"`, expand it to every `cms.*`
   permission row that exists; `super_admin`'s mock value is the literal
   string `"all"` → assign every permission row that exists.
2. **`LanguagesSeeder`** — EN (default), HI, ES, AR (disabled), matching
   `LANGUAGES` in the mock file.
3. **`BuiltInPagesSeeder`** — the 7 built-in pages (`home`, `about`,
   `meditate`, `wellness`, `events`, `mission`, `contact`), their sections,
   and `section_content` populated from **today's actual hardcoded copy** in
   `AboutSection.jsx`, `MeditateSection.jsx`, etc. — not the shorter mock
   placeholder text — so the public site doesn't go blank the moment it
   switches from hardcoded props to fetching from the API. This is the same
   requirement the original draft called out in its "industrial-grade" §8;
   it still applies.
4. **`SettingsSeeder`** — every key from the §3.9 catalogue, seeded with
   today's real values (from `Header.jsx`/`Footer.jsx`/`LiveSessionBanner.jsx`
   and the business's actual contact details), not mock placeholders.
5. **`DemoUsersSeeder`** *(non-production)* — one user per role, matching
   `USERS` in the mock file, so the seeded admin panel is immediately
   explorable. **Never run against production** — production gets exactly
   one seeded `super_admin` account with a real email and a generated
   password.
6. **`DemoContentSeeder`** *(non-production, optional)* — sample
   `contact_submissions`, `members`, `member_journeys`,
   `music_tracks`, `testimonials`, `contact_channels`, `donation_methods`,
   `announcements`, `broadcasts`, `qr_codes` mirroring the mock data, purely
   so a staging environment looks populated. Gate behind
   `app()->environment(['local', 'staging'])`.

---

## 6. API Route Map

All `/admin/*` and `/practitioner/*` routes require `auth:sanctum` +
the matching permission (§7). Endpoints marked *(public)* have no auth
middleware. List endpoints (`GET` without an `{id}`) all support
`?search=&page=&per_page=&sort=` in addition to any filters noted.

### Auth
```
POST   /api/v1/admin/login
POST   /api/v1/admin/logout
GET    /api/v1/admin/me
```
`AuthController`. `login` issues a Sanctum personal access token (§7.1) —
not a session cookie. `me` returns the user plus their resolved permission
list (flattened from `user_roles` → `role_permissions`), since the frontend
needs that array for `<RequirePermission>` route guards.

### Languages
```
GET    /api/v1/admin/languages
POST   /api/v1/admin/languages
PUT    /api/v1/admin/languages/{id}
DELETE /api/v1/admin/languages/{id}
GET    /api/v1/languages/enabled          (public)
```
`LanguageController`. Permission: `languages.*`.

### CMS — Pages / Sections / Content
```
GET    /api/v1/admin/pages
POST   /api/v1/admin/pages
GET    /api/v1/admin/pages/{slug}
PUT    /api/v1/admin/pages/{slug}
DELETE /api/v1/admin/pages/{slug}                      (blocked for is_builtin=true)
PATCH  /api/v1/admin/pages/{slug}/status

GET    /api/v1/admin/pages/{slug}/sections
POST   /api/v1/admin/pages/{slug}/sections
PUT    /api/v1/admin/pages/{slug}/sections/{id}
DELETE /api/v1/admin/pages/{slug}/sections/{id}
PUT    /api/v1/admin/pages/{slug}/sections/reorder     (body: ordered array of section IDs)

GET    /api/v1/admin/sections/{id}/content
PUT    /api/v1/admin/sections/{id}/content              (body: {lang: {field_key: value}})
GET    /api/v1/content/{slug}?lang={code}                (public — assembled page + sections + content for one language)
```
`PageController`, `SectionController`, `SectionContentController`. Permission: `cms.*`.

### Media
```
GET    /api/v1/admin/media
POST   /api/v1/admin/media                  (multipart upload)
PUT    /api/v1/admin/media/{id}
DELETE /api/v1/admin/media/{id}             (warn client-side if referenced in section_content; don't hard-block server-side)
```
`MediaController`. Permission: `cms.*`.

### Music
```
GET    /api/v1/admin/music
POST   /api/v1/admin/music                  (multipart: audio file + cover + fields)
GET    /api/v1/admin/music/{id}
PUT    /api/v1/admin/music/{id}             (multipart if replacing the file, JSON otherwise)
DELETE /api/v1/admin/music/{id}
PUT    /api/v1/admin/music/reorder          (body: ordered array of track IDs)
GET    /api/v1/music                        (public, status=published only, ordered by sort_order)
```
`MusicController`. Permission: `music.*`.

### Testimonials
```
GET    /api/v1/admin/testimonials
POST   /api/v1/admin/testimonials
GET    /api/v1/admin/testimonials/{id}
PUT    /api/v1/admin/testimonials/{id}
DELETE /api/v1/admin/testimonials/{id}
GET    /api/v1/testimonials                          (public, published only)
GET    /api/v1/testimonials/featured                 (public, published + is_featured only — for the homepage)
```
`TestimonialController`. Permission: `testimonials.*`.

### Contact channels
```
GET    /api/v1/admin/contact-channels
POST   /api/v1/admin/contact-channels
PUT    /api/v1/admin/contact-channels/{id}
DELETE /api/v1/admin/contact-channels/{id}
PUT    /api/v1/admin/contact-channels/reorder
GET    /api/v1/contact-channels                      (public, is_visible only)
```
`ContactChannelController`. Permission: `contact_channels.*`.

### Donation methods
```
GET    /api/v1/admin/donation-methods
POST   /api/v1/admin/donation-methods       (multipart if QR image included)
PUT    /api/v1/admin/donation-methods/{id}
DELETE /api/v1/admin/donation-methods/{id}
GET    /api/v1/donation-methods             (public, is_active only)
```
`DonationMethodController`. Permission: `donations.*`.

### Events ⚠ (see §11 — build the admin page alongside this)
```
GET/POST/PUT/DELETE  /api/v1/admin/events/{id?}
GET    /api/v1/events                       (public, is_published only, ordered by starts_at)
```
`EventController`. Permission: `cms.*` (or a dedicated `events.*` group if it grows its own admin page).

### Users & Roles
```
GET/POST/PUT/DELETE  /api/v1/admin/users/{id?}
GET/POST/PUT/DELETE  /api/v1/admin/roles/{id?}        (delete blocked for is_system=true)
GET                  /api/v1/admin/permissions
```
`UserController`, `RoleController`, `PermissionController`. Permission: `users.*` / `roles.*`.

### Members
```
GET/POST/PUT/DELETE  /api/v1/admin/members/{id?}      (DELETE = soft delete)
POST   /api/v1/admin/members/{id}/assign               (body: {assigned_practitioner_id})
GET    /api/v1/admin/members/{id}/journey
POST   /api/v1/admin/members/{id}/journey               (body: {entry_type, content} or {entry_type: 'qa', question, answer})
GET    /api/v1/admin/members/export                     (CSV)
```
`MemberController`, `MemberJourneyController`. Permission: `members.*`.

### Queries
```
GET    /api/v1/admin/queries                            (filters: category, status, assigned_to, date_from, date_to)
GET    /api/v1/admin/queries/{id}
PATCH  /api/v1/admin/queries/{id}/status
PATCH  /api/v1/admin/queries/{id}/assign                (body: {assigned_to})
POST   /api/v1/admin/queries/{id}/convert-to-member      (creates a members row, links converted_to_member_id, seeds first journey entry)
POST   /api/v1/contact                                   (public form submit — body: {name, email, phone, category, message})
```
`QueryController`. Permission: `members.*` (queries and members share a permission group — same lifecycle).

### Practitioner (own scope — no `members.*` permission needed, just "is a practitioner and it's their own record")
```
GET    /api/v1/practitioner/dashboard-stats
GET    /api/v1/practitioner/members
GET    /api/v1/practitioner/members/{id}                (403 if not assigned to the requesting practitioner)
GET    /api/v1/practitioner/members/{id}/journey
POST   /api/v1/practitioner/members/{id}/journey
PUT    /api/v1/practitioner/members/{id}/summary
GET    /api/v1/practitioner/announcements
PATCH  /api/v1/practitioner/announcements/{id}/read
```
`PractitionerController`. Every method here must additionally check
`member.assigned_practitioner_id === auth()->id()` — this scope is not a
permission-group thing, it's an ownership check per row.

### Announcements
```
GET/POST/PUT/DELETE  /api/v1/admin/announcements/{id?}
POST   /api/v1/admin/announcements/{id}/send
```
`AnnouncementController`. Permission: `announcements.*`.

### Broadcasts
```
GET/POST/PUT/DELETE  /api/v1/admin/broadcasts/{id?}
PATCH  /api/v1/admin/broadcasts/{id}/status
GET    /api/v1/broadcasts/active             (public — filters by status=active, active_from/until window, target_pages)
```
`BroadcastController`. Permission: `broadcast.*`.

### QR Codes
```
GET    /api/v1/admin/qr-codes
POST   /api/v1/admin/qr-codes/generate
DELETE /api/v1/admin/qr-codes/{id}
GET    /api/v1/admin/qr-codes/{id}/download   (increments download_count, streams the file)
```
`QrCodeController`. Permission: `qrcode.*`.

### Reports
```
GET    /api/v1/admin/reports/overview
GET    /api/v1/admin/reports/members
GET    /api/v1/admin/reports/practitioners
GET    /api/v1/admin/reports/queries
GET    /api/v1/admin/reports/activity-log
GET    /api/v1/admin/reports/export?type={}&format={csv|pdf}
```
`ReportController`. Permission: `reports.view` (read-only group — nobody edits a report).

### Settings
```
GET/PUT  /api/v1/admin/settings              (GET assembles flat keys back into the nested {general:{...}, social:{...}, ...} shape; PUT accepts the same nested shape and flattens it back to key rows)
POST     /api/v1/admin/settings/test-email
POST     /api/v1/admin/settings/clear-cache
```
`SettingController`. Permission: `settings.*`.

---

## 7. Auth & Permission Architecture

### 7.1 Token-based Sanctum, not SPA-cookie Sanctum

`frontend/src/lib/api.js` already stores a bearer token in `localStorage`
and sends `Authorization: Bearer {token}` on every request (`apiFetch`) —
it was **not** built for Sanctum's cookie-based SPA authentication (which
needs `SANCTUM_STATEFUL_DOMAINS`, CSRF cookie bootstrapping, and
same-site-cookie CORS config). Match what's already there:

- `POST /admin/login` calls `$user->createToken('admin-panel')->plainTextToken` and returns it in the response body.
- Every protected route uses `auth:sanctum` middleware, which for a bearer
  token (no session cookie present) authenticates via the token automatically —
  no stateful-domain config needed.
- `config/cors.php`: allow the frontend's origin(s), `supports_credentials`
  can stay `false` (no cookies involved).
- `POST /admin/logout` calls `$request->user()->currentAccessToken()->delete()`.

### 7.2 Permission middleware

Replace the "simple role check" placeholder with a `CheckPermission`
middleware:

```php
Route::middleware(['auth:sanctum', 'permission:members.edit'])->put('/admin/members/{id}', ...);
```

```php
class CheckPermission
{
    public function handle($request, Closure $next, string $permission)
    {
        $user = $request->user();

        // super_admin bypasses individual permission checks entirely —
        // don't rely on every permission row being assigned to it.
        if ($user->roles->contains('name', 'super_admin')) {
            return $next($request);
        }

        $has = $user->roles
            ->loadMissing('permissions')
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->contains($permission);

        abort_unless($has, 403);

        return $next($request);
    }
}
```

Register the middleware alias in `bootstrap/app.php` (or
`app/Http/Kernel.php` on older Laravel versions) as `permission`.

### 7.3 Login redirect

`GET /admin/me` returns `primary_role.name`. Frontend already branches on
this (`ADMIN_PANEL_PLAN.md` §2.4): `super_admin`/`admin`/`content_manager`
→ `/admin`, `practitioner` → `/admin/my-dashboard`.

---

## 8. File Storage Plan

| Upload type | Disk (local dev) | Disk (production) | Path pattern | Max size | Allowed MIME |
|---|---|---|---|---|---|
| Media library images/video | `public` (`storage/app/public`) | `s3` (env-configured) | `media/{year}/{month}/{uuid}.{ext}` | 10 MB | `image/*`, `video/mp4` |
| Music audio files | `public` or `s3` | `s3` | `music/{uuid}.{ext}` | 50 MB | `audio/mpeg`, `audio/wav`, `audio/mp4` |
| Music cover art | same as media | same | `music/covers/{uuid}.{ext}` | 5 MB | `image/*` |
| Testimonial photos | same as media | same | `testimonials/{uuid}.{ext}` | 5 MB | `image/*` |
| Donation QR images | same as media | same | `donations/{uuid}.{ext}` | 5 MB | `image/*` |
| User avatars | same as media | same | `avatars/{uuid}.{ext}` | 5 MB | `image/*` |
| Generated QR codes | `local` (not public — served via a download route) | same | `qr-codes/{uuid}.{ext}` | n/a (generated) | n/a |

Config: `FILESYSTEM_DISK` env var switches the whole app between `public`
and `s3` without code changes — every controller writes via
`Storage::disk(config('filesystem.uploads_disk'))`, never hardcodes `public`.
Run `php artisan storage:link` in local/dev so `public` disk files are
browser-reachable.

Every upload endpoint validates `mimes:` and `max:` per the table above
(Laravel `File` validation rule) — **before** touching the disk, not after.

---

## 9. Validation Notes

Representative Form Request rules (not exhaustive for every field — follow
this pattern for the rest):

**`StoreContactSubmissionRequest`** *(public — keep it lenient but not
wide open)*
```php
'name' => ['required', 'string', 'max:255'],
'email' => ['required', 'email', 'max:255'],
'phone' => ['required', 'string', 'max:50'],
'category' => ['required', Rule::in(['meditation', 'kundalini', 'health', 'general'])],
'message' => ['required', 'string', 'max:5000'],
```
Also rate-limit this route (`throttle:5,1` — 5 submissions/minute/IP) since
it's the one fully public POST endpoint with no auth at all.

**`StoreMemberRequest`**
```php
'name' => ['required', 'string', 'max:255'],
'email' => ['nullable', 'email', 'max:255'],
'phone' => ['nullable', 'string', 'max:50'],
'category' => ['required', Rule::in(['meditation', 'kundalini', 'health', 'general'])],
'assigned_practitioner_id' => ['nullable', 'exists:users,id'],
```

**`StoreMusicTrackRequest`**
```php
'title' => ['required', 'string', 'max:255'],
'artist' => ['nullable', 'string', 'max:255'],
'category' => ['required', Rule::in(['meditation', 'chanting', 'nature', 'sleep', 'instrumental'])],
'file' => ['required_without:file_path', 'file', 'mimes:mp3,wav,m4a', 'max:51200'],
'cover' => ['nullable', 'image', 'max:5120'],
'status' => ['required', Rule::in(['draft', 'published'])],
```

**`StoreTestimonialRequest`**
```php
'name' => ['required', 'string', 'max:255'],
'quote' => ['required', 'string', 'max:2000'],
'rating' => ['required', 'integer', 'between:1,5'],
'photo' => ['nullable', 'image', 'max:5120'],
'status' => ['required', Rule::in(['draft', 'published'])],
'is_featured' => ['boolean'],
```

**`StoreDonationMethodRequest`**
```php
'label' => ['required', 'string', 'max:255'],
'account_number' => ['nullable', 'string', 'max:100'],
'upi_id' => ['nullable', 'string', 'max:100'],
'payout_link' => ['nullable', 'url', 'max:500'],
'qr_image' => ['nullable', 'image', 'max:5120'],
'is_active' => ['boolean'],
```

General rule for every admin write endpoint: validate with a Form Request
class (never inline `$request->validate()` in the controller), and every
list endpoint's filters (`category`, `status`, `assigned_to`, etc.) get
validated too — `Rule::in(...)` against the same enum values as the DB
column, so a bad filter value 422s instead of silently returning an empty
result set.

---

## 10. Frontend ↔ Backend Traceability Matrix

Every `mock/mockData.js` export, mapped to its table and endpoint group —
use this to confirm nothing in §3/§6 was missed relative to what the
frontend actually needs.

| Mock export | Table(s) | Endpoint group |
|---|---|---|
| `LANGUAGES` | `languages` | Languages |
| `UI_TRANSLATIONS` | `ui_translations` | Languages |
| `SECTION_TYPES` | *(enum only — `page_sections.type`)* | CMS — Pages |
| `PAGES` (incl. nested `sections[]`, `content{}`) | `pages`, `page_translations`, `page_sections`, `section_content` | CMS — Pages |
| `MEDIA_FOLDERS` | *(fixed list, not a table — see §3.3)* | — |
| `MEDIA` | `media` | Media |
| `PERMISSION_GROUPS` | `permissions` (seed data) | Users & Roles |
| `ROLES` | `roles`, `role_permissions` | Users & Roles |
| `USERS` | `users`, `user_roles` | Users & Roles |
| `CURRENT_PRACTITIONER_ID` | *(app-level "logged in as," not stored)* | — |
| `CATEGORY_LABELS` / `CATEGORIES` | *(enum values, not stored — labels are frontend-only display strings)* | — |
| `QUERIES` | `contact_submissions` | Queries |
| `MEMBERS` | `members` | Members |
| `JOURNEYS` | `member_journeys` | Members |
| `ANNOUNCEMENTS` | `announcements` | Announcements |
| `BROADCASTS` | `broadcasts` | Broadcasts |
| `QR_CODES` | `qr_codes` | QR Codes |
| `ACTIVITY_LOG` | `activity_logs` | Reports |
| `REPORTS` | *(computed via aggregation queries — no dedicated table)* | Reports |
| `SETTINGS` | `settings` | Settings |
| `DASHBOARD_TRENDS` | *(computed, no table)* | — |
| `CONTACT_CHANNEL_TYPES` | *(enum only — `contact_channels.type`)* | — |
| `CONTACT_CHANNELS` | `contact_channels` | Contact channels |
| `DONATION_METHODS` | `donation_methods` | Donation methods |
| `MUSIC_CATEGORIES` | *(enum only — `music_tracks.category`)* | — |
| `MUSIC_TRACKS` | `music_tracks` | Music |
| `TESTIMONIALS` | `testimonials` | Testimonials |

Every row has a home. If a future frontend feature adds a new
`mock/mockData.js` export, add a row here in the same PR — that's the
signal a migration is needed too.

---

## 11. Known Gaps / Open Items

1. **Events has no admin page.** The `events` table is specified (§3.5) and
   was even listed as "already migrated" in the original draft, but the
   admin frontend rebuild deleted `EventsPage.jsx` and never replaced it —
   there is currently no UI to create or edit an event row anywhere. The
   `event_list` CMS section type has nothing to render. Either build an
   `EventsPage` (list + form, same shape as Music/Testimonials) or fold
   event management into the Section Editor for the `events` page. Flag
   this to the user before backend work starts on it — worth confirming
   priority rather than assuming.
2. **File uploads are not persisted anywhere yet** — every uploader in the
   admin frontend uses a browser-local blob URL (`ADMIN_PANEL_PLAN.md`
   §16.3). This backend plan's `MediaController`-equivalents (§6, §8) are
   what finally make uploads survive a page refresh; until they're built,
   every upload in the admin panel is demo-only.
3. **Public site doesn't consume any of this API yet** (`ADMIN_PANEL_PLAN.md`
   §16.2) — `HomePage` and its sections are still hardcoded React props.
   Wiring the public site to `GET /content/{slug}`, `/music`, `/testimonials`,
   `/contact-channels`, `/donation-methods`, `/events`, `/broadcasts/active`
   is a separate pass after the admin-facing endpoints in §6 exist.
4. **`settings.email.smtp_password`** needs encryption at rest
   (Laravel's `encrypted` cast on the model attribute, or store it in
   `.env`/a secrets manager instead of the database at all — arguably the
   better call for SMTP credentials specifically, leaving `settings` for
   the notify-toggle only).
5. **No rate limiting or CAPTCHA on `POST /contact`** specified beyond the
   basic `throttle:5,1` in §9 — revisit if spam becomes a real problem
   post-launch.

---

## 12. Suggested Build Order

Follow `ADMIN_PANEL_PLAN.md` §14's phase numbering — this document doesn't
redefine the phases, just supplies the schema/endpoints each phase needs.
Read this doc's §3–§9 as the spec for whichever phase you're building.
One addition to that roadmap: **Phase 2 now also covers Music,
Testimonials, Contact Info, and Donations** (§3.4 here), since their
frontend already shipped alongside Media Library — build all five
together rather than context-switching back to CMS later.

---

*End of plan. This document and `ADMIN_PANEL_PLAN.md` together are the
full spec — nothing about the admin panel's data or API should need to be
re-derived from reading component code.*
