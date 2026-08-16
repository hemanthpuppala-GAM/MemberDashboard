import { Link } from "react-router-dom";
import { UsersRound, Inbox, CheckCircle2, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import Card from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import { useAdminData } from "../../store/useAdminData";
import { CURRENT_PRACTITIONER_ID, DASHBOARD_TRENDS, CATEGORY_LABELS } from "../../mock/mockData";

const PIE_COLORS = ["var(--a-accent)", "var(--a-focus)", "var(--a-success)", "var(--a-warning)"];
const TOOLTIP_STYLE = { background: "var(--a-bg-surface)", border: "1px solid var(--a-border)", borderRadius: 8, fontSize: 12.5 };
const axisProps = { tick: { fill: "var(--a-text-muted)", fontSize: 12 }, axisLine: false, tickLine: false };

export default function PractitionerDashboardPage() {
  const { members, queries, users } = useAdminData();
  const me = users.find((u) => u.id === CURRENT_PRACTITIONER_ID);
  const myMembers = members.filter((m) => m.assignedPractitioner === CURRENT_PRACTITIONER_ID);
  const myQueries = queries.filter((q) => q.assignedTo === CURRENT_PRACTITIONER_ID && q.status !== "resolved" && q.status !== "archived");

  const statusCounts = ["new", "active", "in_progress", "resolved", "archived"]
    .map((status) => ({ status, count: myMembers.filter((m) => m.status === status).length }))
    .filter((s) => s.count > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Welcome back, {me?.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Your members, queries, and activity at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={UsersRound} label="Total members" value={myMembers.length} trend={12} spark={DASHBOARD_TRENDS.members} />
        <StatCard icon={Inbox} label="New / open queries" value={myQueries.length} trend={-4} />
        <StatCard icon={CheckCircle2} label="Resolved this month" value={myMembers.filter((m) => m.status === "resolved").length} trend={20} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Members over time">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DASHBOARD_TRENDS.members.map((v, i) => ({ week: `W${i + 1}`, members: v }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" vertical={false} />
                <XAxis dataKey="week" {...axisProps} />
                <YAxis {...axisProps} width={28} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="members" stroke="var(--a-accent)" fill="var(--a-accent-muted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Members by status">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusCounts} dataKey="count" nameKey="status" innerRadius={42} outerRadius={64} paddingAngle={3}>
                  {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="My members" actions={<Link to="/admin/my-dashboard/members" className="text-[12.5px] font-semibold text-[var(--a-accent)] hover:underline">View all</Link>}>
        <div className="flex flex-col divide-y divide-[var(--a-border)]">
          {myMembers.slice(0, 5).map((m) => (
            <Link key={m.id} to={`/admin/my-dashboard/members/${m.id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80">
              <div>
                <div className="text-[13.5px] font-medium text-[var(--a-text-primary)]">{m.name}</div>
                <div className="text-[12px] text-[var(--a-text-muted)]">{CATEGORY_LABELS[m.category] ?? m.category} · {m.phone || "no phone"}</div>
              </div>
              <TrendingUp size={14} className="text-[var(--a-text-faint)]" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
