import ChakraGlyph from "./ChakraGlyph";

/** Anahata / Heart (centre orb) — twin overlaid triangles, 12 petals. */
export default function IconHeart({ size = 56, petals = 12, className = "" }) {
  return (
    <ChakraGlyph petals={petals} size={size} className={className}>
      <path d="M50,30 L67,60 L33,60 Z" fill="none" strokeWidth="2.75" />
      <path d="M50,70 L33,40 L67,40 Z" fill="none" strokeWidth="2.75" />
    </ChakraGlyph>
  );
}
