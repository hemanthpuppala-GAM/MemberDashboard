import ChakraGlyph from "./ChakraGlyph";

/** Vishuddha / Throat — ☾ crescent moon, 16 petals. */
export default function IconThroat({ size = 40, petals = 16, className = "" }) {
  return (
    <ChakraGlyph petals={petals} size={size} className={className}>
      <g transform="translate(31,31) scale(1.6)" stroke="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </g>
    </ChakraGlyph>
  );
}
