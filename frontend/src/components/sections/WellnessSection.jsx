import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "wellness");

export default function WellnessSection() {
  return (
    <ChakraContentSection
      chakraId="wellness"
      chakra={chakra}
      eyebrow="Wellness"
      title="Practice for the body, not just the mind"
      description="Gentle movement, breathwork, and rest practices that prepare the
        body to sit still — meditation supported by the rest of daily life,
        not separate from it."
      points={[
        "Breathwork sequences to open a sit or close a long day",
        "Simple movement practices, no equipment needed",
        "Guidance on sleep, rest, and pacing your own practice",
      ]}
    />
  );
}
