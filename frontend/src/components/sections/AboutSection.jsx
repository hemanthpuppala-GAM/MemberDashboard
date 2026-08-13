import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";
import { useContent } from "../../hooks/useContent";

const chakra = chakras.find((c) => c.id === "about");

const FALLBACK = {
  eyebrow: "About Me",
  title: "A teaching, not a brand",
  description: "Golden Age Wisdom carries a living lineage of meditation practice —\n        offered freely, held by a community of everyday practitioners rather\n        than a single teacher or institution.",
  points: [
    "Rooted in a decades-old meditation lineage, adapted for modern practice",
    "Guided by volunteer practitioners, not paid staff",
    "Open to any background — no prior experience or belief required",
  ],
};

export default function AboutSection() {
  const content = useContent("about", FALLBACK);

  return <ChakraContentSection chakraId="about" chakra={chakra} {...content} />;
}
