/** Optional per-card/per-item image — used inside card_grid, quick_answers, deep_cards, mission_cosmology. */
export default function CardMedia({ src, alt = "", position = "top", shape = "rectangle" }) {
  if (!src) return null;
  const sideBySide = position === "left" || position === "right";
  const roundedClass = shape === "circle" ? "rounded-full" : "rounded-xl";

  let sizeClass;
  if (sideBySide) {
    sizeClass =
      shape === "circle" ? "aspect-square h-16 w-16 sm:h-20 sm:w-20" : shape === "vertical" ? "aspect-[3/4] w-20 sm:w-24" : "h-full w-20 sm:w-24";
  } else if (position === "center") {
    sizeClass =
      shape === "circle"
        ? "mx-auto aspect-square w-full max-w-[140px]"
        : shape === "vertical"
        ? "mx-auto aspect-[3/4] w-full max-w-[160px]"
        : "mx-auto aspect-video w-full max-w-[200px]";
  } else {
    sizeClass = shape === "circle" ? "mx-auto aspect-square w-full max-w-[160px]" : shape === "vertical" ? "aspect-[3/4] w-full" : "aspect-video w-full";
  }

  return (
    <div className={`shrink-0 overflow-hidden ${roundedClass} ${sizeClass}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}
