import { useEffect, useState } from "react";
import { Flame, Clock, Gauge, ArrowRight, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import IconBadge from "../ui/IconBadge";
import ProgressRing from "../ui/ProgressRing";
import Button from "../../components/ui/Button";
import { memberAuthApi } from "../../lib/memberAuth";
import JoinButton from "../ui/JoinButton";
import { LIVE_LOGGED_EVENT } from "../liveReturn";
import { useMemberSchedule } from "../useMemberSchedule";
import { useMemberAuth } from "../../auth/MemberAuthContext";
import AddPhoneCard from "../ui/AddPhoneCard";

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
  const { user } = useMemberAuth();
  const firstName = (user?.name || "").trim().split(/\s+/)[0] || "";
  const schedule = useMemberSchedule();
  const nextSit = schedule.live[0] || schedule.next;

  useEffect(() => {
    const load = () =>
      memberAuthApi
        .overview()
        .then(setOverview)
        .catch((e) => setError(e.message || "Could not load your overview."))
        .finally(() => setLoading(false));
    load();
    // A live sit logged from the "back from Zoom" prompt updates the streak and totals here too.
    window.addEventListener(LIVE_LOGGED_EVENT, load);
    return () => window.removeEventListener(LIVE_LOGGED_EVENT, load);
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
      <AddPhoneCard />

      {/* Greeting hero — deep forest panel with gold, the same night-sky band as the site's Wisdom Library. */}
      <div className="member-hero relative overflow-hidden rounded-3xl px-6 py-7 sm:px-9 sm:py-9">
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-[12px] font-bold tracking-[0.18em] text-[var(--mh-gold)] uppercase">Welcome back{firstName ? `, ${firstName}` : ""}</p>
            <h2 className="mt-2 font-display text-[28px] leading-tight text-[var(--mh-ink)] sm:text-[34px]">
              Your light is <em className="member-hero-accent not-italic">growing steadily</em>
            </h2>
            <p className="mt-2 max-w-md text-[14.5px] text-[var(--mh-ink-soft)]">Here's where your practice stands today.</p>
          </div>

          {overview && (
            <div className="flex items-center gap-4 rounded-2xl border border-[rgba(232,207,131,0.28)] bg-[rgba(255,255,255,0.07)] px-5 py-4 backdrop-blur-sm">
              <ProgressRing
                value={overview.challenge.day}
                max={overview.challenge.total}
                label={`${overview.challenge.day}/${overview.challenge.total}`}
                track="rgba(246,241,230,0.18)"
                labelClass="text-[var(--mh-ink)]"
              />
              <div>
                <div className="text-[14px] font-semibold text-[var(--mh-ink)]">41-day challenge</div>
                <div className="text-[12.5px] text-[var(--mh-ink-soft)]">
                  Day {overview.challenge.day} of {overview.challenge.total}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {nextSit && (
        <Card accent className="!p-5 sm:!p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0">
              <p className={`text-[11.5px] font-bold tracking-[0.16em] uppercase ${nextSit.live ? "text-[#25803F]" : "text-[var(--color-gold-deep)]"}`}>
                {nextSit.live ? "● Live now" : `Next live session · ${nextSit.day}`}
              </p>
              <div className="mt-1.5 font-display text-[21px] leading-tight text-[var(--color-ink)]">{nextSit.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-[var(--color-ink-soft)]">
                <span className="font-semibold text-[var(--color-ink)]">
                  {nextSit.startLocal} – {nextSit.endLocal}
                </span>
                {!nextSit.sameZone && (
                  <span className="inline-flex items-center gap-1">
                    <Globe2 size={13} /> {nextSit.home}
                  </span>
                )}
                {!nextSit.live && <span className="font-semibold text-[var(--color-gold-deep)]">{nextSit.inLabel}</span>}
              </div>
              {overview?.upcoming_session && (
                <p className="mt-2 text-[12.5px] text-[var(--color-ink-soft)]">
                  Also coming up: <span className="font-semibold text-[var(--color-ink)]">{overview.upcoming_session.title}</span> · {formatSessionTime(overview.upcoming_session.starts_at)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <JoinButton sit={nextSit} size="lg" />
              <Button as={Link} to="/dashboard/join-live" variant="secondary" className="!px-5 !py-3">
                All sessions
              </Button>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{error}</p>
      )}

      {!error && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {loading
            ? [0, 1, 2].map((i) => <Card key={i} className="h-[96px] animate-pulse !bg-[var(--color-bg-soft)] sm:h-[76px]" />)
            : stats.map(({ icon, tone, label, value }) => (
                <Card key={label} className="flex flex-col items-start gap-2.5 !p-3.5 sm:flex-row sm:items-center sm:gap-3.5 sm:!p-6">
                  <IconBadge icon={icon} tone={tone} size={40} iconSize={18} />
                  <div className="min-w-0">
                    <div className="text-[14px] leading-snug font-semibold text-[var(--color-ink)] sm:text-[16px]">{value}</div>
                    <div className="text-[11.5px] leading-snug text-[var(--color-ink-soft)] sm:text-[12.5px]">{label}</div>
                  </div>
                </Card>
              ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Ready to sit?" description="Start a timed solo meditation.">
          <Button
            as={Link}
            to="/dashboard/sit-scribe"
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
