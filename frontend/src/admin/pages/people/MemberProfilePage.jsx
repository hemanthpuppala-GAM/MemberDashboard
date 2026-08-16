import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, NotebookText } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Field, { TextInput, Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import { useAdminData } from "../../store/useAdminData";
import { CATEGORY_LABELS } from "../../mock/mockData";

const STATUSES = ["new", "active", "in_progress", "resolved", "archived"];
const ENTRY_LABEL = { note: "Note", status_change: "Status change", session_completed: "Session completed", message_sent: "Message sent", qa: "Question & answer" };

export default function MemberProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, users, journeys, updateMember } = useAdminData();
  const member = members.find((m) => String(m.id) === id);

  if (!member) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-[14px] text-[var(--a-text-muted)]">Member not found.</p>
        <Button as="button" variant="secondary" onClick={() => navigate("/admin/members")}>Back to members</Button>
      </div>
    );
  }

  const practitioners = users.filter((u) => u.role === "practitioner");
  const entries = journeys[member.id] || [];
  const lastEntry = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

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
          {lastEntry && <> · last update: {ENTRY_LABEL[lastEntry.type] ?? lastEntry.type} on {new Date(lastEntry.date).toLocaleDateString()}</>}
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Personal info" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><TextInput value={member.name} onChange={(e) => updateMember(member.id, { name: e.target.value })} /></Field>
            <Field label="Email"><TextInput value={member.email} onChange={(e) => updateMember(member.id, { email: e.target.value })} /></Field>
            <Field label="Phone"><TextInput value={member.phone} onChange={(e) => updateMember(member.id, { phone: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={member.status} onChange={(e) => updateMember(member.id, { status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Assignment">
          <div className="flex flex-col gap-4">
            <Field label="Assigned practitioner">
              <Select
                value={member.assignedPractitioner ?? ""}
                onChange={(e) => { updateMember(member.id, { assignedPractitioner: e.target.value ? Number(e.target.value) : null }); toast.success("Reassigned"); }}
              >
                <option value="">Unassigned</option>
                {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-[var(--a-text-primary)]">Category</p>
              <span className="inline-flex rounded-full bg-[var(--a-accent-muted)] px-3 py-1 text-[12.5px] font-medium text-[var(--a-accent)]">{CATEGORY_LABELS[member.category] ?? member.category}</span>
            </div>
            <div className="text-[12.5px] text-[var(--a-text-muted)]">
              Joined {new Date(member.joinDate).toLocaleDateString()} · Last contact {new Date(member.lastContact).toLocaleDateString()}
              {member.sourceQueryId && <> · from query #{member.sourceQueryId}</>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
