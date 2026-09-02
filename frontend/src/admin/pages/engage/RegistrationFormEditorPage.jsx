import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Copy, Users } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";
import { registrationFormPublicUrl } from "./registrationFormUtils";

const FIELD_TYPES = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone number" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown (choose one)" },
  { value: "radio", label: "Radio buttons (choose one)" },
  { value: "checkbox", label: "Checkbox (yes / no)" },
];

const CHOICE_TYPES = ["select", "radio"];

function slugifyKey(label, existingKeys) {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
  let key = base;
  let i = 2;
  while (existingKeys.includes(key)) key = `${base}_${i++}`;
  return key;
}

/** URL slug (dashes) — distinct from slugifyKey (underscores), which is for the JS/DB field identifiers. */
function slugifyUrl(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const DEFAULT_FIELDS = [
  { label: "Full name", field_key: "full_name", type: "text", is_required: true, options: [], placeholder: "" },
  { label: "WhatsApp number", field_key: "whatsapp_number", type: "phone", is_required: true, options: [], placeholder: "+91 9XXXXXXXXX" },
];

export default function RegistrationFormEditorPage() {
  const { can } = usePermissions();
  const { id } = useParams();
  const isNew = !id;
  const canEdit = can(isNew ? "registration_forms.create" : "registration_forms.edit");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft",
    submit_label: "Register",
    success_message: "",
  });
  const [fields, setFields] = useState(isNew ? DEFAULT_FIELDS : []);

  useEffect(() => {
    if (isNew) return;
    api
      .registrationForm(id)
      .then((f) => {
        setForm({
          title: f.title,
          slug: f.slug,
          description: f.description ?? "",
          status: f.status,
          submit_label: f.submit_label ?? "Register",
          success_message: f.success_message ?? "",
        });
        setFields(
          f.fields.map((fl) => ({
            label: fl.label,
            field_key: fl.field_key,
            type: fl.type,
            is_required: fl.is_required,
            options: fl.options ?? [],
            placeholder: fl.placeholder ?? "",
          })),
        );
      })
      .catch((err) => toast.error(err.message ?? "Failed to load form"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const updateForm = (key) => (value) => {
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "title" && !slugTouched ? { slug: slugifyUrl(value) } : {}),
    }));
  };

  const updateField = (index, patch) =>
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));

  const updateFieldLabel = (index, label) => {
    const existingKeys = fields.filter((_, i) => i !== index).map((f) => f.field_key);
    updateField(index, { label, field_key: slugifyKey(label, existingKeys) });
  };

  const addField = () => {
    const existingKeys = fields.map((f) => f.field_key);
    setFields((prev) => [
      ...prev,
      { label: "New field", field_key: slugifyKey(`field_${prev.length + 1}`, existingKeys), type: "text", is_required: false, options: [], placeholder: "" },
    ]);
  };

  const removeField = (index) => setFields((prev) => prev.filter((_, i) => i !== index));

  const moveField = (index, dir) => {
    setFields((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async (publish) => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and link slug are required");
      return;
    }
    setSaving(true);
    const payload = { ...form, status: publish ? "published" : form.status === "published" ? "published" : "draft", fields };
    try {
      if (isNew) {
        const created = await api.createRegistrationForm(payload);
        toast.success("Form created");
        navigate(`/admin/registration-forms/${created.id}`, { replace: true });
      } else {
        await api.updateRegistrationForm(id, payload);
        setForm((f) => ({ ...f, status: payload.status }));
        toast.success(publish ? "Form published" : "Draft saved");
      }
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(registrationFormPublicUrl(form.slug));
    toast.success("Registration link copied");
  };

  if (loading) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/registration-forms" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> Registration forms
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">{isNew ? "New registration form" : "Edit registration form"}</h1>
        {!isNew && (
          <div className="flex items-center gap-2">
            <Button as="button" variant="secondary" size="sm" icon={Users} onClick={() => navigate(`/admin/registration-forms/${id}/submissions`)}>
              Registrations
            </Button>
            <Button as="button" variant="secondary" size="sm" icon={Copy} onClick={copyLink}>
              Copy link
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card title="Form details">
            <div className="flex flex-col gap-5">
              <Field label="Title" required hint='Shown at the top of the form, e.g. "21 Days Guided Meditation with Hari Sir"'>
                <TextInput value={form.title} onChange={(e) => updateForm("title")(e.target.value)} disabled={!canEdit} />
              </Field>
              <Field label="Link slug" required hint={`Shareable link: ${registrationFormPublicUrl(form.slug || "your-slug")}`}>
                <TextInput
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }));
                  }}
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Description" hint="Optional — shown under the title on the public form">
                <TextArea rows={3} value={form.description} onChange={(e) => updateForm("description")(e.target.value)} disabled={!canEdit} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Submit button label">
                  <TextInput value={form.submit_label} onChange={(e) => updateForm("submit_label")(e.target.value)} disabled={!canEdit} />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={(e) => updateForm("status")(e.target.value)} disabled={!canEdit}>
                    <option value="draft">Draft (link not live)</option>
                    <option value="published">Published</option>
                  </Select>
                </Field>
              </div>
              <Field label="Success message" hint="Shown after someone registers. Leave blank for a default message.">
                <TextArea rows={2} value={form.success_message} onChange={(e) => updateForm("success_message")(e.target.value)} placeholder="You're registered — we'll add you to the WhatsApp group before the session starts." disabled={!canEdit} />
              </Field>
            </div>
          </Card>

          <Card title="Fields" description="Add whatever you need people to tell you. Mark a field required to force an answer. Avoid renaming a field after people start registering — export matches answers by field, not by label.">
            <div className="flex flex-col gap-3">
              {fields.map((field, i) => (
                <FieldRow
                  key={i}
                  field={field}
                  index={i}
                  total={fields.length}
                  canEdit={canEdit}
                  onLabelChange={(v) => updateFieldLabel(i, v)}
                  onChange={(patch) => updateField(i, patch)}
                  onRemove={() => removeField(i)}
                  onMove={(dir) => moveField(i, dir)}
                />
              ))}
              {canEdit && (
                <button
                  type="button"
                  onClick={addField}
                  className="flex w-fit items-center gap-1 rounded-full border border-dashed border-[var(--a-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--a-accent)] hover:bg-[var(--a-accent-muted)]"
                >
                  <Plus size={13} /> Add field
                </button>
              )}
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button as="button" variant="secondary" onClick={() => handleSave(false)} disabled={saving || !canEdit}>
              Save draft
            </Button>
            <Button as="button" onClick={() => handleSave(true)} disabled={saving || !canEdit}>
              {form.status === "published" ? "Save & keep published" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-4">
          <FormPreview form={form} fields={fields} />
        </div>
      </div>
    </div>
  );
}

function FieldRow({ field, index, total, canEdit, onLabelChange, onChange, onRemove, onMove }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--a-border)] p-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1 pt-1">
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded p-0.5 text-[var(--a-text-faint)] enabled:hover:text-[var(--a-text-primary)] disabled:opacity-30">
            <ChevronUp size={14} />
          </button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} className="rounded p-0.5 text-[var(--a-text-faint)] enabled:hover:text-[var(--a-text-primary)] disabled:opacity-30">
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="flex-1 space-y-2.5">
          <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
            <TextInput value={field.label} onChange={(e) => onLabelChange(e.target.value)} placeholder="Field label" disabled={!canEdit} />
            <Select value={field.type} onChange={(e) => onChange({ type: e.target.value })} disabled={!canEdit}>
              {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>
          {CHOICE_TYPES.includes(field.type) && (
            <TextArea
              rows={2}
              value={(field.options ?? []).join("\n")}
              onChange={(e) => onChange({ options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              placeholder={"One choice per line, e.g.\nMorning batch\nEvening batch"}
              disabled={!canEdit}
            />
          )}
          {!["checkbox"].includes(field.type) && (
            <TextInput value={field.placeholder ?? ""} onChange={(e) => onChange({ placeholder: e.target.value })} placeholder="Placeholder text (optional)" disabled={!canEdit} />
          )}
          <Toggle checked={field.is_required} onChange={(v) => onChange({ is_required: v })} label="Required" disabled={!canEdit} />
        </div>
        <button type="button" onClick={onRemove} disabled={!canEdit} className="shrink-0 rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-danger-muted)] hover:text-[var(--a-danger)] disabled:opacity-40">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/** Read-only rendering of how the public form will look, kept in sync with RegisterPage.jsx's actual field rendering. */
function FormPreview({ form, fields }) {
  return (
    <Card title="Preview" description="What people will see on the public link">
      <div className="rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface-2)] p-5">
        <h2 className="text-[19px] font-bold text-[var(--a-text-primary)]">{form.title || "Untitled form"}</h2>
        {form.description && <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--a-text-muted)]">{form.description}</p>}
        <div className="mt-4 flex flex-col gap-3.5">
          {fields.map((field, i) => (
            <div key={i}>
              {field.type !== "checkbox" && (
                <label className="mb-1 block text-[12.5px] font-medium text-[var(--a-text-primary)]">
                  {field.label} {field.is_required && <span className="text-[var(--a-danger)]">*</span>}
                </label>
              )}
              <PreviewInput field={field} />
            </div>
          ))}
          <button type="button" disabled className="mt-1 w-full rounded-full bg-[var(--a-accent)] px-4 py-2.5 text-[13.5px] font-semibold text-white opacity-90">
            {form.submit_label || "Register"}
          </button>
        </div>
      </div>
    </Card>
  );
}

function PreviewInput({ field }) {
  const base = "w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-base)] px-3 py-2 text-[13px] text-[var(--a-text-muted)]";
  switch (field.type) {
    case "textarea":
      return <textarea disabled rows={2} placeholder={field.placeholder} className={base} />;
    case "select":
      return (
        <select disabled className={base}>
          <option>{field.placeholder || "Choose…"}</option>
          {(field.options ?? []).map((o) => <option key={o}>{o}</option>)}
        </select>
      );
    case "radio":
      return (
        <div className="flex flex-col gap-1.5">
          {(field.options ?? []).length === 0 && <span className="text-[12.5px] text-[var(--a-text-faint)]">No choices added yet</span>}
          {(field.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-2 text-[13px] text-[var(--a-text-muted)]">
              <input type="radio" disabled /> {o}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-[13px] text-[var(--a-text-muted)]">
          <input type="checkbox" disabled /> {field.label} {field.is_required && <span className="text-[var(--a-danger)]">*</span>}
        </label>
      );
    default:
      return <input disabled type={field.type === "phone" ? "tel" : field.type} placeholder={field.placeholder} className={base} />;
  }
}
