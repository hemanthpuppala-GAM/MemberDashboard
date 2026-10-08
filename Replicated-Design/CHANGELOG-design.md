# Design changelog (shared ledger)

Format: date · item · status (🟡 designed / ✅ implemented @sha / ⬅ code change to mirror in Design)

## 2026-10-08 — Ask a question, branded QR, support routing (design_handoff_ask_support)
- 🟡 Public `/ask` page: no auth, type or voice (7 Indian languages), WhatsApp send, 3 page languages (EN/TE/KN)
- 🟡 Member dashboard "Ask a question" tab: seva cards removed, 3-step flow, EN/TE toggle, confirmation email
- 🟡 Dashboard Overview: "Wisdom of Dr. Harikrishna" card removed
- 🟡 Members get acknowledgement email after sending (server-side send; cc info@goldenagewisdom.org)
- 🟡 Branded QR generator (logo centre, level H) → `/ask`
- 🟡 QR poster (Letter) and Zoom slide (1920×1080, PNG export)
- 🟡 Support numbers in config: primary +91 7396 112 111 (call/msg), web +91 7396 119 111 (all WhatsApp sends)
- 🟡 Questions should also POST to `/api/v1/contact` with source `qr_web` | `member_portal`
