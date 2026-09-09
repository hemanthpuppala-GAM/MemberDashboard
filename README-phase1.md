# Phase 1 — tokens, header, footer

Overlay files (copy over your preview copy of `frontend/`):

- `vite.config.js` — base set to `/staging/preview/`
- `index.html` — fonts: Marcellus, Cormorant Garamond, Manrope (Inter removed); theme-color night
- `src/theme/theme.css`, `src/theme/colors.js` — new tokens (night, dusk, gold set, jewel chakras, Manrope body)
- `src/admin/theme/admin-theme.css`, `src/admin/theme/displayPresets.js` — admin aligned to same palette
- `src/components/ui/CoinLogo.jsx` — NEW: 3D coin component
- `src/components/layout/Header.jsx` — night header, coin + wordmark, uppercase nav, gold Join
- `src/components/layout/Footer.jsx` — night footer with large coin
- `src/assets/logo-coin.jpg`, `src/assets/hero-hari-forest.png` — NEW assets (hero used in Phase 2)

Expected result on preview: every page re-colours (ivory paper, gold, dusk blue); header and footer are night; admin panel matches. Hero and inside-page layouts are unchanged until Phase 2/3 — they'll look half-way, that's expected.

Known follow-ups for Phase 2: `HeroSection.jsx` still has hard-coded old gold hexes; `index.css` `.paper-canvas` gradient still uses the old gold tint; `Header` nav no longer lists Volunteer/Support/Contact (they live in the footer now — say if you want them back in the top bar).
