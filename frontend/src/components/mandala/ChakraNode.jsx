import { chakraIcons } from "./icons";

/**
 * One orbiting chakra node — sized smaller so the face stays visible above.
 */
export default function ChakraNode({ chakra, index, onNavigate }) {
  const Icon = chakraIcons[chakra.id];
  const floatDuration = 5 + index * 0.7;

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
            borderColor: `${chakra.color}a6`,
            background:
              "radial-gradient(circle at 38% 32%, rgba(38,32,72,0.55), rgba(20,16,44,0.5) 62%, rgba(14,11,34,0.45))",
            boxShadow: `0 6px 28px rgba(0,0,0,0.4), 0 0 24px ${chakra.color}4d, inset 0 0 16px rgba(255,255,255,0.04)`,
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
              color: chakra.color,
              fontSize: "clamp(12px, calc(var(--orbit-r) * 0.14), 20px)",
              width: "60%",
              height: "60%",
            }}
          >
            {Icon ? <Icon size="100%" petals={chakra.petals} /> : null}
          </span>
        </span>
        <span className="m-node-label max-w-[120px] text-center font-body text-[clamp(11.5px,calc(var(--orbit-r)*0.08),14px)] font-medium tracking-[0.03em] text-[#f2ecdd] transition-colors duration-[350ms] [text-shadow:0_1px_4px_rgba(13,10,28,0.9),0_2px_14px_rgba(13,10,28,0.9)] group-hover:text-[#f7f1e3] group-hover:[text-shadow:0_0_18px_rgba(230,211,168,0.6)]">
          {chakra.label}
        </span>
      </a>
    </div>
  );
}
