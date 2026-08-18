import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Phone, MessageCircle, Mail, MapPin, Globe, Share2, Contact } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, Select } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import EmptyState from "../../ui/EmptyState";
import { api } from "../../../lib/api";
import { CONTACT_CHANNEL_TYPES } from "../../mock/mockData";

const TYPE_ICON = { phone: Phone, whatsapp: MessageCircle, email: Mail, address: MapPin, website: Globe, social: Share2 };
const EMPTY = { type: "phone", label: "", value: "", is_visible: true };

export default function ContactInfoPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const loadChannels = () => api.contactChannels().then(setChannels);

  useEffect(() => {
    loadChannels()
      .catch((err) => toast.error(err.message ?? "Failed to load contact info"))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => [...channels].sort((a, b) => a.sort_order - b.sort_order), [channels]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (c) => { setForm({ type: c.type, label: c.label, value: c.value, is_visible: c.is_visible }); setEditing(c); };

  const save = async () => {
    if (!form.label.trim() || !form.value.trim()) return;
    try {
      if (editing?.id) {
        await api.updateContactChannel(editing.id, form);
        toast.success("Contact option updated");
      } else {
        await api.createContactChannel(form);
        toast.success("Contact option added");
      }
      setEditing(null);
      await loadChannels();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    }
  };

  const toggleVisible = async (c, v) => {
    setChannels((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_visible: v } : x)));
    try {
      await api.updateContactChannel(c.id, { type: c.type, label: c.label, value: c.value, is_visible: v });
    } catch (err) {
      toast.error(err.message ?? "Update failed");
      await loadChannels();
    }
  };

  const move = async (id, direction) => {
    const idx = sorted.findIndex((c) => c.id === id);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return;
    const ids = sorted.map((c) => c.id);
    [ids[idx], ids[swapWith]] = [ids[swapWith], ids[idx]];
    try {
      const updated = await api.reorderContactChannels(ids);
      setChannels(updated);
    } catch (err) {
      toast.error(err.message ?? "Reorder failed");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteContactChannel(toDelete.id);
      toast.success("Contact option deleted");
      await loadChannels();
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
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Contact info</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Every phone number, email, address, and social link shown on the public Contact page. Toggle visibility without deleting, reorder how they appear.
          </p>
        </div>
        <Button as="button" icon={Plus} onClick={openNew} disabled={loading}>Add contact option</Button>
      </div>

      <Card padded={false}>
        {!loading && sorted.length === 0 ? (
          <EmptyState icon={Contact} title="No contact options yet" description="Add a phone number, email, or address for visitors to reach you." />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--a-border)]">
            {sorted.map((c, i) => {
              const Icon = TYPE_ICON[c.type] ?? Contact;
              return (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-[var(--a-text-primary)]">{c.label}</span>
                      <span className="shrink-0 rounded-full bg-[var(--a-bg-surface-2)] px-2 py-0.5 text-[10.5px] font-medium tracking-wide text-[var(--a-text-muted)] uppercase">
                        {CONTACT_CHANNEL_TYPES.find((t) => t.type === c.type)?.label ?? c.type}
                      </span>
                    </div>
                    <p className="truncate text-[12.5px] text-[var(--a-text-muted)]">{c.value}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton icon={ChevronUp} label="Move up" onClick={() => move(c.id, "up")} disabled={i === 0} />
                    <IconButton icon={ChevronDown} label="Move down" onClick={() => move(c.id, "down")} disabled={i === sorted.length - 1} />
                    <Toggle checked={c.is_visible} onChange={(v) => toggleVisible(c, v)} />
                    <IconButton icon={Pencil} label="Edit" variant="accent" onClick={() => openEdit(c)} />
                    <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(c)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit contact option" : "Add contact option"}
        footer={<Button as="button" onClick={save} disabled={!form.label.trim() || !form.value.trim()}>{editing?.id ? "Save" : "Add"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {CONTACT_CHANNEL_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
            </Select>
          </Field>
          <Field label="Label" required hint='Shown as the heading, e.g. "WhatsApp support"'>
            <TextInput value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          </Field>
          <Field label="Value" required hint="The number, email, address, or URL itself">
            <TextInput value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          </Field>
          <Toggle checked={form.is_visible} onChange={(v) => setForm((f) => ({ ...f, is_visible: v }))} label="Visible on public site" description="Turn off to hide without losing the entry" />
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.label}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
