/**
 * JS-side mirror of theme.css tokens, for places Tailwind classes can't
 * reach directly (inline glow colors passed as CSS custom properties,
 * SVG fills). Keep values in sync with ./theme.css by hand — there are
 * only ~16 tokens, a build-step sync isn't worth it at this scale.
 */

export const colors = {
  bg: "#0d0a1c",
  bgSoft: "#14112a",
  surface: "#1a1730",

  goldLight: "#e6d3a8",
  gold: "#d5b77c",
  goldDeep: "#b89758",
  goldLive: "#7ecb8f",
  onGold: "#241b06",

  ink: "#f7f1e3",
  muted: "#cfc8ba",
  mutedSoft: "#9a92a8",

  chakra: {
    crown: "#c9a6f0",
    thirdEye: "#9d8fe0",
    throat: "#7fb0e0",
    heart: "#e6d3a8",
    solar: "#e6c96a",
    sacral: "#eda06a",
    root: "#e08a8a",
  },
};
