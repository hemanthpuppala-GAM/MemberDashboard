# Design changelog (shared ledger)

Format: date · item · status (🟡 designed / ✅ implemented @sha / ⬅ code change to mirror in Design / ↩ mirrored in Design)

## 2026-10-09 — Public home page + sub-pages + admin editors (design_handoff_home_bodhi_tree)
- 🟡 Home `/` — Bodhi Tree v2: hero medallion, 6-node tree navigator (full Buddha + roots visible, pills cover painted leaf labels), 7 chapter sections, world-sits footer, peace film overlay
- 🟡 Sub-pages `/about` `/mission` `/meditation` `/wisdom` `/wellness` `/events` with shared chrome (About: decorative corner frame behind portrait removed)
- 🟡 Admin content editors (one per page) → `GET/PUT /api/v1/content/{page}`; seed from `design/content/*.json`
- 🟡 Shared header on Home + all sub-pages: 48px medallion, wordmark, 7 page links (≥900px; hamburger below), right pill. Pill = "Join free" for guests; for a signed-in member it becomes an avatar-initial + first-name pill linking to the dashboard (read session from auth, not localStorage)
- 🟡 Utility row above the header on Home + all 6 sub-pages (≥900px; in hamburger menu below): Member support → `/ask`, Volunteer → `/volunteer`, Privacy → `/privacy`. Same for guests and members. Replaces the earlier footer placement — no utility links in footers.
- 🟡 `/volunteer` and `/privacy` pages (Volunteer.dc.html, Privacy.dc.html) now included in this bundle
- 🟡 Wellness: detox diet PDF download (`assets/detox-diet.pdf`)
- 🟡 PWA: manifest-v2, sw-v2, offline page, icons
- 🟡 Responsive pillar image sets (`assets/pillars/`, webp+jpg, 6 widths)
- 🟡 Official email is now **goldenageguruteachings@gmail.com** everywhere (replaces the old info@ address) — `gaw-config.js → officialEmail`; update backend mail FROM/CC, acknowledgement cc, OAuth consent screens, receipts, chatbot fallback text

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
