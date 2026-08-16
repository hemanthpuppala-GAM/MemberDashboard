import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PageAtmosphere from "../components/layout/PageAtmosphere";
import HeroSection from "../components/sections/HeroSection";
import QrJoinCard from "../components/sections/QrJoinCard";
import AboutSection from "../components/sections/AboutSection";
import WisdomSection from "../components/sections/WisdomSection";
import WellnessSection from "../components/sections/WellnessSection";
import MeditateSection from "../components/sections/MeditateSection";
import EventsSection from "../components/sections/EventsSection";
import MissionSection from "../components/sections/MissionSection";
import ContactSection from "../components/sections/ContactSection";

const SECTION_VIEWS = {
  about: AboutSection,
  wisdom: WisdomSection,
  wellness: WellnessSection,
  practice: MeditateSection,
  events: EventsSection,
  mission: MissionSection,
  contact: ContactSection,
};

export default function HomePage() {
  const [view, setView] = useState("hub");
  const isHub = view === "hub";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && view !== "hub") setView("hub");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  const Section = SECTION_VIEWS[view];

  return (
    <div
      className={`relative flex h-dvh flex-col overflow-hidden ${
        isHub ? "bg-transparent" : "bg-[var(--color-bg)]"
      }`}
    >
      <PageAtmosphere showFigure={isHub} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-[var(--color-gold)] focus:px-[18px] focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[var(--color-on-gold)]"
      >
        Skip to content
      </a>

      <h1 className="sr-only">
        Golden Age Wisdom — free daily live meditation and Upanishadic wisdom,
        taught by Dr Hari Krishna, MD
      </h1>

      <Header onLogoClick={() => setView("hub")} onNavigate={setView} activeView={view} />

      <main
        id="main"
        className={`relative z-10 flex min-h-0 flex-1 overflow-hidden ${isHub ? "" : "items-stretch justify-center px-[clamp(12px,3vw,24px)] pt-2 pb-2"}`}
      >
        {isHub && (
          <HeroSection
            onNavigate={setView}
            onWatchIntro={() =>
              window.open(
                "https://www.youtube.com/@GoldenAgeGurus",
                "_blank",
                "noopener,noreferrer",
              )
            }
          />
        )}

        {Section && (
          <div className="m-view mx-auto flex w-[min(1120px,100%)] animate-[viewIn_0.45s_ease] flex-col justify-start gap-4 overflow-y-auto overscroll-contain">
            <Section />
          </div>
        )}
      </main>

      <QrJoinCard show={isHub} />
      <Footer view={view} onBack={() => setView("hub")} />
    </div>
  );
}
