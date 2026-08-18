import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, HeartHandshake } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import EmptyState from "../../ui/EmptyState";
import { api } from "../../../lib/api";

const EMPTY = { name: "", is_active: true };

export default function VolunteerCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const loadCategories = () => api.volunteerCategories().then(setCategories);

  useEffect(() => {
    loadCategories()
      .catch((err) => toast.error(err.message ?? "Failed to load volunteer categories"))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => [...categories].sort((a, b) => a.sort_order - b.sort_order), [categories]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (c) => { setForm({ name: c.name, is_active: c.is_active }); setEditing(c); };

  const save = async () => {
    if (!form.name.trim()) return;
    try {
      if (editing?.id) {
        await api.updateVolunteerCategory(editing.id, form);
        toast.success("Category updated");
      } else {
        await api.createVolunteerCategory(form);
        toast.success("Category added");
      }
      setEditing(null);
      await loadCategories();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    }
  };

  const toggleActive = async (c, v) => {
    setCategories((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: v } : x)));
    try {
      await api.updateVolunteerCategory(c.id, { name: c.name, is_active: v });
    } catch (err) {
      toast.error(err.message ?? "Update failed");
      await loadCategories();
    }
  };

  const move = async (id, direction) => {
    const idx = sorted.findIndex((c) => c.id === id);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return;
    const ids = sorted.map((c) => c.id);
    [ids[idx], ids[swapWith]] = [ids[swapWith], ids[idx]];
    try {
      const updated = await api.reorderVolunteerCategories(ids);
      setCategories(updated);
    } catch (err) {
      toast.error(err.message ?? "Reorder failed");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteVolunteerCategory(toDelete.id);
      toast.success("Category deleted");
      await loadCategories();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Volunteer categories</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            The options shown in the "category" dropdown on the public volunteer form. Toggle active without deleting, reorder how they appear.
          </p>
        </div>
        <Button as="button" icon={Plus} onClick={openNew} disabled={loading}>Add category</Button>
      </div>

      <Card padded={false}>
        {!loading && sorted.length === 0 ? (
          <EmptyState icon={HeartHandshake} title="No categories yet" description="Add at least one category so the public volunteer form has options to choose from." />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--a-border)]">
            {sorted.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]">
                  <HeartHandshake size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="truncate text-[13.5px] font-semibold text-[var(--a-text-primary)]">{c.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={ChevronUp} label="Move up" onClick={() => move(c.id, "up")} disabled={i === 0} />
                  <IconButton icon={ChevronDown} label="Move down" onClick={() => move(c.id, "down")} disabled={i === sorted.length - 1} />
                  <Toggle checked={c.is_active} onChange={(v) => toggleActive(c, v)} />
                  <IconButton icon={Pencil} label="Edit" variant="accent" onClick={() => openEdit(c)} />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(c)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit category" : "Add category"}
        footer={<Button as="button" onClick={save} disabled={!form.name.trim()}>{editing?.id ? "Save" : "Add"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required hint='Shown to visitors, e.g. "Event Support"'>
            <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Toggle checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label="Active" description="Turn off to hide from the public form without losing the entry" />
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.name}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
