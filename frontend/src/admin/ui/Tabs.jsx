/** Simple controlled tab bar. tabs: [{ key, label, icon?, badge? }] */
export default function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <div className={`flex items-center gap-1 border-b border-[var(--a-border)] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
              isActive ? "text-[var(--a-accent)]" : "text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]"
            }`}
          >
            {tab.icon && <tab.icon size={15} />}
            {tab.label}
            {tab.badge != null && (
              <span className="ml-0.5 rounded-full bg-[var(--a-bg-surface-2)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--a-text-muted)]">
                {tab.badge}
              </span>
            )}
            {isActive && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[var(--a-accent)]" />}
          </button>
        );
      })}
    </div>
  );
}

/** Pill-style variant for compact tab groups (e.g. inside a card). */
export function PillTabs({ tabs, active, onChange, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-lg bg-[var(--a-bg-surface-2)] p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
            tab.key === active
              ? "bg-[var(--a-bg-surface)] text-[var(--a-text-primary)] shadow-[var(--a-shadow-sm)]"
              : "text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]"
          }`}
        >
          {tab.icon && <tab.icon size={14} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
