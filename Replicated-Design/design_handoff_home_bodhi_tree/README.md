# Handoff: Public home page (Bodhi Tree v2) + sub-pages + admin content editors

## Overview
The public face of goldenagewisdom.org. A single home page with a Bodhi-tree chapter navigator, six
sub-pages (About, Mission, Meditation, Wisdom, Wellness, Events), and a matching Admin editor page per
public page that edits JSON content without touching code. Installable PWA (manifest + service worker +
offline page).

## About the design files
Files in `design/` are **design references built in HTML** (Design Component format; open directly in a
browser with `support.js` alongside). Recreate them in this repo's React + Vite frontend and Laravel backend.
Do not ship the HTML.

## Fidelity
**High-fidelity.** Colors, type, spacing and copy are final. Match them.

## Files → routes
| Design file | Route | Notes |
|---|---|---|
| `Home Bodhi Tree v2.dc.html` | `/` | Home |
| `About.dc.html` | `/about` | |
| `Mission.dc.html` | `/mission` | |
| `Meditation.dc.html` | `/meditation` | |
| `Wisdom.dc.html` | `/wisdom` | |
| `Wellness.dc.html` | `/wellness` | |
| `Events.dc.html` | `/events` | |
| `Admin Home.dc.html` … `Admin Events.dc.html` | `/admin/content/{page}` | Admin only (one editor per public page) |
| `Volunteer.dc.html` | `/volunteer` | Linked from the utility row |
| `Privacy.dc.html` | `/privacy` | Linked from the utility row |
| `Ask.dc.html` (in design_handoff_ask_support) | `/ask` | "Member support" link target |
| `offline-v2.html`, `manifest-v2.webmanifest`, `sw-v2.js`, `pwa-v2.js` | PWA | Register SW, install prompt |
| `content/*.json` | `GET /api/v1/content/{page}` | Default copy per page — seed the DB from these |
| `assets/**` | static | Logo, Bodhi tree art, hero images, pillar images (responsive sets), PWA icons, peace film, `detox-diet.pdf` (Wellness download) |

## Home page structure (`Home Bodhi Tree v2.dc.html`)
Screen sections, top to bottom (`data-screen-label`): **Chapters** (hero + Bodhi-tree navigator), **Small rituals**,
**Daily pause**, **Nourish**, **One minute**, **Reflect**, **FAQ**.
- Utility row (above the header, identical on all 7 pages, ≥900px only; below 900px the same three links sit inside the hamburger menu):
  full-width #14241C band, right-aligned, 32px tall links 10.5px 600 .16em uppercase rgba(246,241,230,.66) → hover #E8CF83:
  **Member support** → `/ask` · **Volunteer** → `/volunteer` · **Privacy** → `/privacy`. Shown to guests and members alike.
- Header (identical on Home and every sub-page): dark band gradient #14241C→#1B3328, padding 12px / clamp(16px,5vw,72px);
  48px medallion + wordmark "GOLDEN AGE WISDOM" (Cormorant Garamond 500, uppercase, clamp(12px,3.4vw,20px));
  page links from `content.subPages` (About · Mission · Teachings(#teachings) · Meditation · Wisdom · Wellness · Events;
  11.5px 600 .14em uppercase, 44px tall, active = #E8CF83 + 1px #C9A24A underline) shown ≥900px, hamburger below.
  Right pill (44px): guest → gold "Join free" (Home also shows the member-QR popover on hover); signed-in member →
  outline pill with 32px gold initial avatar + first name, links to the dashboard. (No footer utility links — they live in the utility row above the header.)
- Hero: large circular medallion (`assets/logo-original.jpg`) with rising rays SVG and 8s gold ripple ring; tagline,
  headline + accent, subline, Join / Support / Watch CTAs. Hero image `content.heroImage`
  (default `assets/hari-stream-forest.png`). Watch opens the peace film (`assets/peace-film.mp4`) in an overlay,
  muted autoplay with an unmute button.
- **Bodhi-tree navigator**: `assets/bodhi-tree.png` (aspect 1277/830, multiply blend) with 6 chapter nodes at fixed
  percent positions `[81.8,66.3] [61.9,64.7] [21.5,63.0] [27.6,31.9] [46.2,18.1] [66.7,29.8]`. Hover/focus rotates the
  active chapter; click opens it (sections below swap by `data-chapter`). Active node ring #C9A24A, inactive
  rgba(201,162,74,.55). Desktop (≥1100px) shows a side grid; narrower stacks to a column.
- Footer "Meditations around the world" (`#world-sits`): globe meditator 56px, live sit counter, Zoom sessions from
  `content.sessions`.
- Reduced-motion: all animations off.

## Sub-pages
Shared chrome: same header/nav/footer as Home, cream bg #F3EAD3, back link to `Home Bodhi Tree v2.dc.html#world-sits`.
Each page loads `content/{page}.json` and merges localStorage overrides (`gaw:{page}-content:v2`) — in production,
fetch from the content API instead. Each has an "Edit this page" admin link (visible only to admins).

## Admin editors (`Admin *.dc.html`)
Form over the page's JSON: text fields for every key, image slots (`image-slot.js`) for hero/pillar art, status line
("Showing file defaults" / "Published overrides active" / "Unsaved changes"), Publish and Reset. Design persists to
localStorage key `gaw:{page}-content:v2`; production should `PUT /api/v1/content/{page}` (admin auth) and the public
pages read the published record. `content/home.json` keys: tagline, headline, headlineAccent, subline, joinLabel,
supportLabel, volunteerNavLabel, volunteerHintTitle, volunteerHint, phoneJoinLabel, watchLabel, sitsTitle, qrEyebrow,
qrSub, volunteerLabel, filmSrc, zoom, sessions, joinShortLabel, privacyLabel, chipKicker, chipLine, pillars, heroImage,
heroCaption, promoKicker, promoTitle, promoBody, promoCta, eventKicker, eventTitle, eventSub, eventCta, eventHref,
tipSunGazing, tipAlkaline, tipEarthing, rulesKicker, rule1–rule5, freeKicker, freeLine, subPages.

## PWA
`pwa-v2.js` registers `sw-v2.js`, links `manifest-v2.webmanifest` (icons in `assets/pwa/`), falls back to
`offline-v2.html` when offline. Keep the `-v2` cache name when bumping.

## Design tokens
Cream bg #F3EAD3 · card #FFFDF8 / #FBF6EA · ink #14241C / #1B3328 · body #2E3A33 · muted #5A5546 · gold #C9A24A,
light #E8CF83, deep #A8853A, border #B8923E, dark gold text #7A5E22 · dark panel #0E1A14 / #12201A · light text
#F6F1E6 / #D8D2C4. Type: Cormorant Garamond (display 300/400/500, italic 400), Manrope (UI 300–700). Hit targets ≥44px.
Responsive pillar images in `assets/pillars/` at 320/360/600/1200/1600/2000 widths (webp + jpg) — use `srcset`.
