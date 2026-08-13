import { chakraIcons } from "./icons";

/**
 * One orbiting chakra node — sized smaller so the face stays visible above.
 */
export default function ChakraNode({ chakra, index, onNavigate }) {
  const Icon = chakraIcons[chakra.id];
  const floatDuration = 5 + index * 0.7;

  // Fly-in start offset in the node's outward orbital direction
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
          '--fly-x': `${flyX}px`,
          '--fly-y': `${flyY}px`,
          animationDelay: `${0.05 + index * 0.08}s`,
        }}
      >
        <a
          href={chakra.href}
          onClick={handleClick}
          aria-label={`${chakra.label} — ${chakra.common} chakra`}
          className="animate-node-float group flex cursor-pointer flex-col items-center gap-1 border-0 bg-transparent no-underline outline-none"
          style={{
            animationDuration: `${floatDuration}s`,
          }}
        >
        <span
          className="m-node-ring relative flex items-center justify-center rounded-full border-[1.5px] shadow-[0_6px_28px_rgba(0,0,0,0.4)] backdrop-blur-[14px] transition-[transform,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:scale-[1.14] group-focus-visible:scale-[1.14]"
          style={{
            width: "clamp(30px, calc(var(--orbit-r) * 0.34), 58px)",
            height: "clamp(30px, calc(var(--orbit-r) * 0.34), 58px)",
            borderColor: "rgba(243,216,154,0.85)",
            background:
              "linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 55%, var(--color-gold-deep) 100%)",
            boxShadow:
              "0 4px 20px rgba(20,16,4,0.25), 0 0 22px rgba(220,185,106,0.55), inset 0 0 12px rgba(255,255,255,0.35)",
          }}
        >
          <span
            className="m-node-aura pointer-events-none absolute inset-[-42%] scale-75 rounded-full opacity-0 blur-[10px] transition-all duration-[450ms] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,246,220,0.2), rgba(230,211,168,0.1) 46%, transparent 100%)",
            }}
            aria-hidden="true"
          />
          <span
            className="relative z-[1] flex items-center justify-center"
            style={{
              color: "var(--color-on-gold)",
              fontSize: "clamp(12px, calc(var(--orbit-r) * 0.14), 20px)",
              width: "60%",
              height: "60%",
            }}
          >
            {Icon ? <Icon size="100%" petals={chakra.petals} /> : null}
          </span>
        </span>
        <span className="m-node-label max-w-[120px] text-center font-body text-[clamp(11.5px,calc(var(--orbit-r)*0.08),14px)] font-medium tracking-[0.03em] text-[#28246A] transition-colors duration-[350ms] [text-shadow:0_1px_5px_rgba(255,255,255,0.95),0_2px_12px_rgba(255,255,255,0.80)] group-hover:text-[#1E1B55] group-hover:[text-shadow:0_0_14px_rgba(243,216,154,0.70),0_1px_5px_rgba(255,255,255,0.95)]">
          {chakra.label}
        </span>
        </a>
      </div>
    </div>
  );
}
