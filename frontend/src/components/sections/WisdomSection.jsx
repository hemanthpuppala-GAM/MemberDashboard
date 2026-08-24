import PageSections from "./PageSections";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "wisdom");

export default function WisdomSection() {
  return <PageSections slug="wisdom" chakraId="wisdom" chakra={chakra} />;
}
