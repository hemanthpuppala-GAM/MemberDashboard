import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";

/**
 * Generic full-width hero banner for the `hero` CMS section type on any page
 * other than Home (which has its own bespoke chakra-mandala layout — see
 * HeroSection.jsx). Background is an image, or optionally a looping video:
 * video is desktop-only and skipped under prefers-reduced-motion, so the
 * image always covers mobile and is what reduced-motion visitors see. Video
 * starts muted (autoplay requires it); a corner toggle lets a visitor turn
 * sound on.
 */
export default function HeroBannerSection({ fields }) {
  const [videoMuted, setVideoMuted] = useState(true);

  if (!fields) return null;
  const hasVideo = Boolean(fields.video);
  const objectPosition = `${fields.focal_x ?? 50}% ${fields.focal_y ?? 50}%`;

  return (
    <section className="relative flex min-h-[46vh] w-full items-center overflow-hidden sm:min-h-[54vh]">
      {fields.image && (
        <img
          src={fields.image}
          alt=""
          style={{ objectPosition }}
          className={`absolute inset-0 h-full w-full object-cover ${hasVideo ? "md:hidden motion-reduce:md:block" : ""}`}
        />
      )}
      {hasVideo && (
        <video
          src={fields.video}
          poster={fields.image || undefined}
          autoPlay
          muted={videoMuted}
          loop
          playsInline
          preload="auto"
          style={{ objectPosition }}
          className="absolute inset-0 hidden h-full w-full object-cover md:block motion-reduce:hidden"
        />
      )}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(28,20,12,0.62) 0%, rgba(24,17,10,0.38) 50%, rgba(22,16,10,0.66) 100%)",
        }}
      />

      {hasVideo && (
        <button
          type="button"
          onClick={() => setVideoMuted((m) => !m)}
          aria-label={videoMuted ? "Unmute background video" : "Mute background video"}
          className="absolute right-4 bottom-4 z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/12 text-white backdrop-blur-[8px] transition-all hover:border-white/60 hover:bg-white/22 md:flex motion-reduce:hidden"
        >
          {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      <Reveal
        animation={fields.animation}
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center text-white sm:px-6"
        style={{ textShadow: "0 2px 20px rgba(20,14,8,0.45)" }}
      >
        {fields.eyebrow && <span className="text-[11px] font-semibold tracking-[0.22em] text-[var(--color-gold-light)] uppercase">{fields.eyebrow}</span>}
        {fields.heading && (
          <h1 className="text-[clamp(30px,5vw,52px)] leading-[1.12] font-semibold tracking-[-0.015em] text-balance">{fields.heading}</h1>
        )}
        {fields.subheading && <p className="text-[clamp(15px,1.6vw,19px)] font-medium text-white/90">{fields.subheading}</p>}
        {fields.description && <p className="max-w-[58ch] text-[15px] leading-[1.7] text-white/80">{fields.description}</p>}
        {fields.cta_label && fields.cta_href && (
          <Button href={fields.cta_href} variant="primary" className="mt-3">
            {fields.cta_label}
          </Button>
        )}
      </Reveal>
    </section>
  );
}
