import { age, formatMinutes } from "../format";

/** Queue health at a glance, from GET /support/dashboard → stats. */
export default function KpiTiles({ stats }) {
  if (!stats) return <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-9">{Array.from({ length: 9 }, (_, i) => <Skeleton key={i} />)}</div>;

  const tiles = [
    { label: "New", value: stats.open, tone: stats.open ? "gold" : null },
    { label: "Being handled", value: stats.in_progress },
    { label: "Waiting for member", value: stats.waiting },
    { label: "Unassigned", value: stats.unassigned, tone: stats.unassigned ? "gold" : null },
    { label: "Urgent", value: stats.urgent_open, tone: stats.urgent_open ? "red" : null },
    { label: "Resolved (7 days)", value: stats.resolved_7d, tone: "green" },
    { label: "Avg first reply", value: formatMinutes(stats.avg_first_response_minutes), sub: "last 30 days" },
    {
      label: "Avg rating",
      value: stats.avg_rating ? `★ ${Number(stats.avg_rating).toFixed(1)}` : "—",
      sub: stats.ratings ? `${stats.ratings} review${stats.ratings === 1 ? "" : "s"}` : "no reviews yet",
    },
    {
      label: "Oldest waiting",
      value: stats.oldest_open_at ? age(stats.oldest_open_at) : "—",
      sub: stats.oldest_open_at ? "oldest open ticket" : "nothing open",
    },
  ];

  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-9">
      {tiles.map((t) => (
        <Tile key={t.label} {...t} />
      ))}
    </dl>
  );
}

const TONES = {
  gold: "border-[rgba(201,162,74,0.55)] bg-[#FFF6DC]",
  red: "border-[rgba(163,58,42,0.45)] bg-[rgba(163,58,42,0.07)]",
  green: "border-[rgba(47,107,69,0.25)] bg-[#FFFDF8]",
};
const VALUE_TONES = { red: "text-[#A33A2A]", green: "text-[#2F6B45]", gold: "text-[#7A5E22]" };

function Tile({ label, value, sub, tone }) {
  return (
    <div className={`flex min-w-0 flex-col justify-between rounded-2xl border px-3 py-2.5 sm:px-3.5 sm:py-3 ${TONES[tone] ?? "border-[rgba(138,111,52,0.18)] bg-[#FFFDF8]"}`}>
      <dt className="text-[11.5px] font-semibold leading-snug text-[#5A5546] sm:text-[12px]">{label}</dt>
      <dd className="m-0">
        <span className={`block font-['Cormorant_Garamond'] text-[28px] font-semibold leading-none sm:text-[32px] ${VALUE_TONES[tone] ?? "text-[#14241C]"}`}>
          {value ?? 0}
        </span>
        {sub && <span className="mt-0.5 block truncate text-[11px] text-[#5A5546]">{sub}</span>}
      </dd>
    </div>
  );
}

function Skeleton() {
  return <div className="h-[78px] animate-pulse rounded-2xl bg-[rgba(255,253,248,0.7)]" />;
}
