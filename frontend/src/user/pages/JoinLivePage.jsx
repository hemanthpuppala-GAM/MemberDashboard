import { Radio, Users } from "lucide-react";
import Card from "../ui/Card";
import Button from "../../components/ui/Button";

const SESSION = {
  isLive: false,
  title: "Evening Group Meditation",
  time: "Today · 7:00 PM",
  teacher: "Dr Hari Krishna, MD",
  attendees: 128,
};

export default function JoinLivePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Join live</h2>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">Sit with the community in real time.</p>
      </div>

      <Card accent={SESSION.isLive}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              {SESSION.isLive && (
                <span
                  className="pointer-events-none absolute top-1/2 left-1/2 animate-ripple rounded-full bg-[var(--color-gold-live)]/50"
                  style={{ width: 48, height: 48 }}
                />
              )}
              <span
                className={`relative flex h-12 w-12 items-center justify-center rounded-full ${
                  SESSION.isLive
                    ? "bg-[rgba(93,184,117,0.22)] text-[#2f8a4d]"
                    : "bg-[rgba(110,198,234,0.18)] text-[var(--color-blue-dark)]"
                }`}
              >
                <Radio size={20} />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-[var(--color-ink)]">{SESSION.title}</span>
                {SESSION.isLive && (
                  <span className="rounded-full bg-[var(--color-gold-live)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-white uppercase shadow-[0_0_10px_rgba(93,184,117,0.55)]">
                    Live
                  </span>
                )}
              </div>
              <div className="text-[13px] text-[var(--color-muted)]">
                {SESSION.time} · {SESSION.teacher}
              </div>
            </div>
          </div>
          <Button
            as="button"
            disabled={!SESSION.isLive}
            className={!SESSION.isLive ? "pointer-events-none opacity-50" : ""}
          >
            {SESSION.isLive ? "Join now" : "Not live yet"}
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[13px] text-[var(--color-muted)]">
          <Users size={14} />
          {SESSION.attendees} joined last session
        </div>
      </Card>
    </div>
  );
}
