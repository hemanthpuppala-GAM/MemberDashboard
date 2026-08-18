import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Megaphone, Trash2, Pencil } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, Select } from "../../ui/Field";
import RichTextEditor from "../../ui/RichTextEditor";
import { StatusBadge } from "../../ui/Badge";
import { api } from "../../../lib/api";

const TYPES = ["info", "warning", "alert"];
const PRIORITIES = ["normal", "urgent"];
const EMPTY = { title: "", body: "", target_type: "all", target_ids: [], type: "info", priority: "normal" };

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const loadAnnouncements = () => api.announcements().then(setAnnouncements);

  useEffect(() => {
    Promise.all([loadAnnouncements(), api.roles().then(setRoles), api.users().then(setUsers)])
      .catch((err) => toast.error(err.message ?? "Failed to load announcements"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY); setModal("new"); };
  const openEdit = (a) => {
    setForm({
      title: a.title, body: a.body, type: a.type, priority: a.priority,
      target_type: a.target_type, target_ids: a.target_ids ?? [],
    });
    setModal(a);
  };

  const targetValue = form.target_type === "all" ? "all" : `${form.target_type}:${form.target_ids[0] ?? ""}`;
  const onTargetChange = (value) => {
    if (value === "all") { setForm((f) => ({ ...f, target_type: "all", target_ids: [] })); return; }
    const [type, id] = value.split(":");
    setForm((f) => ({ ...f, target_type: type, target_ids: [Number(id)] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title: form.title, body: form.body, type: form.type, target_type: form.target_type, target_ids: form.target_ids, priority: form.priority, scheduled_at: null };
      if (modal === "new") {
        const created = await api.createAnnouncement(payload);
        await api.sendAnnouncement(created.id);
        toast.success("Announcement sent");
      } else {
        await api.updateAnnouncement(modal.id, payload);
        toast.success("Announcement updated");
      }
      setModal(null);
      await loadAnnouncements();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteAnnouncement(toDelete.id);
      toast.success("Announcement deleted");
      await loadAnnouncements();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "title", header: "Title", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { accessorKey: "type", header: "Type", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      {
        id: "target", header: "Target",
        accessorFn: (a) => (a.target_type === "all" ? "Everyone" : a.target_type === "role" ? `Role: ${roles.find((r) => r.id === a.target_ids?.[0])?.display_name ?? a.target_ids?.[0]}` : `User: ${users.find((u) => u.id === a.target_ids?.[0])?.name ?? a.target_ids?.[0]}`),
      },
      { id: "sentOn", header: "Sent on", accessorFn: (a) => a.sent_at, cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleDateString() : "Not sent") },
      { id: "reads", header: "Read", accessorFn: (a) => a.reads_count ?? 0 },
      {
        id: "actions", header: "", enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(row.original)} />
            <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(row.original)} />
          </div>
        ),
      },
    ],
    [roles, users]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Announcements</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Internal one-way messages from admin to practitioners.</p>
        </div>
        <Button as="button" icon={Plus} onClick={openCreate} disabled={loading}>New announcement</Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable columns={columns} data={announcements} searchPlaceholder="Search announcements..." emptyIcon={Megaphone} emptyTitle={loading ? "Loading…" : "No announcements yet"} />
        </div>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "new" ? "New announcement" : "Edit announcement"}
        size="lg"
        footer={<Button as="button" onClick={handleSave} disabled={!form.title || saving}>{modal === "new" ? "Send" : "Save changes"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required><TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="Body"><RichTextEditor value={form.body} onChange={(v) => setForm((f) => ({ ...f, body: v }))} placeholder="Write your announcement..." /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Target">
              <Select value={targetValue} onChange={(e) => onTargetChange(e.target.value)}>
                <option value="all">Everyone</option>
                {roles.map((r) => <option key={r.id} value={`role:${r.id}`}>Role: {r.display_name}</option>)}
                {users.map((u) => <option key={u.id} value={`users:${u.id}`}>{u.name}</option>)}
              </Select>
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
