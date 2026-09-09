import { chakras } from "../../data/chakras";
import DecorativeRings from "./DecorativeRings";
import RippleRings from "./RippleRings";
import CenterOrb from "./CenterOrb";
import ChakraNode from "./ChakraNode";

/**
 * Homepage primary navigation: radial mandala of seven chakras.
 * The square box is sized from the orbit radius (+ room for the node labels)
 * so a bigger --orbit-r produces a bigger wheel instead of clipping.
 */
export default function ChakraMandala({ onNavigate, layout }) {
  const orbitR =
    layout?.orbitR ??
    "clamp(72px, min(calc(40dvh - 120px), calc(46vw - 64px)), 148px)";
  const hubTx = layout?.hubTx ?? 0;
  const hubTy = layout?.hubTy ?? 48;

  return (
    <div
      className="m-hub relative mx-auto flex aspect-square w-full items-center justify-center transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        "--orbit-r": orbitR,
        maxWidth: "calc(var(--orbit-r) * 2.7)",
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
          <ChakraNode key={chakra.id} chakra={chakra} index={index} onNavigate={onNavigate} />
        ))}
      </div>
      <span aria-hidden="true" className="absolute left-1/2 bottom-[-6%] grid -translate-x-1/2 whitespace-nowrap font-body text-[11px] tracking-[0.32em] text-[rgba(232,207,131,.75)] uppercase">
        <span className="[grid-area:1/1] animate-breathe-word">Breathe in</span>
        <span className="[grid-area:1/1] animate-breathe-word2">Breathe out</span>
      </span>
    </div>
  );
}
