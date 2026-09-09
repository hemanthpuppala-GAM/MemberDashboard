import { heartChakra } from "../../data/chakras";
import logoCoin from "../../assets/logo-coin.jpg";

const BEADS = [
  "var(--color-chakra-crown)",
  "var(--color-chakra-thirdeye)",
  "var(--color-chakra-throat)",
  "var(--color-chakra-heart)",
  "var(--color-chakra-solar)",
  "var(--color-chakra-sacral)",
  "var(--color-chakra-root)",
];

/**
 * Anahata / Heart — the mandala's centre is the coin itself ("Living Coin").
 * Seven chakra beads run down the meditator on the coin and light in sequence.
 */
export default function CenterOrb({ onNavigate }) {
  const handleClick = (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(heartChakra.view);
    }
  };

  return (
    <div
      className="relative z-[5] aspect-square w-[clamp(96px,calc(var(--orbit-r)*0.9),440px)]"
      style={{ perspective: 900 }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(232,207,131,0.45)]"
        style={{ animation: "hero-ripple 9s ease-out infinite" }}
      />
      <a
        href={heartChakra.href}
        onClick={handleClick}
        title="Mass meditation for global peace"
        aria-label={`${heartChakra.label} — join the daily group meditation`}
        className="m-orb animate-coin-tilt animate-breathe-glow relative block h-full w-full overflow-hidden rounded-full bg-[#0F0D0B] no-underline outline-none"
        style={{
          clipPath: "circle(50%)",
          boxShadow:
            "0 24px 60px rgba(0,0,0,.55), 0 0 50px rgba(201,162,74,.28), 0 0 0 2.5px rgba(60,42,16,.95), 0 1px 0 1px rgba(232,207,131,.6)",
        }}
      >
        <img
          src={logoCoin}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scale(1.45)" }}
        />
        {BEADS.map((color, i) => (
          <span
            key={color}
            aria-hidden="true"
            className="absolute left-1/2 h-[5%] w-[5%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              top: `${43.5 + i * 6}%`,
              background: color,
              boxShadow: `0 0 14px 4px ${color}`,
              animation: `coin-bead 10s ease-in-out ${(i * 0.9).toFixed(1)}s infinite`,
            }}
          />
        ))}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full mix-blend-screen"
          style={{ background: "radial-gradient(circle at 32% 26%, rgba(255,244,214,.4), rgba(255,244,214,0) 45%)" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(232,207,131,.6), inset 0 4px 10px rgba(255,240,200,.25), inset 0 -6px 12px rgba(0,0,0,.65)" }}
        />
      </a>
    </div>
  );
}
