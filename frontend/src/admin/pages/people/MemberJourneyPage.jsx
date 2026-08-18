import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { StatusBadge } from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import JourneyPanel from "../../ui/JourneyPanel";
import MemberSummaryCard from "../../ui/MemberSummaryCard";
import { api } from "../../../lib/api";
import { CATEGORY_LABELS } from "../../mock/mockData";

function decorateEntries(entries) {
  return entries.map((e) => ({ ...e, date: e.created_at, type: e.entry_type, addedBy: e.author?.name }));
}

export default function MemberJourneyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.member(id), api.memberJourney(id)])
      .then(([m, j]) => {
        setMember(m);
        setSummary(m.summary ?? "");
        setEntries(decorateEntries(j));
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

  const saveSummary = async (value) => {
    try {
      const updated = await api.updateMember(member.id, {
        name: member.name, email: member.email, phone: member.phone, category: member.category,
        status: member.status, summary: value || null, assigned_practitioner_id: member.assigned_practitioner_id,
      });
      setMember((m) => ({ ...m, ...updated }));
      toast.success("Summary saved");
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    }
  };

  const addNote = async (text) => {
    try {
      const entry = await api.addMemberJourneyEntry(member.id, { entry_type: "note", content: text });
      setEntries((prev) => [{ ...entry, date: entry.created_at, type: entry.entry_type, addedBy: entry.author?.name }, ...prev]);
      toast.success("Note added");
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Failed to add note"));
    }
  };

  const addQa = async (question, answer) => {
    try {
      const entry = await api.addMemberJourneyEntry(member.id, { entry_type: "qa", question, answer });
      setEntries((prev) => [{ ...entry, date: entry.created_at, type: entry.entry_type, addedBy: entry.author?.name }, ...prev]);
      toast.success("Q&A saved");
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Failed to save Q&A"));
    }
  };

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

      <MemberSummaryCard value={summary} onChange={setSummary} onBlur={saveSummary} />

      <Card title="Journey timeline">
        <JourneyPanel entries={entries} onAddNote={addNote} onAddQa={addQa} />
      </Card>
    </div>
  );
}
