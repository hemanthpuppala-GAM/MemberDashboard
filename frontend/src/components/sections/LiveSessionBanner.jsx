import { heartChakra } from "../../data/chakras";

/**
 * Pill strip announcing the recurring live sit. Static schedule copy for
 * now — no backend session data exists yet to drive real "live" state.
 */
export default function LiveSessionBanner() {
  return (
    <div className="relative z-10 mx-auto mt-10 flex w-fit max-w-[92vw] flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-surface)]/70 px-5 py-2.5 text-xs text-[var(--color-muted)] backdrop-blur-md sm:mt-14 sm:text-sm">
      <span className="flex items-center gap-2 font-medium tracking-wide text-[var(--color-gold-light)] uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold-live)]" />
        Free mass meditation
      </span>
      <span className="hidden text-[var(--color-muted-soft)] sm:inline">·</span>
      <span>Mon–Sat, 8:30 PM your time</span>
      <span className="text-[var(--color-muted-soft)]">|</span>
      <a
        href={heartChakra.href}
        className="font-medium text-[var(--color-gold-light)] transition-colors hover:text-[var(--color-ink)]"
      >
        Join the sit →
      </a>
    </div>
  );
}
