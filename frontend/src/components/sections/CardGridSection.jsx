import Reveal from "../ui/Reveal";
import CardMedia from "../ui/CardMedia";
import { cardFlexClass } from "../ui/cardLayout";

const DEFAULT_COLOR = "#6EC6EA";

/** Heading + a grid of icon/title/body cards — the `card_grid` CMS section type, reusable across pages. */
export default function CardGridSection({ fields, color = DEFAULT_COLOR }) {
  const cards = fields?.cards ?? [];
  if (!fields || cards.length === 0) return null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-2 py-6 sm:px-4">
      {fields.heading && (
        <Reveal animation={fields.animation} as="h3" className="text-xl font-medium text-[var(--color-ink)]">
          {fields.heading}
        </Reveal>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={i} animation={card.animation} delay={i * 60}>
            <div
              className={`flex h-full gap-3 rounded-2xl border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50 px-5 py-5 transition-colors hover:border-[rgba(220,185,106,0.55)] ${cardFlexClass(card.image_position)}`}
            >
              <CardMedia src={card.image} alt={card.title} position={card.image_position} shape={card.image_shape} />
              <div className="flex flex-1 flex-col gap-3">
                {card.icon && (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                    style={{ background: `${color}1a`, color }}
                  >
                    {card.icon}
                  </span>
                )}
                <span className="font-body text-[15px] font-medium text-[var(--color-ink)]">{card.title}</span>
                <p className="text-[13.5px] leading-relaxed text-[var(--color-muted)]">{card.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
