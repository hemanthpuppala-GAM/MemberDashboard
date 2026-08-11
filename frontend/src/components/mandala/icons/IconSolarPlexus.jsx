import ChakraGlyph from "./ChakraGlyph";

/** Manipura / Solar Plexus — △ upward triangle, 10 petals. */
export default function IconSolarPlexus({ size = 40, petals = 10, className = "" }) {
  return (
    <ChakraGlyph petals={petals} size={size} className={className}>
      <path d="M50,36 L66,64 L34,64 Z" stroke="none" />
    </ChakraGlyph>
  );
}
