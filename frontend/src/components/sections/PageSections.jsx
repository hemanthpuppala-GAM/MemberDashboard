import { usePage } from "../../hooks/usePage";
import { renderSection } from "./renderSection";
import { sectionBand } from "../ui/sectionStyles";

/**
 * Renders every section of a CMS page (admin-defined order) by its type —
 * the generic entry point for pages/page_sections/section_content.
 *
 * `silent`: used by the six live-content pages, which already render the
 * live-site copy themselves and append CMS sections *after* it. In silent
 * mode a missing/empty page renders nothing (no skeleton, no "not available"),
 * so the admin can extend a page without the page ever looking broken.
 */
export default function PageSections({ slug, chakraId, chakra, silent = false }) {
  const { page, loading } = usePage(slug);

  if (loading) {
    if (silent) return null;
    return (
      <section className="mx-auto flex w-full max-w-5xl animate-pulse flex-col gap-5 px-4 py-12 sm:px-6 sm:py-16">
        <div className="h-5 w-28 rounded-full bg-[var(--color-bg-soft)]" />
        <div className="h-10 w-2/3 rounded-full bg-[var(--color-bg-soft)]" />
        <div className="h-4 w-full max-w-xl rounded-full bg-[var(--color-bg-soft)]" />
      </section>
    );
  }

  if (!page || !page.sections?.length) {
    if (silent) return null;
    return (
      <p className="mx-auto w-full max-w-5xl px-4 py-12 text-[14.5px] text-[var(--color-muted)] sm:px-6">
        This content isn't available right now.
      </p>
    );
  }

  const color = chakra?.color;
  // Live pages render their own hero — skip a CMS `hero` there so there aren't two.
  const rendered = page.sections
    .filter((section) => !(silent && section.type === "hero"))
    .map((section) => ({ section, body: renderSection(section, { chakraId, chakra, color }) }))
    .filter(({ body }) => body);

  if (!rendered.length) return null;

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
