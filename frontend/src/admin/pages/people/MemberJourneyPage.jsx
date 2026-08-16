import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { StatusBadge } from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import JourneyPanel from "../../ui/JourneyPanel";
import MemberSummaryCard from "../../ui/MemberSummaryCard";
import { useAdminData } from "../../store/useAdminData";
import { CATEGORY_LABELS } from "../../mock/mockData";

export default function MemberJourneyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, journeys, updateMember, addJourneyEntry } = useAdminData();
  const member = members.find((m) => String(m.id) === id);

  if (!member) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-[14px] text-[var(--a-text-muted)]">Member not found.</p>
        <Button as="button" variant="secondary" onClick={() => navigate("/admin/members")}>Back to members</Button>
      </div>
    );
  }

  const entries = journeys[member.id] || [];

  return (
    <div className="flex flex-col gap-6">
      <Link to={`/admin/members/${member.id}`} className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> {member.name}'s profile
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={member.name} size={44} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-[var(--a-text-primary)]">Records — {member.name}</h1>
            <StatusBadge status={member.status} />
          </div>
          <p className="text-[13px] text-[var(--a-text-muted)]">{member.email} · {member.phone || "no phone"} · {CATEGORY_LABELS[member.category] ?? member.category}</p>
        </div>
      </div>

      <MemberSummaryCard value={member.summary} onChange={(v) => updateMember(member.id, { summary: v })} />

      <Card title="Journey timeline">
        <JourneyPanel
          entries={entries}
          onAddNote={(text) => { addJourneyEntry(member.id, { type: "note", content: text, addedBy: "You" }); toast.success("Note added"); }}
          onAddQa={(question, answer) => { addJourneyEntry(member.id, { type: "qa", question, answer, addedBy: "You" }); toast.success("Q&A saved"); }}
        />
      </Card>
    </div>
  );
}
