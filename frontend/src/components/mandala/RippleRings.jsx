/** Three staggered rings pulsing outward from the centre orb. */
export default function RippleRings() {
  const rings = [
    {
      delay: "0s",
      border: "1.5px solid rgba(243,216,154,0.60)",
      shadow: "0 0 26px rgba(243,216,154,0.30), inset 0 0 20px rgba(243,216,154,0.15)",
    },
    { delay: "2s", border: "1px solid rgba(110,198,234,0.55)", shadow: "0 0 16px rgba(110,198,234,0.25)" },
    { delay: "4s", border: "1px solid rgba(243,216,154,0.28)", shadow: "none" },
  ];

  return (
    <>
      {rings.map((r) => (
        <div
          key={r.delay}
          className="pointer-events-none absolute top-1/2 left-1/2 rounded-full animate-ripple"
          style={{
            width: "calc(var(--orbit-r) * 0.72)",
            height: "calc(var(--orbit-r) * 0.72)",
            border: r.border,
            boxShadow: r.shadow,
            animationDelay: r.delay,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
