/** Three staggered rings pulsing outward from the centre orb (Design.md §4.4). */
export default function RippleRings() {
  const delays = [0, 2, 4];

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {delays.map((delay) => (
        <span
          key={delay}
          className="animate-ripple absolute inset-0 rounded-full border"
          style={{
            borderColor: "var(--color-gold)",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
