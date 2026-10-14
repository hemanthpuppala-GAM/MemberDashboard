import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, UserPlus, MapPin, CalendarDays, ChevronRight } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Field, { TextInput, TextArea } from "../../ui/Field";
import EmptyState from "../../ui/EmptyState";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const EMPTY = { name: "", place: "", held_on: new Date().toISOString().slice(0, 10), notes: "" };
const errorText = (err, fallback) => (err?.errors ? Object.values(err.errors).flat()[0] : err?.message ?? fallback);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "No date");

/** People → Membership drives: sign-up drives where members are added in bulk by phone. */
export default function MembershipDrivesPage() {
  const { can } = usePermissions();
  const canEdit = can("members.edit");
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .membershipDrives()
      .then((rows) => setDrives(Array.isArray(rows) ? rows : []))
      .catch((err) => toast.error(err.message ?? "Failed to load drives"))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    setSaving(true);
    try {
      const drive = await api.createMembershipDrive({ ...form, held_on: form.held_on || null });
      toast.success("Drive created — now add the phone numbers");
      navigate(`/admin/membership-drives/${drive.id}`);
    } catch (err) {
      toast.error(errorText(err, "Could not create the drive"));
    } finally {
      setSaving(false);
    }
  };

  const total = drives.reduce((n, d) => n + (d.members_count || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Membership drives</h1>
          <p className="mt-1 max-w-2xl text-[13.5px] text-[var(--a-text-muted)]">
            At a satsang, camp or event, collect phone numbers and add everyone at once. Each person gets a member ID (GAW-…). When they later sign in with
            Google and add the same phone, it stays one member with the same ID.
          </p>
        </div>
        <Button icon={Plus} onClick={() => { setForm(EMPTY); setOpen(true); }} disabled={!canEdit} title={canEdit ? undefined : "You don't have permission to add members"}>
          New drive
        </Button>
      </div>

      {drives.length > 0 && (
        <p className="text-[13px] text-[var(--a-text-muted)]">
          {drives.length} drive{drives.length === 1 ? "" : "s"} · {total} member{total === 1 ? "" : "s"} added through drives
        </p>
      )}

      {loading ? (
        <p className="py-16 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>
      ) : drives.length === 0 ? (
        <Card>
          <EmptyState icon={UserPlus} title="No drives yet" description="Create a drive, paste the phone numbers you collected, and every person becomes a member with their own ID." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {drives.map((d) => (
            <Link
              key={d.id}
              to={`/admin/membership-drives/${d.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-5 shadow-[var(--a-shadow-sm)] transition-colors hover:border-[var(--a-accent)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[15.5px] font-semibold text-[var(--a-text-primary)]">{d.name}</h2>
                <ChevronRight size={16} className="mt-0.5 shrink-0 text-[var(--a-text-faint)] group-hover:text-[var(--a-accent)]" />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[var(--a-text-muted)]">
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {fmtDate(d.held_on)}</span>
                {d.place && <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {d.place}</span>}
              </div>
              <p className="mt-auto text-[22px] font-bold text-[var(--a-text-primary)]">
                {d.members_count} <span className="text-[13px] font-medium text-[var(--a-text-muted)]">member{d.members_count === 1 ? "" : "s"}</span>
              </p>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New membership drive"
        footer={<Button onClick={create} disabled={!form.name.trim() || saving}>{saving ? "Creating…" : "Create drive"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required hint="e.g. Vizag satsang, Kurnool health camp">
            <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Place"><TextInput value={form.place} onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))} /></Field>
            <Field label="Date"><TextInput type="date" value={form.held_on} onChange={(e) => setForm((f) => ({ ...f, held_on: e.target.value }))} /></Field>
          </div>
          <Field label="Notes"><TextArea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></Field>
        </div>
      </Modal>
    </div>
  );
}
