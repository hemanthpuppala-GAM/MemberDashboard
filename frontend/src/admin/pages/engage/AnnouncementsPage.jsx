import { useMemo, useState } from "react";
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
import { useAdminData } from "../../store/useAdminData";

const TYPES = ["info", "warning", "alert"];
const PRIORITIES = ["normal", "urgent"];
const EMPTY = { title: "", body: "", type: "info", target: "all", priority: "normal" };

export default function AnnouncementsPage() {
  const { announcements, users, roles, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAdminData();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const openCreate = () => { setForm(EMPTY); setModal("new"); };
  const openEdit = (a) => { setForm(a); setModal(a); };

  const handleSave = () => {
    if (modal === "new") {
      addAnnouncement(form);
      toast.success("Announcement sent");
    } else {
      updateAnnouncement(modal.id, form);
      toast.success("Announcement updated");
    }
    setModal(null);
  };

  const columns = useMemo(
    () => [
      { accessorKey: "title", header: "Title", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { accessorKey: "type", header: "Type", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      { accessorKey: "target", header: "Target", cell: ({ getValue }) => <span className="capitalize">{String(getValue()).replace(":", " · ")}</span> },
      { accessorKey: "sentOn", header: "Sent on", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      { id: "reads", header: "Read", accessorFn: (a) => `${a.readCount}/${a.totalRecipients}` },
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
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Announcements</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Internal one-way messages from admin to practitioners.</p>
        </div>
        <Button as="button" icon={Plus} onClick={openCreate}>New announcement</Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable columns={columns} data={announcements} searchPlaceholder="Search announcements..." emptyIcon={Megaphone} emptyTitle="No announcements yet" />
        </div>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "new" ? "New announcement" : "Edit announcement"}
        size="lg"
        footer={<Button as="button" onClick={handleSave} disabled={!form.title}>{modal === "new" ? "Send" : "Save changes"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required><TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="Body"><RichTextEditor value={form.body} onChange={(v) => setForm((f) => ({ ...f, body: v }))} placeholder="Write your announcement..." /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Target">
              <Select value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}>
                <option value="all">Everyone</option>
                {roles.map((r) => <option key={r.id} value={`role:${r.name}`}>Role: {r.displayName}</option>)}
                {users.map((u) => <option key={u.id} value={`user:${u.id}`}>{u.name}</option>)}
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
        onConfirm={() => { deleteAnnouncement(toDelete.id); toast.success("Announcement deleted"); }}
      />
    </div>
  );
}
