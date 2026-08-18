import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, NotebookText } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Field, { TextInput, Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import { api } from "../../../lib/api";
import { CATEGORY_LABELS } from "../../mock/mockData";

const STATUSES = ["new", "active", "in_progress", "resolved", "archived"];
const ENTRY_LABEL = { note: "Note", status_change: "Status change", session_completed: "Session completed", message_sent: "Message sent", qa: "Question & answer" };

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([api.member(id), api.users(), api.memberJourney(id)])
      .then(([m, u, j]) => {
        setMember(m);
        setForm({ name: m.name, email: m.email ?? "", phone: m.phone ?? "", category: m.category, status: m.status, summary: m.summary ?? "", assigned_practitioner_id: m.assigned_practitioner_id ?? "" });
        setUsers(u);
        setEntries(j);
      })
      .catch((err) => toast.error(err.message ?? "Failed to load member"))
      .finally(() => setLoading(false));
  }, [id]);

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
          <p className="text-[13px] text-[var(--a-text-muted)]">{member.email} · {member.phone || "no phone"}</p>
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
          {entries.length} journal {entries.length === 1 ? "entry" : "entries"}
          {lastEntry && <> · last update: {ENTRY_LABEL[lastEntry.entry_type] ?? lastEntry.entry_type} on {new Date(lastEntry.created_at).toLocaleDateString()}</>}
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Personal info" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onBlur={(e) => saveField({ name: e.target.value })} /></Field>
            <Field label="Email"><TextInput value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} onBlur={(e) => saveField({ email: e.target.value })} /></Field>
            <Field label="Phone"><TextInput value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} onBlur={(e) => saveField({ phone: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => saveField({ status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Assignment">
          <div className="flex flex-col gap-4">
            <Field label="Assigned practitioner">
              <Select value={form.assigned_practitioner_id ?? ""} onChange={(e) => reassign(e.target.value)}>
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
