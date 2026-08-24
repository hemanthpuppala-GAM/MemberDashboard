import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import CardMedia from "../ui/CardMedia";
import { cardFlexClass } from "../ui/cardLayout";

const DEFAULT_COLOR = "#6EC6EA";

/** Yuga-cycle timeline + a goal stat callout — the `mission_cosmology` CMS section type. */
export default function MissionCosmologySection({ fields, color = DEFAULT_COLOR }) {
  if (!fields) return null;

  const yugas = fields.yugas ?? [];

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-2 py-6 sm:px-4">
      <Reveal animation={fields.animation}>
        <SectionHeading eyebrow={fields.eyebrow} title={fields.intro} color={color} />
      </Reveal>

      {yugas.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-4">
          {yugas.map((yuga, i) => (
            <Reveal key={yuga.name} animation={yuga.animation} delay={i * 60}>
              <div
                className={`flex h-full gap-2 rounded-2xl border px-4 py-4 text-center ${cardFlexClass(yuga.image_position ?? "top")}`}
                style={
                  yuga.active
                    ? { borderColor: color, background: `${color}14`, boxShadow: `0 0 24px ${color}30` }
                    : { borderColor: "rgba(110,198,234,0.25)" }
                }
              >
                <CardMedia src={yuga.image} alt={yuga.name} position={yuga.image_position} shape={yuga.image_shape} />
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-body text-[15px] font-medium text-[var(--color-ink)]">{yuga.name}</span>
                  <span className="text-[12px] font-medium tracking-[0.08em] text-[var(--color-muted-soft)] uppercase">
                    {yuga.label}
                  </span>
                  <p className="text-[12.5px] leading-relaxed text-[var(--color-muted)]">{yuga.description}</p>
                  {yuga.active && (
                    <span className="mt-1 text-[11px] font-medium" style={{ color }}>
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
        <p className="max-w-3xl text-[14.5px] leading-relaxed text-[var(--color-muted)]">{fields.outro}</p>
      )}

      {fields.goal_percent && (
        <Reveal
          animation={fields.animation}
          className="flex flex-col items-center gap-2 rounded-2xl border px-6 py-8 text-center"
          style={{ borderColor: `${color}55`, background: `${color}0d` }}
        >
          <span
            className="font-display text-[clamp(36px,6vw,56px)] font-semibold"
            style={{ color }}
          >
            {fields.goal_percent}
          </span>
          {fields.goal_label && (
            <p className="max-w-md text-[13.5px] leading-relaxed text-[var(--color-muted)]">{fields.goal_label}</p>
          )}
          {fields.goal_caption && (
            <p className="text-[12px] tracking-[0.08em] text-[var(--color-muted-soft)] uppercase">
              {fields.goal_caption}
            </p>
          )}
        </Reveal>
      )}
    </section>
  );
}
