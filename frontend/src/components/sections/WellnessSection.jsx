import PageSections from "./PageSections";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "wellness");

export default function WellnessSection() {
  return <PageSections slug="wellness" chakraId="wellness" chakra={chakra} />;
}
