import { Flame, Clock, Gauge, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import IconBadge from "../ui/IconBadge";
import ProgressRing from "../ui/ProgressRing";
import Button from "../../components/ui/Button";

const CHALLENGE = { day: 12, total: 41 };

const STATS = [
  { icon: Flame, tone: "sacral", label: "Current streak", value: "12 days" },
  { icon: Gauge, tone: "throat", label: "Practice stage", value: "Stage 2 · Stilling" },
  { icon: Clock, tone: "crown", label: "Total practice time", value: "18h 40m" },
];

const UPCOMING_SESSION = {
  title: "Morning Group Meditation",
  time: "Today · 6:30 AM",
  teacher: "Dr Hari Krishna, MD",
};

export default function OverviewPage() {
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
              <Sparkles size={13} />
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

          <div className="flex items-center gap-4 rounded-2xl bg-white/60 px-5 py-4 shadow-[0_4px_20px_rgba(140,138,192,0.12)]">
            <ProgressRing value={CHALLENGE.day} max={CHALLENGE.total} label={`${CHALLENGE.day}/${CHALLENGE.total}`} />
            <div>
              <div className="text-[13.5px] font-semibold text-[var(--color-ink)]">41-day challenge</div>
              <div className="text-[12.5px] text-[var(--color-muted)]">Day {CHALLENGE.day} of {CHALLENGE.total}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map(({ icon, tone, label, value }) => (
          <Card key={label} className="flex items-center gap-3.5">
            <IconBadge icon={icon} tone={tone} size={44} iconSize={19} />
            <div>
              <div className="text-[16px] font-semibold text-[var(--color-ink)]">{value}</div>
              <div className="text-[12.5px] text-[var(--color-muted)]">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card accent title="Upcoming session" description={UPCOMING_SESSION.teacher}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold text-[var(--color-ink)]">{UPCOMING_SESSION.title}</div>
            <div className="text-[13px] text-[var(--color-muted)]">{UPCOMING_SESSION.time}</div>
          </div>
          <Button as={Link} to="/dashboard/join-live">
            Join live
          </Button>
        </div>
      </Card>

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
