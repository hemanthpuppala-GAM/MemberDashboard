import hariPic from "../../assets/hari_sir_stream.png";
import ChakraMandala from "../mandala/ChakraMandala";
import LiveSessionBanner from "./LiveSessionBanner";
import Reveal from "../ui/Reveal";
import { useSectionFields } from "../../hooks/usePage";

/** Default max orbit radius (px) so the six nodes read like the live hub mandala — admin-tunable via mandala_radius */
const DEFAULT_ORBIT_MAX = 148;

/**
 * Renders a hero heading with two admin-authored conventions: "\n" for a
 * line break, and "*word*" for the gold-gradient italic highlight span.
 */
function renderHeroHeading(heading) {
  if (!heading) return null;
  return heading.split("\n").map((line, lineIndex) => (
    <span key={lineIndex}>
      {lineIndex > 0 && <br className="hidden sm:block" />}
      {line.split("*").map((part, partIndex) =>
        partIndex % 2 === 1 ? (
          <span
            key={partIndex}
            style={{
              background: "linear-gradient(135deg, #F9ECCB 20%, #F3D89A 60%, #DCB96A 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontStyle: "italic",
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  ));
}

/**
 * Full-bleed hero: portrait fills the window; large radial mandala over the figure.
 */
export default function HeroSection({ onNavigate, onWatchIntro }) {
  const { fields } = useSectionFields("home", "hero");
  const mandalaX = Number(fields?.mandala_x ?? 64);
  const mandalaY = Number(fields?.mandala_y ?? 62);
  const orbitMax = Number(fields?.mandala_radius ?? DEFAULT_ORBIT_MAX);
  const orbitR = `clamp(${Math.round(orbitMax * 0.65)}px, min(22vh, 17vw), ${orbitMax}px)`;

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto md:flex-row md:overflow-hidden">

      {/* Full-window photo — separate crops for desktop vs mobile, admin-uploaded */}
      <picture>
        {fields?.image_mobile && <source media="(max-width: 767px)" srcSet={fields.image_mobile} />}
        <img
          src={fields?.image || hariPic}
          alt="Dr Hari Krishna by the forest stream"
          fetchPriority="high"
          className="pointer-events-none fixed inset-0 z-0 h-dvh w-full object-cover object-[72%_28%] max-md:object-[80%_22%]"
        />
      </picture>

      {/* Dark violet wash — matches the reference hub look */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 62% 42%, rgba(28,16,48,0.35) 0%, rgba(18,10,36,0.62) 55%, rgba(12,8,28,0.78) 100%)",
        }}
      />

      {/* ── Copy overlay (left on desktop, centered stack on mobile) ── */}
      <div className="pointer-events-none relative z-10 flex w-full max-w-[min(48%,520px)] flex-none flex-col justify-center gap-[clamp(10px,2vh,20px)] py-6 pl-[clamp(20px,4vw,72px)] pr-4 max-md:max-w-none max-md:items-center max-md:px-4 max-md:pt-4 max-md:pb-0 max-md:text-center">
        <Reveal
          animation={fields?.animation}
          className="pointer-events-auto flex flex-col gap-[clamp(8px,1.6vh,20px)] max-md:items-center max-md:rounded-2xl max-md:bg-[rgba(12,8,28,0.45)] max-md:px-4 max-md:py-4 max-md:backdrop-blur-[3px]"
        >
          <LiveSessionBanner onNavigate={onNavigate} />

          {fields?.heading && (
            <h2
              className="text-[clamp(20px,2.6vw,40px)] leading-[1.12] tracking-[-0.01em] text-white"
              style={{
                fontFamily: "'Cormorant Garamond', var(--font-display)",
                fontWeight: 600,
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
              }}
            >
              {renderHeroHeading(fields.heading)}
            </h2>
          )}

          {fields?.subheading && (
            <p
              className="text-[clamp(13px,1.3vw,16px)] font-medium text-[rgba(243,216,154,0.92)]"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
            >
              {fields.subheading}
            </p>
          )}

          {fields?.description && (
            <p
              className="max-[600px]:hidden text-[clamp(13px,1.1vw,15px)] font-light leading-relaxed text-white/88"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
            >
              {fields.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onWatchIntro}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/35 bg-white/12 px-5 py-2.5 font-body text-[14px] font-medium whitespace-nowrap text-white backdrop-blur-[8px] transition-all hover:border-[rgba(220,185,106,0.70)] hover:bg-white/22"
            >
              <span className="text-[10px] opacity-70">▶</span>
              Watch the intro
            </button>
            {fields?.cta_label && fields?.cta_href && (
              <a
                href={fields.cta_href}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] px-5 py-2.5 font-body text-[14px] font-semibold whitespace-nowrap text-[var(--color-on-gold)] transition-all hover:shadow-[0_0_24px_rgba(243,216,154,0.55)]"
              >
                {fields.cta_label}
              </a>
            )}
          </div>
        </Reveal>
      </div>

      {/* ── Large radial mandala over the figure ── */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center md:flex">
        <div
          className="pointer-events-auto"
          style={{
            position: "absolute",
            left: `${mandalaX}%`,
            top: `${mandalaY}%`,
            transform: "translate(-50%, -50%)",
            width: "min(56vw, 560px)",
          }}
        >
          <ChakraMandala
            onNavigate={onNavigate}
            layout={{ orbitR, hubTx: 0, hubTy: 0 }}
          />
        </div>
      </div>

      {/* ── Mobile mandala ── */}
      <div className="relative z-10 flex flex-none items-center justify-center py-4 md:hidden">
        <div className="w-[min(62vw,240px)]">
          <ChakraMandala
            onNavigate={onNavigate}
            layout={{
              orbitR: "clamp(56px, 19vw, 76px)",
              hubTx: 0,
              hubTy: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
