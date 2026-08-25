# Member Dashboard ("My Practice") — Build Plan

> **Status: implemented (Phases 0–5), 2026-08-25.** All dummy data listed in
> §1 has been removed and replaced with the real backend described below —
> migrations, models, controllers, and routes all exist and were curl-tested
> end to end; every page in §5 is wired to its real endpoint. The one open
> item from §6 was resolved by removing the dead admin-link check. A new
> admin **CMS → Live Sessions** page was added (it didn't exist at all
> before, despite the backend Events CRUD already existing) so admins can
> actually schedule sessions with a host practitioner for Join Live/Overview
> to show. The section below is kept as the original design record.

> **Original current state (pre-implementation):** the member-facing dashboard at `/dashboard` (sidebar:
> Overview, Sit & Scribe, Join live, Journal, Share the light, Circles &
> help) is a **fully static UI shell** — every number, name, and list on
> every page is a hardcoded JS constant. There are zero `fetch`/API calls
> anywhere under `frontend/src/user/`. Login/registration (`/join`) is real
> (Sanctum-backed, see the `Member` model), so we now have a real signed-in
> user — this plan wires the six pages behind it to real data, reusing
> existing admin-controlled content (Music, Contact/Queries) wherever
> possible instead of inventing parallel systems.

---

## 1. Current state — real vs. dummy, page by page

| Page | File | Status | Hardcoded values |
|---|---|---|---|
| Overview | `user/pages/OverviewPage.jsx` | 100% dummy | `CHALLENGE = { day: 12, total: 41 }`, streak `"12 days"`, stage `"Stage 2 · Stilling"`, total time `"18h 40m"`, `UPCOMING_SESSION` object |
| Sit & Scribe | `user/pages/SitScribePage.jsx` | UI-only, **timer doesn't even count down** | `DURATIONS = [10,20,30,45]`, nothing persisted |
| Join live | `user/pages/JoinLivePage.jsx` | 100% dummy | `SESSION = { isLive: false, title, time, teacher, attendees: 128 }` |
| Journal | `user/pages/JournalPage.jsx` | 100% dummy | 2 hardcoded `ENTRIES`, "Save" doesn't persist |
| Share the light | `user/pages/ShareLightPage.jsx` | 100% dummy | `REFERRAL_LINK` is a static, non-personalized string |
| Circles & help | `user/pages/CirclesHelpPage.jsx` | 100% dummy | "Send" just does `setSent(true)` — message goes nowhere |
| Sidebar user card | `user/layout/Sidebar.jsx` | **Real** | Pulls `user.name`/`user.email` from `useMemberAuth()` correctly |
| Sidebar "Admin panel" link | `user/layout/Sidebar.jsx:9` | Broken | Checks `user?.is_admin`, which `MemberAuthController::present()` never returns — see §6 |

There is currently **no `/api/v1/member/*` (or `/dashboard/*`) route group at
all** — everything below is new backend surface, built on top of the
existing `members`, `contact_submissions`, `music_tracks`, and `events`
tables wherever they already fit.

---

## 2. Guiding principle: reuse what admin already controls

Two of the six pages need **no new admin UI at all** — the admin panel
already fully manages the content, we just need to connect the dashboard to
it:

- **Circles & help** → the admin **Queries** module
  (`Api\Admin\People\ContactSubmissionController`) already receives, lists,
  assigns, and resolves exactly this kind of submission via the existing
  public `POST /api/v1/contact` endpoint. The "Ask" modal just needs to call
  that endpoint instead of faking `sent=true` locally.
- **Meditation music** (for Sit & Scribe background tracks) → the admin
  **Music** module (CMS → Music) already has full upload/publish/reorder
  CRUD (`MusicTrack` model, `Api\Admin\Content\MusicController`) and a
  public read endpoint (`GET /api/v1/music`) that returns published tracks.
  The dashboard just needs to *consume* that endpoint — whatever a
  practitioner/admin uploads and publishes in CMS → Music shows up in the
  member's player automatically, no new admin work needed.

Everything else (Journal, real streak/practice-time tracking, Join Live,
referrals, Profile) needs small new backend pieces, detailed below.

---

## 3. Data model additions

All additions are additive migrations on top of the existing schema — no
existing tables are restructured beyond adding nullable columns.

### 3.1 `contact_submissions` — link portal submissions to a member
```php
$table->foreignId('member_id')->nullable()->after('id')->constrained('members')->nullOnDelete();
$table->string('source')->default('website')->after('category'); // 'website' | 'member_portal'
```
Lets admin Queries show *which logged-in member* asked, and filter
portal-originated questions from anonymous public-site ones, without any
new table.

### 3.2 `music_tracks` — expose playable URLs
No migration needed — add `file_url`/`cover_url` computed accessors
(`Storage::url($this->file_path)`) to `MusicTrack` so the frontend gets a
ready-to-play URL instead of a raw storage path.

### 3.3 New table: `member_journal_entries`
```php
Schema::create('member_journal_entries', function (Blueprint $table) {
    $table->id();
    $table->foreignId('member_id')->constrained()->cascadeOnDelete();
    $table->text('content');
    $table->foreignId('practice_session_id')->nullable()->constrained()->nullOnDelete(); // optional link to the sit that prompted it
    $table->timestamps();
});
```
Powers the real Journal page (member-authored — distinct from the existing
practitioner-authored `member_journeys` CRM table, which stays untouched).

### 3.4 New table: `practice_sessions`
```php
Schema::create('practice_sessions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('member_id')->constrained()->cascadeOnDelete();
    $table->unsignedSmallInteger('duration_minutes');
    $table->timestamp('completed_at');
    $table->timestamps();
});
```
Every completed Sit & Scribe timer logs one row here. This table is what
makes the Overview page's streak / stage / total-time numbers **real**
instead of hardcoded.

### 3.5 `events` — minimal extension for "Join live"
```php
$table->foreignId('host_practitioner_id')->nullable()->after('description')->constrained('users')->nullOnDelete();
```
`is_published`, `starts_at`, `ends_at`, `join_url` already exist. "Live now"
is derived (`now()` between `starts_at`/`ends_at`), no new boolean needed.
Reuses the existing admin CMS → Events module instead of building a
parallel "Sessions" admin screen.

### 3.6 `members` — referral tracking
```php
$table->string('referral_code', 12)->nullable()->unique()->after('email');
$table->string('referred_by_code', 12)->nullable()->after('referral_code');
```
`referral_code` auto-generated on member creation; `referred_by_code`
captured from a `?ref=` query param at registration.

---

## 4. New backend API surface

All under the existing `auth:sanctum` + `member` middleware group in
`routes/api.php` (alongside `/auth/me`, `/auth/logout`) unless noted public:

```
GET  /api/v1/member/overview          streak, stage, total minutes, next session, recent journal snippet
GET  /api/v1/member/practice-sessions
POST /api/v1/member/practice-sessions          { duration_minutes }  → logs a completed sit, returns updated streak/stage
GET  /api/v1/member/journal
POST /api/v1/member/journal                    { content }
GET  /api/v1/member/live-sessions              upcoming + "is_live" flag from events (host filled in)
GET  /api/v1/member/referral                   { referral_code, share_url, referred_count }
PUT  /api/v1/member/profile                    { name, email }
PUT  /api/v1/member/password                   { current_password, password, password_confirmation }

POST /api/v1/contact   (existing, public)       + member sends { ...fields, category } while authed →
                                                   controller reads $request->user() if a member token is
                                                   present and stamps member_id + source=member_portal
```

`MusicTrack`'s existing public `GET /api/v1/music` is reused as-is for the
Sit & Scribe track picker — no new route.

---

## 5. Frontend wiring — page by page

| Page | Change |
|---|---|
| **Overview** | Replace `CHALLENGE`/`STATS`/`UPCOMING_SESSION` constants with `memberAuthApi.overview()` (new `/member/overview` call). Ring shows real day-of-41 (days since `join_date` capped at 41), streak/stage/time come from `practice_sessions`. |
| **Sit & Scribe** | Add an actual `setInterval` countdown (currently missing entirely). On completion, `POST /member/practice-sessions`. Add a track picker sourced from `GET /api/v1/music` (filtered to `category=meditation`, using new `file_url`). |
| **Join live** | `GET /member/live-sessions`; show the next upcoming event; "Join live" button enables when `is_live` is true and opens `join_url`. |
| **Journal** | Replace hardcoded `ENTRIES` with `GET /member/journal`; "Save entry" calls `POST /member/journal` and prepends the real response instead of just clearing local state. |
| **Share the light** | `GET /member/referral` for a real personalized link (`/join?ref={code}`); registration (`MemberAuthController::register`) reads `?ref=` from the request and sets `referred_by_code`. |
| **Circles & help** | "Send" calls `POST /api/v1/contact` with the topic as `category` and the message; show the real success state only after the request resolves. |
| **New: Profile page** | Not in the original six, but needed since the dashboard now has real accounts — add a 7th nav item for name/email/password editing (`PUT /member/profile`, `PUT /member/password`). |
| **Sidebar "Admin panel" link** | See §6 — decide before wiring. |

---

## 6. One design decision to flag before building

`Replicated-Design/Design.md` §9–§10 describes a **single member identity**
that can also carry `Admin`/`Super admin` roles, with an "Admin panel" link
appearing in *this same sidebar* for elevated members. What's actually
built is **two separate auth systems**: `Member` (public, this dashboard)
and `App\Models\Auth\User` (staff, RBAC roles, logs in separately at
`/admin`) — deliberately kept apart in the work I just did (separate
Sanctum token types, separate `member`/`admin` middleware) so a member
token can never touch admin routes.

Recommendation: **keep them separate** (it's simpler, more secure by
construction, and matches the RBAC system already fully built in
`ADMIN_PANEL_PLAN.md`) and just **remove** the dead `showAdmin`/`is_admin`
check from `Sidebar.jsx` — staff already have their own login at `/admin`
and never need to reach it via the member portal. Flagging this rather than
just deleting it, since it's a deliberate design-doc intent, not obviously
a mistake — say the word if you'd rather I wire real role data through
instead of removing the link.

---

## 7. Streak / stage calculation (recommendation)

Computed server-side in the new `/member/overview` endpoint, no new admin
config for v1:

- **Streak**: count of consecutive calendar days (ending today or
  yesterday) with ≥1 `practice_sessions` row.
- **Total practice time**: `sum(duration_minutes)` across all sessions.
- **Stage**, driven by streak length, echoing the 41-day framing already in
  the design:
  | Streak | Stage |
  |---|---|
  | 0–6 days | Stage 1 · Beginning |
  | 7–20 days | Stage 2 · Stilling |
  | 21–40 days | Stage 3 · Deepening |
  | 41+ days | Stage 4 · Awakened |

If you'd rather admins be able to edit these thresholds/labels later, that
slots into the existing `settings` table with no schema change — starting
fixed keeps v1 small.

---

## 8. Phased roadmap

**Phase 0 — quick wins (reuses 100% existing admin infra, no new tables)**
- Wire Circles & Help → real `POST /api/v1/contact` (+ `member_id`/`source` columns)
- Sit & Scribe track picker → existing `GET /api/v1/music`
- Resolve the Sidebar admin-link question (§6)

**Phase 1 — Profile**
- `member_id`-scoped profile/password endpoints + new Profile nav page

**Phase 2 — Journal**
- `member_journal_entries` table + CRUD + wire `JournalPage`

**Phase 3 — Sit & Scribe real timer + Overview**
- `practice_sessions` table, working countdown, streak/stage/time calc,
  `/member/overview` — this is the phase that lets Overview's dummy numbers
  actually be *deleted* rather than replaced with different dummy numbers

**Phase 4 — Join live**
- `host_practitioner_id` on `events`, `/member/live-sessions`, wire `JoinLivePage`
- (minor admin CMS tweak: add a host-practitioner picker to the existing Events form)

**Phase 5 — Share the light**
- `referral_code`/`referred_by_code` on `members`, `/member/referral`, capture `?ref=` on registration

---

## 9. Recommendation

Start with **Phase 0** — it's low-risk, needs no new tables (one migration
adding two columns to `contact_submissions`), and immediately makes two of
the six pages fully real using admin systems that already exist end to end.
Phases 1–5 can follow in the order above; each is independently shippable.

Say the word and I'll start on Phase 0, or tell me if you want to
reprioritize (e.g. Sit & Scribe/Overview first since that's the page you
screenshotted).
