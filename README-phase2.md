# Phase 2 — Living Coin homepage hero + real URLs

Overlay onto `frontend/`. Copy everything under `frontend/` over the repo (or over `goldenage-preview/` for the private preview), overwrite when asked.

## What changes
- **HeroSection.jsx** — night sky over the full-bleed portrait, copy top-left, mandala lower-left with the coin as its heart. Copy/media still come from the CMS `home → hero` section; `hero-hari-forest.png` is the bundled fallback when no image is set in admin.
- **CenterOrb.jsx** — the mandala centre is now the coin (tilting, seven chakra beads lighting in sequence). Same click → Mass Meditation.
- **LiveSessionBanner.jsx** — night-styled pill.
- **App.jsx** — `basename={import.meta.env.BASE_URL}` (follows vite `base`) and real public routes.
- **HomePage.jsx** — views are URLs now: `/about /wisdom /wellness /meditation /events /mission /contact /volunteer /donate`; any other `/slug` = CMS custom page; legacy `#view` / `#view:sectionId` admin links redirect.
- **lib/publicRoutes.js** — the one view↔path map.
- **theme/theme.css** — hero/coin keyframes appended.

## Admin content to enter (CMS → Pages → Home → Hero)
Live-site copy, verbatim:
- heading: `Peace begins within — together we *radiate it* across the world`
- description: `When we transform ourselves through meditation, that peace expands into our families, communities and nations — a shared field of peace, harmony and universal consciousness. Free live meditation twice daily and ancient wisdom with scientific clarity, by Dr Hari Krishna, MD.`
- cta_label: `Join the movement` · cta_href: `/join`
- image: upload the full-colour Hari photo (or leave empty → bundled fallback)
- focal_x 74 · focal_y 30 · mandala_radius 190

## Server
`.htaccess` (deploy/htaccess-frontend) already routes unknown paths to index.html, so `/wisdom` refreshes correctly. No backend change.

## Next (Phase 3) — content parity
The CMS placeholder copy for wisdom / wellness / events / mission differs from the live site (live has Detox Diet tabs, 5 Golden Rules, daily sessions, yugas/8%). Phase 3 = a `LiveContentSeeder` + section components for those, then redesigned section layouts.
