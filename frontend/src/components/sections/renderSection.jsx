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
import HeroBannerSection from "./HeroBannerSection";

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
 * Renders one CMS section by its `type` — shared by PageSections.jsx (every
 * page's generic section list) and HomeExtraSections.jsx (sections on Home
 * beyond its bespoke first hero). `content_block` needs a `chakra` (color +
 * identity) to render at all — pages not mapped to one of the six chakras
 * (including Home) simply skip any content_block sections.
 */
export function renderSection(section, { chakraId, chakra, color } = {}) {
  switch (section.type) {
    case "hero":
      return <HeroBannerSection fields={section.fields} />;
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
