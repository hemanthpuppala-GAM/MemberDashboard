export default function Card({ title, description, actions, children, className = "", padded = true, accent = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[rgba(110,198,234,0.28)] bg-[rgba(255,255,255,0.82)] shadow-[0_4px_24px_rgba(140,138,192,0.10)] backdrop-blur-[8px] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-gold)]/55 hover:shadow-[0_12px_32px_rgba(140,138,192,0.18),0_0_0_1px_rgba(243,216,154,0.25)] ${
        padded ? "p-5 sm:p-6" : ""
      } ${className}`}
    >
      {accent && (
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--color-blue)] via-[var(--color-gold)] to-[var(--color-blue)] opacity-80" />
      )}
      {(title || actions) && (
        <div className={`flex items-start justify-between gap-4 ${padded ? "mb-4" : "p-5 pb-0 sm:p-6 sm:pb-0"}`}>
          <div>
            {title && <h2 className="font-display text-[16px] text-[var(--color-ink)]">{title}</h2>}
            {description && <p className="mt-1 text-[13px] text-[var(--color-muted)]">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
