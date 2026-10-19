/**
 * Member quotes on the public site come from admin Testimonials when there are any, else the
 * bundled copy. Each sub-page shows as many quotes at a time as its bundled list did (so layouts
 * keep their length) and rotates through ALL testimonials, starting at its own offset so
 * neighbouring pages don't show the same ones.
 */
import { useEffect, useMemo, useState } from "react";

const ROTATE_MS = 9000;
import { cleanQuote, useTestimonials } from "./usePublicData";

const PAGE_OFFSET = { about: 0, wisdom: 4, wellness: 6, events: 8 };

const usable = (list) => (Array.isArray(list) ? list.filter((t) => cleanQuote(t?.quote)) : []);

/** Home rotation: [{ text, name }] without quote marks (the card draws its own “). */
export function useHomeVoices(bundled) {
  const testimonials = useTestimonials();
  return useMemo(() => {
    const list = usable(testimonials);
    return list.length ? list.map((t) => ({ text: cleanQuote(t.quote), name: t.name })) : bundled;
  }, [testimonials, bundled]);
}

/**
 * Sub-page quotes: [{ key, text: "“…”", name }] — as many as `bundled` (or `count`), typographic
 * marks as in content/*.json. `turn` moves the window along by one screenful, wrapping through every testimonial.
 */
export function pageQuotes(page, testimonials, bundled, turn = 0, count = (bundled || []).length) {
  const list = usable(testimonials);
  const n = Math.min(count, list.length);
  if (!n) return bundled || [];
  const start = (PAGE_OFFSET[page] ?? 0) + turn * n;
  return Array.from({ length: n }, (_, i) => {
    const t = list[(start + i) % list.length];
    return { key: `${t.id ?? t.name}-${turn}`, text: `“${cleanQuote(t.quote)}”`, name: t.name };
  });
}

export function usePageQuotes(page, bundled, count = (bundled || []).length) {
  const testimonials = useTestimonials();
  const [turn, setTurn] = useState(0);
  const total = usable(testimonials).length;
  const shown = count;

  // Rotate only when there are more testimonials than fit, and not for reduced-motion readers.
  // More cards on screen get more reading time before they change.
  useEffect(() => {
    if (total <= shown || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => setTurn((x) => x + 1), ROTATE_MS * Math.max(1, shown / 2));
    return () => clearInterval(t);
  }, [total, shown]);

  return useMemo(() => pageQuotes(page, testimonials, bundled, turn, count), [page, testimonials, bundled, turn, count]);
}
