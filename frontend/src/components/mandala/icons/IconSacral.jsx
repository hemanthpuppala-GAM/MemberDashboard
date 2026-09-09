import ChakraGlyph from "./ChakraGlyph";

/** svadhisthana — live-site line-art. `petals` kept for API compatibility; the drawing fixes its own count. */
export default function IconSacral({ size = 40, className = "" }) {
  return <ChakraGlyph kind="svadhisthana" size={size} className={className} />;
}
