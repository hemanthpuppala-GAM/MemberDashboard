import ChakraMandala from "../mandala/ChakraMandala";
import LiveSessionBanner from "./LiveSessionBanner";

/**
 * Hub viewport: compact copy + mandala so the face stays visible below.
 */
export default function HeroSection({ onNavigate, onWatchIntro, layout }) {
  return (
    <div
      data-screen-label="Mandala hub"
      className="m-hub-wrap flex min-h-0 w-full flex-1 flex-col items-center justify-start gap-[clamp(4px,1.2vh,12px)]"
    >
      <div className="m-vp pointer-events-none relative z-[8] mx-auto flex w-[min(680px,100%)] flex-col items-center gap-1.5 text-center">
        <LiveSessionBanner onNavigate={onNavigate} />

        <h2
          className="m-vp-line text-[clamp(20px,2.4vw,30px)] leading-[1.18] tracking-[0.005em] text-[var(--color-ink)] [text-shadow:0_2px_22px_rgba(8,6,20,0.85)]"
          style={{
            fontFamily: "'Cormorant Garamond', var(--font-display)",
            fontWeight: 600,
          }}
        >
          Peace begins within — together we radiate it across the world
        </h2>

        <div className="m-action pointer-events-auto relative z-[8] flex w-full shrink-0 flex-col items-center gap-1.5 text-center">
          <button
            type="button"
            onClick={onWatchIntro}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 font-body text-[13px] whitespace-nowrap text-[var(--color-ink-soft)] backdrop-blur-[8px] transition-colors hover:border-[var(--color-gold-light)]/90"
          >
            <span className="text-[9px]">▶</span>
            Watch the intro
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <ChakraMandala onNavigate={onNavigate} layout={layout} />
      </div>
    </div>
  );
}
