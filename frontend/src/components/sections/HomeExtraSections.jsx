import { usePage } from "../../hooks/usePage";
import { renderSection } from "./renderSection";
import { sectionBand } from "../ui/sectionStyles";

/**
 * Renders any Home-page sections beyond the first `hero` one — that first
 * hero is rendered separately by HeroSection.jsx's bespoke chakra-mandala
 * layout, so it's excluded here to avoid rendering it twice. Everything
 * else (a second hero, content_block, card_grid, etc.) renders the same
 * way it would on any other page, in admin-defined order, below the hero.
 */
export default function HomeExtraSections() {
  const { page } = usePage("home");
  const sections = page?.sections ?? [];
  const heroSectionId = sections.find((s) => s.type === "hero")?.id;
  const extraSections = sections.filter((s) => s.id !== heroSectionId);

  const rendered = extraSections
    .map((section) => ({ section, body: renderSection(section) }))
    .filter(({ body }) => body);

  return (
    <>
      {rendered.map(({ section, body }, i) => (
        <div
          key={section.id}
          id={`cms-section-${section.id}`}
          className={`mx-auto w-[min(1120px,calc(100%-32px))] ${sectionBand(i)}`}
        >
          {body}
        </div>
      ))}
    </>
  );
}
