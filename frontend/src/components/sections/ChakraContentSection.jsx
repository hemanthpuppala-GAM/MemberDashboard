import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";

const SHAPE_CLASSES = {
  circle: "aspect-square max-w-[280px] rounded-full",
  vertical: "aspect-[3/4] max-w-[260px] rounded-2xl",
  rectangle: "aspect-video max-w-[420px] rounded-2xl",
};

/**
 * Shared layout for the six chakra-mapped content sections. Each section
 * file (AboutSection.jsx, WisdomSection.jsx, ...) supplies copy + chakra
 * id and reuses this so the heading/CTA pattern stays one component.
 * `position` (left/right/top/bottom/center), `shape` (circle/rectangle/
 * vertical) and `animation` come straight from the admin's per-section
 * layout controls. With no image set, only the text renders — full width.
 */
export default function ChakraContentSection({
  chakra,
  eyebrow,
  title,
  description,
  points = [],
  cta,
  position = "right",
  shape = "circle",
  animation = "fade",
  image,
}) {
  const stacked = position === "top" || position === "bottom" || position === "center";
  const imageFirst = position === "left" || position === "top" || position === "center";
  const centered = position === "center";
  const shapeClass = SHAPE_CLASSES[shape] ?? SHAPE_CLASSES.circle;

  return (
    <section
      className={`mx-auto flex max-w-5xl gap-10 px-2 py-6 sm:px-4 ${
        image && stacked ? `flex-col ${centered ? "items-center text-center" : ""}` : "flex-col items-center md:flex-row md:items-center md:gap-12"
      }`}
      style={{ borderTop: `1px solid rgba(110,198,234,0.35)` }}
    >
      <Reveal
        animation={animation}
        className={`flex w-full flex-1 flex-col gap-6 ${!image ? "items-start text-left" : centered ? "items-center" : ""} ${
          !image ? "" : stacked ? (imageFirst ? "order-2" : "order-1") : imageFirst ? "md:order-2" : ""
        }`}
      >
        <SectionHeading eyebrow={eyebrow} title={title} description={description} color={chakra.color} />

        {points.length > 0 && (
          <ul className={`flex flex-col gap-3 ${image && centered ? "items-center" : ""}`}>
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm text-[var(--color-muted)]"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full ring-1"
                  style={{ background: chakra.color, boxShadow: `0 0 6px ${chakra.color}80` }}
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
      </Reveal>

      {image && (
        <Reveal
          animation={animation}
          delay={120}
          className={`flex w-full flex-1 items-center justify-center ${
            stacked ? (imageFirst ? "order-1" : "order-2") : imageFirst ? "md:order-1" : ""
          }`}
        >
          <div
            className={`relative flex w-full items-center justify-center overflow-hidden border bg-[var(--color-surface)]/70 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7),0_0_40px_rgba(110,198,234,0.15)] backdrop-blur-sm ${shapeClass}`}
            style={{ borderColor: `${chakra.color}55` }}
          >
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </Reveal>
      )}
    </section>
  );
}
