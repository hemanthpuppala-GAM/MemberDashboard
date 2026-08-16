import hariPic from "../../assets/hari_sir_stream.png";
import ChakraMandala from "../mandala/ChakraMandala";
import LiveSessionBanner from "./LiveSessionBanner";

/** Large orbit so the six nodes read like the live hub mandala */
const ORBIT_R = "clamp(96px, min(22vh, 17vw), 148px)";

/**
 * Full-bleed hero: portrait fills the window; large radial mandala over the figure.
 */
export default function HeroSection({ onNavigate, onWatchIntro }) {
  return (
    <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">

      {/* Full-window photo */}
      <img
        src={hariPic}
        alt="Dr Hari Krishna by the forest stream"
        fetchPriority="high"
        className="pointer-events-none fixed inset-0 z-0 h-dvh w-full object-cover object-[72%_28%] max-md:object-[80%_22%]"
      />

      {/* Dark violet wash — matches the reference hub look */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 62% 42%, rgba(28,16,48,0.35) 0%, rgba(18,10,36,0.62) 55%, rgba(12,8,28,0.78) 100%)",
        }}
      />

      {/* ── Copy overlay (left) ── */}
      <div className="pointer-events-none relative z-10 flex w-full max-w-[min(48%,520px)] flex-col justify-center gap-[clamp(10px,2vh,20px)] py-6 pl-[clamp(20px,4vw,72px)] pr-4 max-md:max-w-none">
        <div className="pointer-events-auto flex flex-col gap-[clamp(10px,2vh,20px)]">
          <LiveSessionBanner onNavigate={onNavigate} />

          <h2
            className="text-[clamp(20px,2.6vw,40px)] leading-[1.12] tracking-[-0.01em] text-white"
            style={{
              fontFamily: "'Cormorant Garamond', var(--font-display)",
              fontWeight: 600,
              textShadow: "0 2px 24px rgba(0,0,0,0.45)",
            }}
          >
            Peace begins within —{" "}
            <br className="hidden sm:block" />
            together we{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F9ECCB 20%, #F3D89A 60%, #DCB96A 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                fontStyle: "italic",
              }}
            >
              radiate it
            </span>{" "}
            across the world
          </h2>

          <p
            className="max-[600px]:hidden text-[clamp(13px,1.1vw,15px)] font-light leading-relaxed text-white/88"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
          >
            A global movement to awaken consciousness, live in harmony,
            and create a golden future.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onWatchIntro}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/35 bg-white/12 px-5 py-2.5 font-body text-[14px] font-medium whitespace-nowrap text-white backdrop-blur-[8px] transition-all hover:border-[rgba(220,185,106,0.70)] hover:bg-white/22"
            >
              <span className="text-[10px] opacity-70">▶</span>
              Watch the intro
            </button>
            <a
              href="https://goldenagewisdom.org/join"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] px-5 py-2.5 font-body text-[14px] font-semibold whitespace-nowrap text-[var(--color-on-gold)] transition-all hover:shadow-[0_0_24px_rgba(243,216,154,0.55)]"
            >
              Join the movement
            </a>
          </div>
        </div>
      </div>

      {/* ── Large radial mandala over the figure ── */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden items-center justify-center md:flex">
        <div
          className="pointer-events-auto"
          style={{
            position: "absolute",
            left: "64%",
            top: "62%",
            transform: "translate(-50%, -50%)",
            width: "min(56vw, 560px)",
          }}
        >
          <ChakraMandala
            onNavigate={onNavigate}
            layout={{ orbitR: ORBIT_R, hubTx: 0, hubTy: 0 }}
          />
        </div>
      </div>

      {/* ── Mobile mandala ── */}
      <div className="relative z-10 flex flex-1 items-end justify-center pb-6 md:hidden">
        <div className="w-[min(92vw,360px)]">
          <ChakraMandala
            onNavigate={onNavigate}
            layout={{
              orbitR: "clamp(78px, 28vw, 110px)",
              hubTx: 0,
              hubTy: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
