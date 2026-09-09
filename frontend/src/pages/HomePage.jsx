import { useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import PageSections from "../components/sections/PageSections";
import { pathForView, viewForSlug } from "../lib/publicRoutes";

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
 * Public site. Each view is a real URL (/wisdom, /meditation, …) via the
 * ":slug" route param — shareable and refreshable. Legacy "#view" and
 * "#view:sectionId" links from the admin panel are redirected to the path.
 */
export default function HomePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const view = viewForSlug(slug);
  const isHub = view === "hub";
  const topBarRef = useRef(null);

  const setView = (nextView) => {
    if (nextView === view) return;
    navigate(pathForView(nextView));
    window.scrollTo({ top: 0 });
  };

  // Legacy hash links: "#wisdom" or "#wisdom:12"
  useEffect(() => {
    const raw = location.hash.slice(1);
    if (!raw) return undefined;
    const [hashView, sectionId] = raw.split(":");
    if (hashView && hashView !== view) {
      navigate(pathForView(hashView) + (sectionId ? `#${hashView}:${sectionId}` : ""), { replace: true });
      return undefined;
    }
    if (!sectionId) return undefined;
    const t = setTimeout(() => {
      const el = document.getElementById(`cms-section-${sectionId}`);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }, 700);
    return () => clearTimeout(t);
  }, [location.hash, view, navigate]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !isHub) setView("hub");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isHub]); // eslint-disable-line react-hooks/exhaustive-deps

  // On the hub the banner+header float (fixed); reserve their height in <main>.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!isHub) {
      root.style.setProperty("--gaw-topbar-h", "0px");
      return undefined;
    }
    const topBarEl = topBarRef.current;
    if (!topBarEl) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty("--gaw-topbar-h", `${entry.contentRect.height}px`);
    });
    observer.observe(topBarEl);
    return () => observer.disconnect();
  }, [isHub]);

  const Section = SECTION_VIEWS[view];
  const isCustomPage = !isHub && !Section;

  return (
    <div className="paper-canvas relative flex min-h-dvh flex-col bg-[var(--color-bg)]">
      <PageAtmosphere showFigure={isHub || Boolean(Section)} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-[var(--color-gold)] focus:px-[18px] focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[var(--color-on-gold)]"
      >
        Skip to content
      </a>

      <h1 className="sr-only">
        Golden Age Wisdom — free daily live meditation and Upanishadic wisdom, taught by Dr Hari Krishna, MD
      </h1>

      {isHub ? (
        <div ref={topBarRef} className="fixed inset-x-0 top-0 z-50 flex flex-col">
          <BroadcastManager view={view} />
          <Header onLogoClick={() => setView("hub")} onNavigate={setView} activeView={view} />
        </div>
      ) : (
        <>
          <BroadcastManager view={view} />
          <div className="sticky top-0 z-50 shrink-0">
            <Header onLogoClick={() => setView("hub")} onNavigate={setView} activeView={view} />
          </div>
        </>
      )}

      <main
        id="main"
        className={isHub ? "relative z-10 flex flex-col items-stretch" : "relative z-10 flex flex-1 flex-col"}
        style={isHub ? { paddingTop: "var(--gaw-topbar-h, 0px)" } : undefined}
      >
        {isHub && (
          <>
            <HeroSection
              onNavigate={setView}
              onWatchIntro={() => window.open("https://www.youtube.com/@GoldenAgeGurus", "_blank", "noopener,noreferrer")}
            />
            <HomeExtraSections />
          </>
        )}

        {Section && (
          <div className="m-view flex w-full animate-[viewIn_0.45s_ease] flex-col">
            <Section onNavigate={setView} />
          </div>
        )}

        {isCustomPage && (
          <div className="m-view mx-auto flex w-[min(1120px,100%)] animate-[viewIn_0.45s_ease] flex-col justify-start gap-4 px-[clamp(12px,3vw,24px)] pt-2 pb-20">
            <PageSections slug={slug} />
          </div>
        )}
      </main>

      <QrJoinCard show={isHub} onNavigate={setView} />
      <Footer view={view} onBack={() => setView("hub")} onNavigate={setView} />
    </div>
  );
}
