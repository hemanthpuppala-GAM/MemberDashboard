import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import Card from "../components/ui/Card";
import Field, { TextInput, TextArea } from "../components/ui/Field";
import Toggle from "../components/ui/Toggle";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";

const EMPTY = {
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  location: "",
  join_url: "",
  is_published: true,
};

function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => api.events().then(setEvents).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const startEdit = (event) => {
    setEditingId(event.id);
    setForm({
      ...EMPTY,
      ...event,
      starts_at: toLocalInput(event.starts_at),
      ends_at: toLocalInput(event.ends_at),
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editingId) {
        await api.updateEvent(editingId, form);
      } else {
        await api.createEvent(form);
      }
      cancelEdit();
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await api.deleteEvent(id);
    await load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[26px] text-[var(--color-ink)]">Events</h1>
        <p className="mt-1 text-[13.5px] text-[var(--color-muted)]">
          Manage the events shown on the public Events page.
        </p>
      </div>

      <Card title={editingId ? "Edit event" : "New event"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Title" error={errors.title?.[0]}>
            <TextInput value={form.title} onChange={(e) => set("title")(e.target.value)} required />
          </Field>

          <Field label="Description" error={errors.description?.[0]}>
            <TextArea rows={3} value={form.description ?? ""} onChange={(e) => set("description")(e.target.value)} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Starts at" error={errors.starts_at?.[0]}>
              <TextInput type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at")(e.target.value)} required />
            </Field>
            <Field label="Ends at" error={errors.ends_at?.[0]} hint="Optional">
              <TextInput type="datetime-local" value={form.ends_at} onChange={(e) => set("ends_at")(e.target.value)} />
            </Field>
            <Field label="Location" error={errors.location?.[0]}>
              <TextInput value={form.location ?? ""} onChange={(e) => set("location")(e.target.value)} placeholder="Online, or a city" />
            </Field>
            <Field label="Join link" error={errors.join_url?.[0]} hint="Optional">
              <TextInput value={form.join_url ?? ""} onChange={(e) => set("join_url")(e.target.value)} />
            </Field>
          </div>

          <Toggle checked={form.is_published} onChange={set("is_published")} label="Published (visible on the public site)" />

          <div className="flex items-center gap-3">
            <Button as="button" type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update event" : "Create event"}
            </Button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[13px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card title="All events">
        {loading ? (
          <p className="text-[13.5px] text-[var(--color-muted)]">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-[13.5px] text-[var(--color-muted)]">No events yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[rgba(110,198,234,0.20)]">
            {events.map((event) => (
              <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[14.5px] font-medium text-[var(--color-ink)]">{event.title}</span>
                    {!event.is_published && <Chip>Draft</Chip>}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-[var(--color-muted)]">
                    {new Date(event.starts_at).toLocaleString()} · {event.location || "TBD"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(event)}
                    className="rounded-full border border-[rgba(110,198,234,0.45)] px-3.5 py-1.5 text-[12.5px] text-[var(--color-ink)] transition-colors hover:border-[var(--color-gold)]/70 hover:bg-[rgba(110,198,234,0.15)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="rounded-full px-3.5 py-1.5 text-[12.5px] text-[#c0554a] transition-colors hover:bg-[rgba(224,138,138,0.15)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
