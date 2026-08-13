import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import Card from "../components/ui/Card";

const STATS = [
  { key: "content_blocks", label: "Content blocks", to: "/admin/content/about" },
  { key: "events_upcoming", label: "Upcoming events", to: "/admin/events" },
  { key: "contact_new", label: "New messages", to: "/admin/contact" },
  { key: "contact_total", label: "Total messages", to: "/admin/contact" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[26px] text-[var(--color-ink)]">Dashboard</h1>
        <p className="mt-1 text-[13.5px] text-[var(--color-muted)]">
          Overview of your site's editable content and incoming messages.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ key, label, to }) => (
          <Link key={key} to={to}>
            <Card className="transition-shadow hover:shadow-[0_12px_36px_-14px_rgba(88,84,160,0.45)]">
              <div className="font-display text-[32px] text-[var(--color-gold-deep)]">
                {stats ? (stats[key] ?? "—") : "…"}
              </div>
              <div className="mt-1 text-[12.5px] text-[var(--color-muted)]">{label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <Card title="Quick links" description="Jump straight to editing a page.">
        <div className="flex flex-wrap gap-2">
          {[
            ["about", "About Me"],
            ["meditate", "Meditation"],
            ["wellness", "Wellness"],
            ["events", "Events intro"],
            ["mission", "Our Mission"],
          ].map(([slug, label]) => (
            <Link
              key={slug}
              to={`/admin/content/${slug}`}
              className="rounded-full border border-[rgba(110,198,234,0.45)] px-4 py-1.5 text-[13px] text-[var(--color-ink)] transition-colors hover:border-[var(--color-gold)]/70 hover:bg-[rgba(110,198,234,0.15)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
