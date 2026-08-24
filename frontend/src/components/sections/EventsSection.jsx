import PageSections from "./PageSections";
import TestimonialRail from "./TestimonialRail";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "events");

export default function EventsSection() {
  return (
    <>
      <PageSections slug="events" chakraId="events" chakra={chakra} />
      <TestimonialRail />
    </>
  );
}
