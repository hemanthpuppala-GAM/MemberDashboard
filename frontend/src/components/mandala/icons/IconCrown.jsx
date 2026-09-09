import ChakraGlyph from "./ChakraGlyph";

/** sahasrara — live-site line-art. `petals` kept for API compatibility; the drawing fixes its own count. */
export default function IconCrown({ size = 40, className = "" }) {
  return <ChakraGlyph kind="sahasrara" size={size} className={className} />;
}
