import { useMemo } from "react";
import { heartChakra } from "../../data/chakras";
import { getPeaceLocalLabel } from "../../utils/peaceTime";

/** Compact live-sit announcement pill. */
export default function LiveSessionBanner({ onNavigate }) {
  const peaceLocal = useMemo(() => getPeaceLocalLabel(), []);

  const handleClick = (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(heartChakra.view);
    }
  };

  return (
    <a
      href={heartChakra.href}
      onClick={handleClick}
      className="pointer-events-auto inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-[rgba(213,183,124,0.55)] px-3.5 py-1.5 text-center text-[12.5px] leading-normal text-[#f7ecd0] backdrop-blur-[8px] transition-colors hover:border-[rgba(230,211,168,0.95)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(230,211,168,0.22), rgba(184,151,88,0.12))",
      }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />
      <span className="text-[10.5px] tracking-[0.12em] text-[var(--color-gold-light)] uppercase">
        Free mass meditation
      </span>
      <span className="opacity-45">·</span>
      <span>Mon–Sat, {peaceLocal}</span>
      <span className="ml-0.5 inline-flex items-center gap-1 border-l border-[rgba(230,211,168,0.3)] pl-2.5 font-medium text-[var(--color-gold-light)]">
        Join the sit <span className="text-[10px]">→</span>
      </span>
    </a>
  );
}
