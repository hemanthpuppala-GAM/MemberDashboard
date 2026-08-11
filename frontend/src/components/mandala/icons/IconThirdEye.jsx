import ChakraGlyph from "./ChakraGlyph";

/** Ajna / Third Eye — ◎ circle with a centre dot, 2 petals. */
export default function IconThirdEye({ size = 40, petals = 2, className = "" }) {
  return (
    <ChakraGlyph petals={petals} size={size} className={className}>
      <circle cx="50" cy="50" r="11" fill="none" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" />
    </ChakraGlyph>
  );
}
