import Chip from "./Chip";

/**
 * Title type scale by length. Section titles come from the CMS, so the same
 * slot holds anything from "Wisdom" to a full paragraph of intro prose —
 * a single display size would either shrink real headlines or blow a
 * paragraph up to eight lines of 44px serif.
 */
function titleClass(title) {
  const length = String(title ?? "").length;
  if (length > 120) return "max-w-[46ch] text-[clamp(19px,2vw,25px)] leading-[1.5]";
  if (length > 60) return "max-w-[26ch] text-[clamp(26px,3.2vw,36px)] leading-[1.2]";
  return "max-w-[19ch] text-[clamp(30px,4vw,44px)] leading-[1.12]";
}

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
      className={`flex flex-col gap-5 ${align === "center" ? "items-center text-center" : "items-start text-left"}`}
    >
      {eyebrow && <Chip color={color}>{eyebrow}</Chip>}
      <h2 className={`tracking-[-0.015em] text-balance text-[var(--color-ink)] ${titleClass(title)}`}>
        {title}
      </h2>
      {description && (
        <p
          className="max-w-[58ch] text-[16px] leading-[1.75] text-[var(--color-ink-soft)]"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}
