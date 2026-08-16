import { Link } from "react-router-dom";
import { Files, Image, Inbox, UsersRound, UserCog, CalendarDays, ArrowRight } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Card from "../ui/Card";
import StatCard from "../ui/StatCard";
import { useAuth } from "../useAuth";
import {
  PAGES, MEDIA, QUERIES, MEMBERS, USERS, ACTIVITY_LOG, REPORTS, DASHBOARD_TRENDS,
} from "../mock/mockData";

const QUICK_LINKS = [
  { to: "/admin/cms/pages/new", label: "New page", icon: Files },
  { to: "/admin/cms/media", label: "Upload media", icon: Image },
  { to: "/admin/queries", label: "Query inbox", icon: Inbox },
  { to: "/admin/announcements", label: "New announcement", icon: UsersRound },
];

function timeAgo(iso) {
  const diffMs = Date.parse("2026-08-14T09:00:00Z") - Date.parse(iso);
  const hrs = Math.round(diffMs / 3.6e6);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const newQueries = QUERIES.filter((q) => q.status === "new").length;
  const practitioners = USERS.filter((u) => u.role === "practitioner").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Here's what's happening across the site today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Files} label="Website pages" value={PAGES.length} trend={8} spark={DASHBOARD_TRENDS.pages} />
        <StatCard icon={Image} label="Media items" value={MEDIA.length} trend={3} spark={DASHBOARD_TRENDS.media} />
        <StatCard icon={Inbox} label="New queries" value={newQueries} trend={-12} spark={DASHBOARD_TRENDS.queries} />
        <StatCard icon={UsersRound} label="Active members" value={MEMBERS.filter((m) => m.status !== "archived").length} trend={15} spark={DASHBOARD_TRENDS.members} />
        <StatCard icon={UserCog} label="Practitioners" value={practitioners} trend={0} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Contact submissions" description="Last 6 months" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REPORTS.submissionsMonthly}>
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
        <div className="flex flex-col divide-y divide-[var(--a-border)]">
          {ACTIVITY_LOG.slice(0, 6).map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="text-[13.5px] text-[var(--a-text-primary)]">
                <span className="font-semibold">{log.user}</span>{" "}
                <span className="text-[var(--a-text-muted)]">{log.action}</span> {log.target}
              </div>
              <span className="shrink-0 text-[12px] text-[var(--a-text-faint)]">{timeAgo(log.timestamp)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
