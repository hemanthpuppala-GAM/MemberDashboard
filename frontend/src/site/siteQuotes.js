/**
 * Member quotes on the public site come from admin Testimonials when there are any, else the
 * bundled copy. Each sub-page takes a stable slice (wrapping) so pages don't repeat each other,
 * and shows as many quotes as its bundled list did, so layouts keep their length.
 */
import { useMemo } from "react";
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

/** Sub-page quotes: [{ text: "“…”", name }] — same count as `bundled`, typographic marks as in content/*.json. */
export function pageQuotes(page, testimonials, bundled) {
  const list = usable(testimonials);
  const n = Math.min((bundled || []).length, list.length);
  if (!n) return bundled || [];
  const start = PAGE_OFFSET[page] ?? 0;
  return Array.from({ length: n }, (_, i) => {
    const t = list[(start + i) % list.length];
    return { text: `“${cleanQuote(t.quote)}”`, name: t.name };
  });
}

export function usePageQuotes(page, bundled) {
  const testimonials = useTestimonials();
  return useMemo(() => pageQuotes(page, testimonials, bundled), [page, testimonials, bundled]);
}
