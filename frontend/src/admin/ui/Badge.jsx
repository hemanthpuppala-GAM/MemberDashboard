const TONES = {
  neutral: "bg-[var(--a-bg-surface-2)] text-[var(--a-text-muted)]",
  accent: "bg-[var(--a-accent-muted)] text-[var(--a-accent)]",
  success: "bg-[var(--a-success-muted)] text-[var(--a-success)]",
  warning: "bg-[var(--a-warning-muted)] text-[var(--a-warning)]",
  danger: "bg-[var(--a-danger-muted)] text-[var(--a-danger)]",
  info: "bg-[var(--a-info-muted)] text-[var(--a-info)]",
};

/** Status pill. Colour-coded per plan §15: new=blue active=green resolved=teal archived=grey urgent=red. */
export default function Badge({ tone = "neutral", dot = false, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-wide whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const STATUS_TONE = {
  new: "info",
  assigned: "info",
  in_progress: "warning",
  active: "success",
  resolved: "success",
  published: "success",
  draft: "neutral",
  paused: "warning",
  archived: "neutral",
  expired: "neutral",
  urgent: "danger",
  alert: "danger",
  warning: "warning",
  info: "info",
  inactive: "neutral",
};

export function StatusBadge({ status, className = "" }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <Badge tone={tone} dot className={className}>
      {String(status).replace(/_/g, " ")}
    </Badge>
  );
}
