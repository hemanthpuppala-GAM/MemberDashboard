import { useEffect, useState } from "react";
import { Radio, Video, Clock, Globe2, CalendarDays } from "lucide-react";
import Youtube from "../ui/YoutubeIcon";
import JoinButton from "../ui/JoinButton";
import Card from "../ui/Card";
import Button from "../../components/ui/Button";
import { memberAuthApi } from "../../lib/memberAuth";
import { useMemberSchedule } from "../useMemberSchedule";

function formatSessionTime(iso) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function LiveDot({ live }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FA65B] opacity-70" />}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? "bg-[#3FA65B]" : "bg-[var(--color-gold)]"}`} />
    </span>
  );
}

/** The session happening now (or next) — the one thing this page is for. */
function FeaturedSession({ sit, zoom }) {
  if (!sit) return null;
  const yt = sit.kind === "youtube";
  return (
    <section className="member-hero relative overflow-hidden rounded-3xl px-6 py-7 sm:px-9 sm:py-8" aria-labelledby="featured-session">
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.16em] text-[var(--mh-gold)] uppercase">
            <LiveDot live={sit.live} />
            {sit.live ? "Live now" : `Next live session · ${sit.day}`}
          </p>
          <h2 id="featured-session" className="mt-2 font-display text-[26px] leading-tight text-[var(--mh-ink)] sm:text-[32px]">
            {sit.title}
          </h2>
          {sit.desc && <p className="mt-1.5 max-w-xl text-[14.5px] text-[var(--mh-ink-soft)]">{sit.desc}</p>}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-display text-[34px] leading-none text-[var(--mh-ink)] sm:text-[40px]">{sit.startLocal}</span>
            <span className="text-[14px] text-[var(--mh-ink-soft)]">
              to {sit.endLocal} · your time
              {!sit.sameZone && <> · {sit.home}</>}
            </span>
          </div>
          <p className="mt-2 text-[13.5px] font-semibold text-[var(--mh-gold)]">{sit.live ? "Happening right now — come and sit." : `Starts ${sit.inLabel}`}</p>
        </div>
        <div className="flex flex-col items-start gap-2.5 sm:items-end">
          <JoinButton sit={sit} size="lg" />
          {!yt && zoom.id && (
            <p className="text-[12.5px] text-[var(--mh-ink-soft)]">
              Meeting ID <span className="font-semibold text-[var(--mh-ink)]">{zoom.id}</span>
              {zoom.passcode && (
                <>
                  {" "}· Passcode <span className="font-semibold text-[var(--mh-ink)]">{zoom.passcode}</span>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SessionRow({ sit }) {
  const yt = sit.kind === "youtube";
  return (
    <li
      className={`grid grid-cols-[74px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-2xl border px-4 py-3.5 transition-colors sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:gap-x-5 sm:px-5 sm:py-4 ${
        sit.live ? "border-[#3FA65B]/50 bg-[rgba(63,166,91,0.07)]" : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-gold)]/60"
      }`}
    >
      <div className="self-start sm:self-center">
        <div className="font-display text-[18px] leading-none whitespace-nowrap text-[var(--color-ink)] sm:text-[20px]">{sit.startLocal}</div>
        <div className="mt-1 text-[11.5px] font-semibold text-[var(--color-ink-soft)]">{sit.day}</div>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold text-[var(--color-ink)]">{sit.title}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold tracking-wide uppercase ${yt ? "bg-[#FDE8E8] text-[#B42318]" : "bg-[#E8EEFB] text-[#2D4F9E]"}`}>
            {yt ? "YouTube" : "Zoom"}
          </span>
          {sit.region && <span className="text-[11.5px] font-semibold text-[var(--color-ink-soft)]">{sit.region}</span>}
        </div>
        {sit.desc && <p className="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">{sit.desc}</p>}
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12.5px] text-[var(--color-ink-soft)]">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Clock size={13} /> {sit.startLocal} – {sit.endLocal}
          </span>
          {!sit.sameZone && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Globe2 size={13} /> {sit.home}
            </span>
          )}
          <span className={`font-semibold whitespace-nowrap ${sit.live ? "text-[#25803F]" : "text-[var(--color-gold-deep)]"}`}>{sit.inLabel}</span>
        </p>
      </div>
      <div className="col-start-2 sm:col-start-auto">
        <JoinButton sit={sit} />
      </div>
    </li>
  );
}

export default function JoinLivePage() {
  const schedule = useMemberSchedule();
  const featured = schedule.live[0] || schedule.next;
  const [special, setSpecial] = useState(null);

  useEffect(() => {
    memberAuthApi
      .liveSessions()
      .then((list) => setSpecial(Array.isArray(list) ? list : []))
      .catch(() => setSpecial([])); // the daily schedule still shows
  }, []);

  const yt = schedule.youtube;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[24px] text-[var(--color-ink)]">Join live</h2>
          <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">Sit with the community in real time — free, every day.</p>
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--color-ink)]">
          <Globe2 size={14} className="text-[var(--color-gold-deep)]" />
          Times in your zone · {schedule.zoneShort || schedule.zoneName}
        </p>
      </div>

      <FeaturedSession sit={featured} zoom={schedule.zoom} />

      {yt && (
        <Card className="flex flex-wrap items-center justify-between gap-4 !p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF0000] text-white shadow-[0_6px_16px_-6px_rgba(255,0,0,0.6)]">
              <Youtube size={24} />
            </span>
            <div>
              <div className="text-[15px] font-semibold text-[var(--color-ink)]">
                YouTube live — every day at {yt.startLocal}
                {!yt.sameZone && <span className="font-normal text-[var(--color-ink-soft)]"> ({yt.home})</span>}
              </div>
              <div className="text-[13px] text-[var(--color-ink-soft)]">
                {yt.live ? "Streaming now — tap to watch." : `Next stream ${yt.day.toLowerCase()} · ${yt.inLabel}`}
              </div>
            </div>
          </div>
          <JoinButton sit={yt} />
        </Card>
      )}

      <section aria-labelledby="daily-schedule" className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-[var(--color-gold-deep)]" />
          <h3 id="daily-schedule" className="font-display text-[19px] text-[var(--color-ink)]">
            Every day
          </h3>
          <span className="text-[13px] text-[var(--color-ink-soft)]">· soonest first</span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {schedule.sits.map((sit) => (
            <SessionRow key={`${sit.title}-${sit.tz}-${sit.start}`} sit={sit} />
          ))}
        </ul>
      </section>

      {special?.length > 0 && (
        <section aria-labelledby="special-sessions" className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-[var(--color-gold-deep)]" />
            <h3 id="special-sessions" className="font-display text-[19px] text-[var(--color-ink)]">
              Special sessions
            </h3>
          </div>
          <ul className="flex flex-col gap-2.5">
            {special.map((s) => {
              const canJoin = s.is_live && !!s.join_url;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-[var(--color-ink)]">{s.title}</span>
                      {s.is_live && <span className="rounded-full bg-[#3FA65B] px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-white uppercase">Live</span>}
                    </div>
                    <div className="text-[13px] text-[var(--color-ink-soft)]">
                      {formatSessionTime(s.starts_at)} · your time{s.teacher ? ` · ${s.teacher}` : ""}
                    </div>
                  </div>
                  {canJoin ? (
                    <Button href={s.join_url} target="_blank" rel="noopener noreferrer" className="!px-4 !py-2 !text-[13px]">
                      <Video size={15} /> Join now
                    </Button>
                  ) : (
                    <span className="text-[12.5px] font-semibold text-[var(--color-ink-soft)]">{s.is_live ? "Link coming soon" : "Opens when it starts"}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
