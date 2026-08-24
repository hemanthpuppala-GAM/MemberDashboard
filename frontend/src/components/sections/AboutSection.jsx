import PageSections from "./PageSections";
import TestimonialRail from "./TestimonialRail";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "about");

export default function AboutSection() {
  return (
    <>
      <PageSections slug="about" chakraId="about" chakra={chakra} />
      <TestimonialRail />
    </>
  );
}
