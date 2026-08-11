/** Three staggered rings pulsing outward from the centre orb. */
export default function RippleRings() {
  const rings = [
    {
      delay: "0s",
      border: "1.5px solid rgba(230,211,168,0.55)",
      shadow:
        "0 0 30px rgba(213,183,124,0.25), inset 0 0 24px rgba(213,183,124,0.18)",
    },
    { delay: "2s", border: "1px solid rgba(230,211,168,0.4)", shadow: "none" },
    { delay: "4s", border: "1px solid rgba(230,211,168,0.3)", shadow: "none" },
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
