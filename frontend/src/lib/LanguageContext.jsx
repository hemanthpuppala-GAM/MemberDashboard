import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { publicApi } from "./api";

const STORAGE_KEY = "gaw_lang";

/** Safety net for first paint before /ui-strings resolves (and for any key an admin hasn't translated yet). */
const FALLBACK_EN = {
  "nav.about": "About",
  "nav.wisdom": "Wisdom",
  "nav.wellness": "Wellness",
  "nav.meditation": "Meditation",
  "nav.events": "Events",
  "nav.mission": "Mission",
  "nav.volunteer": "Volunteer",
  "nav.support": "Support",
  "nav.contact": "Contact",
  "nav.join_free": "Join free",
  "footer.tagline": "Free daily meditation and Upanishadic wisdom, offered without cost or obligation to anyone who seeks it.",
  "footer.explore_heading": "Explore",
  "footer.contact_heading": "Contact",
  "footer.connect_heading": "Connect",
  "footer.get_in_touch": "Get in touch →",
  "footer.support_mission": "Support the mission",
  "footer.go_back": "Go Back",
  "footer.copyright": "© {year} Golden Age Wisdom · A registered non-profit",
  "footer.funded_by_ads": "Funded entirely by voluntary support, never by ads",
  "hub.choose_path": "Choose a path · the center breathes with you",
  "hub.support": "Support",
  "hub.copyright": "A registered non-profit · © {year}",
};

function interpolate(text, vars) {
  if (!vars) return text;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), text);
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [languages, setLanguages] = useState([]);
  const [language, setLanguageState] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "en");
  const [strings, setStrings] = useState({});

  useEffect(() => {
    publicApi
      .languages()
      .then((langs) => {
        setLanguages(langs);
        const saved = localStorage.getItem(STORAGE_KEY);
        const isSavedEnabled = saved && langs.some((l) => l.code === saved);
        if (!isSavedEnabled) {
          const fallback = langs.find((l) => l.is_default)?.code ?? langs[0]?.code;
          if (fallback) setLanguageState(fallback);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    publicApi
      .uiStrings(language)
      .then(setStrings)
      .catch(() => setStrings({}));
  }, [language]);

  const setLanguage = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLanguageState(code);
  }, []);

  const t = useCallback(
    (key, vars) => interpolate(strings[key] ?? FALLBACK_EN[key] ?? key, vars),
    [strings],
  );

  const value = useMemo(
    () => ({ language, setLanguage, languages, t }),
    [language, setLanguage, languages, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
