/**
 * Shared glyph primitive: draws `petals` lotus petals evenly around a
 * centre point in a 100x100 viewBox, with the chakra-specific centre
 * symbol passed in as children. Petal count is a prop (Design.md §12.1)
 * so each chakra's icon file only has to describe its centre symbol.
 */
export default function ChakraGlyph({
  petals = 6,
  size = 40,
  className = "",
  children,
}) {
  // Higher petal counts (throat 16, crown 48) pack far more shapes into
  // the same ring — fading their opacity as count rises keeps the ring a
  // soft halo instead of a solid disc that drowns out the centre symbol.
  // Values run higher than on a light background — on dark glass the
  // petals need real color to read as a glowing lotus, not a faint tint.
  const petalOpacity =
    petals <= 4 ? 0.55 : petals <= 8 ? 0.42 : petals <= 16 ? 0.28 : 0.16;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <g stroke="none">
        {Array.from({ length: petals }).map((_, i) => (
          <path
            key={i}
            d="M50,32 Q44,18 50,6 Q56,18 50,32 Z"
            fill="currentColor"
            fillOpacity={petalOpacity}
            transform={`rotate(${(360 / petals) * i} 50 50)`}
          />
        ))}
      </g>
      <g fill="currentColor" stroke="currentColor">
        {children}
      </g>
    </svg>
  );
}
