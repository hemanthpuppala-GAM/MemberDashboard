import Reveal from "../ui/Reveal";
import CardMedia from "../ui/CardMedia";
import { cardFlexClass } from "../ui/cardLayout";
import { CardRule } from "../ui/CardAccent";
import { CARD_CLASS, SECTION_CLASS, SUBHEADING_CLASS } from "../ui/sectionStyles";

const DEFAULT_COLOR = "#A8B9A0";

/** Heading + a grid of icon/title/body cards — the `card_grid` CMS section type, reusable across pages. */
export default function CardGridSection({ fields, color = DEFAULT_COLOR }) {
  const cards = fields?.cards ?? [];
  if (!fields || cards.length === 0) return null;

  return (
    <section className={`flex flex-col gap-8 ${SECTION_CLASS}`}>
      {fields.heading && (
        <Reveal animation={fields.animation} as="h3" className={SUBHEADING_CLASS}>
          {fields.heading}
        </Reveal>
      )}
      <div className="grid gap-5 sm:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={i} animation={card.animation} delay={i * 60} className="h-full">
            <div className={`flex h-full gap-4 overflow-hidden ${CARD_CLASS} ${cardFlexClass(card.image_position)}`}>
              <CardRule />
              <CardMedia src={card.image} alt={card.title} position={card.image_position} shape={card.image_shape} />
              <div className="flex flex-1 flex-col gap-3">
                {card.icon && (
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full text-lg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-110 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
                    style={{ background: `${color}1f`, color }}
                  >
                    {card.icon}
                  </span>
                )}
                <span className="font-body text-[15.5px] font-semibold tracking-[-0.005em] text-[var(--color-ink)]">{card.title}</span>
                <p className="text-[14px] leading-[1.7] text-[var(--color-ink-soft)]">{card.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
