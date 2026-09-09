import ChakraGlyph from "./ChakraGlyph";

/** muladhara — live-site line-art. `petals` kept for API compatibility; the drawing fixes its own count. */
export default function IconRoot({ size = 40, className = "" }) {
  return <ChakraGlyph kind="muladhara" size={size} className={className} />;
}
