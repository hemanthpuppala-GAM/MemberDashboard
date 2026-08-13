import { chakras } from "../../data/chakras";
import DecorativeRings from "./DecorativeRings";
import RippleRings from "./RippleRings";
import CenterOrb from "./CenterOrb";
import ChakraNode from "./ChakraNode";

/**
 * Homepage primary navigation: radial mandala of seven chakras.
 */
export default function ChakraMandala({ onNavigate, layout }) {
  const orbitR =
    layout?.orbitR ??
    "clamp(72px, min(calc(40dvh - 120px), calc(46vw - 64px)), 148px)";
  const hubTx = layout?.hubTx ?? 0;
  const hubTy = layout?.hubTy ?? 48;

  return (
    <div
      className="m-hub relative mx-auto flex aspect-square w-full max-w-[min(90vw,440px)] items-center justify-center transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        "--orbit-r": orbitR,
        transform: `translate(${hubTx}px, ${hubTy}px)`,
      }}
    >
      <div className="mandala-spin-once absolute inset-0">
        <DecorativeRings />
        <RippleRings />

        <div className="absolute inset-0 flex items-center justify-center">
          <CenterOrb onNavigate={onNavigate} />
        </div>

        {chakras.map((chakra, index) => (
          <ChakraNode
            key={chakra.id}
            chakra={chakra}
            index={index}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}
