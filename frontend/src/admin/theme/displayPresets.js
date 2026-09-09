/**
 * Preset color palettes, font choices, and text-size scale for the admin panel's
 * "Display" preferences (Settings > Appearance). The first preset is the brand
 * default and mirrors theme/theme.css (coin gold + dusk-sky blue).
 */

export const COLOR_PRESETS = [
  {
    id: "gold-blue",
    label: "Gold & Dusk (brand)",
    light: {
      accent: "#C9A24A", accentHover: "#8A6A22", accentMuted: "#F6EED8",
      accentFrom: "#E8CF83", accentTo: "#C9A24A", accentInk: "#2A1F08",
      focus: "#3C5A85", focusHover: "#2E4668", focusMuted: "rgba(107,141,181,0.18)",
      border: "#E6DECF",
    },
    dark: {
      accent: "#E8CF83", accentHover: "#F2E6C4", accentMuted: "rgba(201,162,74,0.16)",
      accentFrom: "#E8CF83", accentTo: "#8A6A22", accentInk: "#2A1F08",
      focus: "#6B8DB5", focusHover: "#8FAACB", focusMuted: "rgba(107,141,181,0.22)",
      border: "rgba(201,162,74,0.22)",
    },
  },
  {
    id: "emerald-blue",
    label: "Emerald & Blue",
    light: {
      accent: "#2F8F63", accentHover: "#25764F", accentMuted: "#E1F3EA",
      accentFrom: "#7FD1A6", accentTo: "#2F8F63", accentInk: "#042216",
      focus: "#3C5A85", focusHover: "#2E4668", focusMuted: "rgba(107,141,181,0.18)",
      border: "#E0F0E8",
    },
    dark: {
      accent: "#7FE3B4", accentHover: "#9BEAC4", accentMuted: "rgba(127,227,180,0.16)",
      accentFrom: "#7FE3B4", accentTo: "#2F8F63", accentInk: "#042216",
      focus: "#6B8DB5", focusHover: "#8FAACB", focusMuted: "rgba(107,141,181,0.22)",
      border: "rgba(127,227,180,0.2)",
    },
  },
  {
    id: "rose-charcoal",
    label: "Rose & Charcoal",
    light: {
      accent: "#B85C6B", accentHover: "#9C4A58", accentMuted: "#FBE7EA",
      accentFrom: "#E8A9B4", accentTo: "#B85C6B", accentInk: "#3A0E14",
      focus: "#5C6B8A", focusHover: "#4C5975", focusMuted: "rgba(92,107,138,0.18)",
      border: "#F2E3E6",
    },
    dark: {
      accent: "#E8A9B4", accentHover: "#F0C2CA", accentMuted: "rgba(232,169,180,0.16)",
      accentFrom: "#E8A9B4", accentTo: "#B85C6B", accentInk: "#3A0E14",
      focus: "#8FA0C2", focusHover: "#A6B5D1", focusMuted: "rgba(143,160,194,0.2)",
      border: "rgba(232,169,180,0.22)",
    },
  },
  {
    id: "slate-mono",
    label: "Slate Mono",
    light: {
      accent: "#4B5565", accentHover: "#3A4250", accentMuted: "#E7E9ED",
      accentFrom: "#8792A2", accentTo: "#4B5565", accentInk: "#FFFFFF",
      focus: "#3C5A85", focusHover: "#2E4668", focusMuted: "rgba(107,141,181,0.18)",
      border: "#E3E5EA",
    },
    dark: {
      accent: "#B7BECB", accentHover: "#CBD1DA", accentMuted: "rgba(183,190,203,0.16)",
      accentFrom: "#B7BECB", accentTo: "#7C8798", accentInk: "#1B2027",
      focus: "#6B8DB5", focusHover: "#8FAACB", focusMuted: "rgba(107,141,181,0.22)",
      border: "rgba(183,190,203,0.22)",
    },
  },
];

export const FONT_OPTIONS = [
  { id: "manrope", label: "Manrope", stack: '"Manrope", "Segoe UI", sans-serif' },
  { id: "outfit", label: "Outfit", stack: '"Outfit", "Segoe UI", sans-serif' },
  { id: "georgia", label: "Georgia", stack: 'Georgia, "Times New Roman", serif' },
  { id: "system", label: "System UI", stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

export const TEXT_SIZES = [
  { id: "sm", label: "Small", scale: 0.92 },
  { id: "md", label: "Medium", scale: 1 },
  { id: "lg", label: "Large", scale: 1.12 },
  { id: "xl", label: "X-Large", scale: 1.28 },
];

export function getPresetTokens(presetId, mode) {
  const preset = COLOR_PRESETS.find((p) => p.id === presetId) ?? COLOR_PRESETS[0];
  return mode === "dark" ? preset.dark : preset.light;
}

export function getFontStack(fontId) {
  return (FONT_OPTIONS.find((f) => f.id === fontId) ?? FONT_OPTIONS[0]).stack;
}

export function getTextScale(sizeId) {
  return (TEXT_SIZES.find((s) => s.id === sizeId) ?? TEXT_SIZES[1]).scale;
}
