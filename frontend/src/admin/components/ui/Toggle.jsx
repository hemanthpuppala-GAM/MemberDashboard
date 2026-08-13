/** Pill switch matching the site's gold/blue accent language. */
export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ${
          checked
            ? "border-[var(--color-gold-deep)] bg-[var(--color-gold)]"
            : "border-[rgba(110,198,234,0.40)] bg-[var(--color-surface)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
          style={{ height: "18px", width: "18px" }}
        />
      </span>
      {label && <span className="font-body text-[13px] text-[var(--color-ink)]">{label}</span>}
    </button>
  );
}
