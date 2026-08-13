import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import Card from "../components/ui/Card";
import Field, { TextInput, TextArea, Select } from "../components/ui/Field";
import Toggle from "../components/ui/Toggle";
import PointsEditor from "../components/ui/PointsEditor";
import Button from "../../components/ui/Button";

const LABELS = {
  about: "About Me",
  meditate: "Meditation",
  wellness: "Wellness",
  events: "Events (intro block)",
  mission: "Our Mission",
};

const EMPTY = {
  eyebrow: "",
  title: "",
  description: "",
  points: [],
  cta_label: "",
  cta_href: "",
  cta_variant: "",
  reverse: false,
  image_path: "",
};

export default function ContentEditPage() {
  const { slug } = useParams();
  // Remount the form whenever the slug changes so each page's state starts fresh.
  return <ContentEditForm key={slug} slug={slug} />;
}

function ContentEditForm({ slug }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api
      .content()
      .then((all) => {
        const block = all[slug];
        setForm(block ? { ...EMPTY, ...block, points: block.points ?? [] } : EMPTY);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const saved = await api.updateContent(slug, form);
      setForm({ ...EMPTY, ...saved, points: saved.points ?? [] });
      setSavedAt(new Date());
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-[13.5px] text-[var(--color-muted)]">Loading…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[26px] text-[var(--color-ink)]">{LABELS[slug] ?? slug}</h1>
        <p className="mt-1 text-[13.5px] text-[var(--color-muted)]">
          Edits appear on the public site immediately after saving.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-5">
          <Field label="Eyebrow" error={errors.eyebrow?.[0]}>
            <TextInput value={form.eyebrow} onChange={(e) => set("eyebrow")(e.target.value)} required />
          </Field>

          <Field label="Title" error={errors.title?.[0]}>
            <TextInput value={form.title} onChange={(e) => set("title")(e.target.value)} required />
          </Field>

          <Field label="Description" error={errors.description?.[0]}>
            <TextArea rows={4} value={form.description} onChange={(e) => set("description")(e.target.value)} required />
          </Field>

          <Field label="Bullet points" error={errors["points.0"]?.[0]}>
            <PointsEditor points={form.points} onChange={set("points")} />
          </Field>
        </div>
      </Card>

      <Card title="Call to action" description="Optional button shown under the bullet points.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Button label" error={errors.cta_label?.[0]}>
            <TextInput value={form.cta_label ?? ""} onChange={(e) => set("cta_label")(e.target.value)} />
          </Field>
          <Field label="Button link" error={errors.cta_href?.[0]}>
            <TextInput value={form.cta_href ?? ""} onChange={(e) => set("cta_href")(e.target.value)} placeholder="#meditate-now" />
          </Field>
          <Field label="Style" error={errors.cta_variant?.[0]}>
            <Select value={form.cta_variant ?? ""} onChange={(e) => set("cta_variant")(e.target.value)}>
              <option value="">None</option>
              <option value="primary">Primary (gold)</option>
              <option value="secondary">Secondary (outline)</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card title="Layout">
        <Toggle
          checked={form.reverse}
          onChange={set("reverse")}
          label="Reverse layout (image on the left)"
        />
      </Card>

      <div className="flex items-center gap-4">
        <Button as="button" type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {savedAt && (
          <span className="text-[12.5px] text-[var(--color-gold-live,#5DB875)]">
            Saved at {savedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </form>
  );
}
