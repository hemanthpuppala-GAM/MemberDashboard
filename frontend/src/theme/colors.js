/**
 * JS-side mirror of theme.css tokens, for places Tailwind classes can't
 * reach directly (inline glow colors passed as CSS custom properties,
 * SVG fills). Keep values in sync with ./theme.css by hand — there are
 * only ~16 tokens, a build-step sync isn't worth it at this scale.
 */

export const colors = {
  bg: "#FAFAFE",
  bgSoft: "#F0EFF9",
  surface: "#E8E6F5",

  blue: "#6EC6EA",
  blueSoft: "#B3E5FA",
  blueDark: "#2F9FD1",

  goldLight: "#F9ECCB",
  gold: "#F3D89A",
  goldDeep: "#DCB96A",
  goldLive: "#5DB875",
  onGold: "#3C2B10",

  ink: "#28246A",
  muted: "#8886C0",
  mutedSoft: "#A8A6D4",

  chakra: {
    crown: "#c9a6f0",
    thirdEye: "#9d8fe0",
    throat: "#7fb0e0",
    heart: "#F3D89A",
    solar: "#e6c96a",
    sacral: "#eda06a",
    root: "#e08a8a",
  },
};
