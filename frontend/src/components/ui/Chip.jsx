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
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--color-gold-deep)] uppercase ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
