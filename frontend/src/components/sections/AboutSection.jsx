import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "about");

export default function AboutSection() {
  return (
    <ChakraContentSection
      chakraId="about"
      chakra={chakra}
      eyebrow="About · Crown"
      title="A teaching, not a brand"
      description="Golden Age Wisdom carries a living lineage of meditation practice —
        offered freely, held by a community of everyday practitioners rather
        than a single teacher or institution."
      points={[
        "Rooted in a decades-old meditation lineage, adapted for modern practice",
        "Guided by volunteer practitioners, not paid staff",
        "Open to any background — no prior experience or belief required",
      ]}
    />
  );
}
