import { sourceLabel } from "../format";
import { Empty, SectionTitle, cardClass } from "./ui";

// Validated pair (dataviz validator, light surface #FFFDF8): CVD-safe and ≥ 3:1 on the card.
const NEW = "#B38A28";
const RESOLVED = "#0E7046";

const day = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "Other");

/** The last 30 days at a glance, from GET /support/dashboard → progress. */
export default function ProgressPanel({ progress }) {
  if (!progress) return <div className={`${cardClass} h-64 animate-pulse`} />;
  const { days = [], new_30d: created = 0, resolved_30d: resolved = 0, mine = {} } = progress;
  const max = Math.max(1, ...days.map((d) => Math.max(d.new, d.resolved)));
  const share = created ? Math.round((resolved / created) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle>Last 30 days</SectionTitle>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3">
          <Stat label="New requests" value={created} />
          <Stat label="Resolved" value={resolved} />
          <Stat label="Resolved vs new" value={share === null ? "—" : `${share}%`} sub={share === null ? "nothing new" : share >= 100 ? "keeping up" : "queue is growing"} />
          <Stat label="You logged" value={mine.logged_30d ?? 0} mine />
          <Stat label="You resolved" value={mine.resolved_30d ?? 0} mine />
          <Stat label="With you now" value={mine.open ?? 0} mine />
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <DailyBars title="New requests per day" days={days} field="new" color={NEW} max={max} />
        <DailyBars title="Resolved per day" days={days} field="resolved" color={RESOLVED} max={max} />
      </section>

      <details className={`${cardClass} px-4 py-3`}>
        <summary className="cursor-pointer text-[13.5px] font-semibold text-[#14241C]">Show the days as a table</summary>
        <div className="mt-3 max-h-72 overflow-y-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-[#7A5E22]">
                <th className="py-1.5 pr-3">Day</th>
                <th className="py-1.5 pr-3 text-right">New</th>
                <th className="py-1.5 text-right">Resolved</th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((d) => (
                <tr key={d.date} className="border-t border-[rgba(138,111,52,0.12)]">
                  <td className="py-1.5 pr-3">{day(d.date)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{d.new}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.resolved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <section className="grid gap-4 lg:grid-cols-2">
        <Breakdown title="Where requests came from" rows={progress.by_source} label={(k) => (sourceLabel(k) === k ? titleCase(k) : sourceLabel(k))} />
        <Breakdown title="What they were about" rows={progress.by_category} label={titleCase} />
      </section>
    </div>
  );
}

function Stat({ label, value, sub, mine }) {
  return (
    <div className={`flex min-w-0 flex-col justify-between rounded-2xl border px-3.5 py-3 ${mine ? "border-[rgba(20,36,28,0.2)] bg-[#F4F1E6]" : "border-[rgba(138,111,52,0.18)] bg-[#FFFDF8]"}`}>
      <dt className="text-[12px] font-semibold leading-snug text-[#5A5546]">{label}</dt>
      <dd className="m-0">
        <span className="block font-['Cormorant_Garamond'] text-[32px] font-semibold leading-none text-[#14241C]">{value}</span>
        {sub && <span className="mt-0.5 block truncate text-[11px] text-[#5A5546]">{sub}</span>}
      </dd>
    </div>
  );
}

/** One series per chart (the title names it), shared scale across both, hover/focus a day for its number. */
function DailyBars({ title, days, field, color, max }) {
  const total = days.reduce((n, d) => n + d[field], 0);
  return (
    <figure className={`${cardClass} m-0 flex flex-col gap-3 px-4 pb-3 pt-4`}>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-semibold text-[#14241C]">{title}</span>
        <span className="text-[12.5px] text-[#5A5546]">{total} in 30 days</span>
      </figcaption>
      <div className="relative">
        <span className="absolute -top-1 left-0 text-[11px] tabular-nums text-[#5A5546]">{max}</span>
        <div className="ml-6 flex h-36 items-end gap-[2px] border-b border-[rgba(20,36,28,0.25)]" role="list" aria-label={title}>
          {days.map((d) => (
            <span key={d.date} role="listitem" tabIndex={0} aria-label={`${day(d.date)}: ${d[field]}`} className="desk-bar group relative flex h-full flex-1 items-end outline-none">
              <span className="block w-full" style={{ borderRadius: "4px 4px 0 0", height: d[field] ? `${(d[field] / max) * 100}%` : 0, minHeight: d[field] ? 3 : 0, background: color }} />
              <span className="desk-bar-tip pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#14241C] px-2 py-1 text-[11.5px] font-semibold text-[#F6F1E6] group-hover:block group-focus:block">
                {day(d.date)} · {d[field]}
              </span>
            </span>
          ))}
        </div>
        <div className="ml-6 mt-1 flex justify-between text-[11px] text-[#5A5546]">
          <span>{days[0] ? day(days[0].date) : ""}</span>
          <span>Today</span>
        </div>
      </div>
    </figure>
  );
}

/** A single-hue bar list: label and count in text ink, the bar shows the share. */
function Breakdown({ title, rows = {}, label }) {
  const entries = Object.entries(rows || {});
  const top = Math.max(1, ...entries.map(([, n]) => n));
  return (
    <section className={`${cardClass} px-4 py-4`}>
      <p className="m-0 mb-3 font-sans text-[14px] font-semibold text-[#14241C]">{title}</p>
      {entries.length === 0 ? (
        <Empty title="Nothing in the last 30 days" />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {entries.slice(0, 8).map(([key, n]) => (
            <li key={key} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2.5rem] items-center gap-3 text-[13.5px]">
              <span className="truncate text-[#2E3A33]">{label(key)}</span>
              <span className="h-2.5 rounded-full bg-[rgba(138,111,52,0.12)]">
                <span className="block h-full rounded-full" style={{ width: `${(n / top) * 100}%`, background: NEW }} />
              </span>
              <span className="text-right font-semibold tabular-nums text-[#14241C]">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
