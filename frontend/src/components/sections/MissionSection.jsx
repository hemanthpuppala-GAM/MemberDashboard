import PageSections from "./PageSections";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "mission");

export default function MissionSection() {
  return <PageSections slug="mission" chakraId="mission" chakra={chakra} />;
}
