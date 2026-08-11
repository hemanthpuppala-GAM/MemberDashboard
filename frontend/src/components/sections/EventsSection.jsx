import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "events");

export default function EventsSection() {
  return (
    <ChakraContentSection
      chakraId="events"
      chakra={chakra}
      eyebrow="Events"
      title="Gather, in person and online"
      description="From weekly online circles to seasonal in-person retreats — ways
        to practice alongside others, at whatever distance feels right."
      points={[
        "Weekly online circles, open to newcomers",
        "Seasonal in-person retreats and gatherings",
        "Local practice groups, searchable by city",
      ]}
    />
  );
}
