import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, UsersRound } from "lucide-react";
import Card from "../../ui/Card";
import DataTable from "../../ui/DataTable";
import { StatusBadge } from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import JourneyPanel from "../../ui/JourneyPanel";
import MemberSummaryCard from "../../ui/MemberSummaryCard";
import { useAdminData } from "../../store/useAdminData";
import { CURRENT_PRACTITIONER_ID, CATEGORY_LABELS } from "../../mock/mockData";

export default function MyMembersPage() {
  const { id } = useParams();
  return id ? <MemberJourney id={id} /> : <MembersList />;
}

function MembersList() {
  const { members } = useAdminData();
  const navigate = useNavigate();
  const myMembers = members.filter((m) => m.assignedPractitioner === CURRENT_PRACTITIONER_ID);

  const columns = [
    {
      accessorKey: "name", header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.original.name} size={28} />
          <span className="font-semibold text-[var(--a-text-primary)]">{row.original.name}</span>
        </div>
      ),
    },
    { accessorKey: "phone", header: "Mobile", cell: ({ getValue }) => getValue() || "—" },
    { accessorKey: "category", header: "Category", cell: ({ getValue }) => CATEGORY_LABELS[getValue()] ?? getValue() },
    { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
    { accessorKey: "lastContact", header: "Last activity", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">My members</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Everyone currently assigned to you.</p>
      </div>
      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable columns={columns} data={myMembers} searchPlaceholder="Search my members..." onRowClick={(m) => navigate(`/admin/my-dashboard/members/${m.id}`)} emptyIcon={UsersRound} emptyTitle="No members assigned yet" />
        </div>
      </Card>
    </div>
  );
}

function MemberJourney({ id }) {
  const { members, journeys, updateMember, addJourneyEntry } = useAdminData();
  const member = members.find((m) => String(m.id) === id);

  if (!member) return <p className="text-[13.5px] text-[var(--a-text-muted)]">Member not found.</p>;

  const entries = journeys[member.id] || [];

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/my-dashboard/members" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> My members
      </Link>

      <div className="flex items-center gap-3">
        <Avatar name={member.name} size={40} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-[var(--a-text-primary)]">{member.name}</h1>
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
