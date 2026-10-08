# Design changelog (shared ledger)

Format: date · item · status (🟡 designed / ✅ implemented @sha / ⬅ code change to mirror in Design)

## 2026-10-08 — Ask a question, branded QR, support routing (design_handoff_ask_support)
- ✅ @804ed3c Public `/ask` page: no auth, type or voice (7 Indian languages), WhatsApp send, 3 page languages (EN/TE/KN)
- ✅ @804ed3c Member dashboard "Ask a question" tab: seva cards removed, 3-step flow, EN/TE toggle, confirmation email
- ✅ Dashboard Overview: "Wisdom of Dr. Harikrishna" card removed (already absent from the coded Overview — no change needed)
- ✅ @804ed3c Members get acknowledgement email after sending (server-side send; cc info@goldenagewisdom.org)
- ✅ @804ed3c Branded QR generator (logo centre, level H) → `/ask`
- ✅ @804ed3c QR poster (Letter) and Zoom slide (1920×1080, PNG export) — routes `/ask/poster`, `/ask/zoom`
- ✅ @804ed3c Support numbers in config: primary +91 7396 112 111 (call/msg), web +91 7396 119 111 (all WhatsApp sends) — backend `.env` SUPPORT_PRIMARY / SUPPORT_WEB, served on `/settings`
- ✅ @804ed3c Questions should also POST to `/api/v1/contact` with source `qr_web` | `member_portal`
- ⬅ code change: acknowledgement email is sent by the server automatically on Send — no "Send confirmation email" button. Status box reads "Sending a confirmation email to {email}" → "Confirmation sent to {email}" (TE: ధృవీకరణ ఇమెయిల్ పంపబడింది: · KN: ದೃಢೀಕರಣ ಇಮೇಲ್ ಕಳುಹಿಸಲಾಗಿದೆ:).
- ⬅ code change: QR poster column gap 22px → 16px and QR 320px → 300px so the Letter page prints on one sheet without overflow.
- ⬅ code change: Telugu/Kannada copy uses Noto Sans Telugu / Noto Sans Kannada (Manrope has no Indic glyphs).
- ⬅ code change: topic → admin category mapping: Health & food → health, Feelings in meditation → kundalini, Trouble sitting → meditation, Money & daily life / Something else → general. Public `/ask` questions → general.
- Not built (not in the README spec): the "Serve, once you have walked it" volunteer card shown under the member Ask tab in Member Flow.dc.html.
