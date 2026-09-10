import { useMemo, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import SriYantra from "../mandala/SriYantra";
import Reveal from "../ui/Reveal";
import { useSectionFields } from "../../hooks/usePage";
import { getSessionTimeLabel } from "../../utils/peaceTime";
import heroFallback from "../../assets/hero-hari-forest.png";
import { HOME } from "../../data/liveContent";

/**
 * Homepage hero — "Sri Yantra" (locked design, see repo-changes/HOMEPAGE_HERO.md).
 *
 * Layout (desktop ≥ 1024px)              Layout (< 1024px)
 * ┌──────────────────────────────┐        ┌──────────────────┐
 * │ headline · subline · CTAs    │        │ headline         │
 * │ ┌──────────┐      ┌────────┐ │        │ subline · CTAs   │
 * │ │ Sri      │      │portrait│ │        │ ┌──────────────┐ │
 * │ │ Yantra   │      │        │ │        │ │  Sri Yantra  │ │
 * │ └──────────┘      └────────┘ │        │ └──────────────┘ │
 * └──────────────────────────────┘        │ portrait (bg)    │
 *                                         └──────────────────┘
 *
 * The wheel is a single fluid component sized by `--yantra-r`; the portrait
 * is a full-bleed <img> whose focal point is CMS-driven, so there is no
 * pixel-positioning in this file — only the proportions of the reference mock.
 *
 * CMS (admin → Pages → Home → Hero) fields honoured:
 *   heading, subheading, description, cta_label, cta_href, image, image_mobile,
 *   video, focal_x, focal_y, show_mandala, mandala_radius (px), animation
 * Every field falls back to data/liveContent.js so the page never renders empty.
 */

/** "\n" = line break, "*word*" = gold italic highlight (admin conventions). */
function renderHeroHeading(heading) {
  if (!heading) return null;
  return heading.split("\n").map((line, lineIndex) => (
    <span key={lineIndex}>
      {lineIndex > 0 && " "}
      {line.split("*").map((part, partIndex) =>
        partIndex % 2 === 1 ? (
          <em key={partIndex} className="text-[var(--color-gold-light)] italic">
            {part}
          </em>
        ) : (
          part
        ),
      )}
    </span>
  ));
}

/** Locked headline for the Sri Yantra hero — one line on desktop. CMS `heading` overrides. */
const DEFAULT_HEADING = "Peace begins within — together we *radiate it*";
const DEFAULT_SUBLINE = "Free daily group meditation with Dr Hari Krishna, MD.";

export default function HeroSection({ onNavigate, onWatchIntro }) {
  const { fields } = useSectionFields("home", "hero");
  const [videoMuted, setVideoMuted] = useState(true);
  const sessionTime = useMemo(() => getSessionTimeLabel(), []); // "Daily at 8:30 PM IST" / "Daily at 11:00 AM EDT · 8:30 PM IST"

  const image = fields?.image || heroFallback;
  const heading = fields?.heading || DEFAULT_HEADING;
  const subline = fields?.subheading || DEFAULT_SUBLINE;
  const ctaLabel = fields?.cta_label || HOME.ctaLabel;
  const ctaHref = fields?.cta_href || HOME.ctaHref;
  // Portrait focal point: Dr Hari sits in the right third of the source photo.
  const focalX = Number(fields?.focal_x ?? 60);
  const focalY = Number(fields?.focal_y ?? 30);
  const showMandala = !["0", "false", false, 0].includes(fields?.show_mandala);
  // Wheel circumradius. Admin `mandala_radius` pins it when set to a sane value (≥150px);
  // smaller values are Phase-3 leftovers (that field used to mean something else) and are ignored.
  const cmsRadius = Number(fields?.mandala_radius);
  const yantraR = cmsRadius >= 150 ? `${cmsRadius}px` : "clamp(105px, min(24vw, 36vh), 300px)";

  return (
    <section
      className="hero-yantra relative flex w-full shrink-0 flex-col overflow-hidden bg-[var(--color-night-soft)]"
      style={{ minHeight: "min(100dvh, 960px)" }}
      aria-label="Welcome"
    >
      {/* ── Portrait (full-bleed, fades into the night on the left) ── */}
      {/* Base wash sits under the masked portrait so its left edge is never a hard seam */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: "linear-gradient(90deg, #0C1728 0%, #142640 30%, #22406A 55%, #2F5482 100%)" }} />
      <picture>
        {fields?.image_mobile && <source media="(max-width: 767px)" srcSet={fields.image_mobile} />}
        <img
          src={image}
          alt=""
          fetchPriority="high"
          style={{
            objectPosition: `${focalX}% ${focalY}%`,
            maskImage: "linear-gradient(90deg, transparent 0%, #000 22%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 22%)",
          }}
          className={`pointer-events-none absolute inset-y-0 right-0 z-0 h-full w-[calc(100%-16vw)] object-cover max-lg:inset-x-0 max-lg:w-full max-lg:opacity-70 ${
            fields?.video ? "lg:hidden motion-reduce:lg:block" : ""
          }`}
        />
      </picture>

      {fields?.video && (
        <>
          <video
            src={fields.video}
            poster={image}
            autoPlay
            muted={videoMuted}
            loop
            playsInline
            preload="auto"
            style={{ objectPosition: `${focalX}% ${focalY}%` }}
            className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-cover lg:block motion-reduce:hidden"
          />
          <button
            type="button"
            onClick={() => setVideoMuted((m) => !m)}
            aria-label={videoMuted ? "Unmute background video" : "Mute background video"}
            className="absolute bottom-4 left-4 z-30 hidden h-9 w-9 items-center justify-center rounded-full border border-[rgba(232,207,131,0.4)] bg-[rgba(5,8,15,0.5)] text-[var(--color-cream)] backdrop-blur-[8px] transition-all hover:border-[var(--color-gold)] lg:flex motion-reduce:hidden"
          >
            {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </>
      )}

      {/* ── Night washes: left (behind the wheel) + vertical (header / page hand-off) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] max-lg:hidden" style={{ background: "linear-gradient(90deg, rgba(12,23,40,.96) 0%, rgba(20,36,62,.9) 34%, rgba(20,36,62,.7) 50%, rgba(60,90,133,.25) 62%, rgba(60,90,133,0) 72%)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]" style={{ background: "linear-gradient(180deg, rgba(5,8,15,.55) 0%, rgba(5,8,15,0) 30%, rgba(5,8,15,0) 70%, rgba(12,23,40,.85) 92%, #0C1728 100%)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] lg:hidden" style={{ background: "linear-gradient(180deg, rgba(5,8,15,.3) 0%, rgba(12,23,40,.75) 40%, rgba(12,23,40,.92) 100%)" }} />

      {/* ── Copy: centred stack under the header ── */}
      <Reveal
        animation={fields?.animation}
        className="relative z-10 flex flex-col items-center gap-[clamp(10px,1.6vh,16px)] px-5 pt-[clamp(28px,5vh,52px)] text-center"
      >
        <h2
          className="hero-rise text-[clamp(28px,2.6vw,38px)] leading-[1.05] tracking-[-0.01em] text-[#F6F1E6] text-balance lg:whitespace-nowrap"
          style={{ fontFamily: "var(--font-headline)", fontWeight: 300, animationDelay: ".1s", textShadow: "0 2px 28px rgba(0,0,0,.8)" }}
        >
          {renderHeroHeading(heading)}
        </h2>

        <p
          className="hero-rise font-body text-[clamp(13px,1.05vw,14.5px)] tracking-[0.02em] text-[rgba(237,230,214,0.9)] text-pretty"
          style={{ animationDelay: ".25s", textShadow: "0 1px 12px rgba(0,0,0,.8)" }}
        >
          {subline}
          <span className="ml-1.5 font-semibold text-[var(--color-gold-light)] whitespace-nowrap">{sessionTime}</span>
        </p>

        <div className="hero-rise flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: ".4s" }}>
          <button
            type="button"
            onClick={onWatchIntro}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(232,207,131,0.55)] bg-[rgba(5,8,15,0.4)] px-5 py-2.5 font-body text-[12px] tracking-[0.1em] whitespace-nowrap text-[var(--color-gold-light)] uppercase backdrop-blur-[6px] transition-all hover:border-[var(--color-gold-light)] hover:bg-[rgba(5,8,15,0.6)]"
          >
            <span className="text-[10px]">▶</span>
            Watch the intro
          </button>
          <a
            href={ctaHref}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold)] px-5 py-2.5 font-body text-[12px] font-medium tracking-[0.1em] whitespace-nowrap text-[var(--color-on-gold)] uppercase transition-all hover:shadow-[0_0_30px_rgba(201,162,74,0.55)]"
            style={{ boxShadow: "0 0 30px rgba(201,162,74,.35)" }}
          >
            {ctaLabel}
          </a>
        </div>
      </Reveal>

      {/* ── Wheel: left half on desktop (portrait owns the right), centred below the copy on smaller screens ── */}
      {showMandala && (
        <div className="relative z-20 flex flex-1 items-center pt-[clamp(6px,1.5vh,14px)] pb-[clamp(20px,4vh,40px)] lg:w-[58%] lg:justify-center lg:pl-[2vw] max-lg:justify-center max-lg:px-4">
          <div style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,.55))" }}>
            <SriYantra onNavigate={onNavigate} radius={yantraR} />
          </div>
        </div>
      )}
    </section>
  );
}
