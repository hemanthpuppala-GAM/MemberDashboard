import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, X } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import PointsEditor from "../../ui/PointsEditor";
import LangTabs from "../../ui/LangTabs";
import RichTextEditor from "../../ui/RichTextEditor";
import MediaPickerModal from "../../ui/MediaPickerModal";
import ImageField from "../../ui/ImageField";
import RangeField from "../../ui/RangeField";
import { api } from "../../../lib/api";
import { SECTION_TYPES, MEDIA_FOLDERS } from "../../mock/mockData";
import { contentArrayToByLang, FLAG_BY_CODE } from "./sectionContentUtil";
import { ANIMATIONS } from "../../../components/ui/animations";
import { usePermissions } from "../../usePermissions";

const QUERY_CATEGORIES = ["meditation", "kundalini", "health", "general"];

const POSITIONS = [
  { value: "left", label: "Image left, text right" },
  { value: "right", label: "Image right, text left" },
  { value: "top", label: "Image above text" },
  { value: "bottom", label: "Image below text" },
  { value: "center", label: "Image centered" },
];

const SHAPES = [
  { value: "rectangle", label: "Rectangle" },
  { value: "circle", label: "Circle" },
  { value: "vertical", label: "Vertical (portrait)" },
];

const REQUIRED_FIELDS = {
  hero: ["heading"],
  content_block: ["heading", "description"],
  card_grid: ["heading"],
  event_list: ["heading"],
  contact_form: ["heading"],
  media_embed: ["heading"],
  custom_html: ["heading"],
  quick_answers: ["heading"],
  science_panel: ["heading", "body"],
  deep_cards: ["seasoned_label"],
  mission_cosmology: ["intro"],
};

function isMissing(sectionType, contentByLang, code) {
  const required = REQUIRED_FIELDS[sectionType] || [];
  const content = contentByLang[code] || {};
  return required.some((f) => !content[f]);
}

export default function SectionEditorPage() {
  const { can } = usePermissions();
  const canEdit = can("cms.edit");

  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [section, setSection] = useState(null);
  const [contentByLang, setContentByLang] = useState({});
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerCallback, setPickerCallback] = useState(null);

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

  const mediaFolder = MEDIA_FOLDERS.find((f) => f.toLowerCase() === page?.slug?.toLowerCase()) ?? "General";
  const openPicker = (onSelect) => setPickerCallback(() => onSelect);

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
          <SectionFields type={section.type} content={content} set={set} openPicker={openPicker} />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button
          as="button"
          variant="secondary"
          onClick={() => handleSave(false)}
          disabled={saving || !canEdit}
          title={canEdit ? undefined : "You don't have permission to edit sections"}
        >
          Save draft
        </Button>
        <Button
          as="button"
          onClick={() => handleSave(true)}
          disabled={saving || !canEdit}
          title={canEdit ? undefined : "You don't have permission to edit sections"}
        >
          Publish
        </Button>
        {savedAt && <span className="text-[12.5px] font-medium text-[var(--a-success)]">Saved at {savedAt.toLocaleTimeString()}</span>}
      </div>

      <MediaPickerModal
        open={!!pickerCallback}
        onClose={() => setPickerCallback(null)}
        onSelect={(url) => pickerCallback?.(url)}
        initialFolder={mediaFolder}
      />
    </div>
  );
}

function SectionFields({ type, content, set, openPicker }) {
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
          <ImageField value={content.image} onChange={set("image")} onPick={() => openPicker(set("image"))} label="Background image (desktop)" />
          <ImageField
            value={content.image_mobile}
            onChange={set("image_mobile")}
            onPick={() => openPicker(set("image_mobile"))}
            label="Background image (mobile)"
            hint="Optional — falls back to the desktop image if left empty. Use a portrait crop so the subject stays visible on small screens."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <RangeField
              label="Chakra wheel — horizontal position"
              hint="Desktop only — mobile keeps the wheel centered below the copy"
              value={content.mandala_x ?? 64}
              onChange={set("mandala_x")}
            />
            <RangeField
              label="Chakra wheel — vertical position"
              hint="Desktop only"
              value={content.mandala_y ?? 62}
              onChange={set("mandala_y")}
            />
          </div>
          <RangeField
            label="Chakra wheel — circle size"
            hint="How far the orbiting icons sit from the center. Desktop only."
            value={content.mandala_radius ?? 148}
            onChange={set("mandala_radius")}
            min={80}
            max={220}
            unit="px"
          />
          <LayoutFields showPosition={false} showShape={false} animation={content.animation} onAnimationChange={set("animation")} />
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
          <ImageField value={content.image} onChange={set("image")} onPick={() => openPicker(set("image"))} />
          <LayoutFields
            position={content.image_position ?? (content.reverse ? "left" : "right")}
            onPositionChange={set("image_position")}
            shape={content.image_shape}
            onShapeChange={set("image_shape")}
            animation={content.animation}
            onAnimationChange={set("animation")}
          />
        </>
      );
    case "card_grid":
      return (
        <>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <LayoutFields showPosition={false} showShape={false} animation={content.animation} onAnimationChange={set("animation")} />
          <CardsEditor cards={content.cards ?? []} onChange={set("cards")} openPicker={openPicker} />
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
          <ImageField value={content.image} onChange={set("image")} onPick={() => openPicker(set("image"))} />
          <LayoutFields
            showPosition={false}
            shape={content.image_shape}
            onShapeChange={set("image_shape")}
            animation={content.animation}
            onAnimationChange={set("animation")}
          />
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
    case "quick_answers":
      return (
        <>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <LayoutFields showPosition={false} showShape={false} animation={content.animation} onAnimationChange={set("animation")} />
          <ItemsEditor
            label="Answers"
            items={content.items ?? []}
            onChange={set("items")}
            fields={[
              { key: "label", placeholder: "Label, e.g. \"Best time\"" },
              { key: "title", placeholder: "Short answer, e.g. \"Sunrise\"" },
              { key: "body", placeholder: "Explanation", multiline: true },
            ]}
            blank={{ label: "", title: "", body: "" }}
            withImage
            openPicker={openPicker}
          />
        </>
      );
    case "science_panel":
      return (
        <>
          <Field label="Eyebrow"><TextInput value={content.eyebrow ?? ""} onChange={(e) => set("eyebrow")(e.target.value)} /></Field>
          <Field label="Heading" required><TextInput value={content.heading ?? ""} onChange={(e) => set("heading")(e.target.value)} /></Field>
          <Field label="Body" required><TextArea rows={4} value={content.body ?? ""} onChange={(e) => set("body")(e.target.value)} /></Field>
          <Field label="Recommendation heading"><TextInput value={content.recommend_heading ?? ""} onChange={(e) => set("recommend_heading")(e.target.value)} /></Field>
          <Field label="Recommendation body"><TextArea rows={3} value={content.recommend_body ?? ""} onChange={(e) => set("recommend_body")(e.target.value)} /></Field>
          <Field label="Other techniques" hint="Short list, e.g. Soham, Kumbhaka"><PointsEditor points={content.techniques ?? []} onChange={set("techniques")} /></Field>
          <Field label="Techniques note"><TextArea rows={2} value={content.techniques_note ?? ""} onChange={(e) => set("techniques_note")(e.target.value)} /></Field>
          <Field label="Closing note"><TextArea rows={2} value={content.body_note ?? ""} onChange={(e) => set("body_note")(e.target.value)} /></Field>
          <LayoutFields showPosition={false} showShape={false} animation={content.animation} onAnimationChange={set("animation")} />
        </>
      );
    case "deep_cards":
      return (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={'"New to this" label'}><TextInput value={content.new_label ?? ""} onChange={(e) => set("new_label")(e.target.value)} /></Field>
            <Field label={'"Seasoned" label'} required><TextInput value={content.seasoned_label ?? ""} onChange={(e) => set("seasoned_label")(e.target.value)} /></Field>
          </div>
          <Field label={'"New to this" body'}><TextArea rows={2} value={content.new_body ?? ""} onChange={(e) => set("new_body")(e.target.value)} /></Field>
          <ItemsEditor
            label="Deeper cards (shown to seasoned meditators)"
            items={content.items ?? []}
            onChange={set("items")}
            fields={[
              { key: "icon", placeholder: "Glyph, e.g. ✦" },
              { key: "title", placeholder: "Card title" },
              { key: "body", placeholder: "Card body", multiline: true },
            ]}
            blank={{ icon: "", title: "", body: "" }}
            withImage
            openPicker={openPicker}
          />
          <Field label="Footer note"><TextArea rows={2} value={content.footer_note ?? ""} onChange={(e) => set("footer_note")(e.target.value)} /></Field>
        </>
      );
    case "mission_cosmology":
      return (
        <>
          <Field label="Eyebrow"><TextInput value={content.eyebrow ?? ""} onChange={(e) => set("eyebrow")(e.target.value)} /></Field>
          <Field label="Intro" required><TextArea rows={3} value={content.intro ?? ""} onChange={(e) => set("intro")(e.target.value)} /></Field>
          <ItemsEditor
            label="Yuga cycle"
            items={content.yugas ?? []}
            onChange={set("yugas")}
            fields={[
              { key: "name", placeholder: "Name, e.g. Satya" },
              { key: "label", placeholder: "Label, e.g. The Golden Age" },
              { key: "description", placeholder: "Description", multiline: true },
              { key: "active", placeholder: "Where we are now", checkbox: true },
            ]}
            blank={{ name: "", label: "", description: "", active: false }}
            withImage
            openPicker={openPicker}
          />
          <Field label="Outro"><TextArea rows={3} value={content.outro ?? ""} onChange={(e) => set("outro")(e.target.value)} /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Goal percent" hint="e.g. 8%"><TextInput value={content.goal_percent ?? ""} onChange={(e) => set("goal_percent")(e.target.value)} /></Field>
            <Field label="Goal caption"><TextInput value={content.goal_caption ?? ""} onChange={(e) => set("goal_caption")(e.target.value)} /></Field>
          </div>
          <Field label="Goal label"><TextArea rows={2} value={content.goal_label ?? ""} onChange={(e) => set("goal_label")(e.target.value)} /></Field>
          <LayoutFields showPosition={false} showShape={false} animation={content.animation} onAnimationChange={set("animation")} />
        </>
      );
    default:
      return null;
  }
}

/** Shared image-position + shape + reveal-animation controls, reused at section level and per card/item. */
function LayoutFields({
  position, onPositionChange,
  shape, onShapeChange,
  animation, onAnimationChange,
  showPosition = true, showShape = true,
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {showPosition && (
        <Field label="Image position" hint="Where the image sits relative to the text">
          <Select value={position ?? "left"} onChange={(e) => onPositionChange(e.target.value)}>
            {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </Field>
      )}
      {showShape && (
        <Field label="Image shape">
          <Select value={shape ?? "rectangle"} onChange={(e) => onShapeChange(e.target.value)}>
            {SHAPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </Field>
      )}
      <Field label="Animation" hint="Plays once as this scrolls into view">
        <Select value={animation ?? "fade"} onChange={(e) => onAnimationChange(e.target.value)}>
          {ANIMATIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </Select>
      </Field>
    </div>
  );
}

/** Editable list of objects with a configurable set of text/textarea/checkbox fields, plus an optional per-item image + position + animation — used by quick_answers, deep_cards, mission_cosmology. */
function ItemsEditor({ label, items, onChange, fields, blank, withImage = false, openPicker }) {
  const update = (i, patch) => onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, blank]);

  return (
    <Field label={label}>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg border border-[var(--a-border)] p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                {fields.map((f) =>
                  f.checkbox ? (
                    <Toggle key={f.key} checked={!!item[f.key]} onChange={(v) => update(i, { [f.key]: v })} label={f.placeholder} />
                  ) : f.multiline ? (
                    <TextArea key={f.key} rows={2} value={item[f.key] ?? ""} onChange={(e) => update(i, { [f.key]: e.target.value })} placeholder={f.placeholder} />
                  ) : (
                    <TextInput key={f.key} value={item[f.key] ?? ""} onChange={(e) => update(i, { [f.key]: e.target.value })} placeholder={f.placeholder} />
                  )
                )}
              </div>
              <button type="button" onClick={() => remove(i)} className="shrink-0 rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-danger-muted)] hover:text-[var(--a-danger)]">
                <X size={14} />
              </button>
            </div>
            {withImage && (
              <div className="flex flex-col gap-3 border-t border-[var(--a-border)] pt-3">
                <ImageField value={item.image} onChange={(v) => update(i, { image: v })} onPick={() => openPicker((v) => update(i, { image: v }))} label="Image (optional)" />
                <LayoutFields
                  position={item.image_position ?? "top"}
                  onPositionChange={(v) => update(i, { image_position: v })}
                  shape={item.image_shape}
                  onShapeChange={(v) => update(i, { image_shape: v })}
                  animation={item.animation}
                  onAnimationChange={(v) => update(i, { animation: v })}
                />
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={add} className="flex w-fit items-center gap-1 rounded-full border border-dashed border-[var(--a-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--a-accent)] hover:bg-[var(--a-accent-muted)]">
          <Plus size={13} /> Add item
        </button>
      </div>
    </Field>
  );
}

function CardsEditor({ cards, onChange, openPicker }) {
  const update = (i, patch) => onChange(cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i) => onChange(cards.filter((_, idx) => idx !== i));
  const add = () => onChange([...cards, { icon: "", title: "", body: "" }]);

  return (
    <Field label="Cards">
      <div className="flex flex-col gap-3">
        {cards.map((card, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg border border-[var(--a-border)] p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <TextInput value={card.icon ?? ""} onChange={(e) => update(i, { icon: e.target.value })} placeholder="Icon (emoji)" className="w-20 shrink-0" />
                  <TextInput value={card.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} placeholder="Card title" />
                </div>
                <TextArea rows={2} value={card.body ?? ""} onChange={(e) => update(i, { body: e.target.value })} placeholder="Card body" />
              </div>
              <button type="button" onClick={() => remove(i)} className="shrink-0 rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-danger-muted)] hover:text-[var(--a-danger)]">
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-3 border-t border-[var(--a-border)] pt-3">
              <ImageField value={card.image} onChange={(v) => update(i, { image: v })} onPick={() => openPicker((v) => update(i, { image: v }))} label="Card image (optional)" />
              <LayoutFields
                position={card.image_position ?? "top"}
                onPositionChange={(v) => update(i, { image_position: v })}
                shape={card.image_shape}
                onShapeChange={(v) => update(i, { image_shape: v })}
                animation={card.animation}
                onAnimationChange={(v) => update(i, { animation: v })}
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="flex w-fit items-center gap-1 rounded-full border border-dashed border-[var(--a-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--a-accent)] hover:bg-[var(--a-accent-muted)]">
          <Plus size={13} /> Add card
        </button>
      </div>
    </Field>
  );
}
