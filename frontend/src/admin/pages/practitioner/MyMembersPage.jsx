import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, UsersRound } from "lucide-react";
import Card from "../../ui/Card";
import DataTable from "../../ui/DataTable";
import { StatusBadge } from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import JourneyPanel from "../../ui/JourneyPanel";
import MemberSummaryCard from "../../ui/MemberSummaryCard";
import { practitionerApi } from "../../../lib/api";
import { CATEGORY_LABELS } from "../../mock/mockData";

export default function MyMembersPage() {
  const { id } = useParams();
  return id ? <MemberJourney id={id} /> : <MembersList />;
}

function MembersList() {
  const [myMembers, setMyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    practitionerApi.members()
      .then(setMyMembers)
      .catch((err) => toast.error(err.message ?? "Failed to load members"))
      .finally(() => setLoading(false));
  }, []);

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
    { accessorKey: "last_contact_date", header: "Last activity", cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleDateString() : "—") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">My members</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Everyone currently assigned to you.</p>
      </div>
      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable columns={columns} data={myMembers} searchPlaceholder="Search my members..." onRowClick={(m) => navigate(`/admin/my-dashboard/members/${m.id}`)} emptyIcon={UsersRound} emptyTitle={loading ? "Loading…" : "No members assigned yet"} />
        </div>
      </Card>
    </div>
  );
}

function decorateEntries(entries) {
  return entries.map((e) => ({ ...e, date: e.created_at, type: e.entry_type, addedBy: e.author?.name }));
}

function MemberJourney({ id }) {
  const [member, setMember] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([practitionerApi.member(id), practitionerApi.journey(id)])
      .then(([m, j]) => { setMember(m); setSummary(m.summary ?? ""); setEntries(decorateEntries(j)); })
      .catch((err) => toast.error(err.message ?? "Failed to load member"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  if (!member) return <p className="text-[13.5px] text-[var(--a-text-muted)]">Member not found.</p>;

  const saveSummary = async (value) => {
    try {
      const updated = await practitionerApi.updateSummary(member.id, value);
      setMember((m) => ({ ...m, ...updated }));
      toast.success("Summary saved");
    } catch (err) {
      toast.error(err.message ?? "Save failed");
    }
  };

  const addNote = async (text) => {
    try {
      const entry = await practitionerApi.addJourneyEntry(member.id, { entry_type: "note", content: text });
      setEntries((prev) => [{ ...entry, date: entry.created_at, type: entry.entry_type, addedBy: entry.author?.name }, ...prev]);
      toast.success("Note added");
    } catch (err) {
      toast.error(err.message ?? "Failed to add note");
    }
  };

  const addQa = async (question, answer) => {
    try {
      const entry = await practitionerApi.addJourneyEntry(member.id, { entry_type: "qa", question, answer });
      setEntries((prev) => [{ ...entry, date: entry.created_at, type: entry.entry_type, addedBy: entry.author?.name }, ...prev]);
      toast.success("Q&A saved");
    } catch (err) {
      toast.error(err.message ?? "Failed to save Q&A");
    }
  };

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

      <MemberSummaryCard value={summary} onChange={setSummary} onBlur={saveSummary} />

      <Card title="Journey timeline">
        <JourneyPanel entries={entries} onAddNote={addNote} onAddQa={addQa} />
      </Card>
    </div>
  );
}
