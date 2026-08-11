import { chakras } from "../../data/chakras";
import DecorativeRings from "./DecorativeRings";
import CenterOrb from "./CenterOrb";
import ChakraNode from "./ChakraNode";

/**
 * The homepage's primary navigation: a radial mandala of seven chakras —
 * one centre orb (Heart / Mass Meditation) with six orbiting nodes at
 * even 60° steps (Design.md §1–§3).
 */
export default function ChakraMandala() {
  return (
    <div
      className="relative mx-auto aspect-square w-[min(94vw,560px)]"
      style={{ "--orbit-r": "clamp(112px, 33vw, 202px)" }}
    >
      <DecorativeRings />

      <div className="absolute inset-0 flex items-center justify-center">
        <CenterOrb />
      </div>

      {chakras.map((chakra, index) => (
        <ChakraNode key={chakra.id} chakra={chakra} index={index} />
      ))}
    </div>
  );
}
