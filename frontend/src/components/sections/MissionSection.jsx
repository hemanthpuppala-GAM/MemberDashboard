import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";
import { useContent } from "../../hooks/useContent";

const chakra = chakras.find((c) => c.id === "mission");

const FALLBACK = {
  eyebrow: "Our Mission",
  title: "Why we exist",
  description: "We believe a calmer inner life adds up to a calmer world. Every\n        sit — solo or shared — is one small, verifiable act toward that,\n        offered without cost or obligation.",
  points: [
    "Free access to every teaching and every session, always",
    "Funded entirely by voluntary support, never by ads",
    "Run by a small volunteer team across several countries",
  ],
  reverse: true,
};

export default function MissionSection() {
  const content = useContent("mission", FALLBACK);

  return <ChakraContentSection chakraId="mission" chakra={chakra} {...content} />;
}
