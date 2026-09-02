import { useEffect, useId, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Music2, VolumeX, CheckCircle2, ChevronLeft, Flame, History } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import StreakCalendar from "../ui/StreakCalendar";
import Button from "../../components/ui/Button";
import { publicApi } from "../../lib/api";
import { memberAuthApi } from "../../lib/memberAuth";
import { useActiveSit } from "../ActiveSitContext";

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatLogDate(iso) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function SitScribePage() {
  const [presets, setPresets] = useState(null);
  const [presetsError, setPresetsError] = useState("");
  const [preset, setPreset] = useState(null);

  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [logging, setLogging] = useState(false);
  const gradientId = useId();
  const audioRef = useRef(null);

  const [overview, setOverview] = useState(null);
  const [sessions, setSessions] = useState(null);

  const loadPracticeData = () => {
    memberAuthApi.overview().then(setOverview).catch(() => {});
    memberAuthApi.practiceSessions().then(setSessions).catch(() => {});
  };

  useEffect(() => {
    publicApi
      .sitPresets()
      .then(setPresets)
      .catch((e) => setPresetsError(e.message || "Could not load meditation presets."));
    loadPracticeData();
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          setRunning(false);
          setCompleted(true);
          setLogging(true);
          memberAuthApi
            .logPracticeSession(preset.duration_minutes, preset.id)
            .then(loadPracticeData)
            .catch(() => {})
            .finally(() => setLogging(false));
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, preset]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (running) audio.play().catch(() => {});
    else audio.pause();
  }, [running]);

  const choosePreset = (p) => {
    setPreset(p);
    setRemaining(p.duration_minutes * 60);
    setRunning(false);
    setCompleted(false);
  };

  const toggleRunning = () => {
    if (completed) return;
    setRunning((r) => !r);
  };

  // Leaving mid-sit (back to picker, or restarting the timer) both discard progress —
  // below a minute there's nothing meaningful to save, so skip the prompt entirely.
  const performExit = (intent) => {
    setRunning(false);
    if (audioRef.current) audioRef.current.pause();
    if (intent === "back") {
      setPreset(null);
    } else {
      setRemaining(preset.duration_minutes * 60);
      setCompleted(false);
    }
  };

  const { setGuard, clearGuard, requestNavigation } = useActiveSit();

  // Keeps the shared nav-guard's callbacks reading live values without re-registering every tick.
  const liveRef = useRef({ preset, remaining });
  useEffect(() => {
    liveRef.current = { preset, remaining };
  }, [preset, remaining]);

  const elapsedSeconds = preset ? preset.duration_minutes * 60 - remaining : 0;
  // 30s is the real floor, not 60s — Math.round(30/60) already rounds up to a loggable
  // 1-minute session, so anything below 30s (which the backend's min:1 rejects anyway
  // once rounded to 0) is the only case with nothing meaningful to save.
  const hasMeaningfulProgress = !!preset && !completed && elapsedSeconds >= 30;

  useEffect(() => {
    if (!hasMeaningfulProgress) {
      clearGuard();
      return undefined;
    }
    setGuard({
      getElapsedMinutes: () => {
        const { preset: p, remaining: r } = liveRef.current;
        return Math.round((p.duration_minutes * 60 - r) / 60);
      },
      pause: () => setRunning(false),
      onLeave: async () => {
        const { preset: p, remaining: r } = liveRef.current;
        const minutes = Math.round((p.duration_minutes * 60 - r) / 60);
        if (minutes >= 1) {
          await memberAuthApi.logPracticeSession(minutes, p.id);
          loadPracticeData();
        }
      },
    });
    return clearGuard;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMeaningfulProgress]);

  const requestExit = (intent) => requestNavigation(() => performExit(intent));

  // Best-effort warning on tab close/refresh mid-sit — the browser doesn't reliably
  // let async work (saving a partial session) finish during unload, so this can only warn.
  useEffect(() => {
    if (!hasMeaningfulProgress && !running) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasMeaningfulProgress, running]);

  const totalSeconds = preset ? preset.duration_minutes * 60 : 1;
  const gradientCirc = 2 * Math.PI * 96;
  const progressOffset = gradientCirc * (remaining / totalSeconds);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Sit & Scribe</h2>
        <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">
          Choose a session, then scribe your reflections after.
        </p>
      </div>

      {presetsError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{presetsError}</p>
      )}

      {!presetsError && presets && presets.length === 0 && (
        <Card padded={false}>
          <EmptyState icon={Music2} title="No sessions available yet" description="Ask an admin to add meditation presets in CMS → Meditation Presets." />
        </Card>
      )}

      {!preset && presets && presets.length > 0 && (
        <Card title="Choose a session">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePreset(p)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-gold-deep)] hover:bg-[var(--color-surface)] hover:shadow-[0_8px_20px_rgba(80,65,40,0.10)]"
              >
                <div>
                  <div className="text-[14px] font-semibold text-[var(--color-ink)]">{p.title}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-soft)]">
                    {p.track ? <Music2 size={12} /> : <VolumeX size={12} />}
                    {p.duration_minutes} min · {p.track ? p.track.category : "Silent"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {preset && (
        <>
          <button
            type="button"
            onClick={() => requestExit("back")}
            className="flex w-fit items-center gap-1 text-[13px] font-medium text-[var(--color-blue-dark)] transition-opacity hover:opacity-80"
          >
            <ChevronLeft size={15} />
            Change session
          </button>

          <Card className="overflow-visible">
            <div className="flex flex-col items-center gap-7 py-6">
              <p className="text-[13px] font-medium tracking-wide text-[var(--color-ink-soft)] uppercase">{preset.title}</p>

              <div className="relative flex h-52 w-52 items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full bg-[var(--color-gold)]/25 blur-2xl transition-opacity duration-700 ${
                    running ? "animate-breathe opacity-100" : "opacity-0"
                  }`}
                />
                <svg width={208} height={208} className="absolute -rotate-90">
                  <circle cx={104} cy={104} r={96} stroke="rgba(168,185,160,0.18)" strokeWidth={8} fill="none" />
                  <circle
                    cx={104}
                    cy={104}
                    r={96}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={8}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={gradientCirc}
                    strokeDashoffset={progressOffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                  <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D6E0D1" />
                      <stop offset="60%" stopColor="#C6A15B" />
                      <stop offset="100%" stopColor="#8A6A32" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="relative flex flex-col items-center">
                  {completed ? (
                    <CheckCircle2 size={40} className="text-[var(--color-gold-live)]" />
                  ) : (
                    <span className="font-display text-[38px] leading-none text-[var(--color-ink)]">{formatClock(remaining)}</span>
                  )}
                  <span className="mt-1.5 text-[12px] tracking-wide text-[var(--color-ink-soft)] uppercase">
                    {completed ? (logging ? "Saving…" : "Sit complete") : running ? "Sitting…" : "Ready when you are"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button as="button" onClick={toggleRunning} disabled={completed}>
                  {running ? <Pause size={16} /> : <Play size={16} />}
                  {running ? "Pause" : "Start sit"}
                </Button>
                <Button as="button" variant="secondary" onClick={() => requestExit("reset")}>
                  <RotateCcw size={16} />
                  Reset
                </Button>
              </div>

              {preset.track?.file_url && (
                <audio ref={audioRef} src={preset.track.file_url} loop className="w-full max-w-xs" controls />
              )}
            </div>
          </Card>
        </>
      )}

      {overview && (
        <Card
          title="Your streak"
          description={`${overview.streak_days} day${overview.streak_days === 1 ? "" : "s"} in a row · ${overview.stage}`}
        >
          <div className="flex items-center gap-2 text-[12.5px] text-[var(--color-ink-soft)]">
            <Flame size={14} className="text-[var(--color-gold-deep)]" />
            Last 41 days — lit days are ones you sat.
          </div>
          <div className="mt-3">
            <StreakCalendar days={overview.daily_log} />
          </div>
        </Card>
      )}

      {sessions && (
        <Card title="Recent sits" description={sessions.length === 0 ? undefined : `${sessions.length} logged`}>
          {sessions.length === 0 ? (
            <EmptyState icon={History} title="No sits logged yet" description="Complete a sit above and it will show up here." />
          ) : (
            <div className="flex flex-col divide-y divide-[rgba(168,185,160,0.18)]">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(168,185,160,0.15)] text-[var(--color-blue-dark)]">
                      {s.sit_preset?.music_track_id ? <Music2 size={14} /> : <VolumeX size={14} />}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-medium text-[var(--color-ink)]">{s.sit_preset?.title ?? "Silent sit"}</div>
                      <div className="text-[12px] text-[var(--color-ink-soft)]">{formatLogDate(s.completed_at)}</div>
                    </div>
                  </div>
                  <span className="shrink-0 text-[13px] font-medium text-[var(--color-ink-soft)]">{s.duration_minutes} min</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
