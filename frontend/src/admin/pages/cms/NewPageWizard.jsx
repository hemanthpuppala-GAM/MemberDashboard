import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Stepper from "../../ui/Stepper";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import { useAdminData } from "../../store/useAdminData";
import { SECTION_TYPES } from "../../mock/mockData";

const STEPS = [
  { key: "basics", label: "Basic info" },
  { key: "sections", label: "Add sections" },
  { key: "content", label: "Fill content" },
  { key: "review", label: "Review & publish" },
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewPageWizard() {
  const { addPage, addSection, updateSectionContent } = useAdminData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [basics, setBasics] = useState({ title: "", slug: "", metaDescription: "", status: "draft" });
  const [chosenSections, setChosenSections] = useState([]);
  const [draftContent, setDraftContent] = useState({});

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const toggleSection = (type) => {
    setChosenSections((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleCreate = () => {
    const page = addPage({ title: basics.title, slug: basics.slug || slugify(basics.title), status: basics.status, langCoverage: { en: 100 } });
    chosenSections.forEach((type, i) => {
      const section = addSection(page.id, { type, order: i + 1 });
      const draft = draftContent[type];
      if (draft) updateSectionContent(page.id, section.id, "en", draft);
    });
    toast.success(`"${basics.title}" created`);
    navigate(`/admin/cms/pages/${page.slug || slugify(basics.title)}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/cms/pages" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> All pages
      </Link>

      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">New page</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Set up a page in four quick steps.</p>
      </div>

      <Card>
        <Stepper steps={STEPS} activeIndex={step} />
      </Card>

      <Card>
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <Field label="Title" required>
              <TextInput
                value={basics.title}
                onChange={(e) => setBasics((b) => ({ ...b, title: e.target.value, slug: b.slug || slugify(e.target.value) }))}
                placeholder="e.g. The Seven Chakras — A Guide"
              />
            </Field>
            <Field label="Slug" hint="Used in the page URL" required>
              <TextInput value={basics.slug} onChange={(e) => setBasics((b) => ({ ...b, slug: slugify(e.target.value) }))} placeholder="seven-chakras-guide" />
            </Field>
            <Field label="Meta description" hint="Optional — shown in search results">
              <TextArea rows={2} value={basics.metaDescription} onChange={(e) => setBasics((b) => ({ ...b, metaDescription: e.target.value }))} />
            </Field>
            <Field label="Initial status">
              <Select value={basics.status} onChange={(e) => setBasics((b) => ({ ...b, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-[var(--a-text-muted)]">Choose the section types this page will contain — you can reorder and add more later.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SECTION_TYPES.map((t) => {
                const active = chosenSections.includes(t.type);
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => toggleSection(t.type)}
                    className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors ${
                      active ? "border-[var(--a-accent)] bg-[var(--a-accent-muted)]" : "border-[var(--a-border)] hover:border-[var(--a-accent)]"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? "border-[var(--a-accent)] bg-[var(--a-accent)] text-white" : "border-[var(--a-border)]"}`}>
                      {active && <Check size={11} />}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-[var(--a-text-primary)]">{t.label}</div>
                      <div className="mt-0.5 text-[12px] text-[var(--a-text-muted)]">{t.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            {chosenSections.length === 0 && <p className="text-[13.5px] text-[var(--a-text-muted)]">No sections chosen — go back and pick at least one, or skip and add sections later.</p>}
            {chosenSections.map((type) => {
              const meta = SECTION_TYPES.find((t) => t.type === type);
              const draft = draftContent[type] || {};
              const setField = (key) => (value) => setDraftContent((prev) => ({ ...prev, [type]: { ...prev[type], [key]: value } }));
              return (
                <div key={type} className="rounded-lg border border-[var(--a-border)] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded bg-[var(--a-accent-muted)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--a-accent)] uppercase">{meta.label}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Field label="Heading"><TextInput value={draft.heading ?? ""} onChange={(e) => setField("heading")(e.target.value)} /></Field>
                    {type !== "event_list" && (
                      <Field label="Description / eyebrow" hint="English only for now — add translations after creating the page">
                        <TextArea rows={2} value={draft.description ?? ""} onChange={(e) => setField("description")(e.target.value)} />
                      </Field>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-semibold text-[var(--a-text-primary)]">{basics.title || "Untitled page"}</h3>
                <StatusBadge status={basics.status} />
              </div>
              <p className="text-[13px] text-[var(--a-text-muted)]">/{basics.slug || slugify(basics.title)}</p>
              {basics.metaDescription && <p className="mt-2 text-[13px] text-[var(--a-text-muted)]">{basics.metaDescription}</p>}
            </div>
            <div>
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Sections ({chosenSections.length})</p>
              {chosenSections.length === 0 ? (
                <p className="text-[13px] text-[var(--a-text-muted)]">None — you can add sections after creating the page.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {chosenSections.map((type) => (
                    <li key={type} className="flex items-center gap-2 text-[13.5px] text-[var(--a-text-primary)]">
                      <Check size={14} className="text-[var(--a-success)]" />
                      {SECTION_TYPES.find((t) => t.type === type)?.label}
                      {draftContent[type]?.heading && <span className="text-[var(--a-text-muted)]">— {draftContent[type].heading}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button as="button" variant="secondary" onClick={back} disabled={step === 0}>Back</Button>
        {step < STEPS.length - 1 ? (
          <Button as="button" icon={ArrowRight} onClick={next} disabled={step === 0 && !basics.title}>Continue</Button>
        ) : (
          <Button as="button" icon={Plus} onClick={handleCreate} disabled={!basics.title}>Create page</Button>
        )}
      </div>
    </div>
  );
}
