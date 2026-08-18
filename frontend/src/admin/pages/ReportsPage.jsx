import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { Download, FileText } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Tabs from "../ui/Tabs";
import DataTable from "../ui/DataTable";
import { api, downloadAuthed } from "../../lib/api";

const PIE_COLORS = ["var(--a-accent)", "var(--a-focus)", "var(--a-success)", "var(--a-warning)"];
const TOOLTIP_STYLE = { background: "var(--a-bg-surface)", border: "1px solid var(--a-border)", borderRadius: 8, fontSize: 12.5 };
const axisProps = { tick: { fill: "var(--a-text-muted)", fontSize: 12 }, axisLine: false, tickLine: false };

const toEntries = (obj, keyName, valueName = "count") => Object.entries(obj ?? {}).map(([k, v]) => ({ [keyName]: k, [valueName]: v }));

export default function ReportsPage() {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [membersReport, setMembersReport] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.reportsOverview(), api.reportsMembers(), api.reportsPractitioners(), api.reportsActivityLog({ per_page: 100 })])
      .then(([ov, mem, prac, log]) => {
        setOverview(ov);
        setMembersReport({ ...mem, practitionerWorkload: prac });
        setActivityLog(log.data);
      })
      .catch((err) => toast.error(err.message ?? "Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const activityColumns = [
    { id: "user", header: "User", accessorFn: (l) => l.user?.name ?? "System", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "target_type", header: "Target" },
    { accessorKey: "ip_address", header: "IP address" },
    { accessorKey: "created_at", header: "When", cell: ({ getValue }) => new Date(getValue()).toLocaleString() },
  ];

  const exportActivityCsv = () => downloadAuthed("/admin/reports/export?type=activity-log&format=csv", "activity-log.csv").catch((err) => toast.error(err.message ?? "Export failed"));

  if (loading) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading reports…</p>;
  }

  const submissionsByCategory = toEntries(overview.by_category, "category");
  const statusBreakdown = toEntries(membersReport.status_breakdown, "status");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Reports & analytics</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Website submissions, member/practitioner health, and audit trail.</p>
        </div>
        <div className="flex gap-2">
          <Button as="button" variant="secondary" size="sm" icon={Download} onClick={exportActivityCsv}>Export CSV</Button>
          <Button as="button" variant="secondary" size="sm" icon={FileText} onClick={() => toast("PDF export isn't wired up on the backend yet — use CSV.")}>Export PDF</Button>
        </div>
      </div>

      <Tabs
        tabs={[{ key: "overview", label: "Overview" }, { key: "members", label: "Members & Practitioners" }, { key: "activity", label: "Activity Log" }]}
        active={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Submissions per month" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.submissions_monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} width={28} />
                  <Tooltip cursor={{ fill: "var(--a-bg-surface-2)" }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="var(--a-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Submissions by category" className="lg:col-span-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={submissionsByCategory} dataKey="count" nameKey="category" innerRadius={48} outerRadius={72} paddingAngle={3}>
                    {submissionsByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12.5 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {tab === "members" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Members per practitioner">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membersReport.members_by_practitioner} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" horizontal={false} />
                  <XAxis type="number" {...axisProps} />
                  <YAxis type="category" dataKey="name" {...axisProps} width={90} />
                  <Tooltip cursor={{ fill: "var(--a-bg-surface-2)" }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="members" fill="var(--a-accent)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Member status breakdown">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={48} outerRadius={72} paddingAngle={3}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12.5 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="New vs resolved" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={membersReport.new_vs_resolved_monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} width={28} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12.5 }} />
                  <Area type="monotone" dataKey="new" stroke="var(--a-accent)" fill="var(--a-accent-muted)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="var(--a-focus)" fill="var(--a-focus-muted)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Practitioner workload" className="lg:col-span-2" padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="bg-[var(--a-bg-surface-2)]">
                    {["Practitioner", "Members", "Capacity", "Resolved this month"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[var(--a-text-muted)] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {membersReport.practitionerWorkload.map((row) => (
                    <tr key={row.name} className="border-t border-[var(--a-border)]">
                      <td className="px-4 py-3 text-[13.5px] font-medium text-[var(--a-text-primary)]">{row.name}</td>
                      <td className="px-4 py-3 text-[13.5px]">{row.members}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--a-bg-surface-2)]">
                            <div className="h-full rounded-full bg-[var(--a-accent)]" style={{ width: `${row.capacity ? Math.min(100, (row.members / row.capacity) * 100) : 0}%` }} />
                          </div>
                          <span className="text-[12px] text-[var(--a-text-muted)]">{row.members}/{row.capacity ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13.5px]">{row.resolved_this_month}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "activity" && (
        <Card padded={false}>
          <div className="p-5 sm:p-6">
            <DataTable columns={activityColumns} data={activityLog} searchPlaceholder="Search activity..." />
          </div>
        </Card>
      )}
    </div>
  );
}
