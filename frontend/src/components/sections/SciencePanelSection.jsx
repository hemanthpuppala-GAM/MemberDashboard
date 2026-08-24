import SectionHeading from "../ui/SectionHeading";

const DEFAULT_COLOR = "#6EC6EA";

/** "The science, simply" style explainer + optional techniques list — the `science_panel` CMS section type. */
export default function SciencePanelSection({ fields, color = DEFAULT_COLOR }) {
  if (!fields) return null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-2 py-6 sm:px-4">
      <SectionHeading eyebrow={fields.eyebrow} title={fields.heading} color={color} />
      <p className="max-w-3xl text-[14.5px] leading-relaxed text-[var(--color-muted)]">{fields.body}</p>

      {(fields.recommend_heading || fields.recommend_body) && (
        <div
          className="flex flex-col gap-2 rounded-2xl border px-6 py-5"
          style={{ borderColor: `${color}55`, background: `${color}0d` }}
        >
          {fields.recommend_heading && (
            <h4 className="font-body text-[15px] font-medium text-[var(--color-ink)]">{fields.recommend_heading}</h4>
          )}
          {fields.recommend_body && (
            <p className="text-[13.5px] leading-relaxed text-[var(--color-muted)]">{fields.recommend_body}</p>
          )}
        </div>
      )}

      {fields.techniques?.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {fields.techniques.map((technique) => (
              <span
                key={technique}
                className="rounded-full border border-[rgba(110,198,234,0.35)] px-3 py-1 text-[12.5px] text-[var(--color-muted)]"
              >
                {technique}
              </span>
            ))}
          </div>
          {fields.techniques_note && (
            <p className="text-[13px] leading-relaxed text-[var(--color-muted-soft)]">{fields.techniques_note}</p>
          )}
        </div>
      )}

      {fields.body_note && (
        <p className="max-w-3xl text-[13.5px] leading-relaxed text-[var(--color-muted)]">{fields.body_note}</p>
      )}
    </section>
  );
}
