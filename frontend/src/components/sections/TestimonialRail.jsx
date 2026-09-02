import { useEffect, useState } from "react";
import { publicApi } from "../../lib/api";
import { CardRule } from "../ui/CardAccent";

/** Scrolling row of visitor quotes — shared between About and Events. */
export default function TestimonialRail() {
  const [testimonials, setTestimonials] = useState(null);

  useEffect(() => {
    publicApi
      .testimonials()
      .then(setTestimonials)
      .catch(() => setTestimonials([]));
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 pb-12 sm:px-6">
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3">
        {testimonials.map((t) => (
          <blockquote
            key={t.id}
            className="group/card relative flex w-[min(320px,82vw)] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 pt-7 pb-6 shadow-[0_1px_2px_rgba(80,65,40,0.05),0_12px_28px_-10px_rgba(80,65,40,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[rgba(198,161,91,0.5)] hover:shadow-[0_2px_4px_rgba(80,65,40,0.06),0_24px_44px_-12px_rgba(80,65,40,0.22)]"
          >
            <CardRule />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 right-3 font-display text-[92px] leading-none text-[var(--color-gold)] opacity-[0.16] transition-all duration-500 ease-out select-none group-hover/card:-translate-y-0.5 group-hover/card:opacity-[0.26] motion-reduce:transition-none"
            >
              &rdquo;
            </span>
            <p className="relative font-display text-[16.5px] leading-[1.6] text-[var(--color-ink)] italic">{t.quote}</p>
            <footer className="mt-6 flex items-center gap-2.5">
              <span className="h-px w-6 shrink-0 bg-[var(--color-gold)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:w-10 motion-reduce:transition-none motion-reduce:group-hover/card:w-6" />
              <span className="text-[12px] font-semibold tracking-[0.08em] text-[var(--color-gold-deep)] uppercase">
                {t.name}
                {t.role && <span className="font-normal tracking-normal text-[var(--color-muted)] normal-case"> · {t.role}</span>}
              </span>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
