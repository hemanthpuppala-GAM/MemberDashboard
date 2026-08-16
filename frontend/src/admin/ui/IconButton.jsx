const VARIANTS = {
  default: "text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] hover:text-[var(--a-text-primary)]",
  danger: "text-[var(--a-text-muted)] hover:bg-[var(--a-danger-muted)] hover:text-[var(--a-danger)]",
  accent: "text-[var(--a-text-muted)] hover:bg-[var(--a-accent-muted)] hover:text-[var(--a-accent)]",
};

export default function IconButton({ icon: Icon, label, variant = "default", size = 18, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      <Icon size={size} strokeWidth={2} />
    </button>
  );
}
