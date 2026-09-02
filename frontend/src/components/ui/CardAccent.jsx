/**
 * Gold accents that draw themselves in when a card is hovered or focused.
 * Each card-shaped section type gets a different one so the page reads as a
 * family rather than one repeated effect: a rule across the top, a bar down
 * the leading edge, a corner bracket.
 *
 * All of them are decorative and are skipped under prefers-reduced-motion
 * (the accent still appears, it just stops animating).
 *
 * Requires the parent to carry Tailwind's `group/card` + `relative`, which
 * CARD_CLASS in sectionStyles.js already does.
 */

const GOLD_GRADIENT =
  "bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-deep)]";

/** Hairline that opens left-to-right along the card's top edge. */
export function CardRule() {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 rounded-t-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-x-100 group-focus-within/card:scale-x-100 motion-reduce:transition-none motion-reduce:group-hover/card:scale-x-100 ${GOLD_GRADIENT}`}
    />
  );
}

/** Bar that opens top-to-bottom down the card's leading edge. */
export function CardEdge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 rounded-l-2xl bg-gradient-to-b from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-deep)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-y-100 group-focus-within/card:scale-y-100 motion-reduce:transition-none motion-reduce:group-hover/card:scale-y-100"
    />
  );
}

/** Two hairlines that close in on the top-right corner. */
export function CardBracket() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-8 w-8">
      <span
        className={`absolute top-0 right-0 h-[2px] w-full origin-right scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-x-100 motion-reduce:transition-none motion-reduce:group-hover/card:scale-x-100 ${GOLD_GRADIENT}`}
      />
      <span className="absolute top-0 right-0 h-full w-[2px] origin-top scale-y-0 bg-gradient-to-b from-[var(--color-gold)] to-transparent transition-transform delay-100 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-y-100 motion-reduce:transition-none motion-reduce:group-hover/card:scale-y-100" />
    </span>
  );
}
