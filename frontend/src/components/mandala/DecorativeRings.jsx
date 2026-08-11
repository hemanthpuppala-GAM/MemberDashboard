/**
 * Two atmosphere-only rings tracing the mandala at 1.52x and 2.24x the
 * node orbit radius (Design.md §3) — no interactive content, pure aura.
 */
export default function DecorativeRings() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <span
        className="animate-ring-pulse absolute rounded-full border"
        style={{
          width: "calc(var(--orbit-r) * 3.04)",
          height: "calc(var(--orbit-r) * 3.04)",
          borderColor: "var(--color-gold-light)",
        }}
      />
      <span
        className="animate-ring-pulse-reverse absolute rounded-full border"
        style={{
          width: "calc(var(--orbit-r) * 4.48)",
          height: "calc(var(--orbit-r) * 4.48)",
          borderColor: "var(--color-gold-light)",
        }}
      />
    </div>
  );
}
