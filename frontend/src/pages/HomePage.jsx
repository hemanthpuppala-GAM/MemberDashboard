import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PageAtmosphere from "../components/layout/PageAtmosphere";
import BroadcastManager from "../components/layout/BroadcastManager";
import HeroSection from "../components/sections/HeroSection";
import HomeExtraSections from "../components/sections/HomeExtraSections";
import QrJoinCard from "../components/sections/QrJoinCard";
import AboutSection from "../components/sections/AboutSection";
import WisdomSection from "../components/sections/WisdomSection";
import WellnessSection from "../components/sections/WellnessSection";
import MeditateSection from "../components/sections/MeditateSection";
import EventsSection from "../components/sections/EventsSection";
import MissionSection from "../components/sections/MissionSection";
import ContactSection from "../components/sections/ContactSection";
import VolunteerSection from "../components/sections/VolunteerSection";
import DonateSection from "../components/sections/DonateSection";

const SECTION_VIEWS = {
  about: AboutSection,
  wisdom: WisdomSection,
  wellness: WellnessSection,
  practice: MeditateSection,
  events: EventsSection,
  mission: MissionSection,
  contact: ContactSection,
  volunteer: VolunteerSection,
  donate: DonateSection,
};

/**
 * Reads `#<view>` or `#<view>:<sectionId>` from the URL — the format the
 * admin panel's per-section "view" button links to (see PageDetailPage.jsx).
 * Not a full router: this SPA has one route ("*" -> HomePage) and switches
 * views via component state, so the hash is the only shareable/refreshable
 * pointer into a specific view (and, best-effort, a specific CMS section).
 */
function parseHash() {
  const raw = window.location.hash.slice(1);
  if (!raw) return { view: "hub", sectionId: null };
  const [view, sectionId] = raw.split(":");
  if (view !== "hub" && !SECTION_VIEWS[view]) return { view: "hub", sectionId: null };
  return { view, sectionId: sectionId ?? null };
}

export default function HomePage() {
  const [view, setViewState] = useState(() => parseHash().view);
  const isHub = view === "hub";

  const setView = (nextView) => {
    setViewState(nextView);
    const hash = nextView === "hub" ? "" : `#${nextView}`;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
  };

  useEffect(() => {
    const { sectionId } = parseHash();
    if (!sectionId) return undefined;
    // Best-effort: give the view's CMS data time to fetch + mount, then scroll to it.
    const t = setTimeout(() => {
      document.getElementById(`cms-section-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onHashChange = () => setViewState(parseHash().view);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

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
      className="paper-canvas relative flex min-h-dvh flex-col bg-[var(--color-bg)]"
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

      <BroadcastManager view={view} />

      <div className={isHub ? "fixed inset-x-0 top-0 z-50" : "sticky top-0 z-50 shrink-0"}>
        <Header onLogoClick={() => setView("hub")} onNavigate={setView} activeView={view} />
      </div>

      <main
        id="main"
        className={
          isHub
            ? "relative z-10 flex flex-col items-stretch"
            : "relative z-10 flex-1 px-[clamp(12px,3vw,24px)] pt-2 pb-20"
        }
      >
        {isHub && (
          <>
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
            <HomeExtraSections />
          </>
        )}

        {Section && (
          <div className="m-view mx-auto flex w-[min(1120px,100%)] animate-[viewIn_0.45s_ease] flex-col justify-start gap-4">
            <Section />
          </div>
        )}
      </main>

      <QrJoinCard show={isHub} onNavigate={setView} />

      {/* <AboutSection/>
      <WisdomSection/>
      <MeditateSection/>
      <DonateSection/> */}
      <Footer view={view} onBack={() => setView("hub")} onNavigate={setView} />
    </div>
  );
}
