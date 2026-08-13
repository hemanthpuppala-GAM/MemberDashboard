/** Primary/secondary CTA button, gold "house" accent (Design.md §4.1). */
export default function Button({
  as: Tag = "a",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2 font-body text-[14px] font-semibold tracking-wide transition-all duration-300";

  const variants = {
    primary:
      "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] text-[var(--color-on-gold)] hover:text-[var(--color-on-gold)] hover:shadow-[0_0_22px_rgba(243,216,154,0.50)]",
    secondary:
      "border border-[rgba(110,198,234,0.55)] text-[var(--color-ink)] bg-[rgba(110,198,234,0.15)] hover:bg-[rgba(110,198,234,0.30)] hover:border-[var(--color-gold)]/70 hover:text-[var(--color-ink)]",
  };

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
