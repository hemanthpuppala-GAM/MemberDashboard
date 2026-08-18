import { useId } from "react";

export default function ProgressRing({ value, max, size = 76, stroke = 7, label }) {
  const gradientId = useId();
  const pct = Math.min(1, Math.max(0, value / max));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(110,198,234,0.20)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s ease" }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9ECCB" />
            <stop offset="100%" stopColor="#DCB96A" />
          </linearGradient>
        </defs>
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center font-display text-[13px] text-[var(--color-ink)]">
          {label}
        </div>
      )}
    </div>
  );
}
