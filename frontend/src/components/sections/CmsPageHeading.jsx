import { useSectionFields } from "../../hooks/usePage";
import SectionHeading from "../ui/SectionHeading";

/**
 * SectionHeading backed by a page's `content_block` CMS section, for pages
 * that are a single form rather than the full chakra content layout
 * (Contact, Volunteer). Falls back to the given defaults while loading or
 * if the page has no CMS copy yet, so the form never renders headerless.
 */
export default function CmsPageHeading({ slug, color, fallbackEyebrow, fallbackTitle, fallbackDescription }) {
  const { fields } = useSectionFields(slug, "content_block");

  return (
    <SectionHeading
      eyebrow={fields?.eyebrow || fallbackEyebrow}
      title={fields?.heading || fallbackTitle}
      description={fields?.description || fallbackDescription}
      color={color}
    />
  );
}
