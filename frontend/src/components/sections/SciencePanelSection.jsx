import SectionHeading from "../ui/SectionHeading";
import { SECTION_CLASS } from "../ui/sectionStyles";

const DEFAULT_COLOR = "#A8B9A0";

/** "The science, simply" style explainer + optional techniques list — the `science_panel` CMS section type. */
export default function SciencePanelSection({ fields, color = DEFAULT_COLOR }) {
  if (!fields) return null;

  return (
    <section className={`flex flex-col gap-9 ${SECTION_CLASS}`}>
      <SectionHeading eyebrow={fields.eyebrow} title={fields.heading} color={color} />
      <p className="max-w-[64ch] text-[15.5px] leading-[1.75] text-[var(--color-ink-soft)]">{fields.body}</p>

      {(fields.recommend_heading || fields.recommend_body) && (
        <div
          className="flex max-w-[72ch] flex-col gap-2 rounded-2xl border px-7 py-6"
          style={{ borderColor: `${color}45`, background: `${color}0f` }}
        >
          {fields.recommend_heading && (
            <h4 className="font-body text-[15.5px] font-semibold text-[var(--color-ink)]">{fields.recommend_heading}</h4>
          )}
          {fields.recommend_body && (
            <p className="text-[14px] leading-[1.7] text-[var(--color-ink-soft)]">{fields.recommend_body}</p>
          )}
        </div>
      )}

      {fields.techniques?.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2.5">
            {fields.techniques.map((technique) => (
              <span
                key={technique}
                className="pill-sweep cursor-default rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-1.5 text-[13px] text-[var(--color-ink-soft)] transition-colors duration-300 hover:border-[rgba(198,161,91,0.5)] hover:text-[var(--color-gold-deep)]"
              >
                {technique}
              </span>
            ))}
          </div>
          {fields.techniques_note && (
            <p className="text-[13.5px] leading-[1.7] text-[var(--color-muted)]">{fields.techniques_note}</p>
          )}
        </div>
      )}

      {fields.body_note && (
        <p className="max-w-[64ch] text-[14px] leading-[1.7] text-[var(--color-muted)]">{fields.body_note}</p>
      )}
    </section>
  );
}
