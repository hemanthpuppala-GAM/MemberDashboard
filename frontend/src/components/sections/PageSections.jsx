import { usePage } from "../../hooks/usePage";
import ChakraContentSection from "./ChakraContentSection";
import CardGridSection from "./CardGridSection";
import QuickAnswersSection from "./QuickAnswersSection";
import SciencePanelSection from "./SciencePanelSection";
import DeepCardsSection from "./DeepCardsSection";
import MissionCosmologySection from "./MissionCosmologySection";
import EventListSection from "./EventListSection";
import MediaEmbedSection from "./MediaEmbedSection";
import CustomHtmlSection from "./CustomHtmlSection";
import ContactFormSection from "./ContactFormSection";

function toContentBlockProps(fields) {
  return {
    eyebrow: fields.eyebrow,
    title: fields.heading,
    description: fields.description,
    points: fields.points ?? [],
    cta: fields.cta_label && fields.cta_href ? { label: fields.cta_label, href: fields.cta_href } : undefined,
    position: fields.image_position || (fields.reverse ? "left" : "right"),
    shape: fields.image_shape,
    animation: fields.animation,
    image: fields.image || undefined,
  };
}

/**
 * Renders every section of a page (in admin-defined order) by its CMS
 * type — the single generic entry point for the pages/page_sections/
 * section_content system. Whatever section types an admin adds to a page
 * via /admin/cms/pages/{slug} show up here automatically; no per-page,
 * per-type wiring needed. `hero` is intentionally not handled here — it's
 * rendered directly by HomePage's full-bleed layout for the 'home' page only.
 */
export default function PageSections({ slug, chakraId, chakra }) {
  const { page, loading } = usePage(slug);

  if (loading) {
    return (
      <section className="mx-auto flex max-w-5xl animate-pulse flex-col gap-6 px-2 py-6 sm:px-4">
        <div className="h-4 w-24 rounded-full bg-[var(--color-surface)]" />
        <div className="h-8 w-2/3 rounded-full bg-[var(--color-surface)]" />
        <div className="h-4 w-full rounded-full bg-[var(--color-surface)]" />
      </section>
    );
  }

  if (!page || !page.sections?.length) {
    return (
      <p className="mx-auto max-w-5xl px-2 py-6 text-sm text-[var(--color-muted)] sm:px-4">
        This content isn't available right now.
      </p>
    );
  }

  const color = chakra?.color;

  return (
    <>
      {page.sections.map((section) => {
        const body = renderSection(section, { chakraId, chakra, color });
        if (!body) return null;
        return (
          <div key={section.id} id={`cms-section-${section.id}`}>
            {body}
          </div>
        );
      })}
    </>
  );
}

function renderSection(section, { chakraId, chakra, color }) {
  switch (section.type) {
    case "content_block":
      return chakra ? (
        <ChakraContentSection chakraId={chakraId} chakra={chakra} {...toContentBlockProps(section.fields)} />
      ) : null;
    case "card_grid":
      return <CardGridSection fields={section.fields} color={color} />;
    case "quick_answers":
      return <QuickAnswersSection fields={section.fields} />;
    case "science_panel":
      return <SciencePanelSection fields={section.fields} color={color} />;
    case "deep_cards":
      return <DeepCardsSection fields={section.fields} color={color} />;
    case "mission_cosmology":
      return <MissionCosmologySection fields={section.fields} color={color} />;
    case "event_list":
      return <EventListSection fields={section.fields} />;
    case "media_embed":
      return <MediaEmbedSection fields={section.fields} />;
    case "custom_html":
      return <CustomHtmlSection fields={section.fields} />;
    case "contact_form":
      return <ContactFormSection fields={section.fields} color={color} />;
    default:
      return null;
  }
}
