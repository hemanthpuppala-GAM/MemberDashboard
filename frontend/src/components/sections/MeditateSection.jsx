import ChakraContentSection from "./ChakraContentSection";
import { chakras, heartChakra } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "meditate");

export default function MeditateSection() {
  return (
    <ChakraContentSection
      chakraId="meditate"
      chakra={chakra}
      eyebrow="Meditate · Root"
      title="Sit alone, or sit with the world"
      description="Start with a solo timed sit whenever you like, or join the daily
        mass meditation — the same moment, held by practitioners around the
        world at once."
      points={[
        "A daily group sit, open to anyone, anywhere",
        "Solo timed sits in 5, 15, or 30 minutes",
        "No streaks to keep, no account required to start",
      ]}
      cta={{ label: "Join today's sit", href: heartChakra.href, variant: "primary" }}
      reverse
    />
  );
}
