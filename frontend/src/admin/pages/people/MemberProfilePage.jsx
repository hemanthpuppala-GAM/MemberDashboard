import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, NotebookText, HeartHandshake, LifeBuoy, Flame, BookOpen, UserPlus } from "lucide-react";
import Badge from "../../ui/Badge";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Field, { TextInput, Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import { api } from "../../../lib/api";
import { CATEGORY_LABELS } from "../../mock/mockData";
import { usePermissions } from "../../usePermissions";

const STATUSES = ["new", "active", "in_progress", "resolved", "archived"];
const ENTRY_LABEL = { note: "Note", status_change: "Status change", session_completed: "Session completed", message_sent: "Message sent", qa: "Question & answer" };

export default function MemberProfilePage() {
  const { can } = usePermissions();
  const canEdit = can("members.edit");
  const canAssign = can("members.assign");
  const canViewUsers = can("users.view");

  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  useEffect(() => {
    // The practitioner list only populates the "Assigned practitioner"
    // dropdown — a role without users.view still gets a working profile.
    Promise.all([api.member(id), api.memberJourney(id), canViewUsers ? api.users().catch(() => []) : Promise.resolve([])])
      .then(([m, j, u]) => {
        setMember(m);
        setForm({ name: m.name, email: m.email ?? "", phone: m.phone ?? "", category: m.category, status: m.status, summary: m.summary ?? "", assigned_practitioner_id: m.assigned_practitioner_id ?? "" });
        setEntries(j);
        setUsers(u);
      })
      .catch((err) => toast.error(err.message ?? "Failed to load member"))
      .finally(() => setLoading(false));
  }, [id, canViewUsers]);

  if (loading) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-[14px] text-[var(--a-text-muted)]">Member not found.</p>
        <Button as="button" variant="secondary" onClick={() => navigate("/admin/members")}>Back to members</Button>
      </div>
    );
  }

  const practitioners = users.filter((u) => u.primary_role?.name === "practitioner");
  const lastEntry = entries[0];

  const saveField = async (patch) => {
    const next = { ...form, ...patch };
    setForm(next);
    try {
      const updated = await api.updateMember(member.id, {
        name: next.name, email: next.email || null, phone: next.phone || null,
        category: next.category, status: next.status, summary: next.summary || null,
        assigned_practitioner_id: next.assigned_practitioner_id || null,
      });
      setMember((m) => ({ ...m, ...updated }));
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    }
  };

  const reassign = async (value) => {
    const practitionerId = value ? Number(value) : null;
    setForm((f) => ({ ...f, assigned_practitioner_id: value }));
    try {
      const updated = await api.assignMember(member.id, practitionerId);
      setMember((m) => ({ ...m, ...updated }));
      toast.success("Reassigned");
    } catch (err) {
      toast.error(err.message ?? "Reassign failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/members" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> All members
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={member.name} size={44} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-[var(--a-text-primary)]">{member.name}</h1>
            <StatusBadge status={member.status} />
          </div>
          <p className="text-[13px] text-[var(--a-text-muted)]">
            <span className="font-mono font-semibold text-[var(--a-text-primary)]">{member.member_code}</span>
            {member.role_title && <> · {member.role_title}</>} · {member.email || "no email"} · {member.phone || "no phone"}
          </p>
        </div>
      </div>

      <Card
        title="Records"
        description="Summary and full Q&A journal — kept on its own page so it stays clean to read and write."
        actions={<Button as={Link} to={`/admin/members/${member.id}/journey`} size="sm" icon={NotebookText}>View records</Button>}
      >
        <p className="text-[13.5px] text-[var(--a-text-muted)] italic">
          {member.summary ? `"${member.summary}"` : "No summary yet — add one from the records page."}
        </p>
        <p className="mt-2 text-[12px] text-[var(--a-text-faint)]">
          {entries.length} record {entries.length === 1 ? "note" : "notes"}
          {lastEntry && <> · last update: {ENTRY_LABEL[lastEntry.entry_type] ?? lastEntry.entry_type} on {new Date(lastEntry.created_at).toLocaleDateString()}</>}
        </p>
      </Card>

      {member.linked && <LinkedRecords member={member} />}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Personal info" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onBlur={(e) => saveField({ name: e.target.value })} disabled={!canEdit} /></Field>
            <Field label="Email"><TextInput value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} onBlur={(e) => saveField({ email: e.target.value })} disabled={!canEdit} /></Field>
            <Field label="Phone"><TextInput value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} onBlur={(e) => saveField({ phone: e.target.value })} disabled={!canEdit} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => saveField({ status: e.target.value })} disabled={!canEdit}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Assignment">
          <div className="flex flex-col gap-4">
            <Field label="Assigned practitioner">
              <Select value={form.assigned_practitioner_id ?? ""} onChange={(e) => reassign(e.target.value)} disabled={!canAssign}>
                <option value="">Unassigned</option>
                {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-[var(--a-text-primary)]">Category</p>
              <span className="inline-flex rounded-full bg-[var(--a-accent-muted)] px-3 py-1 text-[12.5px] font-medium text-[var(--a-accent)]">{CATEGORY_LABELS[member.category] ?? member.category}</span>
            </div>
            <div className="text-[12.5px] text-[var(--a-text-muted)]">
              Joined {member.join_date ? new Date(member.join_date).toLocaleDateString() : "—"} · Last contact {member.last_contact_date ? new Date(member.last_contact_date).toLocaleDateString() : "—"}
              {member.source_submission_id && <> · from query #{member.source_submission_id}</>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—");
const TICKET_SOURCE = { ask_web: "Ask page", member_portal: "Member area", website: "Website", call: "Phone call", whatsapp: "WhatsApp", volunteer: "Volunteer sign-up", other: "Other" };

/** Everything this person has done anywhere: volunteering, support desk, practice, journal, drive. */
function LinkedRecords({ member }) {
  const { linked } = member;
  const vols = linked.volunteer_applications ?? [];
  const tiles = [
    { icon: Flame, label: "Sits logged", value: linked.practice.sits, sub: linked.practice.minutes ? `${linked.practice.minutes} min · last ${fmt(linked.practice.last_sit_at)}` : "None yet" },
    { icon: BookOpen, label: "Journal entries", value: linked.journal_count, sub: linked.journal_recent?.[0] ? `Latest ${fmt(linked.journal_recent[0].created_at)}` : "None yet" },
    { icon: LifeBuoy, label: "Support tickets", value: linked.tickets_count, sub: linked.tickets?.[0] ? `Latest ${fmt(linked.tickets[0].created_at)}` : "None" },
    { icon: HeartHandshake, label: "Volunteer", value: vols.length ? "Yes" : "No", sub: vols[0] ? `${vols[0].status} · since ${fmt(vols[0].created_at)}` : "Not signed up" },
  ];

  return (
    <Card title="Across the platform" description="Kept in step automatically — the member area, volunteer form, support desk and membership drives all point to this one member.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-base)] p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--a-text-muted)]"><t.icon size={14} /> {t.label}</div>
            <div className="mt-1.5 text-[22px] font-bold text-[var(--a-text-primary)]">{t.value}</div>
            <div className="text-[12px] text-[var(--a-text-faint)]">{t.sub}</div>
          </div>
        ))}
      </div>

      {member.drive && (
        <p className="mt-4 flex items-center gap-2 text-[13px] text-[var(--a-text-muted)]">
          <UserPlus size={14} /> Added at <Link to={`/admin/membership-drives/${member.drive.id}`} className="font-semibold text-[var(--a-accent)] hover:underline">{member.drive.name}</Link>
          {member.drive.held_on && <> on {fmt(member.drive.held_on)}</>}
        </p>
      )}

      {linked.tickets?.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[12.5px] font-semibold text-[var(--a-text-primary)]">Support tickets</p>
          <ul className="flex flex-col divide-y divide-[var(--a-border)] rounded-xl border border-[var(--a-border)]">
            {linked.tickets.map((t) => (
              <li key={t.id}>
                <a href={`${import.meta.env.BASE_URL}support/ticket/${t.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[13px] hover:bg-[var(--a-bg-surface-2)]">
                  <span className="font-mono text-[12px] text-[var(--a-text-muted)]">{t.ref}</span>
                  <span className="min-w-0 flex-1 truncate text-[var(--a-text-primary)]">{t.subject}</span>
                  <span className="text-[12px] text-[var(--a-text-faint)]">{TICKET_SOURCE[t.source] ?? t.source} · {fmt(t.created_at)}</span>
                  <Badge tone={["resolved", "closed"].includes(t.status) ? "success" : "warning"}>{t.status.replace("_", " ")}</Badge>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {linked.journal_recent?.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[12.5px] font-semibold text-[var(--a-text-primary)]">Recent journal</p>
          <ul className="flex flex-col gap-2">
            {linked.journal_recent.map((j) => (
              <li key={j.id} className="rounded-xl bg-[var(--a-bg-base)] px-3 py-2 text-[13px] text-[var(--a-text-primary)]">
                <span className="mr-2 text-[12px] text-[var(--a-text-faint)]">{fmt(j.created_at)}</span>
                {j.content.length > 220 ? `${j.content.slice(0, 220)}…` : j.content}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
