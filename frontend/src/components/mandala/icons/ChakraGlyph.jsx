/**
 * Traditional chakra symbols as line-art — the same drawings the live
 * goldenagewisdom.org hub uses (stroked lotus petals, outer ring, centre
 * geometry), in the node's own hue via currentColor.
 * Petal counts follow the tradition: 4 root, 6 sacral, 10 solar, 16 throat,
 * 2 brow, many-petalled crown. (The heart's 12-petal shatkona is the coin.)
 */
const C = 22;

function petals(n, opts = {}) {
  const { cy = 6.4, rx = 3.1, ry = 6.2, angles = null } = opts;
  const list = angles || Array.from({ length: n }, (_, i) => (i * 360) / n);
  return list.map((a, i) => (
    <g key={`p${i}`} transform={`rotate(${a} ${C} ${C})`}>
      <ellipse cx={C} cy={cy} rx={rx} ry={ry} fill="none" stroke="currentColor" strokeWidth="1.1" />
    </g>
  ));
}
const circle = (r, key) => <circle key={key} cx={C} cy={C} r={r} fill="none" stroke="currentColor" strokeWidth="1.2" />;
const triDown = (r, key) => (
  <path
    key={key}
    d={`M${(C - r * 0.866).toFixed(1)} ${(C - r / 2).toFixed(1)} L${(C + r * 0.866).toFixed(1)} ${(C - r / 2).toFixed(1)} L${C} ${(C + r).toFixed(1)} Z`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinejoin="round"
  />
);

const KINDS = {
  muladhara: () => [
    ...petals(4, { rx: 4, ry: 6.8, cy: 6.8 }),
    circle(12.6, "c"),
    <rect key="sq" x={C - 7.6} y={C - 7.6} width="15.2" height="15.2" fill="none" stroke="currentColor" strokeWidth="1.1" />,
    triDown(5.6, "t"),
  ],
  svadhisthana: () => [
    ...petals(6),
    circle(12.6, "c"),
    <path key="cr" d={`M${C - 6.4} ${C + 0.5} a6.4 6.4 0 0 0 12.8 0`} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />,
    circle(3.4, "c2"),
  ],
  manipura: () => [...petals(10, { rx: 2.9, ry: 5.9 }), circle(12.6, "c"), triDown(7.8, "t")],
  vishuddha: () => [...petals(16, { rx: 2.4, ry: 5.6, cy: 6.2 }), circle(12.6, "c"), triDown(7.8, "t"), circle(4.2, "c2")],
  ajna: () => [...petals(2, { rx: 3.6, ry: 6.6, cy: 7, angles: [90, 270] }), circle(12.6, "c"), triDown(7, "t")],
  anahata: () => [
    ...petals(12, { rx: 2.7, ry: 5.9 }),
    circle(12.6, "c"),
    triDown(7.4, "t"),
    <path key="tu" d={`M${(C - 7.4 * 0.866).toFixed(1)} ${(C + 3.7).toFixed(1)} L${(C + 7.4 * 0.866).toFixed(1)} ${(C + 3.7).toFixed(1)} L${C} ${(C - 7.4).toFixed(1)} Z`} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />,
  ],
  sahasrara: () => [...petals(20, { rx: 2.2, ry: 5.8, cy: 6.2 }), circle(12.6, "c"), circle(4.6, "c2")],
};

export default function ChakraGlyph({ kind = "sahasrara", size = 40, className = "" }) {
  const draw = KINDS[kind] || KINDS.sahasrara;
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className={className} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      {draw()}
    </svg>
  );
}
