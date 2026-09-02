import Reveal from "../ui/Reveal";
import CardMedia from "../ui/CardMedia";
import { cardFlexClass } from "../ui/cardLayout";
import { CardEdge } from "../ui/CardAccent";
import { CARD_CLASS, SECTION_CLASS, SUBHEADING_CLASS } from "../ui/sectionStyles";

/** Grid of short label/title/body answer cards — the `quick_answers` CMS section type. */
export default function QuickAnswersSection({ fields }) {
  const items = fields?.items ?? [];
  if (!fields || items.length === 0) return null;

  return (
    <section className={`flex flex-col gap-8 ${SECTION_CLASS}`}>
      {fields.heading && (
        <Reveal animation={fields.animation} as="h3" className={SUBHEADING_CLASS}>
          {fields.heading}
        </Reveal>
      )}
      <div className="grid gap-5 sm:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={i} animation={item.animation} delay={i * 60} className="h-full">
            <div className={`flex h-full gap-4 overflow-hidden ${CARD_CLASS} ${cardFlexClass(item.image_position)}`}>
              <CardEdge />
              <CardMedia src={item.image} alt={item.title} position={item.image_position} shape={item.image_shape} />
              <div className="flex flex-1 flex-col gap-2.5">
                <span className="text-[11px] font-semibold tracking-[0.16em] text-[var(--color-muted)] uppercase transition-colors duration-300 group-hover/card:text-[var(--color-gold-deep)]">
                  {item.label}
                </span>
                <span className="font-body text-[15.5px] font-semibold tracking-[-0.005em] text-[var(--color-ink)]">{item.title}</span>
                <p className="text-[14px] leading-[1.7] text-[var(--color-ink-soft)]">{item.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
