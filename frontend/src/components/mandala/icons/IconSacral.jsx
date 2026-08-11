import ChakraGlyph from "./ChakraGlyph";

/** Svadhisthana / Sacral — ❋ six-spoke burst, 6 petals. */
export default function IconSacral({ size = 40, petals = 6, className = "" }) {
  return (
    <ChakraGlyph petals={petals} size={size} className={className}>
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="43"
          x2="50"
          y2="57"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${i * 60} 50 50)`}
        />
      ))}
    </ChakraGlyph>
  );
}
