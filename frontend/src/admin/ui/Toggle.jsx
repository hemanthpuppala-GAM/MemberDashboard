export default function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-start gap-3 text-left disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-[var(--a-accent)]" : "bg-[var(--a-border)]"
        }`}
      >
        <span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-[13.5px] font-medium text-[var(--a-text-primary)]">{label}</span>}
          {description && <span className="text-[12.5px] text-[var(--a-text-muted)]">{description}</span>}
        </span>
      )}
    </button>
  );
}
