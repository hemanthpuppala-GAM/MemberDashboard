import { useEffect, useId, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Music2, VolumeX, CheckCircle2, ChevronLeft, Flame, History, Video } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import StreakCalendar from "../ui/StreakCalendar";
import Button from "../../components/ui/Button";
import { publicApi } from "../../lib/api";
import { memberAuthApi } from "../../lib/memberAuth";
import { useActiveSit } from "../ActiveSitContext";
import { LIVE_LOGGED_EVENT } from "../liveReturn";
import AddMissedSit from "../AddMissedSit";
import { SIT_SOUNDS, chime, soundUrl } from "../sitSounds";

/** Sits logged from a live session (old-site imports say "live"). */
const LIVE_VIA = { zoom: "Live on Zoom", youtube: "Live on YouTube", live: "Live session" };
/** Their own sit, added later with "Add a missed sit". */
const OWN_SIT = "Own sit";

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const OWN_MINUTES = [10, 15, 20, 30, 45, 60];

function stored(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function remember(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* private mode */
  }
}

const chip = (on) =>
  `rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
    on
      ? "border-[var(--color-gold-deep)] bg-[var(--color-gold-deep)] text-white"
      : "border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] text-[var(--color-ink)] hover:border-[var(--color-gold-deep)]"
  }`;

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

  // "Your own sit": the member picks the length and a background sound (remembered on this device).
  const [ownMinutes, setOwnMinutes] = useState(() => Number(stored("gaw_goal", 30)) || 30);
  const [ownSound, setOwnSound] = useState(() => stored("gaw_sound", "om"));
  const [ownSrc, setOwnSrc] = useState(null);

  const [overview, setOverview] = useState(null);
  const [sessions, setSessions] = useState(null);

  const loadPracticeData = () => {
    memberAuthApi.overview().then(setOverview).catch(() => {});
    memberAuthApi.practiceSessions().then(setSessions).catch(() => {});
  };

  // A live sit logged from the "back from Zoom" prompt: show it in the streak and history at once.
  useEffect(() => {
    window.addEventListener(LIVE_LOGGED_EVENT, loadPracticeData);
    return () => window.removeEventListener(LIVE_LOGGED_EVENT, loadPracticeData);
  }, []);

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
          chime();
          memberAuthApi
            .logPracticeSession(preset.duration_minutes, preset.id, preset.own ? "own" : undefined)
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

  // Your own sit: get the chosen sound ready (the synthesised ones take a moment the first time).
  useEffect(() => {
    let live = true;
    if (preset?.own) soundUrl(preset.sound).then((url) => live && setOwnSrc(url));
    return () => {
      live = false;
      setOwnSrc(null);
    };
  }, [preset]);

  const audioSrc = preset?.track?.file_url || (preset?.own ? ownSrc : null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (running) audio.play().catch(() => {});
    else audio.pause();
  }, [running, audioSrc]);

  const ownMinutesValid = Number.isInteger(ownMinutes) && ownMinutes >= 1 && ownMinutes <= 180;
  const startOwnSit = () => {
    remember("gaw_goal", ownMinutes);
    remember("gaw_sound", ownSound);
    const sound = SIT_SOUNDS.find((x) => x.key === ownSound) ?? SIT_SOUNDS[0];
    choosePreset({ id: null, own: true, sound: sound.key, title: `Your own sit · ${sound.label}`, duration_minutes: ownMinutes });
  };

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
          await memberAuthApi.logPracticeSession(minutes, p.id, p.own ? "own" : undefined);
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
          Sit on your own or choose a guided session, then scribe your reflections after.
        </p>
      </div>

      {presetsError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{presetsError}</p>
      )}

      {!preset && (
        <Card title="Your own sit" description="Choose how long, and a sound to sit with. A soft bell rings when the time is up.">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-[var(--color-ink)]">Minutes</span>
              <div className="flex flex-wrap items-center gap-2">
                {OWN_MINUTES.map((m) => (
                  <button key={m} type="button" aria-pressed={ownMinutes === m} onClick={() => setOwnMinutes(m)} className={chip(ownMinutes === m)}>
                    {m}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={180}
                  inputMode="numeric"
                  aria-label="Minutes"
                  value={Number.isNaN(ownMinutes) ? "" : ownMinutes}
                  onChange={(e) => setOwnMinutes(e.target.value === "" ? NaN : Number(e.target.value))}
                  className="w-20 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] px-3 py-2 text-[14px] text-[var(--color-ink)] focus:border-[var(--color-gold-deep)] focus:outline-none"
                />
                <span className="text-[13px] text-[var(--color-ink-soft)]">min</span>
              </div>
              {!ownMinutesValid && <p className="text-[12.5px] text-red-600">Choose 1 to 180 minutes.</p>}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-[var(--color-ink)]">Sound</span>
              <div className="flex flex-wrap gap-2">
                {SIT_SOUNDS.map((x) => (
                  <button key={x.key} type="button" aria-pressed={ownSound === x.key} onClick={() => setOwnSound(x.key)} className={chip(ownSound === x.key)}>
                    <span aria-hidden="true" className="mr-1.5">{x.glyph}</span>
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
            <Button as="button" onClick={startOwnSit} disabled={!ownMinutesValid} className="w-fit">
              <Play size={16} />
              Begin {ownMinutesValid ? `${ownMinutes}-minute ` : ""}sit
            </Button>
          </div>
        </Card>
      )}

      {!preset && !presetsError && presets && presets.length === 0 && (
        <Card padded={false}>
          <EmptyState icon={Music2} title="No guided sessions yet" description="Guided sessions will appear here soon. Your own sit above works any time." />
        </Card>
      )}

      {!preset && presets && presets.length > 0 && (
        <Card title="Or choose a guided session">
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

              {audioSrc && <audio ref={audioRef} src={audioSrc} loop className="w-full max-w-xs" controls />}
              {preset.own && preset.sound !== "off" && !audioSrc && <p className="text-[12.5px] text-[var(--color-ink-soft)]">Preparing the sound…</p>}
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
        <Card title="Recent sits" description={sessions.length === 0 ? undefined : `${sessions.length} logged`} actions={<AddMissedSit />}>
          {sessions.length === 0 ? (
            <EmptyState icon={History} title="No sits logged yet" description="Complete a sit above and it will show up here." />
          ) : (
            <div className="flex flex-col divide-y divide-[rgba(168,185,160,0.18)]">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(168,185,160,0.15)] text-[var(--color-blue-dark)]">
                      {LIVE_VIA[s.via] ? <Video size={14} /> : s.sit_preset?.music_track_id ? <Music2 size={14} /> : <VolumeX size={14} />}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-medium text-[var(--color-ink)]">{LIVE_VIA[s.via] ?? (s.via === "own" ? OWN_SIT : null) ?? s.sit_preset?.title ?? "Silent sit"}</div>
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
