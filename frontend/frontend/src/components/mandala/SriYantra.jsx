import { chakras, heartChakra } from "../../data/chakras";
import { chakraIcons } from "./icons";
import logoCoin from "../../assets/logo-coin.jpg";

/**
 * Sri Yantra — the homepage primary navigation.
 *
 * Two interlocking triangles (shatkona) with a chakra node at each vertex and
 * the Golden Age coin breathing at the centre:
 *   ▽ gold  "core"  = Meditation · Wellness · Wisdom   (what we practise)
 *   △ blue  "path"  = About · Events · Mission          (how you join)
 *
 * Geometry lives in data/chakras.js (`yantra.deg`, `yantra.group`, `yantra.line`);
 * this component only draws. Everything is sized from ONE variable, `--yantra-r`
 * (the circumradius of the triangles), so the same markup scales from a 300px
 * phone wheel to a 560px desktop one without any per-breakpoint tweaks:
 *
 *   box       = 2 × R + label allowance (rings + labels never clip)
 *   node ring = 0.24 R (core) / 0.19 R (path)
 *   coin      = 0.63 R
 *   label     = clamp() type that grows with R but never below 11px
 *
 * Motion: `.animate-breathe` (theme.css, 10s = 5s in / 5s out) on the whole wheel,
 * `yantra-draw` strokes the triangles in on mount. Both honour prefers-reduced-motion.
 *
 * Props
 *   onNavigate(view)  SPA navigation (HomePage.setView). Falls back to href.
 *   radius            CSS length for --yantra-r. Default clamps between 105px (phone) and 300px.
 *   showLines         Render the one-line teachings under core labels. They are also hidden
 *                     below the `sm` breakpoint (640px) regardless, where they would clip.
 */
export default function SriYantra({ onNavigate, radius, showLines = true }) {
  const R = radius ?? "clamp(105px, min(24vw, 36vh), 300px)";
  // Label allowance beyond the triangle ring, in R units (kicker + 2-line teaching).
  const PAD = 0.42;
  const box = `calc(var(--yantra-r) * ${2 + PAD * 2})`;

  const go = (view, href) => (e) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(view);
  };

  // Vertex position (in % of the box) from a clockwise-from-top angle.
  const pos = (deg) => {
    const rad = (deg * Math.PI) / 180;
    const x = 50 + (50 * Math.sin(rad)) / (1 + PAD);
    const y = 50 - (50 * Math.cos(rad)) / (1 + PAD);
    return { x, y, sx: Math.sin(rad), cy: Math.cos(rad) };
  };

  const tri = (group) =>
    chakras
      .filter((c) => c.yantra.group === group)
      .map((c) => pos(c.yantra.deg))
      .map(({ x, y }) => `${x},${y}`)
      .join(" ");

  return (
    <div
      className="sri-yantra relative mx-auto aspect-square shrink-0"
      style={{ "--yantra-r": R, width: box, maxWidth: "100%" }}
      role="navigation"
      aria-label="Explore Golden Age Wisdom"
    >
      <div className="animate-breathe absolute inset-0">
        {/* Outer halo ring */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full border border-[rgba(232,207,131,0.18)]"
          style={{ inset: `calc(var(--yantra-r) * ${PAD - 0.22})` }}
        />

        {/* Triangles + dashed orbit — one SVG, percentages of the box */}
        <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
          <polygon
            points={tri("core")}
            fill="rgba(232,207,131,0.04)"
            stroke="var(--color-gold-light)"
            strokeWidth="0.18"
            pathLength="100"
            strokeDasharray="100"
            className="yantra-draw"
            style={{ animationDelay: ".3s" }}
          />
          <polygon
            points={tri("path")}
            fill="rgba(127,176,224,0.05)"
            stroke="#7fb0e0"
            strokeWidth="0.18"
            pathLength="100"
            strokeDasharray="100"
            className="yantra-draw"
            style={{ animationDelay: "1.2s" }}
          />
          <circle cx="50" cy="50" r={50 / (1 + PAD)} fill="none" stroke="rgba(232,207,131,0.25)" strokeWidth="0.14" strokeDasharray="0.6 1.2" />
        </svg>

        {/* Six vertex nodes */}
        {chakras.map((c, i) => {
          const { x, y, sx, cy } = pos(c.yantra.deg);
          const core = c.yantra.group === "core";
          const Icon = chakraIcons[c.id];
          const hue = c.glyphColor || c.color;
          const ring = core ? "calc(var(--yantra-r) * 0.24)" : "calc(var(--yantra-r) * 0.19)";
          const side = Math.abs(sx) < 0.1 ? "center" : sx > 0 ? "right" : "left";
          const vertical = cy > 0.01 ? "above" : cy < -0.01 ? "below" : "beside";
          const label = c.yantra.shortLabel ?? c.label;

          // Label block sits radially OUTWARD from its node so nothing crosses the triangles.
          const labelStyle = {
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            gap: "0.3em",
            width: side === "center" ? "calc(var(--yantra-r) * 0.8)" : "max-content",
            maxWidth: side === "center" ? undefined : "calc(var(--yantra-r) * 0.58)",
            textAlign: side === "center" ? "center" : side === "right" ? "left" : "right",
            alignItems: side === "center" ? "center" : side === "right" ? "flex-start" : "flex-end",
            ...(side === "center"
              ? { left: "50%", transform: "translateX(-50%)" }
              : side === "right"
                ? { left: `calc(${ring} / 2 + 0.6em)` }
                : { right: `calc(${ring} / 2 + 0.6em)` }),
            ...(vertical === "above"
              ? { bottom: side === "center" ? `calc(${ring} / 2 + 0.7em)` : `calc(${ring} / -2)` }
              : vertical === "below"
                ? { top: side === "center" ? `calc(${ring} / 2 + 0.7em)` : `calc(${ring} / -2)` }
                : { top: "-1.2em" }),
          };

          return (
            <a
              key={c.id}
              href={c.href}
              onClick={go(c.view, c.href)}
              aria-label={`${c.label} — ${c.common} chakra`}
              className="group absolute z-[6] block h-0 w-0 text-[#F6F1E6] no-underline outline-none"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Glass ring + glyph */}
              <span
                className="absolute flex items-center justify-center rounded-full border transition-[transform,box-shadow] duration-300 group-hover:scale-110 group-focus-visible:scale-110"
                style={{
                  translate: "-50% -50%",
                  width: ring,
                  height: ring,
                  borderColor: core ? "rgba(232,207,131,0.6)" : "rgba(127,176,224,0.5)",
                  background: "rgba(12,20,36,0.85)",
                  backdropFilter: "blur(8px)",
                  color: hue,
                  boxShadow: `0 0 26px ${hue}55`,
                  animation: `yantra-node-in .7s cubic-bezier(.2,.7,.3,1) both ${(0.05 + i * 0.08).toFixed(2)}s`,
                }}
              >
                <span className="flex" style={{ width: "66%", height: "66%" }}>
                  {Icon ? <Icon size="100%" petals={c.petals} /> : null}
                </span>
              </span>

              {/* Kicker + teaching line */}
              <span style={labelStyle}>
                <span
                  className="font-body font-bold uppercase transition-colors group-hover:text-[var(--color-gold-light)]"
                  style={{
                    fontSize: "clamp(11px, calc(var(--yantra-r) * 0.043), 12px)",
                    letterSpacing: "0.24em",
                    color: hue,
                    textShadow: "0 1px 2px #000, 0 0 6px #000, 0 0 14px rgba(0,0,0,.95)",
                  }}
                >
                  {label}
                </span>
                {showLines && c.yantra.line && (
                  <span
                    className="text-balance max-sm:hidden"
                    style={{
                      fontFamily: "var(--font-headline)",
                      fontWeight: 500,
                      fontSize: "clamp(15px, calc(var(--yantra-r) * 0.078), 21px)",
                      lineHeight: 1.2,
                      color: "#FFFDF7",
                      textShadow: "0 1px 2px #000, 0 0 8px #000, 0 2px 18px rgba(0,0,0,.95)",
                    }}
                  >
                    {c.yantra.line}
                  </span>
                )}
              </span>
            </a>
          );
        })}

        {/* Centre: the coin — click goes to the daily sit */}
        <a
          href={heartChakra.href}
          onClick={go(heartChakra.view, heartChakra.href)}
          title="Mass meditation for global peace"
          aria-label={`${heartChakra.label} — join the daily group meditation`}
          className="animate-breathe-glow absolute top-1/2 left-1/2 z-[5] block -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#0F0D0B] no-underline outline-none"
          style={{ width: "calc(var(--yantra-r) * 0.63)", height: "calc(var(--yantra-r) * 0.63)" }}
        >
          <img src={logoCoin} alt="" className="h-full w-full object-cover" style={{ transform: "scale(1.45)" }} />
        </a>
      </div>
    </div>
  );
}
