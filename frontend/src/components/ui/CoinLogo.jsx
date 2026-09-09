import logoCoin from "../../assets/logo-coin.jpg";

/**
 * The coin logo with a "real medal" read: circular clip, embossed gold rim,
 * specular highlight, grounded shadow. Size in px. Pass tilt to add the slow
 * 3D sway used at hero scale (off by default in the header).
 */
export default function CoinLogo({ size = 44, tilt = false, className = "", alt = "Golden Age Wisdom" }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full bg-[#0F0D0B] ${tilt ? "animate-coin-tilt" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        clipPath: "circle(50%)",
        boxShadow:
          "0 8px 18px -6px rgba(0,0,0,.9), 0 1px 0 1px rgba(232,207,131,.6), 0 0 0 2.5px rgba(60,42,16,.95), 0 0 22px rgba(201,162,74,.35)",
      }}
    >
      <img src={logoCoin} alt={alt} className="absolute inset-0 h-full w-full object-cover" style={{ transform: "scale(1.45)" }} />
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
    </span>
  );
}
