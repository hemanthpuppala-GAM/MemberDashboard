# Homepage Chakra Mandala — Design Reference

Source of truth: `index (3).html` (the `.m-hub` hero section). This document
describes the **design only** — visual system, layout, motion, and the
navigation-to-chakra mapping — not implementation code.

**Target tech stack (next implementation pass):** React JS + Tailwind CSS,
scaffolded with Vite.

---

## 1. Concept

The homepage's primary navigation is not a menu bar — it is a **radial
mandala of seven chakras**. One glowing orb sits at the centre; six nodes
orbit it. Together they stand in for the seven chakras of the subtle body,
and each one is also a link to a section of the site.

> Crown at the top, root at the base, heart at the centre.

This ties the site's core message — "world peace through meditation" — to
its own navigation: the thing you're always facing, front and centre, is the
Heart chakra / daily group meditation. Everything else in the site (about,
wisdom, wellness, practice, events, mission) orbits that.

---

## 2. Navigation ↔ Chakra Mapping

| Position | Nav section | Glyph | Color | Petals | Chakra (Sanskrit) | Chakra (common) |
|---|---|---|---|---|---|---|
| Centre | Mass Meditation | ✡︎ (twin triangles) | Gold `#e6d3a8` / green when live `#7ecb8f` | 12 (implied) | Anahata | Heart |
| 0° · top | About / Guru | ✦ | Violet `#c9a6f0` | 48 (≈1000, stylised) | Sahasrara | Crown |
| 60° | Wisdom | ◎ | Indigo `#9d8fe0` | 2 | Ajna | Third Eye |
| 120° | Wellness | ❋ | Orange `#eda06a` | 6 | Svadhisthana | Sacral |
| 180° · bottom | Meditate | ▽ | Red `#e08a8a` | 4 | Muladhara | Root |
| 240° | Events | ☾ | Blue `#7fb0e0` | 16 | Vishuddha | Throat |
| 300° | Mission | △ | Yellow `#e6c96a` | 10 | Manipura | Solar Plexus |

**Design rule:** every node's color and petal count matches the traditional
chakra it represents — this is not decorative, it's a deliberate 1:1 system.
Crown and Root are the only two nodes anchored to a fixed visual position
(top / bottom); the remaining four are distributed evenly around the
remaining 240° of arc, in traditional chakra order (Ajna → Vishuddha is
skipped-order for visual balance, not vertical body order — see §6).

---

## 3. Layout Structure

```
                    ✦  About (Crown)
                  /                \
        ☾ Events                     ◎ Wisdom
             \        ⟡ Heart        /
              \      (centre orb)   /
        △ Mission                 ❋ Wellness
                  \                /
                    ▽  Meditate (Root)
```

- **Centre orb** — fixed size, independent of the ring (`clamp(84px, 46% of orbit, 180px)`).
- **Orbit ring** — six nodes placed at even 60° steps around a single radius (`--orbit-r`).
- **Two decorative rings** trace the mandala at 1.52× and 2.24× the node
  orbit radius — pure atmosphere, no interactive content, evoke the
  concentric "aura" rings of a mandala painting.
- **Three ripple rings** emanate from the centre orb outward, like sound /
  energy waves — reinforcing the "broadcast" theme used elsewhere on the
  page ("you are an electromagnetic broadcast").

---

## 4. Visual Design System

### 4.1 Base palette (whole site, not just the mandala)

| Token | Value | Use |
|---|---|---|
| Background | `#0d0a1c` | Page base — deep cosmic indigo-black |
| Gold accent (light) | `#e6d3a8` | Headlines, active glow, primary CTA text |
| Gold accent (mid) | `#d5b77c` | Buttons, brand wordmark |
| Gold accent (deep) | `#b89758` | Gradient partner, secondary accents |
| Text (bright) | `#f7f1e3` / `#f2e9d8` | Headings on dark background |
| Text (muted) | `#b9b1a0` / `#cfc8ba` | Body copy, secondary labels |

### 4.2 Chakra node color role

Each node's chakra color is used **only** for that node's identity — ring
border, glyph fill/glow, and hover accent. It never bleeds into shared UI
chrome (buttons, text) — the gold palette stays the "house" color, and
chakra colors stay scoped to their own orbiting node. This keeps six
saturated hues from fighting each other visually; each only appears once,
small, and self-contained.

### 4.3 Node anatomy (per chakra)

Each of the six nodes is built from the same four layers, stacked:

| Layer | Purpose |
|---|---|
| Ring (glassy circle) | Frosted/blurred dark backdrop, border in the node's chakra color |
| Aura | Soft blurred glow behind the glyph, warm white/gold, chakra-agnostic |
| Glyph | The chakra symbol itself, rendered in the chakra color with a matching text-shadow glow |
| Label | Section name below the ring, neutral cream color — legible regardless of chakra hue |

### 4.4 Centre orb anatomy

| Layer | Purpose |
|---|---|
| Ring | Frosted glass circle, gold border (green when a live session is on) |
| Glow | Radial gold bloom behind the whole orb, brighter when live |
| Icon | Two overlaid triangles (a Star of David / merkaba-like form) — union symbol |
| Arc label | "Mass Meditation ·" text curved along the inner rim of the orb, repeating |
| Ripple rings ×3 | Staggered outward pulses (0s / 2s / 4s offsets) |

---

## 5. Motion Language

| Element | Animation | Feel |
|---|---|---|
| Centre orb | `breathe` (scale, 6s loop) | Literally breathing — ties to the meditation theme |
| Ripple rings | `ripple` (expand + fade, 6s, staggered) | Energy radiating outward from the heart |
| Outer decorative rings | `ringPulse` (7s / 9s, one reversed) | Slow counter-rotating pulse, gives the mandala a living, turning quality |
| Each of the 6 nodes | `nodeFloat` (gentle bob, duration = `5 + index×0.7`s) | Staggered durations mean the ring never moves in unison — reads as organic, not mechanical |
| Node hover/focus | Scale 1.16×, brighter border + glow | Direct, immediate feedback without breaking the floating rhythm |
| Background starfield | ~8% of stars "lit" and twinkling, rest dim/static | Distant, meditative backdrop — never competes with the mandala |

**Design principle:** nothing in the mandala is static. Every ring, node,
and glow is in slow, continuous, non-synchronized motion — evoking a living
energy field rather than a clickable diagram.

---

## 6. Design Rationale Notes

- **Why the heart is the centre, not the crown:** the site's single most
  important CTA is the daily group meditation ("world peace through
  meditation"). Putting Anahata (Heart) at the centre — rather than
  Sahasrara (Crown), which is traditionally "highest" — makes the
  navigation's focal point match the site's actual primary action.
- **Why Crown/Root are anchored top/bottom:** these are the only two chakras
  with a fixed, unambiguous position in the body (top of head, base of
  spine), so they're the only two nodes given a fixed position in the ring.
  The other four are distributed for visual balance rather than strict
  anatomical order.
- **Why chakra color never leaves its node:** six saturated hues used
  site-wide would compete with the gold "house" palette and with each
  other. Scoping each chakra color to exactly one small ring keeps the
  system legible as a set of distinct symbols rather than a rainbow.
- **Why petal counts matter:** they're a direct, verifiable link to
  classical chakra iconography (2 / 4 / 6 / 10 / 12 / 16 / 1000), not
  arbitrary decoration — this is what makes the mapping feel authentic
  rather than aesthetic-only.

---

## 7. Post Sign-In Flow — Scope Note

Sections 8–10 extend this document beyond the homepage mandala to cover
**what happens after a visitor joins**: signing in, landing on their
dashboard, and (for staff) the admin panel. Design reference for these is
the existing `Member Flow.dc.html` and `Admin Panel.dc.html` builds — same
visual system (dark cosmic background, gold accent, Marcellus/Outfit type,
frosted-glass cards), carried forward rather than reinvented.

---

## 8. Sign-In — OAuth Providers

The site is **passwordless**. A visitor never creates or types a password —
they authenticate with an identity provider and Golden Age Wisdom only ever
receives a name and email.

### 8.1 Providers & button treatment

| Order | Provider | Button style | Icon treatment |
|---|---|---|---|
| 1 | Google | Filled white pill, dark text — the one visually "loud" button on the screen | Multicolor "G" wordmark (Google brand gradient), text-clipped |
| 2 | Microsoft | Dark glass pill, cream text | 4-square Microsoft mark (red/green/blue/yellow quadrants) |
| 3 | Facebook | Dark glass pill, cream text | Lowercase "f" in Facebook blue |
| 4 | Apple | Dark glass pill, cream text | Apple glyph |

Design rule: **Google is visually first and distinct** (solid white pill —
it's the highest-conversion, most-recognized option); the other three share
one consistent "dark glass" pill style so the row doesn't turn into four
competing brand colors. Order is fixed (Google → Microsoft → Facebook →
Apple) and does not reshuffle based on usage.

### 8.2 Supporting sign-in elements

| Element | Purpose |
|---|---|
| "Continue as [last user]" | If the browser remembers a previous member, this is offered above the provider list — a one-tap shortcut with the member's initial in a gold-gradient avatar chip |
| "Look around a demo account" | Dashed-border pill, clearly secondary — lets a visitor preview the dashboard with nothing saved |
| Trust note | Small card with a shield glyph: "We never see, store or handle passwords…" — always visible beneath the provider buttons |
| Background visual | Full-bleed meditator photo, heavily vignetted to near-black at the edges, with the same faint twinkling starfield as the homepage — the sign-in screen still reads as the same cosmic world, not a generic auth form |

### 8.3 Design principle

The sign-in screen should feel like an *entrance* to the mandala experience,
not a break from it — same background treatment, same type, same gold
accent — so joining feels continuous with the homepage rather than a hand-off
to a generic auth vendor page.

---

## 9. Member Dashboard (After Joining)

Once signed in, the visitor lands on their personal dashboard — a
sidebar-shell layout, distinct from the homepage's centered mandala, built
for return visits rather than first-impression wonder.

### 9.1 Layout

| Region | Content |
|---|---|
| Sidebar (collapsible) | Brand mark, primary nav, "Support the mission" / "Become a volunteer" prompts, collapse toggle |
| Main content | Active section's content, swapped by nav selection (no page reload) |

The sidebar collapses to icon-only width on request (and automatically on
narrow viewports), keeping the dashboard usable without losing navigation.

### 9.2 Primary navigation (sidebar)

| Icon | Label | Destination |
|---|---|---|
| ☀ | Overview | Dashboard home — streak, upcoming session, quick stats |
| ▶ | Sit & Scribe | Start a timed solo meditation sit |
| ◉ | Join live | Join the current/next live group session (badge when one is active) |
| ✎ | Journal | Personal practice journal entries |
| ♡ | Share the light | Referral / sharing tools |
| ✆ | Circles & help | Volunteer-staffed help topics (health, kundalini, practice, life, other) |
| ✦ | Admin panel | **Only shown to Admin / Super Admin roles** — links out to the Admin Panel |

### 9.3 Key dashboard motifs

| Motif | Design treatment |
|---|---|
| 41-day challenge counter | Large Marcellus numeral ("41 days") with a 10-across dot grid below it — lit gold dots for completed days, dim for remaining, echoing the homepage's star-field lit/dim logic |
| Streak / practice cards | Frosted glass cards (same `rgba` dark-glass + blur treatment as the homepage nodes), gold border at low opacity |
| Session state | A live badge/dot on "Join live" nav item when a session is actually running — same "live vs idle" color language as the homepage centre orb (gold idle → green live) |
| Role badge | Small pill next to the member's name/avatar showing their role (Member / Admin / Super admin) — see §10.1 for color coding |

### 9.4 Design principle

The dashboard trades the homepage's radial, floating, ambient motion for a
**calmer, structured, return-visit layout** — but keeps the same palette,
type, glass-card language, and gold "lit" accent so it never feels like a
different product once you're signed in.

---

## 10. User & Admin Panel

A separate, role-gated screen for members with elevated access. Same visual
system as the dashboard (sidebar-less here — top tab bar instead), scoped
entirely to member/community management.

### 10.1 Roles

| Role | Badge color | Can do |
|---|---|---|
| Super admin | Gold `bg rgba(213,183,124,0.2)` / text `#f2e3bb` | Everything: telemetry/insights, member removal, privacy controls, granting roles |
| Admin | Violet `bg rgba(143,127,214,0.2)` / text `#c9bdf5` | Member list, profile cleanup, practice resets — no telemetry, no removals |
| Member | Neutral `bg rgba(255,255,255,0.08)` / text `#b9b1a0` | Their own dashboard only — no admin panel access |

Role badges reuse the same "pill chip" shape used for the homepage's
section labels and the sign-in role indicator — one consistent chip
component across the whole site, only the fill/text color changes per role.

### 10.2 Admin panel tabs

| Tab | Icon | Visibility | Purpose |
|---|---|---|---|
| Insights | ◈ | Super admin only | Consent-gated telemetry, computed on-device |
| Members | ☰ | Admin + Super admin | Every member who has signed in, with practice at a glance |
| Cleanup | ✧ | Admin + Super admin | Detected profile issues — nothing changes without an explicit tap |
| Access | ✦ | Admin + Super admin | Who holds which role, and how to roll it back |
| Privacy | ❋ | Super admin only | What's collected, retention, and erasure |

### 10.3 Design principle

The admin panel is deliberately **plain and dense** relative to the
homepage/dashboard — same dark/gold theme for continuity, but flatter cards,
more tabular data, fewer glows and animations. It's a working tool for
staff, not a visitor-facing moment, so the design restraint itself is the
signal: less ceremony where the audience is internal.

---

## 11. Open Design Questions / Possible Extensions

| Idea | Notes |
|---|---|
| Render literal lotus petals per node | A `lotusPetals` (4 concentric rings of 48/36/24/16) construct already exists elsewhere on the page for a fuller lotus illustration — could be reused per-node at small scale if the ring size allows |
| Chakra order on mobile / narrow layouts | Confirm the 60°-step ring still reads clearly at the smallest supported orbit radius (88px floor) — six labels close together is the tightest case |
| Sound/frequency tie-in | Chakras are traditionally each associated with a seed sound (bija mantra) — could be a future audio cue on hover/tap, consistent with the site's existing Om/chant audio assets |
| Consistent chip component | The role badge (§10.1), live/idle indicator (§9.3), and homepage section labels all use the same "pill chip" shape — worth formalizing as one shared design token rather than three near-identical variants |
| Provider button parity on small screens | Confirm the four OAuth buttons (§8.1) stack cleanly without the Google button's white pill visually dominating the row on narrow viewports |




## 12. Sourcing the Chakra Glyphs in React + Tailwind

**Question asked:** is there an existing npm/React icon package that already
ships these seven chakra symbols, so they can just be installed rather than
built?

**Short answer: no.** Checked at time of writing — there is no maintained
npm package that provides an accurate seven-chakra icon set (correct glyph
+ correct petal count per chakra, matching §2's mapping). A couple of
things worth knowing while searching:

- **"Chakra UI" (`@chakra-ui/react`, `@chakra-ui/icons`) is unrelated.** It's
  a popular React *component library* that happens to be named "Chakra" —
  it ships generic UI icons (arrows, checkmarks, menus), not spiritual
  chakra symbols. Easy to confuse in an npm search; worth ruling out
  explicitly so no one installs it expecting glyphs.
- Generic icon packs (`react-icons`'s Game-Icons set, Font Awesome's single
  `fa-om` glyph, Tabler's `IconOm`) have scattered lotus/om/third-eye style
  icons, but none reproduce the specific 7-symbol, petal-accurate system
  this design relies on (§6: *"petal counts matter... a direct, verifiable
  link to classical chakra iconography"*). Using a generic pack would break
  that design rule.

**Recommendation: build them as seven small custom SVG React components**,
not as an installed icon dependency.

### 12.1 Proposed component shape

| Piece | Approach |
|---|---|
| One component per chakra | `<ChakraCrown />`, `<ChakraThirdEye />`, `<ChakraSacral />`, `<ChakraRoot />`, `<ChakraThroat />`, `<ChakraSolarPlexus />`, `<ChakraHeart />` — matches the 7-row table in §2 one-for-one |
| Shared wrapper | A single `<ChakraGlyph petals={n}>` primitive that draws `n` petals around a centre point via SVG, so petal count is a prop, not seven hand-drawn one-off SVGs |
| Color | SVG uses `fill="currentColor"` / `stroke="currentColor"` — color is then just a Tailwind text-color utility (e.g. `text-[#c9a6f0]`) on the wrapping element, matching each chakra's color from §2 |
| Sizing | `w-*` / `h-*` Tailwind utilities on the SVG's wrapping `<span>`/`<div>`, consistent with the `clamp()`-based responsive sizing already specified in §3–4 |
| Glow | Tailwind's `drop-shadow-[...]` arbitrary-value utility (or a small `filter: drop-shadow()` in a `@layer utilities` rule) reproducing the `text-shadow`/glow described in §4.3 |

### 12.2 Design principle

Keep the glyph set as **first-party, hand-built components**, not a
third-party dependency. It's seven simple shapes, the petal-count accuracy
is a stated design rule (§6), and no external package currently guarantees
that accuracy or gives control over color/glow the way `currentColor` +
Tailwind utilities do.
