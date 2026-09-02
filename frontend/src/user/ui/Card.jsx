import { CARD_CLASS } from "../../components/ui/sectionStyles";

/** Dashboard card — the exact surface/elevation system used by the public site's sections, so the two feel like one product. */
export default function Card({ title, description, actions, children, className = "", padded = true, accent = false }) {
  return (
    <div
      className={`${CARD_CLASS} overflow-hidden ${padded ? "" : "!p-0"} ${className}`}
    >
      {accent && (
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-deep)]" />
      )}
      {(title || actions) && (
        <div className={`flex items-start justify-between gap-4 ${padded ? "mb-4" : "p-5 pb-0 sm:p-6 sm:pb-0"}`}>
          <div>
            {title && <h2 className="font-display text-[16.5px] text-[var(--color-ink)]">{title}</h2>}
            {description && <p className="mt-1 text-[13.5px] text-[var(--color-ink-soft)]">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
