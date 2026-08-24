import { useState } from "react";
import Reveal from "../ui/Reveal";
import CardMedia from "../ui/CardMedia";
import { cardFlexClass } from "../ui/cardLayout";

const DEFAULT_COLOR = "#6EC6EA";

/** "Where are you on the path?" toggle — a quiet note by default, or a grid of deeper cards — the `deep_cards` CMS section type. */
export default function DeepCardsSection({ fields, color = DEFAULT_COLOR }) {
  const [seasoned, setSeasoned] = useState(false);

  if (!fields) return null;

  const items = fields.items ?? [];

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-2 py-6 sm:px-4">
      <div className="mx-auto flex w-fit rounded-full border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50 p-1">
        {[
          { key: false, label: fields.new_label || "New to this" },
          { key: true, label: fields.seasoned_label || "Seasoned meditator" },
        ].map((tab) => (
          <button
            key={String(tab.key)}
            type="button"
            onClick={() => setSeasoned(tab.key)}
            className="rounded-full px-4 py-1.5 font-body text-[13px] font-medium whitespace-nowrap transition-colors"
            style={
              seasoned === tab.key
                ? { background: color, color: "var(--color-on-gold)" }
                : { color: "var(--color-muted)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!seasoned ? (
        fields.new_body && (
          <p className="mx-auto max-w-xl text-center text-[14.5px] leading-relaxed text-[var(--color-muted)]">
            {fields.new_body}
          </p>
        )
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, i) => (
              <Reveal key={i} animation={item.animation} delay={i * 60}>
                <div
                  className={`flex h-full gap-3 rounded-2xl border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50 px-5 py-4 ${cardFlexClass(item.image_position)}`}
                >
                  <CardMedia src={item.image} alt={item.title} position={item.image_position} shape={item.image_shape} />
                  <div className="flex flex-1 flex-col gap-2">
                    <span className="text-lg" style={{ color }}>
                      {item.icon}
                    </span>
                    <span className="font-body text-[15px] font-medium text-[var(--color-ink)]">{item.title}</span>
                    <p className="text-[13.5px] leading-relaxed text-[var(--color-muted)]">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {fields.footer_note && (
            <p className="mx-auto max-w-xl text-center text-[13px] leading-relaxed text-[var(--color-muted-soft)] italic">
              {fields.footer_note}
            </p>
          )}
        </>
      )}
    </section>
  );
}
