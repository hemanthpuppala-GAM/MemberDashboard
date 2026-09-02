/**
 * Shared surface/rhythm classes for the public page sections. Every CMS
 * section type renders through renderSection.jsx, so keeping the wrapper,
 * card and input treatments here is what stops ten section files drifting
 * apart visually.
 *
 * Three deliberate surface levels, so nothing reads as white-on-white:
 *   1. page canvas  — warm ivory (--color-bg)
 *   2. section band — sand (--color-bg-soft), a rounded panel on the canvas
 *   3. card/field   — white (--color-surface), lifted off the band
 * Sections alternate between band and bare canvas to give the page rhythm.
 */

/** Inner column of a section: centred, generous vertical rhythm. */
export const SECTION_CLASS = "mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20";

/**
 * Sand band behind every other section — level 2 of the surface stack. The
 * tone step from ivory to sand is deliberately small, so a hairline edge
 * does the work of making it read as a distinct panel rather than a smudge.
 */
export const SECTION_BAND =
  "rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-soft)]";

/**
 * Band tone for the nth *rendered* section. Odd positions get the sand
 * panel so cards always have something to sit against.
 */
export function sectionBand(index) {
  return index % 2 === 1 ? SECTION_BAND : "";
}

/**
 * Elevated content card. A tight contact shadow plus a broad ambient one
 * reads as a real object on the page; a single soft blur just looks hazy.
 */
export const CARD_CLASS =
  "group/card relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_1px_2px_rgba(80,65,40,0.05),0_12px_28px_-10px_rgba(80,65,40,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[rgba(198,161,91,0.5)] hover:shadow-[0_2px_4px_rgba(80,65,40,0.06),0_24px_44px_-12px_rgba(80,65,40,0.22)]";

/** Same surface and elevation, without the hover lift — for static panels. */
export const PANEL_CLASS =
  "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_1px_2px_rgba(80,65,40,0.05),0_12px_28px_-10px_rgba(80,65,40,0.16)]";

/** Larger panel for a form or a single block of content. */
export const FORM_PANEL_CLASS =
  "rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_1px_2px_rgba(80,65,40,0.05),0_16px_36px_-12px_rgba(80,65,40,0.18)] sm:p-8";

/** Secondary heading inside a section (display serif, one step under the section title). */
export const SUBHEADING_CLASS =
  "font-display text-[clamp(21px,2.4vw,26px)] leading-snug tracking-[-0.01em] text-[var(--color-ink)]";

/**
 * Form field. Three things have to be legible: the field's own outline, the
 * placeholder (these forms use placeholders as their only labels), and the
 * focus state. Measured against the white form panel:
 *   border  #A08B60 -> 3.30:1  (WCAG 1.4.11 wants 3:1 for control boundaries)
 *   hint    #6F6D66 -> 4.59:1  on the sand fill
 *   focus   #8A6A32 -> 5.01:1  — must be stronger than resting, not weaker
 */
export const INPUT_CLASS =
  "w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] px-4 py-3 font-body text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] outline-none transition-all focus:border-[var(--color-gold-deep)] focus:bg-[var(--color-surface)] focus:shadow-[0_0_0_3px_rgba(198,161,91,0.28)]";

/**
 * Select. Same field treatment plus a chevron — with `appearance-none` and no
 * marker, a dropdown is indistinguishable from a text input.
 */
export const SELECT_CLASS = `${INPUT_CLASS} field-select cursor-pointer appearance-none pr-11`;
