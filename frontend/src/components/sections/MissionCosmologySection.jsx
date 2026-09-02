import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import CardMedia from "../ui/CardMedia";
import { cardFlexClass } from "../ui/cardLayout";
import { SECTION_CLASS } from "../ui/sectionStyles";

const DEFAULT_COLOR = "#A8B9A0";

/** Yuga-cycle timeline + a goal stat callout — the `mission_cosmology` CMS section type. */
export default function MissionCosmologySection({ fields, color = DEFAULT_COLOR }) {
  if (!fields) return null;

  const yugas = fields.yugas ?? [];

  return (
    <section className={`flex flex-col gap-10 ${SECTION_CLASS}`}>
      <Reveal animation={fields.animation}>
        <SectionHeading eyebrow={fields.eyebrow} title={fields.intro} color={color} />
      </Reveal>

      {yugas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          {yugas.map((yuga, i) => (
            <Reveal key={yuga.name} animation={yuga.animation} delay={i * 60} className="h-full">
              <div
                className={`flex h-full gap-2.5 rounded-2xl border bg-[var(--color-surface)] px-5 py-6 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(80,65,40,0.20)] motion-reduce:hover:translate-y-0 ${
                  yuga.active ? "animate-soft-pulse" : ""
                } ${cardFlexClass(yuga.image_position ?? "top")}`}
                style={
                  yuga.active
                    ? { borderColor: `${color}80`, background: `${color}12`, boxShadow: "0 10px 32px rgba(80,65,40,0.10)" }
                    : { borderColor: "var(--color-border)", boxShadow: "0 8px 30px rgba(80,65,40,0.04)" }
                }
              >
                <CardMedia src={yuga.image} alt={yuga.name} position={yuga.image_position} shape={yuga.image_shape} />
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-body text-[15.5px] font-semibold text-[var(--color-ink)]">{yuga.name}</span>
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">
                    {yuga.label}
                  </span>
                  <p className="text-[13px] leading-[1.65] text-[var(--color-ink-soft)]">{yuga.description}</p>
                  {yuga.active && (
                    <span className="mt-1 text-[11px] font-semibold tracking-[0.08em]" style={{ color }}>
                      We rise from here
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {fields.outro && (
        <p className="max-w-[64ch] text-[15.5px] leading-[1.75] text-[var(--color-ink-soft)]">{fields.outro}</p>
      )}

      {fields.goal_percent && (
        <Reveal
          animation={fields.animation}
          className="flex flex-col items-center gap-3 rounded-3xl border px-8 py-12 text-center"
          style={{ borderColor: `${color}40`, background: `${color}0f` }}
        >
          <span
            className="font-display text-[clamp(44px,7vw,68px)] leading-none font-semibold tracking-[-0.02em]"
            style={{ color }}
          >
            {fields.goal_percent}
          </span>
          {fields.goal_label && (
            <p className="max-w-[48ch] text-[15px] leading-[1.7] text-[var(--color-ink-soft)]">{fields.goal_label}</p>
          )}
          {fields.goal_caption && (
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--color-muted)] uppercase">
              {fields.goal_caption}
            </p>
          )}
        </Reveal>
      )}
    </section>
  );
}
