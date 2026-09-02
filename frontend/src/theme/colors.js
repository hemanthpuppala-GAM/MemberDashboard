/**
 * JS-side mirror of theme.css tokens, for places Tailwind classes can't
 * reach directly (inline glow colors passed as CSS custom properties,
 * SVG fills). Keep values in sync with ./theme.css by hand — there are
 * only ~16 tokens, a build-step sync isn't worth it at this scale.
 */

export const colors = {
  bg: "#FCFAF5",
  bgSoft: "#F5F1E8",
  surface: "#FFFFFF",

  blue: "#A8B9A0",
  blueSoft: "#D6E0D1",
  blueDark: "#5F7658",

  goldLight: "#DCC58A",
  gold: "#C6A15B",
  goldDeep: "#8A6A32",
  goldLive: "#7A9B6E",
  onGold: "#3A2A12",

  ink: "#30302D",
  muted: "#9A968D",
  mutedSoft: "#B5B1A6",

  sage: "#A8B9A0",
  lavender: "#C8B9D9",

  chakra: {
    crown: "#AA8BC2",
    thirdEye: "#9187B8",
    throat: "#79AFC0",
    heart: "#88B28A",
    solar: "#D6B85C",
    sacral: "#D99A62",
    root: "#C96B6B",
  },
};
