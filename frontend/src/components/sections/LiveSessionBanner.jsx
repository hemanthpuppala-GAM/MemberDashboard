import { useMemo } from "react";
import { heartChakra } from "../../data/chakras";
import { getPeaceLocalLabel } from "../../utils/peaceTime";

/** Compact live-sit announcement pill — night treatment for the hero. */
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
      className="pointer-events-auto inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[rgba(232,207,131,0.35)] bg-[rgba(5,8,15,0.45)] px-4 py-2 text-center font-body text-[11px] leading-normal tracking-[0.18em] text-[var(--color-gold-light)] uppercase backdrop-blur-[8px] transition-colors hover:border-[rgba(232,207,131,0.7)]"
    >
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--color-gold-live)]"
        style={{ boxShadow: "0 0 12px var(--color-gold-live)", animation: "hero-ticker 2s infinite" }}
      />
      <span>Free mass meditation</span>
      <span className="opacity-40">·</span>
      <span className="normal-case tracking-normal text-[13px] text-[var(--color-cream)]">Mon–Sat, {peaceLocal}</span>
      <span className="ml-1 inline-flex items-center gap-1 border-l border-[rgba(232,207,131,0.3)] pl-3 normal-case tracking-normal text-[13px] font-medium text-white">
        Join the sit <span className="text-[10px]">→</span>
      </span>
    </a>
  );
}
