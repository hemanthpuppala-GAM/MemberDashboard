import Reveal from "../ui/Reveal";
import CardMedia from "../ui/CardMedia";
import { cardFlexClass } from "../ui/cardLayout";

/** Grid of short label/title/body answer cards — the `quick_answers` CMS section type. */
export default function QuickAnswersSection({ fields }) {
  const items = fields?.items ?? [];
  if (!fields || items.length === 0) return null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-2 py-6 sm:px-4">
      {fields.heading && (
        <Reveal animation={fields.animation} as="h3" className="text-xl font-medium text-[var(--color-ink)]">
          {fields.heading}
        </Reveal>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={i} animation={item.animation} delay={i * 60}>
            <div
              className={`flex h-full gap-3 rounded-2xl border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50 px-5 py-4 ${cardFlexClass(item.image_position)}`}
            >
              <CardMedia src={item.image} alt={item.title} position={item.image_position} shape={item.image_shape} />
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-[11px] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                  {item.label}
                </span>
                <span className="font-body text-[15px] font-medium text-[var(--color-ink)]">{item.title}</span>
                <p className="text-[13.5px] leading-relaxed text-[var(--color-muted)]">{item.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
