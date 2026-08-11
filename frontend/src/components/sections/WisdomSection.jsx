import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "wisdom");

export default function WisdomSection() {
  return (
    <ChakraContentSection
      chakraId="wisdom"
      chakra={chakra}
      eyebrow="Wisdom"
      title="Teachings for a quiet mind"
      description="Short talks, recorded sits, and written reflections on the practice —
        the same material shared in our in-person circles, kept open for
        anyone to read or listen to at their own pace."
      points={[
        "Weekly reflections on practice and daily life",
        "Recorded guided sits in multiple lengths",
        "A growing library, organized by theme rather than difficulty",
      ]}
      reverse
    />
  );
}
