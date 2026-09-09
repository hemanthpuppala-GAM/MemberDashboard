# Homepage hero — "Sri Yantra" (locked 2026-09-09)

Reference mock: `Mandala Concepts.dc.html` → option **1c**. This document is the
developer hand-off: what changed, why, how it plugs into the existing app, and
what a dev can safely tweak.

---

## 1. What the design is

A living shatkona (two interlocking triangles) used as the site's primary navigation:

| Triangle | Colour | Vertices (clockwise from top) | Meaning |
|---|---|---|---|
| ▽ downward | gold `--color-gold-light` | Wisdom 60° · Wellness 180° · Meditation 300° | the three practices |
| △ upward | blue `#7fb0e0` | About 0° · Mission 120° · Events 240° | the three ways to join |

The Golden Age coin breathes at the centre (click → daily sit). Labels sit radially
*outward* from each vertex so nothing crosses the triangles. Headline, subline (with
the session time in the visitor's own zone) and two CTAs sit centred under the header;
the portrait owns the right half.

---

## 2. Files touched (all under `frontend/src`)

| File | Change | Type |
|---|---|---|
| `data/chakras.js` | added `yantra: { group, deg, line, shortLabel? }` to each of the six entries | **data** — the only place to move a node or edit its teaching line |
| `components/mandala/SriYantra.jsx` | **new** — draws the wheel from `chakras` | component |
| `components/sections/HeroSection.jsx` | rewritten for the Sri Yantra layout; same props (`onNavigate`, `onWatchIntro`), same CMS fields | component |
| `utils/peaceTime.js` | added `getSessionTimeLabel()` | util |
| `components/layout/Header.jsx` | added `UTILITY_LINKS` (Support · Volunteer · Privacy) | component |
| `theme/theme.css` | `yantra-draw`, `yantra-node-in` keyframes + reduced-motion rule | css |

Unchanged and still used: `ChakraMandala.jsx` (subpage heroes), `CenterOrb.jsx`,
`ChakraNode.jsx`, `icons/*`, `QrJoinCard.jsx` (bottom-right Volunteer + Scan-to-join),
`LiveSessionBanner.jsx` (no longer rendered in the hero — kept for other surfaces).

Nothing outside `frontend/src` changes. No new dependencies.

---

## 3. How it integrates with the member dashboard

The public site and the member dashboard are **one Vite/React app** (`App.jsx` routes
`/` and `/:slug` → `HomePage`, `/join`, `/register/:slug`, `/dashboard/*` → member area
(`MemberGate`), `/admin/*` → admin). The hero is just a section inside `HomePage`; it:

- **Navigates via the shared `setView`** (`HomePage.jsx`) → `pathForView()` in
  `lib/publicRoutes.js`. Same mechanism the Header, Footer and subpage heroes use.
  A node is a real `<a href>` too, so it works without JS and is crawlable.
- **Reads CMS content through `useSectionFields("home", "hero")`** — identical hook
  the Phase-3 hero used, so admin-entered heading / image / focal point / video keep
  working with zero backend change. Every field has a bundled fallback.
- **Shares the design tokens** (`theme.css` `@theme` block: `--color-gold-light`,
  `--color-night-soft`, `--font-headline`, …) and the existing `breathe` /
  `breathe-glow` keyframes the dashboard's own coin widgets use.
- **Uses the same chakra data** (`data/chakras.js`) that drives the dashboard's
  circles and the subpage hero glyphs — one source of truth for label, colour, glyph,
  route.
- **Time zone logic is shared** — `getSessionTimeLabel()` sits beside
  `getPeaceLocalLabel()` that the dashboard's live banner already imports.

Auth state does not affect the hero; a logged-in member landing on `/` sees the same
hero. (Swapping *Join free* for a "My dashboard" link in the Header is a one-line
follow-up using `useMemberAuth()` — not part of this change.)

---

## 4. Responsive behaviour

`SriYantra` is sized by a single CSS variable `--yantra-r` (triangle circumradius).
Everything — box, rings, coin, label type — is a multiple of it, so there is **no
breakpoint-specific geometry**.

| Viewport | Layout | `--yantra-r` |
|---|---|---|
| ≥ 1024px | copy centred top; wheel in the left 58%; portrait right, masked to fade into navy | `clamp(150px, min(19vw, 30vh), 270px)` |
| 768–1023px | copy, then wheel centred; portrait becomes a dimmed full background | same clamp (lands ~150–190px) |
| < 768px | same stacking; headline wraps to 2 lines; CMS `image_mobile` used if set | same clamp (150px floor) |

`prefers-reduced-motion`: triangles/nodes render instantly, breathing stops.

---

## 5. Safe manual tweaks (no design review needed)

| Want to… | Edit |
|---|---|
| Move a node to another vertex | `yantra.deg` in `data/chakras.js` (keep 0/120/240 for path, 60/180/300 for core) |
| Change a teaching line under a label | `yantra.line` in `data/chakras.js` |
| Make the wheel bigger/smaller on desktop | admin → Home → Hero → `mandala_radius` (px), or the clamp in `HeroSection.jsx` `yantraR` |
| Hide the wheel entirely | admin `show_mandala = 0` |
| Re-crop the portrait | admin `focal_x` / `focal_y` (defaults 60 / 30) |
| Change the headline / subline | admin `heading` / `subheading` (`*text*` = gold italic, `\n` = break) |
| Breathing speed | `.animate-breathe` duration in `theme.css` (10s = 5 in / 5 out — matches the Coherence Protocol; change with care) |
| Triangle colours | the two `stroke` values in `SriYantra.jsx` (gold uses the token; blue is `#7fb0e0` to match the Events glyph) |
| Add a utility link (e.g. Contact) | `UTILITY_LINKS` in `Header.jsx` + a `nav.*` key in `LanguageContext.FALLBACK_EN` |

Things that should **not** be changed without a design pass: label placement math in
`SriYantra.jsx` (radial-outward rule), `PAD` (label allowance), the 0.63 coin ratio.

---

## 6. Open items for the team

1. **Privacy page** — the header link resolves to CMS custom page slug `privacy`.
   Create that page in admin (Pages → New → slug `privacy`) or the link will render
   the empty-page state. Add `"nav.privacy": "Privacy"` to `FALLBACK_EN` when
   convenient (Header carries a local fallback meanwhile).
2. **QR** — `QrJoinCard` already generates a live QR for `/join` via the `qrcode`
   package; the mock's QR is a placeholder pattern only.
3. **Portrait asset** — `hero-hari-forest.png` is 1520×1013; consider a WebP/AVIF
   pair via `image` / `image_mobile` in admin for LCP.
4. **Subpages** — Wisdom is the live-replica reference; Wellness, Meditation, About,
   Events, Mission still use Phase-3 cards and are the next port.

---

## 7. Verify locally

```bash
cd frontend
npm run build && npm run preview   # → http://localhost:4173/staging/preview/
```
Check: wheel labels all inside the viewport at 1440×900, 1280×720, 1024×768, 390×844;
click every node → correct route; `Daily at …` shows your zone (or IST in Kolkata);
Escape from a subpage returns to the hub.
