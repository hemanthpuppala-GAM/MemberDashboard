import { AlertTriangle, Plus } from "lucide-react";

/**
 * Language tab bar for multi-language content editors (plan §3.3).
 * languages: [{ code, name, flag }], incomplete: Set of codes missing required fields.
 */
export default function LangTabs({ languages, active, onChange, incomplete, onAddLanguage }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--a-border)] pb-3">
      {languages.map((lang) => {
        const isActive = lang.code === active;
        const missing = incomplete?.has(lang.code);
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
              isActive
                ? "bg-[var(--a-accent)] text-white"
                : "bg-[var(--a-bg-surface-2)] text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]"
            }`}
          >
            <span>{lang.flag}</span>
            {lang.name}
            {missing && (
              <AlertTriangle size={12} className={isActive ? "text-white" : "text-[var(--a-warning)]"} />
            )}
          </button>
        );
      })}
      {onAddLanguage && (
        <button
          type="button"
          onClick={onAddLanguage}
          className="flex items-center gap-1 rounded-full border border-dashed border-[var(--a-border)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:border-[var(--a-accent)] hover:text-[var(--a-accent)]"
        >
          <Plus size={13} /> Add language
        </button>
      )}
    </div>
  );
}
