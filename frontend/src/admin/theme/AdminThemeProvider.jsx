import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminThemeContext } from "./adminThemeContextInstance";
import { getPresetTokens, getFontStack, getTextScale } from "./displayPresets";

const KEYS = {
  theme: "gaw_admin_theme",
  textSize: "gaw_admin_text_size",
  font: "gaw_admin_font",
  colorPreset: "gaw_admin_color_preset",
  customAccent: "gaw_admin_custom_accent",
};

function read(key, fallback) {
  const v = localStorage.getItem(key);
  return v ?? fallback;
}

export function AdminThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => read(KEYS.theme, "system"));
  const [textSize, setTextSizeState] = useState(() => read(KEYS.textSize, "md"));
  const [fontChoice, setFontChoiceState] = useState(() => read(KEYS.font, "outfit"));
  const [colorPreset, setColorPresetState] = useState(() => read(KEYS.colorPreset, "gold-blue"));
  const [customAccent, setCustomAccentState] = useState(() => localStorage.getItem(KEYS.customAccent));
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemPrefersDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  const setTheme = useCallback((next) => {
    setThemeState(next);
    if (next === "system") localStorage.removeItem(KEYS.theme);
    else localStorage.setItem(KEYS.theme, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const resolved = current === "system" ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light") : current;
      const next = resolved === "dark" ? "light" : "dark";
      localStorage.setItem(KEYS.theme, next);
      return next;
    });
  }, []);

  const setTextSize = useCallback((id) => {
    setTextSizeState(id);
    localStorage.setItem(KEYS.textSize, id);
  }, []);

  const setFontChoice = useCallback((id) => {
    setFontChoiceState(id);
    localStorage.setItem(KEYS.font, id);
  }, []);

  const setColorPreset = useCallback((id) => {
    setColorPresetState(id);
    localStorage.setItem(KEYS.colorPreset, id);
    setCustomAccentState(null);
    localStorage.removeItem(KEYS.customAccent);
  }, []);

  const setCustomAccent = useCallback((hex) => {
    setCustomAccentState(hex);
    localStorage.setItem(KEYS.customAccent, hex);
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "" : theme;
  }, [theme]);

  const scale = getTextScale(textSize);
  const fontStack = getFontStack(fontChoice);

  const cssVars = useMemo(() => {
    const tokens = getPresetTokens(colorPreset, resolvedTheme);
    const vars = {
      "--a-accent": customAccent || tokens.accent,
      "--a-accent-hover": tokens.accentHover,
      "--a-accent-muted": tokens.accentMuted,
      "--a-accent-from": customAccent || tokens.accentFrom,
      "--a-accent-to": customAccent || tokens.accentTo,
      "--a-accent-ink": tokens.accentInk,
      "--a-focus": tokens.focus,
      "--a-focus-hover": tokens.focusHover,
      "--a-focus-muted": tokens.focusMuted,
      "--a-border": tokens.border,
      "--a-font-body": fontStack,
      // Keep the brand serif for headings only while body font is left at its default;
      // once someone picks a different font (often for readability), headings follow it too.
      "--a-font-display": fontChoice === "outfit" ? '"Marcellus", Georgia, serif' : fontStack,
    };
    return vars;
  }, [colorPreset, resolvedTheme, customAccent, fontStack, fontChoice]);

  const value = useMemo(
    () => ({
      theme, setTheme, toggleTheme, resolvedTheme,
      textSize, setTextSize, scale,
      fontChoice, setFontChoice,
      colorPreset, setColorPreset,
      customAccent, setCustomAccent,
      cssVars,
    }),
    [theme, setTheme, toggleTheme, resolvedTheme, textSize, setTextSize, scale, fontChoice, setFontChoice, colorPreset, setColorPreset, customAccent, setCustomAccent, cssVars]
  );

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}
