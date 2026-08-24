import PageSections from "./PageSections";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "meditate");

export default function MeditateSection() {
  return <PageSections slug="meditate" chakraId="meditate" chakra={chakra} />;
}
