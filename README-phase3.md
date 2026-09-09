# Phase 3 — Homepage 2× mandala + live-site subpages

Overlay onto `frontend/` (same as Phase 2: copy `frontend/` over the repo, overwrite when asked). Then `npm run build` → test on `localhost:4173/staging/preview/` → upload `dist/` contents.

## 1 · Homepage
- **HeroSection.jsx** — left column now holds copy on top and the mandala filling the space beneath; orbit radius cap 190 → **300px** (`mandala_radius` in admin still overrides). Live-site copy is the bundled fallback when the CMS hero is empty, so the hero never renders half-blank.
- **ChakraMandala.jsx / ChakraNode.jsx / CenterOrb.jsx** — the wheel, node rings, glyphs, labels and the coin all scale from `--orbit-r` (coin cap 200 → 300px, rings 72 → 108px, labels up to 17px).
- **data/chakras.js** — "About Me" → "About" (matches the nav). Adds `chakraByView`.

## 2 · Subpages (About · Wisdom · Wellness · Meditation · Events · Mission)
Each page = `SubpageHero` (night → dusk → dawn → paper gradient, chakra emblem, breadcrumb, headline) + the live site's content on paper + any CMS sections appended after it.
- **data/liveContent.js** — every word from the live site (CONTENT.md): About strengths + voices, Wisdom four threads + Gita verse, 5 Golden Rules + 6 Detox tabs, Meditation 5 steps / quick answers / science / deep cards / 4 stages, Events daily sessions (auto-converted to the visitor's clock) + Awakening Hyderabad (auto-moves to "Past"), Mission yugas / 8% / evidence.
- **sections/SubpageHero.jsx, sections/liveUi.jsx** — the shared shell + primitives (Rule, Numeral, Pill, Voices, NightPanel). Palette is the preview's: night `#05080F`, dusk `#3C5A85`, dawn `#C9D3E0`, paper `#F8F5EE`, ink `#1E2A3C`, gold `#C9A24A / #E8CF83 / #8A6A22`.
- **sections/{About,Wisdom,Wellness,Meditate,Events,Mission}Section.jsx** — rewritten. Each accepts `onNavigate` and ends with `<PageSections slug=… silent />`.
- **sections/PageSections.jsx** — new `silent` prop: no skeleton / "not available" text, and a CMS `hero` section is skipped (the page already has one). Non-silent behaviour (custom pages) unchanged.
- **utils/peaceTime.js** — adds `istToLocal(h, m, tz?)`; `getPeaceLocalLabel` now uses it.
- **pages/HomePage.jsx** — section views render full-bleed (the hero needs the edges); custom CMS pages keep the old padded column. `PageAtmosphere` starfield only on custom pages.
- **assets/** — `detox-diet.pdf`, `hari-graduation.jpg`, `hari-reflect.webp`, `hari-posture.webp`, `awakening-hyderabad-invite.jpg`.

## 3 · Member dashboard / admin
Untouched. Routes, `MemberGate`, `UserApp`, `AdminApp`, theme tokens and the CMS section renderer are the same files as before; the live pages only *add* content above whatever the CMS returns.

## 4 · Phase 3b — glyphs, wheel size, palette
- **mandala/icons/** — all seven glyphs redrawn as the live site's line-art (stroked lotus petals + ring + traditional centre: square/triangle, crescent, triangles). Pastel node hues from the live hub added as `glyphColor` in `data/chakras.js`; the saturated theme tokens stay for beads/accents.
- **HeroSection.jsx** — orbit cap 300 → **460px** (`min(22vw, 36vh)`), coin cap 440, node rings 156, labels 22px. The wheel now spans the left half; on a laptop the hero runs slightly past the fold. Washes shifted to the subpage palette: night → dusk `#3C5A85` → dawn `#C9D3E0` → paper, so the homepage lands on the same bluish-white as the subpages.

## 5 · Phase 3c — Wisdom as a live replica + readability
- **WisdomSection.jsx** — rebuilt block-for-block from the live page: "Ancient truths, scientific clarity", four glyph cards, the *Architecture of Reality* dusk panel (static vs coherence waves, three principles, Coherence Protocol), voices, the two CTAs. The invented "This week" verse block is gone.
- **liveUi.jsx** — `Body` now full-weight ink `#2B3648` (was muted) on every subpage; new `DawnBand` (bluish-white `#E4EAF2 → paper` behind the content), `Card`, `GlyphBadge`.
- **liveContent.js** — `WISDOM.heading`, card glyphs, `WISDOM.architecture` (verbatim copy).
- Other five pages still use the Phase 3 layouts — say which to convert to live replicas next.

## 6 · Phase 3d — breathing wheel + portrait
- **ChakraMandala.jsx / CenterOrb.jsx / theme.css** — the whole wheel inhales/exhales on a 10 s cycle (5 in, 5 out — the Coherence Protocol rhythm); coin glow swells with it; "Breathe in / Breathe out" fades beneath. Respects reduced-motion.
- **HeroSection.jsx** — portrait anchored to the top (`object-position: 74% 0%`) so the face stays in frame with the taller hero.

## Still needed
- Transparent-PNG coin (currently `logo-coin.jpg`).
- Photos: `hari-graduation.jpg` / `hari-reflect.webp` / `hari-posture.webp` are the site's existing shots — swap in higher-res originals when available.
- Long-form copy stays English-only until a native speaker reviews translations.
