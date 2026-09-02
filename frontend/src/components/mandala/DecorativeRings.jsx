/**
 * Atmosphere rings at 1.52× / 2.24× orbit radius — soft dashed guides like the live hub.
 */
export default function DecorativeRings() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span
        className="m-ring2 animate-ring-pulse absolute rounded-full border border-dashed border-white/35"
        style={{
          width: "calc(var(--orbit-r) * 2.24)",
          height: "calc(var(--orbit-r) * 2.24)",
          boxShadow: "0 0 40px rgba(255,255,255,0.06)",
        }}
      />
      <span
        className="m-ring1 animate-ring-pulse-reverse absolute rounded-full border border-dashed border-[rgba(198,161,91,0.42)]"
        style={{
          width: "calc(var(--orbit-r) * 1.52)",
          height: "calc(var(--orbit-r) * 1.52)",
        }}
      />
    </div>
  );
}
