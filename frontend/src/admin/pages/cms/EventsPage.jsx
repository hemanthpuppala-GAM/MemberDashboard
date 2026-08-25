import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, CalendarClock } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import EmptyState from "../../ui/EmptyState";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const EMPTY = {
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  location: "",
  join_url: "",
  host_practitioner_id: "",
  is_published: true,
};

/** Converts an ISO datetime string to the value a <input type="datetime-local"> expects, in local time. */
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventsPage() {
  const { can } = usePermissions();
  const canCreate = can("cms.create");
  const canEdit = can("cms.edit");
  const canDelete = can("cms.delete");

  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const practitioners = useMemo(() => users.filter((u) => u.primary_role?.name === "practitioner"), [users]);
  const sorted = useMemo(
    () => [...events].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    [events],
  );

  const load = () => Promise.all([api.events(), api.users()]).then(([e, u]) => {
    setEvents(e);
    setUsers(u);
  });

  useEffect(() => {
    load()
      .catch((err) => toast.error(err.message ?? "Failed to load sessions"))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (e) => {
    setForm({
      title: e.title,
      description: e.description ?? "",
      starts_at: toLocalInput(e.starts_at),
      ends_at: toLocalInput(e.ends_at),
      location: e.location ?? "",
      join_url: e.join_url ?? "",
      host_practitioner_id: e.host_practitioner_id ?? "",
      is_published: e.is_published,
    });
    setEditing(e);
  };

  const save = async () => {
    if (!form.title.trim() || !form.starts_at) return;
    const payload = {
      ...form,
      ends_at: form.ends_at || null,
      location: form.location || null,
      join_url: form.join_url || null,
      host_practitioner_id: form.host_practitioner_id || null,
    };
    try {
      if (editing?.id) {
        await api.updateEvent(editing.id, payload);
        toast.success("Session updated");
      } else {
        await api.createEvent(payload);
        toast.success("Session scheduled");
      }
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteEvent(toDelete.id);
      toast.success("Session deleted");
      await load();
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
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Live sessions</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Group meditation sessions members see under "Join live" and "Overview" on their dashboard.
          </p>
        </div>
        <Button as="button" icon={Plus} onClick={openNew} disabled={loading || !canCreate} title={canCreate ? undefined : "You don't have permission to add sessions"}>
          Schedule session
        </Button>
      </div>

      <Card padded={false}>
        {!loading && sorted.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No sessions scheduled" description="Schedule a session so it appears on members' Join live and Overview pages." />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--a-border)]">
            {sorted.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]">
                  <CalendarClock size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-[var(--a-text-primary)]">{e.title}</div>
                  <div className="truncate text-[12px] text-[var(--a-text-muted)]">
                    {new Date(e.starts_at).toLocaleString()}
                    {e.host?.name ? ` · ${e.host.name}` : ""}
                    {!e.is_published ? " · Draft" : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={Pencil} label={canEdit ? "Edit" : "You don't have permission to edit sessions"} variant="accent" disabled={!canEdit} onClick={() => openEdit(e)} />
                  <IconButton icon={Trash2} label={canDelete ? "Delete" : "You don't have permission to delete sessions"} variant="danger" disabled={!canDelete} onClick={() => setToDelete(e)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit session" : "Schedule session"}
        size="lg"
        footer={<Button as="button" onClick={save} disabled={!form.title.trim() || !form.starts_at}>{editing?.id ? "Save" : "Schedule"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Morning Group Meditation" />
          </Field>
          <Field label="Description">
            <TextArea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts at" required>
              <TextInput type="datetime-local" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} />
            </Field>
            <Field label="Ends at" hint="Optional — used to know when a session stops being live">
              <TextInput type="datetime-local" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} />
            </Field>
          </div>
          <Field label="Host practitioner">
            <Select value={form.host_practitioner_id} onChange={(e) => setForm((f) => ({ ...f, host_practitioner_id: e.target.value }))}>
              <option value="">Unassigned</option>
              {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" hint="Optional, e.g. a room name">
              <TextInput value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </Field>
            <Field label="Join URL" hint="Where 'Join live' sends members">
              <TextInput value={form.join_url} onChange={(e) => setForm((f) => ({ ...f, join_url: e.target.value }))} placeholder="https://meet.example.com/..." />
            </Field>
          </div>
          <Toggle checked={form.is_published} onChange={(v) => setForm((f) => ({ ...f, is_published: v }))} label="Published" description="Turn off to hide from members while you're still setting it up" />
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
