import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Files, Image, Inbox, UsersRound, CalendarDays, ArrowRight, SlidersHorizontal } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Card from "../ui/Card";
import StatCard from "../ui/StatCard";
import Button from "../ui/Button";
import { useAuth } from "../useAuth";
import { usePermissions } from "../usePermissions";
import { api } from "../../lib/api";
import { DASHBOARD_WIDGETS, DEFAULT_DASHBOARD_WIDGETS } from "../dashboardWidgets";
import DashboardCustomizeModal from "./DashboardCustomizeModal";

const QUICK_LINKS = [
  { to: "/admin/cms/pages/new", label: "New page", icon: Files, permission: "cms.create" },
  { to: "/admin/cms/media", label: "Upload media", icon: Image, permission: "cms.view" },
  { to: "/admin/queries", label: "Query inbox", icon: Inbox, permission: "members.view" },
  { to: "/admin/announcements", label: "New announcement", icon: UsersRound, permission: "announcements.create" },
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
  const { can } = usePermissions();
  const canViewCms = can("cms.view");
  const canViewReports = can("reports.view");

  const [stats, setStats] = useState({});
  const [layout, setLayout] = useState(null);
  const [customizing, setCustomizing] = useState(false);
  const [submissionsMonthly, setSubmissionsMonthly] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Each widget only fetches what its own permission covers, and failures
    // are isolated per-widget — a role missing e.g. reports.view still gets
    // a working dashboard for everything it can see, instead of the whole
    // page dying on one 403 (see git history for the Promise.all version
    // this replaced).
    const jobs = [
      api.dashboard().then(setStats),
      api.dashboardLayout().then((res) => setLayout(res.widgets)),
      canViewReports && api.reportsOverview().then((overview) => setSubmissionsMonthly(overview.submissions_monthly)),
      canViewReports && api.reportsActivityLog({ per_page: 6 }).then((log) => setActivity(log.data)),
    ].filter(Boolean);

    Promise.allSettled(jobs)
      .then((results) => {
        const failed = results.find((r) => r.status === "rejected");
        if (failed) toast.error(failed.reason?.message ?? "Some dashboard widgets failed to load");
      })
      .finally(() => setLoading(false));
  }, [canViewReports]);

  if (loading) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  }

  // A saved layout may reference a widget the admin no longer has permission for
  // (role changed after saving) — stats simply won't have that key, so it drops out.
  const selectedIds = (layout ?? DEFAULT_DASHBOARD_WIDGETS).filter((id) => stats[id] !== undefined);
  const widgets = selectedIds.map((id) => DASHBOARD_WIDGETS.find((w) => w.id === id)).filter(Boolean);

  function handleSaveLayout(widgetIds) {
    setLayout(widgetIds);
    api.updateDashboardLayout(widgetIds).catch((e) => toast.error(e.message ?? "Failed to save dashboard layout"));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Here's what's happening across the site today.</p>
        </div>
        <Button variant="secondary" size="sm" icon={SlidersHorizontal} onClick={() => setCustomizing(true)}>
          Customize
        </Button>
      </div>

      {widgets.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {widgets.map((w) => (
            <StatCard key={w.id} icon={w.icon} label={w.label} value={stats[w.id] ?? 0} to={w.to} />
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {canViewReports && (
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
        )}

        <Card title="Quick links" className={canViewReports ? undefined : "lg:col-span-3"}>
          <div className="flex flex-col gap-2">
            {QUICK_LINKS.filter((l) => can(l.permission)).map(({ to, label, icon: Icon }) => (
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
            {canViewCms && (
              <Link
                to="/admin/events"
                className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--a-border)] px-3.5 py-2.5 text-[13px] text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]"
              >
                <CalendarDays size={16} />
                <span className="flex-1">Upcoming events (via Pages &gt; Events)</span>
              </Link>
            )}
          </div>
        </Card>
      </div>

      {canViewReports && (
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
      )}

      <DashboardCustomizeModal open={customizing} onClose={() => setCustomizing(false)} selected={selectedIds} onSave={handleSaveLayout} />
    </div>
  );
}
