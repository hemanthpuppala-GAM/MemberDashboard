import { useEffect, useState } from "react";
import { publicApi } from "../../lib/api";

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-2 pb-6 sm:px-4">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {testimonials.map((t) => (
          <blockquote
            key={t.id}
            className="w-[min(280px,80vw)] shrink-0 snap-start rounded-2xl border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50 px-5 py-4"
          >
            <p className="text-[13.5px] leading-relaxed text-[var(--color-ink)]">“{t.quote}”</p>
            <footer className="mt-3 text-[12px] text-[var(--color-muted)]">
              — {t.name}
              {t.role && <span className="text-[var(--color-muted-soft)]"> · {t.role}</span>}
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
