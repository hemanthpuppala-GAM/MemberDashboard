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
      "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] text-[var(--color-on-gold)] hover:text-[var(--color-on-gold)]",
    secondary:
      "border border-[var(--color-gold)]/50 text-[var(--color-gold-light)] bg-[var(--color-surface)]/60 hover:bg-[var(--color-surface)]/90 hover:border-[var(--color-gold)]",
  };

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
