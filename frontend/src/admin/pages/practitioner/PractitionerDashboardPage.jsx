import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { UsersRound, Inbox, CheckCircle2, TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Card from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import { useAuth } from "../../useAuth";
import { practitionerApi } from "../../../lib/api";
import { CATEGORY_LABELS } from "../../mock/mockData";

const PIE_COLORS = ["var(--a-accent)", "var(--a-focus)", "var(--a-success)", "var(--a-warning)"];
const TOOLTIP_STYLE = { background: "var(--a-bg-surface)", border: "1px solid var(--a-border)", borderRadius: 8, fontSize: 12.5 };

export default function PractitionerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myMembers, setMyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([practitionerApi.dashboardStats(), practitionerApi.members()])
      .then(([s, members]) => { setStats(s); setMyMembers(members); })
      .catch((err) => toast.error(err.message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  }

  const statusCounts = Object.entries(stats.members_by_status ?? {}).map(([status, count]) => ({ status, count }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Your members, queries, and activity at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={UsersRound} label="Total members" value={stats.total_members} />
        <StatCard icon={Inbox} label="New / open queries" value={stats.open_queries} />
        <StatCard icon={CheckCircle2} label="Resolved this month" value={stats.resolved_this_month} />
      </div>

      {statusCounts.length > 0 && (
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
      )}

      <Card title="My members" actions={<Link to="/admin/my-dashboard/members" className="text-[12.5px] font-semibold text-[var(--a-accent)] hover:underline">View all</Link>}>
        {myMembers.length === 0 ? (
          <p className="py-4 text-[13.5px] text-[var(--a-text-muted)]">No members assigned yet.</p>
        ) : (
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
        )}
      </Card>
    </div>
  );
}
