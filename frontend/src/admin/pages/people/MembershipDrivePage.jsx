import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Download, Eye, UserPlus, Trash2, MapPin, CalendarDays, CheckCircle2 } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import ConfirmModal from "../../ui/ConfirmModal";
import { TextArea } from "../../ui/Field";
import { api, downloadAuthed } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const errorText = (err, fallback) => (err?.errors ? Object.values(err.errors).flat()[0] : err?.message ?? fallback);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "No date");

const STATUS = {
  new: { tone: "info", label: "Will be added" },
  created: { tone: "success", label: "Added" },
  existing: { tone: "neutral", label: "Already a member" },
  repeat: { tone: "warning", label: "Repeated line" },
  invalid: { tone: "danger", label: "Can't read" },
};

const PLACEHOLDER = `One person per line — phone number, and a name or email if you have them:

9876543210
9876543211, Lakshmi
Ravi Kumar, +91 98765 43212, ravi@example.com`;

/** One drive: paste phone numbers → preview → add. Each new person gets a GAW member ID. */
export default function MembershipDrivePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canEdit = can("members.edit");
  const canDelete = can("members.delete");

  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState("");
  const [result, setResult] = useState(null); // { rows, summary, preview }
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(
    () =>
      api
        .membershipDrive(id)
        .then(setDrive)
        .catch((err) => toast.error(err.message ?? "Failed to load the drive")),
    [id]
  );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const lineCount = useMemo(() => lines.split("\n").filter((l) => l.trim()).length, [lines]);

  const submit = async (preview) => {
    setBusy(true);
    try {
      const res = await api.addDriveMembers(id, lines, preview);
      setResult({ ...res, preview });
      if (!preview) {
        toast.success(`${res.summary.created} member${res.summary.created === 1 ? "" : "s"} added`);
        setLines("");
        await load();
      }
    } catch (err) {
      toast.error(errorText(err, "Could not read the list"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api.deleteMembershipDrive(id);
      toast.success("Drive deleted — its members are kept");
      navigate("/admin/membership-drives");
    } catch (err) {
      toast.error(errorText(err, "Delete failed"));
    }
  };

  if (loading) return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  if (!drive) return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Drive not found.</p>;

  const s = result?.summary;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/membership-drives" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> All drives
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">{drive.name}</h1>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--a-text-muted)]">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {fmtDate(drive.held_on)}</span>
            {drive.place && <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {drive.place}</span>}
            <span>{drive.members_count} member{drive.members_count === 1 ? "" : "s"}</span>
          </div>
          {drive.notes && <p className="mt-2 max-w-2xl text-[13px] text-[var(--a-text-muted)]">{drive.notes}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Download}
            disabled={!drive.members_count}
            onClick={() => downloadAuthed(`/admin/membership-drives/${id}/export`, `drive-${id}-members.csv`).catch((err) => toast.error(err.message ?? "Export failed"))}
          >
            Export CSV
          </Button>
          <Button variant="danger-ghost" icon={Trash2} disabled={!canDelete} onClick={() => setConfirmDelete(true)}>
            Delete drive
          </Button>
        </div>
      </div>

      <Card
        title="Add members"
        description="Paste the numbers you collected. Check first with Preview — nothing is saved until you press Add. People already in the system keep their existing member ID."
      >
        <TextArea rows={9} value={lines} onChange={(e) => { setLines(e.target.value); setResult(null); }} placeholder={PLACEHOLDER} disabled={!canEdit} className="font-mono text-[13px]" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12.5px] text-[var(--a-text-faint)]">{lineCount} line{lineCount === 1 ? "" : "s"} · a bare 10-digit number is read as India (+91)</span>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Eye} onClick={() => submit(true)} disabled={!canEdit || !lineCount || busy}>Preview</Button>
            <Button icon={UserPlus} onClick={() => submit(false)} disabled={!canEdit || !lineCount || busy || (result?.preview && !s?.new)}>
              {busy ? "Working…" : result?.preview && s ? `Add ${s.new} member${s.new === 1 ? "" : "s"}` : "Add members"}
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS).map(([k, v]) =>
                s[k] ? <Badge key={k} tone={v.tone}>{s[k]} · {v.label}</Badge> : null
              )}
            </div>
            <div className="max-h-[420px] overflow-auto rounded-xl border border-[var(--a-border)]">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 bg-[var(--a-bg-surface-2)] text-[11.5px] tracking-wide text-[var(--a-text-muted)] uppercase">
                  <tr><th className="px-3 py-2">Line</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Member ID</th><th className="px-3 py-2">Result</th></tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={i} className="border-t border-[var(--a-border)]">
                      <td className="max-w-[220px] truncate px-3 py-2 font-mono text-[12px] text-[var(--a-text-muted)]">{r.line}</td>
                      <td className="px-3 py-2">{r.name || <span className="text-[var(--a-text-faint)]">—</span>}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.phone || r.email || "—"}</td>
                      <td className="px-3 py-2 font-semibold whitespace-nowrap">
                        {r.member_id ? <Link to={`/admin/members/${r.member_id}`} className="text-[var(--a-accent)] hover:underline">{r.member_code}</Link> : "—"}
                      </td>
                      <td className="px-3 py-2"><Badge tone={STATUS[r.status]?.tone}>{r.status === "invalid" || r.status === "repeat" ? r.message : STATUS[r.status]?.label}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      <Card title={`Members from this drive (${drive.members?.length ?? 0})`} padded={false}>
        {drive.members?.length ? (
          <div className="overflow-x-auto p-5 pt-4 sm:p-6 sm:pt-4">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[11.5px] tracking-wide text-[var(--a-text-muted)] uppercase">
                <tr><th className="py-2 pr-3">Member ID</th><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Phone</th><th className="py-2 pr-3">Email</th><th className="py-2">Signed in</th></tr>
              </thead>
              <tbody>
                {drive.members.map((m) => (
                  <tr key={m.id} className="cursor-pointer border-t border-[var(--a-border)] hover:bg-[var(--a-bg-surface-2)]" onClick={() => navigate(`/admin/members/${m.id}`)}>
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap text-[var(--a-text-primary)]">{m.member_code}</td>
                    <td className="py-2 pr-3">{m.name || <span className="text-[var(--a-text-faint)]">No name yet</span>}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{m.phone || "—"}</td>
                    <td className="py-2 pr-3 break-all">{m.email || "—"}</td>
                    <td className="py-2">{m.signed_in ? <CheckCircle2 size={16} className="text-[var(--a-success)]" aria-label="Yes" /> : <span className="text-[var(--a-text-faint)]">Not yet</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 pt-3 text-[13px] text-[var(--a-text-muted)]">Nobody added yet.</p>
        )}
      </Card>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete "${drive.name}"?`}
        description="The members stay, with their member IDs — they just won't be grouped under this drive any more."
        onConfirm={remove}
      />
    </div>
  );
}
