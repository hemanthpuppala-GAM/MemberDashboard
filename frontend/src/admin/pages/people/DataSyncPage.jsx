import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, RefreshCw, KeyRound, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const TABLE_LABEL = {
  reserved_numbers: { name: "Reserved member numbers", into: "Ceremonial GAW numbers (e.g. the founder's)" },
  members: { name: "Members", into: "Members — matched by email; the live site's GAW number is kept" },
  volunteers: { name: "Volunteers", into: "Volunteer applications, linked to the member" },
  practice: { name: "Practice & journal", into: "Each sit and journal entry, once" },
  support_agents: { name: "Support desk team", into: "Support team — their desk password keeps working" },
  support_calls: { name: "Support desk calls", into: "Support desk tickets (source: call)" },
};

const fmt = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "");

function Report({ report }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-[var(--a-border)]">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[var(--a-bg-surface-2)] text-[11.5px] tracking-wide text-[var(--a-text-muted)] uppercase">
            <tr>
              <th className="px-3 py-2">Live site data</th><th className="px-3 py-2 text-right">Rows</th><th className="px-3 py-2 text-right">New</th>
              <th className="px-3 py-2 text-right">Updated</th><th className="px-3 py-2 text-right">Same</th><th className="px-3 py-2 text-right">Skipped</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(report.counts).map(([t, c]) => (
              <tr key={t} className="border-t border-[var(--a-border)]">
                <td className="px-3 py-2">
                  <div className="font-semibold text-[var(--a-text-primary)]">{TABLE_LABEL[t]?.name ?? t}</div>
                  <div className="text-[12px] text-[var(--a-text-muted)]">{TABLE_LABEL[t]?.into}</div>
                </td>
                <td className="px-3 py-2 text-right">{c.rows}</td>
                <td className="px-3 py-2 text-right font-semibold text-[var(--a-success)]">{c.created || ""}</td>
                <td className="px-3 py-2 text-right font-semibold text-[var(--a-info)]">{c.updated || ""}</td>
                <td className="px-3 py-2 text-right text-[var(--a-text-muted)]">{c.unchanged || ""}</td>
                <td className="px-3 py-2 text-right text-[var(--a-warning)]">{c.skipped || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {report.notes?.length > 0 && (
        <div>
          <p className="mb-1.5 text-[12.5px] font-semibold text-[var(--a-text-primary)]">Notes</p>
          <ul className="flex max-h-60 list-disc flex-col gap-1 overflow-auto pl-5 text-[12.5px] text-[var(--a-text-muted)]">
            {report.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

/** People → Data sync: bring the live site's Supabase data (members, volunteers, journal, desk) in. */
export default function DataSyncPage() {
  const { can } = usePermissions();
  const canEdit = can("members.edit");
  const [state, setState] = useState(null);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.dataSync().then(setState).catch((err) => toast.error(err.message ?? "Failed to load"));
  }, []);

  const run = async (preview) => {
    setBusy(true);
    try {
      const res = await api.runDataSync(preview);
      setReport(res);
      if (!preview) {
        toast.success("Synced — safe to run again any time");
        setState((s) => ({ ...s, last: res, last_error: null }));
      }
    } catch (err) {
      toast.error(err.message ?? "Sync failed");
    } finally {
      setBusy(false);
    }
  };

  if (!state) return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Data sync</h1>
        <p className="mt-1 max-w-3xl text-[13.5px] text-[var(--a-text-muted)]">
          Copies everything the live site (goldenagewisdom.org) keeps in Supabase into this admin panel: members and their GAW numbers, volunteers, practice
          history and journal entries, and the Support Desk team and call log. Run it as often as you like — records are matched, never duplicated, and nothing
          here is deleted.
        </p>
      </div>

      {state.configured && (
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-2 text-[13px] text-[var(--a-text-muted)]">
            <Clock size={15} className="text-[var(--a-accent)]" />
            {state.auto
              ? "Runs automatically every day at 3:00 AM IST (after the 2:45 AM database backup). You can also sync any time below."
              : "Automatic daily sync is off (SUPABASE_AUTO_SYNC=false) — sync by hand below."}
          </p>
          {state.last_error && (
            <p className="flex items-start gap-2 rounded-xl border border-[var(--a-danger)]/30 bg-[var(--a-danger-muted)] px-3.5 py-2.5 text-[13px] text-[var(--a-danger)]">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>Last sync failed on {fmt(state.last_error.at)} — nothing was saved. {state.last_error.message}</span>
            </p>
          )}
        </div>
      )}

      {!state.configured ? (
        <Card>
          <div className="flex items-start gap-3">
            <KeyRound size={20} className="mt-0.5 shrink-0 text-[var(--a-warning)]" />
            <div className="text-[13.5px] text-[var(--a-text-muted)]">
              <p className="font-semibold text-[var(--a-text-primary)]">Connect the live site first</p>
              <p className="mt-1">
                Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_KEY</code> (Supabase → Project settings → API → service_role key) to the backend{" "}
                <code>.env</code> on the server, then reload this page. The key stays on the server and is never shown here.
              </p>
              <p className="mt-2">
                No key? A developer can run <code>php artisan supabase:sync --from=&lt;folder of exported CSV/JSON&gt;</code> instead.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          title="Sync from the live site"
          description="Preview shows exactly what would change without saving anything. Sync now applies it."
          actions={
            <>
              <Button variant="secondary" icon={Eye} onClick={() => run(true)} disabled={busy}>Preview</Button>
              <Button icon={RefreshCw} onClick={() => run(false)} disabled={busy || !canEdit} title={canEdit ? undefined : "You don't have permission to change members"}>
                {busy ? "Working…" : "Sync now"}
              </Button>
            </>
          }
        >
          {report ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {report.dry_run ? <Badge tone="info">Preview — nothing saved</Badge> : <Badge tone="success">Saved</Badge>}
                <span className="text-[12.5px] text-[var(--a-text-faint)]">{fmt(report.ran_at)}</span>
              </div>
              <Report report={report} />
            </div>
          ) : (
            <p className="text-[13px] text-[var(--a-text-muted)]">Press Preview to see what the live site holds and what would change.</p>
          )}
        </Card>
      )}

      {state.last && !(report && !report.dry_run) && (
        <Card title="Last sync" description={`${fmt(state.last.ran_at)}${state.last.by ? ` · by ${state.last.by}` : ""}`} actions={<CheckCircle2 size={18} className="text-[var(--a-success)]" />}>
          <Report report={state.last} />
        </Card>
      )}
    </div>
  );
}
