import ChakraGlyph from "./ChakraGlyph";

/** Sahasrara / Crown — ✦ four-pointed star, 48 stylised petals. */
export default function IconCrown({ size = 40, petals = 48, className = "" }) {
  return (
    <ChakraGlyph petals={petals} size={size} className={className}>
      <path
        d="M50,32 L54.5,45.5 L68,50 L54.5,54.5 L50,68 L45.5,54.5 L32,50 L45.5,45.5 Z"
        strokeWidth="0.5"
      />
    </ChakraGlyph>
  );
}
