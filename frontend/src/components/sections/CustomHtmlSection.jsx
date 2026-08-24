/** Raw HTML block — the `custom_html` CMS section type, editable in the admin panel by super admins only. */
export default function CustomHtmlSection({ fields }) {
  if (!fields?.html) return null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4 px-2 py-6 sm:px-4">
      {fields.heading && (
        <h3 className="text-xl font-medium text-[var(--color-ink)]">{fields.heading}</h3>
      )}
      <div dangerouslySetInnerHTML={{ __html: fields.html }} />
    </section>
  );
}
