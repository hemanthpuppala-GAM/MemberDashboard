export default function Card({ title, description, actions, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[rgba(110,198,234,0.30)] bg-white/70 p-5 shadow-[0_8px_30px_-16px_rgba(88,84,160,0.35)] backdrop-blur-sm sm:p-6 ${className}`}
    >
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-display text-[19px] text-[var(--color-ink)]">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-[13px] text-[var(--color-muted)]">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
