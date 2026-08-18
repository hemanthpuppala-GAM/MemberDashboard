import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Files, Image, Inbox, UsersRound, UserCog, CalendarDays, ArrowRight } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Card from "../ui/Card";
import StatCard from "../ui/StatCard";
import { useAuth } from "../useAuth";
import { api } from "../../lib/api";

const QUICK_LINKS = [
  { to: "/admin/cms/pages/new", label: "New page", icon: Files },
  { to: "/admin/cms/media", label: "Upload media", icon: Image },
  { to: "/admin/queries", label: "Query inbox", icon: Inbox },
  { to: "/admin/announcements", label: "New announcement", icon: UsersRound },
];

function timeAgo(iso) {
  const diffMs = Date.now() - Date.parse(iso);
  const hrs = Math.round(diffMs / 3.6e6);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [submissionsMonthly, setSubmissionsMonthly] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard(),
      api.pages(),
      api.media(),
      api.members(),
      api.users(),
      api.reportsOverview(),
      api.reportsActivityLog({ per_page: 6 }),
    ])
      .then(([dash, pages, media, membersRes, users, overview, log]) => {
        setStats({
          pages: pages.length,
          media: media.length,
          newQueries: dash.contact_new,
          activeMembers: membersRes.data.filter((m) => m.status !== "archived").length,
          practitioners: users.filter((u) => u.primary_role?.name === "practitioner").length,
        });
        setSubmissionsMonthly(overview.submissions_monthly);
        setActivity(log.data);
      })
      .catch((err) => toast.error(err.message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Here's what's happening across the site today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Files} label="Website pages" value={stats.pages} />
        <StatCard icon={Image} label="Media items" value={stats.media} />
        <StatCard icon={Inbox} label="New queries" value={stats.newQueries} />
        <StatCard icon={UsersRound} label="Active members" value={stats.activeMembers} />
        <StatCard icon={UserCog} label="Practitioners" value={stats.practitioners} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Contact submissions" description="Last 6 months" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionsMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--a-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--a-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: "var(--a-bg-surface-2)" }}
                  contentStyle={{ background: "var(--a-bg-surface)", border: "1px solid var(--a-border)", borderRadius: 8, fontSize: 12.5 }}
                />
                <Bar dataKey="count" fill="var(--a-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Quick links">
          <div className="flex flex-col gap-2">
            {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg border border-[var(--a-border)] px-3.5 py-2.5 text-[13.5px] font-medium text-[var(--a-text-primary)] transition-colors hover:border-[var(--a-accent)] hover:bg-[var(--a-accent-muted)]"
              >
                <Icon size={16} className="text-[var(--a-accent)]" />
                <span className="flex-1">{label}</span>
                <ArrowRight size={14} className="text-[var(--a-text-faint)]" />
              </Link>
            ))}
            <Link
              to="/admin/events"
              className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--a-border)] px-3.5 py-2.5 text-[13px] text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]"
            >
              <CalendarDays size={16} />
              <span className="flex-1">Upcoming events (via Pages &gt; Events)</span>
            </Link>
          </div>
        </Card>
      </div>

      <Card title="Recent activity" description="Latest changes across the admin panel" actions={<Link to="/admin/reports" className="text-[12.5px] font-semibold text-[var(--a-accent)] hover:underline">View log</Link>}>
        {activity.length === 0 ? (
          <p className="py-4 text-[13.5px] text-[var(--a-text-muted)]">No activity recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--a-border)]">
            {activity.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="text-[13.5px] text-[var(--a-text-primary)]">
                  <span className="font-semibold">{log.user?.name ?? "System"}</span>{" "}
                  <span className="text-[var(--a-text-muted)]">{log.action}</span> {log.target_type}
                </div>
                <span className="shrink-0 text-[12px] text-[var(--a-text-faint)]">{timeAgo(log.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
