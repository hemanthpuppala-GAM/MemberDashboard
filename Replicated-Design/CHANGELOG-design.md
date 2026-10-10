# Design changelog (shared ledger)

Format: date · item · status (🟡 designed / ✅ implemented @sha / ⬅ code change to mirror in Design / ↩ mirrored in Design)

## 2026-10-09 — Public home page + sub-pages + admin editors (design_handoff_home_bodhi_tree)
- ✅ @9eecaa6 Home `/` — Bodhi Tree v2: hero medallion, 6-node tree navigator (full Buddha + roots visible, pills cover painted leaf labels), 7 chapter sections, world-sits footer, peace film overlay
- ✅ @9eecaa6 Sub-pages `/about` `/mission` `/meditation` `/wisdom` `/wellness` `/events` with shared chrome (About: decorative corner frame behind portrait removed)
- ✅ @9eecaa6 Admin content editors (one per page) → `GET/PUT /api/v1/content/{page}`; seed from `design/content/*.json`
- ✅ @9eecaa6 Shared header on Home + all sub-pages: 48px medallion, wordmark, 7 page links (≥900px; hamburger below), right pill. Pill = "Join free" for guests; for a signed-in member it becomes an avatar-initial + first-name pill linking to the dashboard (read session from auth, not localStorage)
- ✅ @9eecaa6 Utility row above the header on Home + all 6 sub-pages (≥900px; in hamburger menu below): Member support → `/ask`, Volunteer → `/volunteer`, Privacy → `/privacy`. Same for guests and members. Replaces the earlier footer placement — no utility links in footers.
- ✅ @9eecaa6 `/volunteer` and `/privacy` pages (Volunteer.dc.html, Privacy.dc.html) now included in this bundle
- ✅ @9eecaa6 Wellness: detox diet PDF download (`assets/detox-diet.pdf`)
- ✅ @9eecaa6 PWA: manifest-v2, sw-v2, offline page, icons
- ✅ @9eecaa6 Responsive pillar image sets (`assets/pillars/`, webp+jpg, 6 widths)
- ✅ @9eecaa6 Official email is now **goldenageguruteachings@gmail.com** everywhere (replaces the old info@ address) — `gaw-config.js → officialEmail`; update backend mail FROM/CC, acknowledgement cc, OAuth consent screens, receipts, chatbot fallback text

- ⬅ code change: Home hero medallion (big emblem with rays/ripple, right of the hero) removed at the owner's request — the logo appears only top-left in the header. Design: Home Bodhi Tree v2.dc.html.
- ⬅ code change: content API is `GET /api/v1/site-content/{page}` (admin: GET/PUT/DELETE `/api/v1/admin/site-content/{page}`) — `/content/{slug}` was already taken by the legacy CMS blocks. Unpublished page → `data: null` → page shows the bundled `content/*.json` defaults.
- ⬅ code change: Volunteer form — phone is required (backend rule); label no longer says "Optional", placeholder "With country code, e.g. +91". Volunteer page uses the shared site header instead of its own small top bar. Design: Volunteer.dc.html.
- ⬅ code change: Home phone layout now mirrors desktop (owner request): no full-width photo band under the hero (the photo stays as the first card), the gold "Next group meditation" pill shows beside Watch the intro, and the phone time-zone strip is replaced by the same "Sits around the world" footer as desktop (stacked: title, ticker, full-width Join on Zoom). Design: Home Bodhi Tree v2.dc.html.
- ⬅ code change: Home Join pill click goes straight to /join (hover/focus still shows the member-QR card); the volunteer hint popover sits on the utility row's Volunteer link. Design: Home Bodhi Tree v2.dc.html.
- ⬅ code change: tree navigator uses the design code's frame (aspect 1277/835, image offset −10.78%, nodes [81.8,63.5] [61.9,62.3] [21.5,61.1] [27.6,29.9] [46.2,16.8] [66.7,27.5]) rather than the README's 1277/830 numbers. `#teachings` anchors on the tree + side-cards block.
- ⬅ code change: admin editors use the admin panel's own look (not cream/gold); images upload to the Media Library and store a URL (no base64 in JSON); Home's long "Header & hero" group has sub-headings. Raw-JSON panel for keys without a form field.
- ⬅ code change: tap targets raised to ≥44px where the design had 36–40px (detox tabs, film close, consent buttons, Zoom pill, a few text links).
- Not built: telemetry (Privacy page records the visitor's consent choice in `gaw_consent`; nothing reads it yet).

## 2026-10-08 — Ask a question, branded QR, support routing (design_handoff_ask_support)
- ✅ @804ed3c Public `/ask` page: no auth, type or voice (7 Indian languages), WhatsApp send, 3 page languages (EN/TE/KN)
- ✅ @804ed3c Member dashboard "Ask a question" tab: seva cards removed, 3-step flow, EN/TE toggle, confirmation email
- ✅ Dashboard Overview: "Wisdom of Dr. Harikrishna" card removed (already absent from the coded Overview — no change needed)
- ✅ @804ed3c Members get acknowledgement email after sending (server-side send; cc goldenageguruteachings@gmail.com — see 2026-10-09 email change)
- ✅ @804ed3c Branded QR generator (logo centre, level H) → `/ask`
- ✅ @804ed3c QR poster (Letter) and Zoom slide (1920×1080, PNG export) — routes `/ask/poster`, `/ask/zoom`
- ✅ @804ed3c Support numbers in config: primary +91 7396 112 111 (call/msg), web +91 7396 119 111 (all WhatsApp sends) — backend `.env` SUPPORT_PRIMARY / SUPPORT_WEB, served on `/settings`
- ✅ @804ed3c Questions should also POST to `/api/v1/contact` with source `qr_web` | `member_portal`
- ↩ 2026-10-09 code change mirrored: acknowledgement email is sent by the server automatically on Send — no "Send confirmation email" button. Status box reads "Sending a confirmation email to {email}" → "Confirmation sent to {email}" (TE: ధృవీకరణ ఇమెయిల్ పంపబడింది: · KN: ದೃಢೀಕರಣ ಇಮೇಲ್ ಕಳುಹಿಸಲಾಗಿದೆ:). Design: Ask.dc.html, Member Flow.dc.html.
- ↩ 2026-10-09 code change mirrored: QR poster column gap 22px → 16px and QR 320px → 300px so the Letter page prints on one sheet without overflow. Design: QR Ask Poster.dc.html.
- ↩ 2026-10-09 code change mirrored: Telugu/Kannada copy uses Noto Sans Telugu / Noto Sans Kannada (Manrope has no Indic glyphs). Design: Ask, QR Ask Poster, QR Ask Zoom.
- ⬅ code change: topic → admin category mapping: Health & food → health, Feelings in meditation → kundalini, Trouble sitting → meditation, Money & daily life / Something else → general. Public `/ask` questions → general. (No design impact.)
- Not built (not in the README spec): the "Serve, once you have walked it" volunteer card shown under the member Ask tab in Member Flow.dc.html.
