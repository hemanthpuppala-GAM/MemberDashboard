import ChakraGlyph from "./ChakraGlyph";

/** ajna — live-site line-art. `petals` kept for API compatibility; the drawing fixes its own count. */
export default function IconThirdEye({ size = 40, className = "" }) {
  return <ChakraGlyph kind="ajna" size={size} className={className} />;
}
