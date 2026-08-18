import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Image as ImageIcon, Plus, X } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Field, { TextInput, TextArea } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import PointsEditor from "../../ui/PointsEditor";
import LangTabs from "../../ui/LangTabs";
import RichTextEditor from "../../ui/RichTextEditor";
import { api } from "../../../lib/api";
import { SECTION_TYPES } from "../../mock/mockData";
import { contentArrayToByLang, FLAG_BY_CODE } from "./sectionContentUtil";

const QUERY_CATEGORIES = ["meditation", "kundalini", "health", "general"];

const REQUIRED_FIELDS = {
  hero: ["heading"],
  content_block: ["heading", "description"],
  card_grid: ["heading"],
  event_list: ["heading"],
  contact_form: ["heading"],
  media_embed: ["heading"],
  custom_html: ["heading"],
};

function isMissing(sectionType, contentByLang, code) {
  const required = REQUIRED_FIELDS[sectionType] || [];
  const content = contentByLang[code] || {};
  return required.some((f) => !content[f]);
}

export default function SectionEditorPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [section, setSection] = useState(null);
  const [contentByLang, setContentByLang] = useState({});
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeLang, setActiveLang] = useState("en");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the spinner when navigating between sections via route params
    setLoading(true);
    Promise.all([api.page(slug), api.languages()])
      .then(([p, langs]) => {
        const sec = p.sections.find((s) => String(s.id) === String(id));
        setPage(p);
        setSection(sec ?? null);
        setContentByLang(sec ? contentArrayToByLang(sec.content) : {});
        const enabled = langs.filter((l) => l.is_enabled);
        setLanguages(enabled);
        setActiveLang(enabled.find((l) => l.is_default)?.code ?? enabled[0]?.code ?? "en");
      })
      .catch((err) => toast.error(err.message ?? "Failed to load section"))
      .finally(() => setLoading(false));
  }, [slug, id]);

  const enabledLanguages = useMemo(
    () => languages.map((l) => ({ code: l.code, name: l.name, flag: FLAG_BY_CODE[l.code] ?? "🌐" })),
    [languages]
  );

  const incomplete = useMemo(() => {
    if (!section) return new Set();
    return new Set(enabledLanguages.filter((l) => isMissing(section.type, contentByLang, l.code)).map((l) => l.code));
  }, [section, contentByLang, enabledLanguages]);

  if (loading) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  }

  if (!page || !section) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-[14px] text-[var(--a-text-muted)]">Section not found.</p>
        <Button as="button" variant="secondary" onClick={() => navigate(`/admin/cms/pages/${slug}`)}>Back to page</Button>
      </div>
    );
  }

  const meta = SECTION_TYPES.find((t) => t.type === section.type);
  const content = contentByLang[activeLang] || {};
  const set = (key) => (value) =>
    setContentByLang((prev) => ({ ...prev, [activeLang]: { ...prev[activeLang], [key]: value } }));

  const handleSave = async (publish) => {
    setSaving(true);
    try {
      await api.updateSectionContent(section.id, contentByLang);
      if (publish && section.status !== "active") {
        await api.updateSection(slug, section.id, { type: section.type, status: "active" });
        setSection((s) => ({ ...s, status: "active" }));
      }
      setSavedAt(new Date());
      toast.success(publish ? "Section published" : "Draft saved");
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to={`/admin/cms/pages/${page.slug}`} className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> {page.title}
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-[var(--a-accent-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--a-accent)] uppercase">{meta?.label}</span>
        </div>
        <h1 className="mt-1.5 text-[24px] font-bold text-[var(--a-text-primary)]">Edit section</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">{meta?.description}</p>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <LangTabs languages={enabledLanguages} active={activeLang} onChange={setActiveLang} incomplete={incomplete} />
        </div>
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <SectionFields type={section.type} content={content} set={set} />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button as="button" variant="secondary" onClick={() => handleSave(false)} disabled={saving}>Save draft</Button>
        <Button as="button" onClick={() => handleSave(true)} disabled={saving}>Publish</Button>
        {savedAt && <span className="text-[12.5px] font-medium text-[var(--a-success)]">Saved at {savedAt.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}

function SectionFields({ type, content, set }) {
  switch (type) {
    case "hero":
      return (
        <>
          <Field label="Eyebrow"><TextInput value={content.eyebrow ?? ""} onChange={(e) => set("eyebrow")(e.target.value)} /></Field>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <Field label="Subheading"><TextInput value={content.subheading ?? ""} onChange={(e) => set("subheading")(e.target.value)} /></Field>
          <Field label="Body text"><TextArea rows={3} value={content.description ?? ""} onChange={(e) => set("description")(e.target.value)} /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="CTA label"><TextInput value={content.cta_label ?? ""} onChange={(e) => set("cta_label")(e.target.value)} /></Field>
            <Field label="CTA link"><TextInput value={content.cta_href ?? ""} onChange={(e) => set("cta_href")(e.target.value)} /></Field>
          </div>
          <ImageField value={content.image} onChange={set("image")} label="Background image" />
        </>
      );
    case "content_block":
      return (
        <>
          <Field label="Eyebrow"><TextInput value={content.eyebrow ?? ""} onChange={(e) => set("eyebrow")(e.target.value)} /></Field>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <Field label="Description" required>
            <RichTextEditor value={content.description ?? ""} onChange={set("description")} />
          </Field>
          <Field label="Bullet points"><PointsEditor points={content.points ?? []} onChange={set("points")} /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="CTA label" hint="Optional"><TextInput value={content.cta_label ?? ""} onChange={(e) => set("cta_label")(e.target.value)} /></Field>
            <Field label="CTA link" hint="Optional"><TextInput value={content.cta_href ?? ""} onChange={(e) => set("cta_href")(e.target.value)} /></Field>
          </div>
          <ImageField value={content.image} onChange={set("image")} />
          <Toggle checked={!!content.reverse} onChange={set("reverse")} label="Reverse layout" description="Show the image on the left instead of the right" />
        </>
      );
    case "card_grid":
      return (
        <>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <CardsEditor cards={content.cards ?? []} onChange={set("cards")} />
        </>
      );
    case "event_list":
      return (
        <>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <p className="text-[12.5px] text-[var(--a-text-muted)]">This section auto-renders published events from the Events table.</p>
        </>
      );
    case "contact_form":
      return (
        <>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <Field label="Subheading"><TextArea rows={2} value={content.description ?? ""} onChange={(e) => set("description")(e.target.value)} /></Field>
          <Field label="Categories shown on the form">
            <div className="flex flex-wrap gap-2">
              {QUERY_CATEGORIES.map((c) => {
                const active = (content.categories ?? QUERY_CATEGORIES).includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      const current = content.categories ?? QUERY_CATEGORIES;
                      set("categories")(active ? current.filter((x) => x !== c) : [...current, c]);
                    }}
                    className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
                      active ? "bg-[var(--a-accent)] text-white" : "bg-[var(--a-bg-surface-2)] text-[var(--a-text-muted)]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Field>
        </>
      );
    case "media_embed":
      return (
        <>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <Field label="Video URL" hint="Leave blank to use an image instead"><TextInput value={content.video_url ?? ""} onChange={(e) => set("video_url")(e.target.value)} placeholder="https://youtube.com/watch?v=..." /></Field>
          <ImageField value={content.image} onChange={set("image")} />
        </>
      );
    case "custom_html":
      return (
        <>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <Field label="Raw HTML" hint="Super admin only">
            <TextArea rows={8} className="font-mono!" value={content.html ?? ""} onChange={(e) => set("html")(e.target.value)} placeholder="<div>...</div>" />
          </Field>
        </>
      );
    default:
      return null;
  }
}

function ImageField({ value, onChange, label = "Image" }) {
  return (
    <Field label={label} hint="Paste a URL or pick from Media Library">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-surface-2)]">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={18} className="text-[var(--a-text-faint)]" />}
        </div>
        <TextInput value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
        <Link to="/admin/cms/media" className="shrink-0 text-[12.5px] font-semibold whitespace-nowrap text-[var(--a-accent)] hover:underline">
          Browse
        </Link>
      </div>
    </Field>
  );
}

function CardsEditor({ cards, onChange }) {
  const update = (i, patch) => onChange(cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i) => onChange(cards.filter((_, idx) => idx !== i));
  const add = () => onChange([...cards, { title: "", body: "" }]);

  return (
    <Field label="Cards">
      <div className="flex flex-col gap-3">
        {cards.map((card, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-[var(--a-border)] p-3">
            <div className="flex-1 space-y-2">
              <TextInput value={card.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} placeholder="Card title" />
              <TextArea rows={2} value={card.body ?? ""} onChange={(e) => update(i, { body: e.target.value })} placeholder="Card body" />
            </div>
            <button type="button" onClick={() => remove(i)} className="shrink-0 rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-danger-muted)] hover:text-[var(--a-danger)]">
              <X size={14} />
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="flex w-fit items-center gap-1 rounded-full border border-dashed border-[var(--a-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--a-accent)] hover:bg-[var(--a-accent-muted)]">
          <Plus size={13} /> Add card
        </button>
      </div>
    </Field>
  );
}
