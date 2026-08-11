/**
 * Shared pill-chip primitive (Design.md §11: role badges, live/idle
 * indicators and section labels all reuse one chip shape). Homepage only
 * uses the neutral/gold variants for now.
 */
export default function Chip({ children, color, className = "" }) {
  const style = color
    ? { color, borderColor: color, backgroundColor: `${color}1a` }
    : undefined;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold-light)]/10 px-3 py-1 text-xs font-medium tracking-wide text-[var(--color-gold-light)] uppercase ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
