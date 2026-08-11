// Deterministic pseudo-random so the field is stable across re-renders
// without hand-authoring ~70 star positions.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_COUNT = 90;
const rand = mulberry32(20260811);
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  top: `${(rand() * 100).toFixed(2)}%`,
  left: `${(rand() * 100).toFixed(2)}%`,
  size: rand() < 0.15 ? 2.5 : 1.3,
  lit: i % 12 === 0, // ~8% of stars twinkle, per Design.md §5
  delay: `${(rand() * 5).toFixed(2)}s`,
  duration: `${(2.8 + rand() * 2.4).toFixed(2)}s`,
}));

/**
 * Background starfield (Design.md §5): most stars are dim and static,
 * a small twinkling fraction gives the field a living, distant quality
 * without competing with the mandala.
 */
export default function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-[var(--color-ink)] ${s.lit ? "animate-twinkle" : ""}`}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.lit ? undefined : 0.25,
            animationDelay: s.lit ? s.delay : undefined,
            animationDuration: s.lit ? s.duration : undefined,
          }}
        />
      ))}
    </div>
  );
}
