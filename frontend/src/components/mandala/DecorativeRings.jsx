/**
 * Two atmosphere rings at 1.52× / 2.24× orbit radius (live site diameters).
 */
export default function DecorativeRings() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span
        className="m-ring2 animate-ring-pulse absolute rounded-full border border-[rgba(110,198,234,0.50)]"
        style={{
          width: "calc(var(--orbit-r) * 2.24)",
          height: "calc(var(--orbit-r) * 2.24)",
        }}
      />
      <span
        className="m-ring1 animate-ring-pulse-reverse absolute rounded-full border border-dashed border-[rgba(243,216,154,0.38)]"
        style={{
          width: "calc(var(--orbit-r) * 1.52)",
          height: "calc(var(--orbit-r) * 1.52)",
        }}
      />
    </div>
  );
}
