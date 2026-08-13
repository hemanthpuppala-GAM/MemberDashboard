import hariPic from "../../assets/hari_sir_pic_bg.png";
import ChakraMandala from "../mandala/ChakraMandala";
import LiveSessionBanner from "./LiveSessionBanner";

/** Orbit radius — smaller so all nodes cluster on the chest, not spread to the face */
const ORBIT_R = "clamp(44px, min(8vw, 10vh), 68px)";

/**
 * Two-column hub layout:
 *   LEFT  — headline, subtitle, CTAs (dark navy bg)
 *   RIGHT — hari_sir_pic_bg.png + chakra mandala at chest level
 */
export default function HeroSection({ onNavigate, onWatchIntro }) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden md:flex-row">

      {/* ── LEFT PANEL: text content ── */}
      <div
        className="relative z-10 flex flex-col justify-center gap-[clamp(10px,2.2vh,24px)] py-6 pl-[clamp(20px,5vw,80px)] pr-[clamp(16px,2.5vw,40px)] md:w-[46%] md:shrink-0 lg:w-[44%]"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,252,238,0.97) 0%, rgba(240,238,255,0.97) 55%, rgba(236,234,255,0.96) 100%)",
        }}
      >

        <LiveSessionBanner onNavigate={onNavigate} />

        <h2
          className="text-[clamp(22px,3vw,48px)] leading-[1.1] tracking-[-0.01em] text-[#28246A]"
          style={{ fontFamily: "'Cormorant Garamond', var(--font-display)", fontWeight: 600 }}
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

        <p className="max-[600px]:hidden text-[clamp(13px,1.15vw,16px)] font-light leading-relaxed text-[#5854A0]">
          A global movement to awaken consciousness, live in harmony,
          and create a golden future.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onWatchIntro}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(40,36,106,0.22)] bg-white/[0.65] px-5 py-2.5 font-body text-[14px] font-medium whitespace-nowrap text-[#28246A] backdrop-blur-[8px] transition-all hover:border-[rgba(220,185,106,0.70)] hover:bg-white/90"
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

      {/* ── RIGHT PANEL: person image + mandala (desktop only) ── */}
      <div className="relative hidden min-h-0 flex-1 items-center justify-center overflow-hidden md:flex">

        {/* hari_sir_pic_bg.png — landscape image, fills portrait column with object-cover */}
        <img
          src={hariPic}
          alt="Dr Hari Krishna in meditation"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[50%_top]"
        />

        {/* Left-edge gradient: image blends into the warm light left panel */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[200px]"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to right, rgba(250,248,240,0.98) 0%, rgba(240,238,255,0.75) 28%, rgba(236,234,255,0.20) 60%, transparent 100%)",
          }}
        />

        {/* Top vignette — soft fade matching the light panel */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[80px]"
          aria-hidden="true"
          style={{ background: "linear-gradient(to bottom, rgba(236,234,255,0.45), transparent)" }}
        />

        {/* Bottom vignette */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[80px]"
          aria-hidden="true"
          style={{ background: "linear-gradient(to top, rgba(236,234,255,0.35), transparent)" }}
        />

        {/* Very subtle overlay so mandala nodes stay crisp over the bright image */}
        <div
          className="pointer-events-none absolute inset-0 z-[11]"
          aria-hidden="true"
          style={{ background: "rgba(110,198,234,0.06)" }}
        />

        {/*
        {/* Mandala center fixed at 57% of right-panel height = mid-chest */}
        <div
          className="absolute inset-x-0 z-20 flex justify-center"
          style={{ top: "57%", transform: "translateY(-50%)" }}
        >
          <ChakraMandala
            onNavigate={onNavigate}
            layout={{ orbitR: ORBIT_R, hubTx: 0, hubTy: 0 }}
          />
        </div>
      </div>

      {/* ── MOBILE MANDALA: interactive, below text, no person image ── */}
      <div className="flex min-h-[220px] items-center justify-center overflow-hidden md:hidden">
        <div className="relative z-10">
          <ChakraMandala
            onNavigate={onNavigate}
            layout={{ orbitR: "clamp(52px, 18vw, 80px)", hubTx: 0, hubTy: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
