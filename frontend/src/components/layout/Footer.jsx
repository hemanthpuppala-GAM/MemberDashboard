/**
 * Minimal hub footer matching goldenagewisdom.org.
 */
export default function Footer({ view = "hub", onBack }) {
  const inSection = view !== "hub" && view !== "film";

  return (
    <footer className="relative z-10 flex shrink-0 flex-col items-center gap-[7px] px-6 pt-2 pb-3 text-xs font-light text-[#b8b0a0] [text-shadow:0_1px_10px_rgba(11,9,26,0.9)]">
      {inSection && (
        <button
          type="button"
          onClick={onBack}
          title="Return to Home · Esc"
          className="absolute bottom-2 left-[clamp(12px,2vw,24px)] z-[60] flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-gold)]/40 bg-[rgba(13,10,28,0.92)] py-1 pr-[15px] pl-[5px] font-body shadow-[0_8px_26px_rgba(0,0,0,0.45)] backdrop-blur-[10px] transition-colors hover:border-[var(--color-gold-light)]/85"
        >
          <span className="animate-breathe flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/50 bg-[radial-gradient(circle_at_38%_34%,rgba(230,211,168,0.35),rgba(184,151,88,0.1))]">
            <svg viewBox="0 0 100 100" className="block h-[13px] w-[13px]">
              <polygon
                points="50,8 86,71 14,71"
                fill="none"
                stroke="#f7f1e3"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <polygon
                points="50,92 14,29 86,29"
                fill="none"
                stroke="#f7f1e3"
                strokeWidth="6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="whitespace-nowrap text-[11px] tracking-[0.2em] text-[var(--color-gold-light)] uppercase">
            Go Back
          </span>
        </button>
      )}

      {view === "hub" && (
        <>
          <div className="m-caption text-[12.5px] tracking-[0.1em] text-[#7d7666] max-[700px]:hidden">
            Choose a path · the center breathes with you
          </div>
          <div className="flex flex-wrap items-center justify-center gap-[18px]">
            <a
              href="https://goldenagewisdom.org/volunteer"
              className="text-[#b8b0a0] transition-colors hover:text-[var(--color-gold-light)]"
            >
              Volunteer
            </a>
            <span>A registered non-profit · © {new Date().getFullYear()}</span>
            <a
              href="https://goldenagewisdom.org/privacy"
              className="text-[#b8b0a0] transition-colors hover:text-[var(--color-gold-light)]"
            >
              Privacy
            </a>
          </div>
        </>
      )}
    </footer>
  );
}
