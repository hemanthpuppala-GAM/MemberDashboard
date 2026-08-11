import RippleRings from "./RippleRings";
import IconHeart from "./icons/IconHeart";
import { heartChakra } from "../../data/chakras";

const ARC_LABEL_PATH_ID = "center-orb-arc-label-path";

/**
 * Anahata / Heart — the fixed centre of the mandala (Design.md §4.4).
 * Idle state only for now: no live-session data source exists yet on the
 * homepage, so the "green when live" state from the design isn't wired up.
 */
export default function CenterOrb() {
  return (
    <a
      href={heartChakra.href}
      aria-label={`${heartChakra.label} — join the daily group meditation`}
      className="group relative z-10 flex aspect-square w-[clamp(92px,26vw,168px)] items-center justify-center outline-none"
    >
      <RippleRings />

      <span
        className="absolute inset-[-30%] rounded-full opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, var(--color-gold-light) 0%, transparent 70%)",
        }}
      />

      <span className="animate-breathe absolute inset-0 rounded-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <path
              id={ARC_LABEL_PATH_ID}
              d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
              fill="none"
            />
          </defs>
          <text
            fill="var(--color-gold-light)"
            fontSize="4.4"
            letterSpacing="0.15"
            className="uppercase"
          >
            <textPath href={`#${ARC_LABEL_PATH_ID}`} startOffset="0%">
              Mass Meditation · Mass Meditation · Mass Meditation ·
            </textPath>
          </text>
        </svg>

        <span className="absolute inset-[14%] rounded-full border border-[var(--color-gold)]/60 bg-[var(--color-surface)]/80 shadow-[0_8px_34px_-6px_rgba(0,0,0,0.6)] backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
          <span className="flex h-full w-full items-center justify-center text-[var(--color-gold-light)]">
            <IconHeart size="60%" petals={heartChakra.petals} />
          </span>
        </span>
      </span>
    </a>
  );
}
