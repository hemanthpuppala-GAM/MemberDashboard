import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import WisdomSection from "../components/sections/WisdomSection";
import WellnessSection from "../components/sections/WellnessSection";
import MeditateSection from "../components/sections/MeditateSection";
import EventsSection from "../components/sections/EventsSection";
import MissionSection from "../components/sections/MissionSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <WisdomSection />
        <WellnessSection />
        <MeditateSection />
        <EventsSection />
        <MissionSection />
      </main>
      <Footer />
    </div>
  );
}
