import { SECTION_CLASS, SUBHEADING_CLASS } from "../ui/sectionStyles";

/** Raw HTML block — the `custom_html` CMS section type, editable in the admin panel by super admins only. */
export default function CustomHtmlSection({ fields }) {
  if (!fields?.html) return null;

  return (
    <section className={`flex flex-col gap-6 ${SECTION_CLASS}`}>
      {fields.heading && <h3 className={SUBHEADING_CLASS}>{fields.heading}</h3>}
      <div dangerouslySetInnerHTML={{ __html: fields.html }} />
    </section>
  );
}
