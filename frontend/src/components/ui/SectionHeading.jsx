import Chip from "./Chip";

/** Consistent heading block used at the top of every homepage section. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  color,
  align = "left",
}) {
  return (
    <div
      className={`flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "items-start text-left"}`}
    >
      {eyebrow && <Chip color={color}>{eyebrow}</Chip>}
      <h2 className="max-w-xl text-3xl text-[var(--color-ink)] sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}
