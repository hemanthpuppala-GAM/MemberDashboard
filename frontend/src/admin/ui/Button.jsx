const VARIANTS = {
  primary:
    "bg-gradient-to-br from-[var(--a-accent-from)] to-[var(--a-accent-to)] text-[var(--a-accent-ink)] hover:brightness-105 shadow-[var(--a-shadow-sm)]",
  secondary:
    "bg-[var(--a-bg-surface)] text-[var(--a-text-primary)] border border-[var(--a-border)] hover:bg-[var(--a-bg-surface-2)]",
  ghost:
    "bg-transparent text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] hover:text-[var(--a-text-primary)]",
  danger:
    "bg-[var(--a-danger)] text-white hover:opacity-90",
  "danger-ghost":
    "bg-transparent text-[var(--a-danger)] hover:bg-[var(--a-danger-muted)]",
};

const SIZES = {
  sm: "px-3 py-1.5 text-[12.5px] gap-1.5",
  md: "px-4 py-2.5 text-[13.5px] gap-2",
};

export default function Button({
  as: Tag = "button",
  type = Tag === "button" ? "button" : undefined,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  disabled,
  children,
  ...props
}) {
  return (
    <Tag
      type={type}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold tracking-tight transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.25} />}
      {children}
    </Tag>
  );
}
