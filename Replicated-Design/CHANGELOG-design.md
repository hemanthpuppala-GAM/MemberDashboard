# Design changelog (shared ledger)

Format: date · item · status (🟡 designed / ✅ implemented @sha / ⬅ code change to mirror in Design / ↩ mirrored in Design)

## 2026-10-12 — Admin panel modules feed the site and support desk (code first; no design handoff)
- ⬅ code change: site quotes (Home voices, About/Wisdom/Wellness/Events quotes) come from admin Testimonials (featured first, else published); bundled quotes are the fallback. The 12 existing quotes were copied into Testimonials.
- ⬅ code change: Home "Sits around the world", Events daily cards and Upcoming/Past gatherings come from admin Live Sessions (sessions can repeat every day, with a time zone). Events second card title becomes "Around the world" when sessions are outside USA/UK; gatherings get a "Join →" link when they have one.
- ⬅ code change: "Join on Zoom" link, meeting ID and passcode come from admin Settings → Support & Zoom. Support numbers are editable there too (blank = server .env value).
- ⬅ code change: new `/donate` page (cream sub-page, one card per admin donation method: QR, UPI/bank rows with Copy, "Give online" link; empty state points to WhatsApp support). "Donate" added to the utility row / mobile menu and the footer ("Support the mission · Donate").
- ⬅ code change: sub-page footers gain a bottom row — Member support Call / WhatsApp (from Settings) + admin Contact Info channels. Privacy page gains a Member support line.
- ⬅ code change: admin Broadcasts show on the new site (banner/ticker inside the sticky header on sub-pages; dismissable toast under the header on Home and Privacy; popups bottom-right in cream/gold) and in the member dashboard. Admin target picker adds Home, Privacy, Member dashboard.
- ⬅ code change: Home one-screen layout — on wide screens (room beside the headline) the meditation pill + "Watch the intro" sit to the right of the headline and the hero column is a little wider (1.2 : 1); on shorter laptop screens the pill sits beside the "Free meditation · every day" kicker and the hero Watch link is hidden (the "Watch the intro" card covers it). Frees 70–90px so the Bodhi tree is 20–70% larger.
- ⬅ code change: Home one-screen layout on very short screens (under 680px tall, e.g. a 1080p laptop at 150% scaling ≈ 1280×590): headline 30–44px and sub-line 14.5px; kicker letter-spacing .2em so the meditation pill fits beside it from ~1280px wide.
- ⬅ code change (owner request): Home one-screen layout drops the "Free meditation · every day" kicker so the headline starts at the top; the "Next group meditation" pill sits beside the headline (under the sub-line when there is no room, e.g. 1024px). "What members say" card no longer clips on short screens (quote up to 4 lines, smaller type); the Watch-the-intro play button moves to the card corner under 760px tall.
- ⬅ code change: admin Queries and the support desk are one inbox (status/assignee sync both ways). Admin staff with Queries access open the desk with their admin login ("Admin staff? Sign in to the admin panel" on the desk login; header button "Back to admin"). Admin Dashboard gets ticket widgets; Reports shows tickets by status/source.

## 2026-10-11 — Member support desk (built in code first; no design handoff yet)
- ⬅ code change: new staff desk at `/support` (core support: phone + PIN; volunteers: member Google account) with KPI tiles, ticket queue (Mine / Unassigned / All open / Resolved), ticket panel (thread, internal notes, reply, status, assignee, urgent, call/WhatsApp/email), "Log a call / WhatsApp", Team & reviews. Public-site look (cream/ink/gold). Please design-review and mirror.
- ⬅ code change: members' "My questions" page at `/support/my` (status, thread, reply, 1–5 star rating). Linked from the member dashboard nav and after sending on /ask.
- ⬅ code change: Home fits one screen on desktop / landscape tablets (≥1024px, landscape): hero copy + Bodhi tree (caption beside the tree) in the left column, the four cards fill the right column where the hero emblem was, "Sits around the world" footer pinned at the bottom; tree size follows the available height. Design: Home Bodhi Tree v2.dc.html.
- ⬅ code change: Ask page fits on one screen (owner request): short intro line, compact spacing; ≥1024px the voice card and question + Send sit side by side; on phones the wordmark next to the logo hides below 420px and the question box is shorter on screens under 700px tall. Share/QR card stays below. Design: Ask.dc.html.
- ⬅ code change: Ask page — big "🎤 Speak your question" button with a first-time nudge now sits above the textarea (visible without scrolling on phones); voice errors explain what to do. Design: Ask.dc.html.

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
- ⬅ code change: site header (utility row + header bar) is sticky — it stays pinned at the top while scrolling, on Home and every sub-page (owner request). Design: all page .dc.html files.
- ⬅ code change: Join / sign-in is Google (Gmail) only — the "Prefer email & password?" form and the "Look around a demo account" button are removed; a one-line note says to sign in with Google. Returning members still get "Continue as …". Design: Member Flow.dc.html join screen.
- ⬅ code change: tablets/other devices — the 7 page links sit inline in the header only from 1200px wide (they did not fit on one line at iPad Pro portrait / iPad landscape); below that the header is logo + Join pill + menu, with the page and utility links in the menu. Home on iPad portrait keeps the stacked phone order but desktop-size type, a centred tree (max 640px) and the four cards as a 2×2 grid (also 2×2 on small Android phones). Design: all page .dc.html files.
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
