/** Primary/secondary CTA button, gold "house" accent (Design.md §4.1). */
export default function Button({
  as: Tag = "a",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-2.5 font-body text-[14px] font-semibold tracking-[0.01em] transition-all duration-300 ease-out";

  const variants = {
    primary:
      "bg-[var(--color-gold)] text-[var(--color-on-gold)] shadow-[0_4px_16px_rgba(80,65,40,0.10)] hover:-translate-y-px hover:bg-[var(--color-gold-deep)] hover:text-white hover:shadow-[0_8px_22px_rgba(80,65,40,0.16)]",
    secondary:
      "border border-[var(--color-gold)]/70 text-[var(--color-gold-deep)] hover:border-[var(--color-gold)] hover:bg-[rgba(198,161,91,0.08)] hover:text-[var(--color-gold-deep)]",
  };

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
