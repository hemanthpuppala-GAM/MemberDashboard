/** Primary/secondary CTA button, gold "house" accent (Design.md §4.1). */
export default function Button({
  as: Tag = "a",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-body text-sm font-semibold tracking-wide transition-all duration-300";

  const variants = {
    primary:
      "bg-gradient-to-b from-[var(--color-gold-light)] to-[var(--color-gold-deep)] text-[var(--color-on-gold)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_14px_36px_-8px_rgba(214,183,124,0.45)] hover:-translate-y-0.5",
    secondary:
      "border border-[var(--color-gold)]/50 text-[var(--color-gold-light)] bg-[var(--color-surface)]/60 hover:bg-[var(--color-surface)]/90 hover:border-[var(--color-gold)]",
  };

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
