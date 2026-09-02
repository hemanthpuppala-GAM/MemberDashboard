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
      className="pointer-events-auto inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-[rgba(168,185,160,0.50)] px-3.5 py-1.5 text-center text-[12.5px] leading-normal backdrop-blur-[10px] transition-colors hover:border-[rgba(168,185,160,0.80)]"
      style={{
        background: "rgba(255,255,255,0.80)",
        boxShadow: "0 2px 12px rgba(168,185,160,0.20)",
      }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]" />
      <span className="text-[10.5px] tracking-[0.12em] text-[#6F6D66] uppercase">
        Free mass meditation
      </span>
      <span className="opacity-30 text-[var(--color-ink)]">·</span>
      <span className="text-[#30302D]">Mon–Sat, {peaceLocal}</span>
      <span className="ml-0.5 inline-flex items-center gap-1 border-l border-[rgba(168,185,160,0.35)] pl-2.5 font-medium text-[var(--color-blue-dark)]">
        Join the sit <span className="text-[10px]">→</span>
      </span>
    </a>
  );
}
