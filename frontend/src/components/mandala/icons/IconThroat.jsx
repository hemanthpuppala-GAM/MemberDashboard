import ChakraGlyph from "./ChakraGlyph";

/** vishuddha — live-site line-art. `petals` kept for API compatibility; the drawing fixes its own count. */
export default function IconThroat({ size = 40, className = "" }) {
  return <ChakraGlyph kind="vishuddha" size={size} className={className} />;
}
