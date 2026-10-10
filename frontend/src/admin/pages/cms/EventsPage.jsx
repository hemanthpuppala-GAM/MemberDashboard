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
  recurrence: "none",
  timezone: BROWSER_TZ,
  location: "",
  join_url: "",
  host_practitioner_id: "",
  is_published: true,
};

/**
 * Chrome reports some zones by their old ICU names (India is "Asia/Calcutta"); the backend only
 * accepts current IANA names (`timezone:all`), so map them before showing or saving.
 */
const LEGACY_ZONES = {
  "Asia/Calcutta": "Asia/Kolkata", "Asia/Katmandu": "Asia/Kathmandu", "Asia/Rangoon": "Asia/Yangon",
  "Asia/Saigon": "Asia/Ho_Chi_Minh", "Europe/Kiev": "Europe/Kyiv", "America/Godthab": "America/Nuuk",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires", "America/Catamarca": "America/Argentina/Catamarca",
  "America/Cordoba": "America/Argentina/Cordoba", "America/Jujuy": "America/Argentina/Jujuy",
  "America/Mendoza": "America/Argentina/Mendoza", "America/Indianapolis": "America/Indiana/Indianapolis",
  "America/Louisville": "America/Kentucky/Louisville", "America/Coral_Harbour": "America/Atikokan",
  "Africa/Asmera": "Africa/Asmara", "Atlantic/Faeroe": "Atlantic/Faroe", "Pacific/Enderbury": "Pacific/Kanton",
  "Pacific/Ponape": "Pacific/Pohnpei", "Pacific/Truk": "Pacific/Chuuk",
};
const ianaZone = (tz) => LEGACY_ZONES[tz] ?? tz;

const BROWSER_TZ = (() => {
  try {
    return ianaZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata");
  } catch {
    return "Asia/Kolkata";
  }
})();

/** The zones most sitters are in; the full IANA list follows under "All time zones". */
const COMMON_ZONES = [
  "Asia/Kolkata", "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "Europe/London", "Europe/Berlin", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "Australia/Sydney", "Pacific/Auckland",
];
const ALL_ZONES = (() => {
  try {
    const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
    return [...new Set(zones.map(ianaZone))].sort();
  } catch {
    return [];
  }
})();

const pad = (n) => String(n).padStart(2, "0");

/** Wall-clock parts of an instant in an IANA zone. */
function zonedParts(ms, tz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
  );
  return { year: +parts.year, month: +parts.month, day: +parts.day, hour: +parts.hour % 24, minute: +parts.minute };
}

/** ISO instant → the value a <input type="datetime-local"> expects, as wall-clock time in `tz`. */
function toZonedInput(iso, tz) {
  if (!iso) return "";
  const p = zonedParts(new Date(iso).getTime(), tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** A <input type="datetime-local"> value read as wall-clock time in `tz` → UTC ISO string for the backend. */
function fromZonedInput(local, tz) {
  if (!local) return null;
  const [datePart, timePart] = local.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const wall = Date.UTC(year, month - 1, day, hours, minutes);
  const offsetAt = (ms) => {
    const p = zonedParts(ms, tz);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - ms;
  };
  // Two passes settle the offset across a DST change.
  let ms = wall - offsetAt(wall);
  ms = wall - offsetAt(ms);
  return new Date(ms).toISOString();
}

/** "IST" for India (en-US would say GMT+5:30); the short name the browser knows elsewhere. */
function zoneAbbr(tz, date = new Date()) {
  if (tz === "Asia/Kolkata") return "IST";
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

/** List line: "Every day at 6:00 AM IST" for a daily sit, the date and time (in its zone) for a one-off. */
function scheduleLabel(e) {
  const tz = e.timezone || BROWSER_TZ;
  const start = new Date(e.starts_at);
  try {
    if (e.recurrence === "daily") {
      const time = start.toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
      const from = start > new Date() ? ` · from ${start.toLocaleDateString(undefined, { timeZone: tz, day: "numeric", month: "short" })}` : "";
      return `Every day at ${time} ${zoneAbbr(tz)}${from}`;
    }
    return `${start.toLocaleString(undefined, { timeZone: tz, dateStyle: "medium", timeStyle: "short" })} ${zoneAbbr(tz, start)}`;
  } catch {
    return start.toLocaleString();
  }
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
  const zoneGroups = useMemo(() => {
    const common = [...new Set([BROWSER_TZ, ...COMMON_ZONES, form.timezone].filter(Boolean))];
    const rest = ALL_ZONES.filter((z) => !common.includes(z));
    return rest.length ? [["Common", common], ["All time zones", rest]] : [["Common", common]];
  }, [form.timezone]);
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
      starts_at: toZonedInput(e.starts_at, e.timezone || BROWSER_TZ),
      ends_at: toZonedInput(e.ends_at, e.timezone || BROWSER_TZ),
      recurrence: e.recurrence === "daily" ? "daily" : "none",
      timezone: e.timezone || BROWSER_TZ,
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
      starts_at: fromZonedInput(form.starts_at, form.timezone),
      ends_at: fromZonedInput(form.ends_at, form.timezone),
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
                    {scheduleLabel(e)}
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
            <Field label="Repeats">
              <Select value={form.recurrence} onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))}>
                <option value="none">One time</option>
                <option value="daily">Every day</option>
              </Select>
            </Field>
            <Field label="Time zone" hint={form.recurrence === "daily" ? "The session repeats at the same clock time in this zone" : "The start and end times below are in this zone"}>
              <Select value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}>
                {zoneGroups.map(([label, zones]) => (
                  <optgroup key={label} label={label}>
                    {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}{z === BROWSER_TZ ? " (this device)" : ""}</option>)}
                  </optgroup>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={form.recurrence === "daily" ? "First session" : "Starts at"} required hint={form.recurrence === "daily" ? "Date it begins and the daily start time" : undefined}>
              <TextInput type="datetime-local" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} />
            </Field>
            <Field label="Ends at" hint={form.recurrence === "daily" ? "Optional — sets how long each day's session lasts (default 1 hour)" : "Optional — used to know when a session stops being live"}>
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
            <Field label="Join link" hint="Leave blank to use the Zoom room from Settings.">
              <TextInput value={form.join_url} onChange={(e) => setForm((f) => ({ ...f, join_url: e.target.value }))} placeholder="https://zoom.us/j/..." />
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
