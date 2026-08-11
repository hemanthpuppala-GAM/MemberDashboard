import { chakraIcons } from "./icons";

/**
 * One orbiting chakra node. Position (polar → CSS) and float animation
 * live on separate wrapper elements from the hover-scale transform so the
 * three `transform`s don't fight each other (Design.md §5 float + §5 hover).
 */
export default function ChakraNode({ chakra, index }) {
  const Icon = chakraIcons[chakra.id];
  const floatDuration = 5 + index * 0.7;
  const floatDelay = index * 0.35;

  return (
    <a
      href={chakra.href}
      aria-label={`${chakra.label} — ${chakra.common} chakra`}
      className="absolute top-1/2 left-1/2 outline-none"
      style={{
        "--angle": `${chakra.angle}deg`,
        transform:
          "translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--orbit-r))) rotate(calc(-1 * var(--angle)))",
      }}
    >
      <div
        className="animate-node-float group"
        style={{
          animationDuration: `${floatDuration}s`,
          animationDelay: `${floatDelay}s`,
        }}
      >
        <div className="flex w-[clamp(64px,15vw,92px)] flex-col items-center gap-2 transition-transform duration-300 ease-out group-hover:scale-[1.16] group-focus-visible:scale-[1.16]">
          <span className="relative flex aspect-square w-full items-center justify-center">
            <span
              className="absolute inset-[6%] rounded-full opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-90"
              style={{ background: chakra.color }}
            />
            <span
              className="relative flex h-[82%] w-[82%] items-center justify-center rounded-full border bg-[var(--color-surface)]/70 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-300"
              style={{ borderColor: chakra.color }}
            >
              <span style={{ color: chakra.color }}>
                <Icon size="56%" petals={chakra.petals} />
              </span>
            </span>
          </span>
          <span className="text-center font-body text-[clamp(11px,2vw,13px)] font-medium tracking-wide text-[var(--color-ink)]">
            {chakra.label}
          </span>
        </div>
      </div>
    </a>
  );
}
