import { useMemo, useState } from "react";
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
import { useAdminData } from "../../store/useAdminData";
import { CONTACT_CHANNEL_TYPES } from "../../mock/mockData";

const TYPE_ICON = { phone: Phone, whatsapp: MessageCircle, email: Mail, address: MapPin, website: Globe, social: Share2 };
const EMPTY = { type: "phone", label: "", value: "", visible: true };

export default function ContactInfoPage() {
  const { contactChannels, addContactChannel, updateContactChannel, deleteContactChannel, reorderContactChannel } = useAdminData();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const sorted = useMemo(() => [...contactChannels].sort((a, b) => a.order - b.order), [contactChannels]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (c) => { setForm(c); setEditing(c); };

  const save = () => {
    if (!form.label.trim() || !form.value.trim()) return;
    if (editing?.id) {
      updateContactChannel(editing.id, form);
      toast.success("Contact option updated");
    } else {
      addContactChannel(form);
      toast.success("Contact option added");
    }
    setEditing(null);
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
        <Button as="button" icon={Plus} onClick={openNew}>Add contact option</Button>
      </div>

      <Card padded={false}>
        {sorted.length === 0 ? (
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
                    <IconButton icon={ChevronUp} label="Move up" onClick={() => reorderContactChannel(c.id, "up")} disabled={i === 0} />
                    <IconButton icon={ChevronDown} label="Move down" onClick={() => reorderContactChannel(c.id, "down")} disabled={i === sorted.length - 1} />
                    <Toggle checked={c.visible} onChange={(v) => updateContactChannel(c.id, { visible: v })} />
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
          <Toggle checked={form.visible} onChange={(v) => setForm((f) => ({ ...f, visible: v }))} label="Visible on public site" description="Turn off to hide without losing the entry" />
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.label}"?`}
        onConfirm={() => { deleteContactChannel(toDelete.id); toast.success("Contact option deleted"); }}
      />
    </div>
  );
}
