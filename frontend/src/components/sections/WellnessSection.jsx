import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";
import { useContent } from "../../hooks/useContent";

const chakra = chakras.find((c) => c.id === "wellness");

const FALLBACK = {
  eyebrow: "Wellness",
  title: "Practice for the body, not just the mind",
  description: "Gentle movement, breathwork, and rest practices that prepare the\n        body to sit still — meditation supported by the rest of daily life,\n        not separate from it.",
  points: [
    "Breathwork sequences to open a sit or close a long day",
    "Simple movement practices, no equipment needed",
    "Guidance on sleep, rest, and pacing your own practice",
  ],
};

export default function WellnessSection() {
  const content = useContent("wellness", FALLBACK);

  return <ChakraContentSection chakraId="wellness" chakra={chakra} {...content} />;
}
