// Deterministic pseudo-random matching live site seed + 8% lit stars.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (Math.imul(a, 1103515245) + 12345) & 0x7fffffff;
    return a / 0x7fffffff;
  };
}

function buildStars() {
  const rand = mulberry32(20260804);
  const out = [];
  for (let i = 0; i < 100; i++) {
    const x = 2 + rand() * 96;
    const y = 3 + rand() * 90;
    // Keep clear of the centre column (mandala + copy).
    if (Math.abs(x - 50) < 17 && Math.abs(y - 50) < 30) continue;
    out.push({ x, y, jitter: rand() * 1.2, delay: (-rand() * 10).toFixed(2) });
  }
  const GOAL_PCT = 8;
  const len = out.length;
  const count = Math.max(1, Math.round((len * GOAL_PCT) / 100));
  const litIdx = new Set();
  for (let k = 0; k < count; k++) litIdx.add(Math.round((k * len) / count));

  return out.map((s, i) => {
    const lit = litIdx.has(i);
    const px = (lit ? 2.2 : 1.4) + s.jitter;
    return {
      left: `${s.x.toFixed(2)}%`,
      top: `${s.y.toFixed(2)}%`,
      size: `${px.toFixed(1)}px`,
      lit,
      delay: `${s.delay}s`,
    };
  });
}

const stars = buildStars();

/**
 * Background starfield — 8 of every 100 points lit (Mission 8% goal).
 */
export default function Starfield() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className={s.lit ? "animate-star-lit" : "animate-star-dim"}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.lit ? "#f0dcaf" : "rgba(226,220,240,0.75)",
            boxShadow: s.lit ? "0 0 7px rgba(230,211,168,0.95)" : "none",
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
