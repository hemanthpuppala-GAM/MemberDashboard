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
      {/* Greeting hero — a sand band (the same "level 2" surface the public sections alternate onto), not a glowing glass panel. */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-6 py-7 sm:px-9 sm:py-9">
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[12.5px] font-semibold tracking-[0.14em] text-[var(--color-blue-dark)] uppercase">
              Welcome back
            </p>
            <h2 className="mt-1.5 font-display text-[24px] leading-tight text-[var(--color-ink)] sm:text-[28px]">
              Your light is{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #DCC58A 20%, #C6A15B 60%, #8A6A32 100%)",
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
            <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-[0_8px_24px_rgba(80,65,40,0.08)]">
              <ProgressRing value={overview.challenge.day} max={overview.challenge.total} label={`${overview.challenge.day}/${overview.challenge.total}`} />
              <div>
                <div className="text-[13.5px] font-semibold text-[var(--color-ink)]">41-day challenge</div>
                <div className="text-[12.5px] text-[var(--color-ink-soft)]">Day {overview.challenge.day} of {overview.challenge.total}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{error}</p>
      )}

      {!error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading
            ? [0, 1, 2].map((i) => <Card key={i} className="h-[76px] animate-pulse !bg-[var(--color-bg-soft)]" />)
            : stats.map(({ icon, tone, label, value }) => (
                <Card key={label} className="flex items-center gap-3.5">
                  <IconBadge icon={icon} tone={tone} size={44} iconSize={19} />
                  <div>
                    <div className="text-[16px] font-semibold text-[var(--color-ink)]">{value}</div>
                    <div className="text-[12.5px] text-[var(--color-ink-soft)]">{label}</div>
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
              <div className="text-[13px] text-[var(--color-ink-soft)]">{formatSessionTime(overview.upcoming_session.starts_at)}</div>
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
