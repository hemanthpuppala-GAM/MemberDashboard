import ChakraGlyph from "./ChakraGlyph";

/** anahata — live-site line-art. `petals` kept for API compatibility; the drawing fixes its own count. */
export default function IconHeart({ size = 40, className = "" }) {
  return <ChakraGlyph kind="anahata" size={size} className={className} />;
}
