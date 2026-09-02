import { useState } from "react";
import Reveal from "../ui/Reveal";
import CardMedia from "../ui/CardMedia";
import { cardFlexClass } from "../ui/cardLayout";
import { CardBracket } from "../ui/CardAccent";
import { CARD_CLASS, SECTION_CLASS } from "../ui/sectionStyles";

const DEFAULT_COLOR = "#A8B9A0";

/** "Where are you on the path?" toggle — a quiet note by default, or a grid of deeper cards — the `deep_cards` CMS section type. */
export default function DeepCardsSection({ fields, color = DEFAULT_COLOR }) {
  const [seasoned, setSeasoned] = useState(false);

  if (!fields) return null;

  const items = fields.items ?? [];

  return (
    <section className={`flex flex-col gap-8 ${SECTION_CLASS}`}>
      <div className="mx-auto flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-1">
        {[
          { key: false, label: fields.new_label || "New to this" },
          { key: true, label: fields.seasoned_label || "Seasoned meditator" },
        ].map((tab) => (
          <button
            key={String(tab.key)}
            type="button"
            onClick={() => setSeasoned(tab.key)}
            className="cursor-pointer rounded-full px-5 py-2 font-body text-[13px] font-semibold whitespace-nowrap transition-all duration-300"
            style={
              seasoned === tab.key
                ? { background: color, color: "var(--color-on-gold)", boxShadow: "0 2px 10px rgba(80,65,40,0.12)" }
                : { color: "var(--color-muted)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!seasoned ? (
        fields.new_body && (
          <p className="mx-auto max-w-[56ch] text-center text-[15.5px] leading-[1.75] text-[var(--color-ink-soft)]">
            {fields.new_body}
          </p>
        )
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item, i) => (
              <Reveal key={i} animation={item.animation} delay={i * 60} className="h-full">
                <div className={`flex h-full gap-4 overflow-hidden ${CARD_CLASS} ${cardFlexClass(item.image_position)}`}>
                  <CardBracket />
                  <CardMedia src={item.image} alt={item.title} position={item.image_position} shape={item.image_shape} />
                  <div className="flex flex-1 flex-col gap-2.5">
                    <span
                      className="text-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover/card:translate-y-0"
                      style={{ color }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-body text-[15.5px] font-semibold tracking-[-0.005em] text-[var(--color-ink)]">{item.title}</span>
                    <p className="text-[14px] leading-[1.7] text-[var(--color-ink-soft)]">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {fields.footer_note && (
            <p className="mx-auto max-w-[56ch] text-center text-[13.5px] leading-[1.7] text-[var(--color-muted)] italic">
              {fields.footer_note}
            </p>
          )}
        </>
      )}
    </section>
  );
}
