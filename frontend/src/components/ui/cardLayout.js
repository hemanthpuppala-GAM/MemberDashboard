/** Flex direction for a card whose optional image sits left/right/top/bottom/center of its text. */
export function cardFlexClass(position = "top") {
  if (position === "left") return "flex-row items-center";
  if (position === "right") return "flex-row-reverse items-center";
  if (position === "bottom") return "flex-col-reverse";
  return "flex-col"; // top, center
}
