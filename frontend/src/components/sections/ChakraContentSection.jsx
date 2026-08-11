import { chakraIcons } from "../mandala/icons";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";

/**
 * Shared layout for the six chakra-mapped content sections. Each section
 * file (AboutSection.jsx, WisdomSection.jsx, ...) supplies copy + chakra
 * id and reuses this so the glyph/heading/CTA pattern stays one component.
 */
export default function ChakraContentSection({
  chakraId,
  chakra,
  eyebrow,
  title,
  description,
  points = [],
  cta,
  reverse = false,
}) {
  const Icon = chakraIcons[chakraId];

  return (
    <section
      id={chakraId}
      className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-2 py-6 sm:px-4 md:flex-row md:items-center md:gap-12"
    >
      <div
        className={`flex w-full flex-1 flex-col gap-6 ${reverse ? "md:order-2" : ""}`}
      >
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          color={chakra.color}
        />

        {points.length > 0 && (
          <ul className="flex flex-col gap-3">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm text-[var(--color-muted)]"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: chakra.color }}
                />
                {point}
              </li>
            ))}
          </ul>
        )}

        {cta && (
          <Button href={cta.href} variant={cta.variant ?? "secondary"} className="w-fit">
            {cta.label}
          </Button>
        )}
      </div>

      <div
        className={`flex w-full flex-1 items-center justify-center ${reverse ? "md:order-1" : ""}`}
      >
        <div
          className="relative flex aspect-square w-full max-w-[280px] items-center justify-center rounded-full border bg-[var(--color-surface)]/60 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm"
          style={{ borderColor: `${chakra.color}55` }}
        >
          <span
            className="absolute inset-[10%] rounded-full opacity-40 blur-2xl"
            style={{ background: chakra.color }}
            aria-hidden="true"
          />
          <span className="relative" style={{ color: chakra.color }}>
            <Icon size="42%" petals={chakra.petals} />
          </span>
          <span className="absolute bottom-6 text-xs tracking-[0.2em] text-[var(--color-muted-soft)] uppercase">
            {chakra.sanskrit} · {chakra.common}
          </span>
        </div>
      </div>
    </section>
  );
}
