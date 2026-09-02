import { usePage } from "../../hooks/usePage";
import { renderSection } from "./renderSection";
import { sectionBand } from "../ui/sectionStyles";

/**
 * Renders every section of a page (in admin-defined order) by its CMS
 * type — the single generic entry point for the pages/page_sections/
 * section_content system. Whatever section types an admin adds to a page
 * via /admin/cms/pages/{slug} show up here automatically; no per-page,
 * per-type wiring needed. Home doesn't use this component directly (its hub
 * view renders its own bespoke chakra-mandala HeroSection for the *first*
 * hero section instead) — but it reuses the same renderSection() for any
 * *additional* sections placed after that first hero (see
 * HomeExtraSections.jsx), so a second `hero` section on Home renders as the
 * plain HeroBannerSection here, same as any other page.
 */
export default function PageSections({ slug, chakraId, chakra }) {
  const { page, loading } = usePage(slug);

  if (loading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl animate-pulse flex-col gap-5 px-4 py-12 sm:px-6 sm:py-16">
        <div className="h-5 w-28 rounded-full bg-[var(--color-bg-soft)]" />
        <div className="h-10 w-2/3 rounded-full bg-[var(--color-bg-soft)]" />
        <div className="h-4 w-full max-w-xl rounded-full bg-[var(--color-bg-soft)]" />
      </section>
    );
  }

  if (!page || !page.sections?.length) {
    return (
      <p className="mx-auto w-full max-w-5xl px-4 py-12 text-[14.5px] text-[var(--color-muted)] sm:px-6">
        This content isn't available right now.
      </p>
    );
  }

  const color = chakra?.color;

  // Band tone alternates over the sections that actually render — section
  // types that bail out (a content_block on a non-chakra page) must not
  // consume a position, or the stripes come out uneven.
  const rendered = page.sections
    .map((section) => ({ section, body: renderSection(section, { chakraId, chakra, color }) }))
    .filter(({ body }) => body);

  return (
    <>
      {rendered.map(({ section, body }, i) => (
        <div key={section.id} id={`cms-section-${section.id}`} className={sectionBand(i)}>
          {body}
        </div>
      ))}
    </>
  );
}
