import { useLanguage } from "../../lib/LanguageContext";

/** Compact language picker for the header — lists enabled languages, persists the choice (see LanguageContext). */
export default function LanguageSwitcher({ light = false }) {
  const { language, setLanguage, languages } = useLanguage();

  if (languages.length < 2) return null;

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label="Choose language"
      className={`shrink-0 cursor-pointer rounded-full border bg-transparent px-2.5 py-1.5 text-[12.5px] font-medium tracking-wide outline-none transition-colors ${
        light
          ? "border-white/25 text-white/85 hover:border-white/50 [&>option]:text-[var(--color-ink)]"
          : "border-[rgba(110,198,234,0.35)] text-[var(--color-muted)] hover:border-[var(--color-gold)]/60"
      }`}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.native_name}
        </option>
      ))}
    </select>
  );
}
