/**
 * Nav ↔ chakra mapping (Replicated-Design/Design.md §2). Single source of
 * truth for the mandala nodes, the anchor nav, and each section's chakra
 * identity strip — every place that needs "which chakra is this section"
 * reads from here instead of repeating the mapping.
 */

import { colors } from "../theme/colors";

export const heartChakra = {
  id: "meditate-now",
  label: "Mass Meditation",
  sanskrit: "Anahata",
  common: "Heart",
  color: colors.chakra.heart,
  liveColor: colors.goldLive,
  petals: 12,
  href: "#meditate-now",
};

export const chakras = [
  {
    id: "about",
    angle: 0,
    label: "About",
    tagline: "Guru",
    sanskrit: "Sahasrara",
    common: "Crown",
    color: colors.chakra.crown,
    petals: 48,
    href: "#about",
  },
  {
    id: "wisdom",
    angle: 60,
    label: "Wisdom",
    tagline: "Teachings",
    sanskrit: "Ajna",
    common: "Third Eye",
    color: colors.chakra.thirdEye,
    petals: 2,
    href: "#wisdom",
  },
  {
    id: "wellness",
    angle: 120,
    label: "Wellness",
    tagline: "Practice for the body",
    sanskrit: "Svadhisthana",
    common: "Sacral",
    color: colors.chakra.sacral,
    petals: 6,
    href: "#wellness",
  },
  {
    id: "meditate",
    angle: 180,
    label: "Meditate",
    tagline: "Sit with us",
    sanskrit: "Muladhara",
    common: "Root",
    color: colors.chakra.root,
    petals: 4,
    href: "#meditate",
  },
  {
    id: "events",
    angle: 240,
    label: "Events",
    tagline: "Gatherings",
    sanskrit: "Vishuddha",
    common: "Throat",
    color: colors.chakra.throat,
    petals: 16,
    href: "#events",
  },
  {
    id: "mission",
    angle: 300,
    label: "Mission",
    tagline: "Why we exist",
    sanskrit: "Manipura",
    common: "Solar Plexus",
    color: colors.chakra.solar,
    petals: 10,
    href: "#mission",
  },
];
