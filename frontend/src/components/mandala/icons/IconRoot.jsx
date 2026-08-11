import ChakraGlyph from "./ChakraGlyph";

/** Muladhara / Root — ▽ downward triangle, 4 petals. */
export default function IconRoot({ size = 40, petals = 4, className = "" }) {
  return (
    <ChakraGlyph petals={petals} size={size} className={className}>
      <path d="M34,40 L66,40 L50,64 Z" stroke="none" />
    </ChakraGlyph>
  );
}
