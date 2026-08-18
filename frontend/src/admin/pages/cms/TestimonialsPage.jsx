import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Star, Quote, MessageSquareQuote } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import { StatusBadge } from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import Avatar from "../../ui/Avatar";
import ImageUploader from "../../ui/ImageUploader";
import { api } from "../../../lib/api";

const EMPTY = { name: "", role: "", quote: "", rating: 5, status: "draft", is_featured: false };

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
        >
          <Star size={readOnly ? 13 : 20} className={n <= value ? "fill-[var(--a-warning)] text-[var(--a-warning)]" : "text-[var(--a-border)]"} />
        </button>
      ))}
    </div>
  );
}

function toFormData(form, photoFile) {
  const fd = new FormData();
  fd.append("name", form.name);
  if (form.role) fd.append("role", form.role);
  fd.append("quote", form.quote);
  fd.append("rating", form.rating);
  fd.append("status", form.status);
  fd.append("is_featured", form.is_featured ? "1" : "0");
  if (photoFile) fd.append("photo", photoFile);
  return fd;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadTestimonials = () => api.testimonials().then(setTestimonials);

  useEffect(() => {
    loadTestimonials()
      .catch((err) => toast.error(err.message ?? "Failed to load testimonials"))
      .finally(() => setLoading(false));
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const openNew = () => { setForm(EMPTY); setPhotoPreview(""); setPhotoFile(null); setEditing({}); };
  const openEdit = (t) => {
    setForm({ name: t.name, role: t.role ?? "", quote: t.quote, rating: t.rating, status: t.status, is_featured: t.is_featured });
    setPhotoPreview(t.photo_path ?? "");
    setPhotoFile(null);
    setEditing(t);
  };

  const save = async () => {
    if (!form.name.trim() || !form.quote.trim()) return;
    setSaving(true);
    try {
      const formData = toFormData(form, photoFile);
      if (editing?.id) {
        await api.updateTestimonial(editing.id, formData);
        toast.success("Testimonial updated");
      } else {
        await api.createTestimonial(formData);
        toast.success("Testimonial added");
      }
      setEditing(null);
      await loadTestimonials();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteTestimonial(toDelete.id);
      toast.success("Testimonial deleted");
      await loadTestimonials();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const sorted = [...testimonials].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Testimonials</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Stories from members and practitioners shown on the public site. Feature the strongest ones to highlight them on the homepage.
          </p>
        </div>
        <Button as="button" icon={Plus} onClick={openNew} disabled={loading}>Add testimonial</Button>
      </div>

      {!loading && sorted.length === 0 ? (
        <Card><EmptyState icon={MessageSquareQuote} title="No testimonials yet" description="Add a quote from a member or practitioner to build social proof." /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((t) => (
            <Card key={t.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {t.photo_path ? (
                    <img src={t.photo_path} alt={t.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <Avatar name={t.name} size={40} />
                  )}
                  <div>
                    <p className="text-[13.5px] font-semibold text-[var(--a-text-primary)]">{t.name}</p>
                    <p className="text-[12px] text-[var(--a-text-muted)]">{t.role}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={Pencil} label="Edit" variant="accent" onClick={() => openEdit(t)} />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(t)} />
                </div>
              </div>

              <StarRating value={t.rating} readOnly />

              <p className="relative text-[13px] leading-relaxed text-[var(--a-text-muted)]">
                <Quote size={14} className="mb-1 text-[var(--a-accent)]" />
                {t.quote}
              </p>

              <div className="mt-auto flex items-center gap-2 pt-1">
                <StatusBadge status={t.status} />
                {t.is_featured && <span className="rounded-full bg-[var(--a-accent-muted)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-[var(--a-accent)] uppercase">Featured</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit testimonial" : "Add testimonial"}
        size="lg"
        footer={<Button as="button" onClick={save} disabled={!form.name.trim() || !form.quote.trim() || saving}>{editing?.id ? "Save" : "Add"}</Button>}
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required><TextInput value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Role / description" hint='e.g. "Practitioner, 2 years"'>
              <TextInput value={form.role} onChange={(e) => set({ role: e.target.value })} />
            </Field>
          </div>

          <Field label="Quote" required>
            <TextArea rows={4} value={form.quote} onChange={(e) => set({ quote: e.target.value })} />
          </Field>

          <Field label="Photo" hint="Optional — falls back to initials">
            <ImageUploader url={photoPreview} onChange={setPhotoPreview} onFileSelect={setPhotoFile} label="photo" size={96} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rating">
              <StarRating value={form.rating} onChange={(n) => set({ rating: n })} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set({ status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </div>

          <Toggle checked={form.is_featured} onChange={(v) => set({ is_featured: v })} label="Featured" description="Highlighted on the homepage instead of just the testimonials page" />
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete testimonial from "${toDelete?.name}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
