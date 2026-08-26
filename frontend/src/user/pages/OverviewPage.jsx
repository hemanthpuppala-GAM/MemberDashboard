import { useEffect, useState } from "react";
import { Flame, Clock, Gauge, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import IconBadge from "../ui/IconBadge";
import ProgressRing from "../ui/ProgressRing";
import Button from "../../components/ui/Button";
import { memberAuthApi } from "../../lib/memberAuth";

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatSessionTime(iso) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

export default function OverviewPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    memberAuthApi
      .overview()
      .then(setOverview)
      .catch((e) => setError(e.message || "Could not load your overview."))
      .finally(() => setLoading(false));
  }, []);

  const stats = overview
    ? [
        { icon: Flame, tone: "sacral", label: "Current streak", value: `${overview.streak_days} day${overview.streak_days === 1 ? "" : "s"}` },
        { icon: Gauge, tone: "throat", label: "Practice stage", value: overview.stage },
        { icon: Clock, tone: "crown", label: "Total practice time", value: formatMinutes(overview.total_minutes) },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting hero */}
      <div
        className="relative overflow-hidden rounded-3xl border border-[rgba(110,198,234,0.30)] px-6 py-7 sm:px-9 sm:py-9"
        style={{
          background:
            "radial-gradient(ellipse 90% 140% at 0% 0%, rgba(110,198,234,0.20) 0%, transparent 60%), radial-gradient(ellipse 80% 120% at 100% 100%, rgba(243,216,154,0.28) 0%, transparent 60%), rgba(255,255,255,0.72)",
        }}
      >
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[var(--color-gold)]/25 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-[12.5px] font-medium tracking-[0.14em] text-[var(--color-blue-dark)] uppercase">
              {/* <Sparkles size={13} /> */}
              Welcome back
            </p>
            <h2 className="mt-1.5 font-display text-[24px] leading-tight text-[var(--color-ink)] sm:text-[28px]">
              Your light is{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #F9ECCB 20%, #F3D89A 60%, #DCB96A 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                growing steadily
              </span>
            </h2>
            <p className="mt-1.5 max-w-md text-[14px] text-[var(--color-ink-soft)]">
              Here's where your practice stands today.
            </p>
          </div>

          {overview && (
            <div className="flex items-center gap-4 rounded-2xl bg-white/60 px-5 py-4 shadow-[0_4px_20px_rgba(140,138,192,0.12)]">
              <ProgressRing value={overview.challenge.day} max={overview.challenge.total} label={`${overview.challenge.day}/${overview.challenge.total}`} />
              <div>
                <div className="text-[13.5px] font-semibold text-[var(--color-ink)]">41-day challenge</div>
                <div className="text-[12.5px] text-[var(--color-muted)]">Day {overview.challenge.day} of {overview.challenge.total}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{error}</p>
      )}

      {!error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading
            ? [0, 1, 2].map((i) => <Card key={i} className="h-[76px] animate-pulse bg-white/40" />)
            : stats.map(({ icon, tone, label, value }) => (
                <Card key={label} className="flex items-center gap-3.5">
                  <IconBadge icon={icon} tone={tone} size={44} iconSize={19} />
                  <div>
                    <div className="text-[16px] font-semibold text-[var(--color-ink)]">{value}</div>
                    <div className="text-[12.5px] text-[var(--color-muted)]">{label}</div>
                  </div>
                </Card>
              ))}
        </div>
      )}

      {overview?.upcoming_session ? (
        <Card accent title="Upcoming session" description={overview.upcoming_session.teacher}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold text-[var(--color-ink)]">{overview.upcoming_session.title}</div>
              <div className="text-[13px] text-[var(--color-muted)]">{formatSessionTime(overview.upcoming_session.starts_at)}</div>
            </div>
            <Button as={Link} to="/dashboard/join-live">
              Join live
            </Button>
          </div>
        </Card>
      ) : (
        !loading &&
        !error && (
          <Card title="No sessions scheduled" description="Check back soon, or start a solo sit in the meantime.">
            <Button as={Link} to="/dashboard/sit-scribe" variant="secondary" className="mt-1">
              Sit & Scribe
            </Button>
          </Card>
        )
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Ready to sit?" description="Start a timed solo meditation.">
          <Button
            as={Link}
            to="/dashboard/sit-scribe"
            variant="secondary"
            className="group mt-1 w-full justify-between"
          >
            Sit & Scribe
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Card>
        <Card title="Reflect on your practice" description="Write today's journal entry.">
          <Button
            as={Link}
            to="/dashboard/journal"
            variant="secondary"
            className="group mt-1 w-full justify-between"
          >
            Open journal
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
