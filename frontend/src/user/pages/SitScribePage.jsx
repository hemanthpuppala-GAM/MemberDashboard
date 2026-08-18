import { useId, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import Card from "../ui/Card";
import Button from "../../components/ui/Button";

const DURATIONS = [10, 20, 30, 45];

export default function SitScribePage() {
  const [duration, setDuration] = useState(20);
  const [running, setRunning] = useState(false);
  const gradientId = useId();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Sit & Scribe</h2>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">
          Start a timed solo sit, then scribe your reflections after.
        </p>
      </div>

      <Card className="overflow-visible">
        <div className="flex flex-col items-center gap-7 py-6">
          <div className="relative flex h-52 w-52 items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full bg-[var(--color-gold)]/25 blur-2xl transition-opacity duration-700 ${
                running ? "animate-breathe opacity-100" : "opacity-0"
              }`}
            />
            <svg width={208} height={208} className="absolute -rotate-90">
              <circle cx={104} cy={104} r={96} stroke="rgba(110,198,234,0.18)" strokeWidth={8} fill="none" />
              <circle
                cx={104}
                cy={104}
                r={96}
                stroke={`url(#${gradientId})`}
                strokeWidth={8}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={running ? 2 * Math.PI * 96 * 0.22 : 2 * Math.PI * 96}
                style={{ transition: "stroke-dashoffset 1.2s ease" }}
              />
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B3E5FA" />
                  <stop offset="60%" stopColor="#F3D89A" />
                  <stop offset="100%" stopColor="#DCB96A" />
                </linearGradient>
              </defs>
            </svg>
            <div className="relative flex flex-col items-center">
              <span className="font-display text-[38px] leading-none text-[var(--color-ink)]">{duration}:00</span>
              <span className="mt-1.5 text-[12px] tracking-wide text-[var(--color-muted)] uppercase">
                {running ? "Sitting…" : "Ready when you are"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {DURATIONS.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => setDuration(min)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                  duration === min
                    ? "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] text-[var(--color-on-gold)] shadow-[0_0_16px_rgba(243,216,154,0.45)]"
                    : "bg-[rgba(110,198,234,0.15)] text-[var(--color-ink)] hover:bg-[rgba(110,198,234,0.30)]"
                }`}
              >
                {min} min
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button as="button" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? "Pause" : "Start sit"}
            </Button>
            <Button as="button" variant="secondary" onClick={() => setRunning(false)}>
              <RotateCcw size={16} />
              Reset
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
