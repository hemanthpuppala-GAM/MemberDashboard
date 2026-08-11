import ChakraMandala from "../mandala/ChakraMandala";
import Starfield from "../layout/Starfield";
import LiveSessionBanner from "./LiveSessionBanner";
import QrJoinCard from "./QrJoinCard";

/**
 * Hero = the mandala itself. "Heart at the centre" is the site's thesis
 * (Design.md §1, §6): the primary CTA is the daily meditation, everything
 * else orbits it.
 */
export default function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex flex-col items-center gap-8 overflow-hidden px-6 pb-20 text-center"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 22%, var(--color-bg-soft) 0%, var(--color-bg) 70%)",
        }}
        aria-hidden="true"
      />
      <Starfield />

      <LiveSessionBanner />

      <div className="flex max-w-2xl flex-col items-center gap-5 pt-6">
        <h1 className="text-3xl leading-tight text-[var(--color-ink)] sm:text-5xl">
          Peace begins within — together we radiate it across the world
        </h1>

        <a
          href="#wisdom"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)]/35 bg-[var(--color-surface)]/60 px-5 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] backdrop-blur-md transition-colors hover:border-[var(--color-gold)]/70 hover:text-[var(--color-gold-light)]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-gold)]/25">
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-[var(--color-gold-light)]">
              <path d="M6 4.5v15l13-7.5z" />
            </svg>
          </span>
          Watch the intro
        </a>
      </div>

      <ChakraMandala />

      <p className="text-xs tracking-[0.25em] text-[var(--color-muted-soft)] uppercase">
        Choose a path · the centre breathes with you
      </p>

      <QrJoinCard />
    </section>
  );
}
