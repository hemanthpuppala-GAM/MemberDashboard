export default function Card({ title, description, actions, children, className = "", padded = true }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] shadow-[var(--a-shadow-sm)] ${padded ? "p-5 sm:p-6" : ""} ${className}`}
    >
      {(title || actions) && (
        <div className={`flex items-start justify-between gap-4 ${padded ? "mb-5" : "p-5 pb-0 sm:p-6 sm:pb-0"}`}>
          <div>
            {title && <h2 className="text-[15.5px] font-semibold text-[var(--a-text-primary)]">{title}</h2>}
            {description && <p className="mt-1 text-[13px] text-[var(--a-text-muted)]">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
