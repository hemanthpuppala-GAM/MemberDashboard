/**
 * Nav ↔ chakra mapping (Replicated-Design/Design.md §2 + live site labels).
 * Single source of truth for mandala nodes, subpage heroes and section anchors.
 */

import { colors } from "../theme/colors";

export const heartChakra = {
  id: "meditate-now",
  view: "practice",
  label: "Mass Meditation",
  sanskrit: "Anahata",
  common: "Heart",
  color: colors.chakra.heart,
  liveColor: colors.goldLive,
  petals: 12,
  href: "#meditate-now",
};

/**
 * `glyphColor` = the pastel line-art hue the live site paints each node in; `color` stays the saturated theme token for beads/accents.
 *
 * `yantra` (Sri Yantra hero — components/mandala/SriYantra.jsx):
 *   group  "core" = gold downward triangle (the three practices), "path" = blue upward triangle (the ways in).
 *   deg    vertex angle on the wheel, clockwise from 12 o'clock. Core = 60/180/300, path = 0/120/240.
 *   line   one-line teaching shown under the kicker (core only; paths show just the label).
 * Changing a node's position/copy here is enough — the component derives everything else.
 */
export const chakras = [
  { id: "about", glyphColor: "#c9a6f0", view: "about", angle: 0, label: "About", tagline: "Our guide", sanskrit: "Sahasrara", common: "Crown", color: colors.chakra.crown, petals: 48, href: "#about", yantra: { group: "path", deg: 0 } },
  { id: "wisdom", glyphColor: "#9d8fe0", view: "wisdom", angle: 60, label: "Wisdom", tagline: "Teachings", sanskrit: "Ajna", common: "Third Eye", color: colors.chakra.thirdEye, petals: 2, href: "#wisdom", yantra: { group: "core", deg: 60, line: "You are the master of your destiny." } },
  { id: "wellness", glyphColor: "#eda06a", view: "wellness", angle: 120, label: "Wellness", tagline: "Practice for the body", sanskrit: "Svadhisthana", common: "Sacral", color: colors.chakra.sacral, petals: 6, href: "#wellness", yantra: { group: "core", deg: 180, line: "Eat pure. Eat vegetarian." } },
  { id: "meditate", glyphColor: "#e08a8a", view: "practice", angle: 180, label: "Meditation", tagline: "Sit with us", sanskrit: "Muladhara", common: "Root", color: colors.chakra.root, petals: 4, href: "#meditate", yantra: { group: "core", deg: 300, line: "Cross your legs. Clasp your hands. Watch the breath." } },
  { id: "events", glyphColor: "#7fb0e0", view: "events", angle: 240, label: "Events", tagline: "Gatherings", sanskrit: "Vishuddha", common: "Throat", color: colors.chakra.throat, petals: 16, href: "#events", yantra: { group: "path", deg: 240 } },
  { id: "mission", glyphColor: "#e6c96a", view: "mission", angle: 300, label: "Our Mission", tagline: "Why we exist", sanskrit: "Manipura", common: "Solar Plexus", color: colors.chakra.solar, petals: 10, href: "#mission", yantra: { group: "path", deg: 120, shortLabel: "Mission" } },
];

export const chakraByView = Object.fromEntries(chakras.map((c) => [c.view, c]));
