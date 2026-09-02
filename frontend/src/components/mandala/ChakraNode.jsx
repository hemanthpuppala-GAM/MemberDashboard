import { chakraIcons } from "./icons";

/**
 * One orbiting chakra node — dark glass ring, colored glyph, white label
 * (matches the live hub / reference mandala).
 */
export default function ChakraNode({ chakra, index, onNavigate }) {
  const Icon = chakraIcons[chakra.id];
  const floatDuration = 5 + index * 0.7;

  const rad = (chakra.angle * Math.PI) / 180;
  const flyX = Math.round(240 * Math.sin(rad));
  const flyY = Math.round(-240 * Math.cos(rad));

  const handleClick = (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(chakra.view);
    }
  };

  return (
    <div
      className="m-node absolute top-1/2 left-1/2 z-[6]"
      style={{
        transform: `translate(-50%, -50%) rotate(${chakra.angle}deg) translateY(calc(-1 * var(--orbit-r))) rotate(${-chakra.angle}deg)`,
      }}
    >
      <div
        className="node-fly-in"
        style={{
          "--fly-x": `${flyX}px`,
          "--fly-y": `${flyY}px`,
          animationDelay: `${0.05 + index * 0.08}s`,
        }}
      >
        <a
          href={chakra.href}
          onClick={handleClick}
          aria-label={`${chakra.label} — ${chakra.common} chakra`}
          className="animate-node-float group flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent no-underline outline-none"
          style={{ animationDuration: `${floatDuration}s` }}
        >
          <span
            className="m-node-ring relative flex items-center justify-center rounded-full border transition-[transform,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.12] group-focus-visible:scale-[1.12]"
            style={{
              width: "clamp(48px, calc(var(--orbit-r) * 0.42), 72px)",
              height: "clamp(48px, calc(var(--orbit-r) * 0.42), 72px)",
              borderColor: "rgba(198,161,91,0.55)",
              borderWidth: "1.5px",
              background: "rgba(22,16,10,0.42)",
              backdropFilter: "blur(10px)",
              boxShadow: `0 4px 22px rgba(0,0,0,0.35), 0 0 18px ${chakra.color}55, inset 0 0 14px rgba(255,255,255,0.06)`,
            }}
          >
            <span
              className="m-node-aura pointer-events-none absolute inset-[-48%] scale-75 rounded-full opacity-0 blur-[12px] transition-all duration-[450ms] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
              style={{
                background: "radial-gradient(closest-side, #C6A15B66, transparent 72%)",
              }}
              aria-hidden="true"
            />
            <span
              className="relative z-[1] flex items-center justify-center"
              style={{
                color: chakra.color,
                filter: `drop-shadow(0 0 8px ${chakra.color}aa)`,
                width: "68%",
                height: "68%",
              }}
            >
              {Icon ? <Icon size="100%" petals={chakra.petals} /> : null}
            </span>
          </span>
          <span className="m-node-label max-w-[130px] text-center font-body text-[clamp(12px,calc(var(--orbit-r)*0.095),15px)] font-semibold tracking-[0.04em] text-white transition-colors duration-[350ms] [text-shadow:0_1px_8px_rgba(0,0,0,0.75),0_0_18px_rgba(0,0,0,0.35)] group-hover:text-[var(--color-gold-light)]">
            {chakra.label}
          </span>
        </a>
      </div>
    </div>
  );
}
