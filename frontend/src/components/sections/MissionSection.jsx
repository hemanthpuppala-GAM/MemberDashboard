import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";

const chakra = chakras.find((c) => c.id === "mission");

export default function MissionSection() {
  return (
    <ChakraContentSection
      chakraId="mission"
      chakra={chakra}
      eyebrow="Our Mission"
      title="Why we exist"
      description="We believe a calmer inner life adds up to a calmer world. Every
        sit — solo or shared — is one small, verifiable act toward that,
        offered without cost or obligation."
      points={[
        "Free access to every teaching and every session, always",
        "Funded entirely by voluntary support, never by ads",
        "Run by a small volunteer team across several countries",
      ]}
      reverse
    />
  );
}
