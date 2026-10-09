# Handoff: Ask a Question (public + member), branded QR, support routing

## Overview
A low-friction way for anyone — member or stranger who scanned a QR — to ask the Golden Age Wisdom
support team a question. Type or speak, press Send, WhatsApp opens pre-filled to the support line.
Signed-in members additionally get an acknowledgement email. Includes a printable Letter poster and a
1920×1080 Zoom slide, both carrying a brand-styled QR to `/ask`.

## About the design files
Files in `design/` are **design references built in HTML** (Design Component format, open directly in a
browser). They show intended look and behaviour. **Recreate them in this repo's React + Vite frontend
(`frontend/src/user/...`) and Laravel backend** using existing patterns (`Card`, `Modal`,
`navConfig`, `memberAuthApi`, `POST /api/v1/contact`). Do not ship the HTML.

## Fidelity
**High-fidelity.** Colors, type, spacing and copy are final. Match them.

## Screens

### 1. Public Ask page → route `/ask` (new, NO auth)
Design: `design/Ask.dc.html`. Mobile-first, max-width 560px, centered, padding 28px 18px 48px, column gap 22px.
- Header row: medallion logo 40px circle + wordmark "Golden Age Wisdom" (Cormorant Garamond 700 18px #14241C) left;
  **page-language segmented chips** right: English / తెలుగు / ಕನ್ನಡ (min-height 44px, pill, 1px border
  rgba(138,111,52,0.25); selected: border rgba(201,162,74,0.75), bg rgba(201,162,74,0.16), weight 600, text #7A5E22).
- Member strip (ONLY when a member session exists): pill card bg rgba(201,162,74,0.12), border rgba(201,162,74,0.3),
  28px dark avatar circle (#14241C, gold initial #E8CF83) + "Signed in as **{name}** · you will get a confirmation email."
- H1 "Ask a question" Cormorant Garamond 700 40px/1.05 #14241C; intro paragraph Manrope 15px/1.6 #2E3A33 (copy in §Copy).
- Step label "1. Your question" Manrope 12px 600 #7A5E22. Textarea 5 rows, bg #FFFDF8, border 1px rgba(138,111,52,0.28),
  radius 16px, padding 16px, font 16px/1.6 #1B3328.
- "Speak in:" (12px #5A5546) + 7 language chips (44px tall, 14px): en-IN English, te-IN తెలుగు, kn-IN ಕನ್ನಡ, hi-IN हिन्दी,
  ta-IN தமிழ், ml-IN മലയാളം, mr-IN मराठी. Same chip styling as above. Selecting a page language also sets the mic language.
- Mic button: pill 44px, "● Speak your question". Listening state: border rgba(168,64,63,0.6), bg rgba(168,64,63,0.1),
  text #A8403F, label "Stop · listening…", pulse ring animation 1.2s (box-shadow 0→14px rgba(168,64,63,.45→0)).
  Side note (12.5px #5A5546) for no-support / error.
- Step "2. Send it" + full-width primary button 16px padding, pill, gradient 135deg #E8CF83 → #C9A24A 55% → #A8853A,
  text #14241C Manrope 600 16px, "Send on WhatsApp". Under it, 12.5px centered #2E3A33:
  "Goes to our support team on WhatsApp · Call or message: +91 7396 112 111".
- Status box after send: border rgba(47,107,69,0.3), bg rgba(47,107,69,0.07), radius 14px; bold 14px #2F6B45 note.
  If member: line "We will also send a confirmation email to **{email}**" + outline button "Send confirmation email"
  (border rgba(47,107,69,0.5), text #2F6B45). After click: note becomes "Confirmation email opened — press send there."
- Share card: bg #FFFDF8, border 1px rgba(201,162,74,0.3), radius 20px, padding 18px; branded QR 128px (see §QR) inside
  a 2px gold-bordered white frame, tappable → `/ask`; title "Share this page" (Cormorant 700 20px), body 13px,
  links "Print a QR poster" → poster, "Zoom slide" → zoom.
- Footnote 12px #5A5546: "Our volunteers are seekers, not doctors. If something is urgent, see a doctor first."

### 2. Member dashboard → "Ask a question" tab (changed)
Design: `design/Member Flow.dc.html` (tab `help`). Replaces the old "Circles & help" page (`CirclesHelpPage.jsx`).
- **Removed:** the four seva/volunteer cards (Health & diet / Kundalini / Practice / Householder) and the email-send link.
- Header: H1 "Ask a question" 44px + sub "Any doubt about your practice? Ask a person." + right-aligned toggle
  "తెలుగులో చూడండి" / "English" (outline gold pill) switching ALL tab copy.
- 3 numbered steps (labels 12px 600 #7A5E22): 1. topic chips (Health & food · Feelings in meditation · Trouble sitting ·
  Money & daily life · Something else); 2. textarea (4 rows, same style); 3. primary button "Send my question" +
  "Goes to our support team on WhatsApp · Call: +91 7396 112 111".
- After send: green status box (as above) with confirmation-email line + button, email = member's login email.
- Link card at bottom: "Ask without login — open the QR / voice page →" → `/ask`.
- Dashboard Overview: the "Wisdom of Dr. Harikrishna" card is **removed**; only stats strip + circles list remain.

### 3. QR poster (print, Letter 8.5×11) — `design/QR Ask Poster.dc.html`
816×1056, bg #14241C, padding 48px 64px, centered column gap 22px: medallion 150px; eyebrow "GOLDEN AGE WISDOM"
(14px, tracking .3em, #E8CF83); H1 "Have a question? / Scan and ask." Cormorant 700 64px/1.05 #FFFDF8; body 20px/1.6
#D8D2C4; QR 320px in white frame (padding 20px, radius 32px, border 4px #B8923E, outer glow 12px rgba(232,207,131,.1));
Telugu + Kannada lines 24px #E8CF83; footer 16px #D8D2C4: "Call or WhatsApp +91 7396 112 111 · +91 7396 119 111" /
"goldenagewisdom.org/ask". Must fit one page with no overflow.

### 4. Zoom slide (1920×1080) — `design/QR Ask Zoom.dc.html`
Two-column grid (1fr auto), gap 96px, padding 96px 120px, bg #14241C with radial gold glow at 30% 50%.
Left: logo 112px + eyebrow 20px; H1 104px/1; body 30px/1.5; Telugu/Kannada 30px #E8CF83; URL + numbers 24px #D8D2C4.
Right: QR 640px in white frame (padding 32px, radius 48px, border 6px #B8923E). Scales to viewport; "Download PNG"
exports the unscaled 1920×1080.

## Branded QR (`design/gaw-qr.js`)
Error correction **H**. Quiet zone 3 modules. Dark modules drawn as circles (r = 0.43 cell) #14241C on #FFFDF8.
Finder eyes: rounded squares — outer #14241C, middle #FFFDF8, inner #B8923E. Centre 26% of modules cleared for the
medallion logo (`assets/logo-coin-tight.png`) clipped to a circle with a #B8923E ring. Encodes
`https://goldenagewisdom.org/ask`. In React: use the `qrcode` package (already a dep in the main site) to get the
module matrix, then draw on canvas exactly as above.

## Behaviour
- **Send** (both screens): build text → `https://wa.me/{WEB_NUMBER}?text=…`, open in new tab. Body:
  `Golden Age Wisdom — question (via QR/web|member)\n[From: {name} ({memberId})\nEmail: {email}]\n\n{question}`.
  Empty question → inline note "Please write or speak your question first." Also POST the question to
  `/api/v1/contact` (category = topic or "ask", source = `member_portal` | `qr_web`) so admin Queries sees it.
- **Voice**: Web Speech API (`webkitSpeechRecognition`), `interimResults=true, continuous=true`, lang from the
  Speak-in chip. Append transcript to existing text. Unsupported → hide/disable mic and show note
  "Voice typing works best in Chrome on a phone."
- **Acknowledgement email (members only)**: on send, trigger backend mail to member email, cc info@goldenagewisdom.org,
  subject "We received your question — Golden Age Wisdom", body "Namaste {name}, We have received your question.
  Thank you. A volunteer will get back to you as soon as possible. — Golden Age Wisdom seva team" (TE/KN variants in
  `design/Ask.dc.html` T.te/T.kn). The HTML design falls back to `mailto:`; the real build should send server-side
  and show "Confirmation sent to {email}".
- **Language**: `?lang=en|te|kn` preselects page language; persist choice in localStorage.
- Hit targets ≥44px; text contrast ≥4.5:1 as specified.

## Support numbers (single source: `design/gaw-config.js` → `support`)
- primary `+91 7396 112 111` (917396112111) — published call/message line.
- web `+91 7396 119 111` (917396119111) — receives ALL website/QR WhatsApp sends (WhatsApp links target one number).
Expose both from backend config / env, never hard-code in components.

## Design tokens
Cream bg #F3EAD3 · card #FFFDF8 · ink #14241C / #1B3328 · body #2E3A33 · muted #5A5546 · gold #C9A24A, light #E8CF83,
deep #A8853A, border gold #B8923E, dark gold text #7A5E22 · success #2F6B45 · danger #A8403F · dark panel #14241C,
light text #F3EAD3 / #D8D2C4. Type: Cormorant Garamond (headings 500/700), Manrope (UI 400/500/600).
Radii: pill 999px, inputs 16px, cards 20px, poster frame 32px. Spacing scale 6/8/10/12/14/16/18/22/28.

## Copy (EN; TE/KN in `design/Ask.dc.html` → `T`)
Intro: "No login needed. Type your question, or press the mic and speak. Then press Send — WhatsApp opens with your
message ready. Our support team will reply there." Placeholder: "Type here, or press the mic and speak."
Opening note: "WhatsApp is opening. Press send there."

## Assets
`design/assets/logo-coin-tight.png` — medallion logo (512px). Fonts via Google Fonts.

## Files
`design/Ask.dc.html`, `design/Member Flow.dc.html`, `design/QR Ask Poster.dc.html`, `design/QR Ask Zoom.dc.html`,
`design/gaw-qr.js`, `design/gaw-config.js`, `design/support.js` (runtime needed to open the .dc.html files locally).
