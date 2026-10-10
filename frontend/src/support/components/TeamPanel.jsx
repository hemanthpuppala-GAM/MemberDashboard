import { Link } from "react-router-dom";
import { KIND_LABELS, formatMinutes, formatRating, timeAgo } from "../format";
import { Empty, SectionTitle, cardClass } from "./ui";

/** Each person's workload and results, plus the latest member reviews. */
export default function TeamPanel({ team = [], reviews = [], meId }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <section>
        <SectionTitle>Team</SectionTitle>
        {team.length === 0 ? (
          <div className={cardClass}>
            <Empty title="No one on the team yet">The coordinator adds people from the admin panel.</Empty>
          </div>
        ) : (
          <>
            <TeamCards team={team} meId={meId} />
            <TeamTable team={team} meId={meId} />
          </>
        )}
      </section>
      <section>
        <SectionTitle>Latest reviews</SectionTitle>
        <Reviews reviews={reviews} />
      </section>
    </div>
  );
}

const lastSeen = (d) => (d ? timeAgo(d) : "never");

function TeamTable({ team, meId }) {
  const th = "px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7A5E22]";
  const td = "px-3 py-3 text-[14px] text-[#2E3A33]";
  return (
    <div className={`${cardClass} hidden overflow-x-auto md:block`}>
      <table className="w-full border-collapse">
        <thead className="border-b border-[rgba(138,111,52,0.16)] bg-[#FBF6EA]">
          <tr>
            <th className={th}>Name</th>
            <th className={th}>Role</th>
            <th className={`${th} text-right`}>Open</th>
            <th className={`${th} text-right`}>Resolved 30 d / total</th>
            <th className={`${th} text-right`}>Avg to resolve</th>
            <th className={th}>Rating</th>
            <th className={th}>Last seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(138,111,52,0.12)]">
          {team.map((a) => (
            <tr key={a.id} className={a.id === meId ? "bg-[rgba(201,162,74,0.08)]" : ""}>
              <td className={`${td} font-semibold text-[#14241C]`}>
                {a.name}
                {a.id === meId && <span className="ml-1 font-normal text-[#5A5546]">(you)</span>}
              </td>
              <td className={td}>{a.kind === "core" ? "Core" : "Volunteer"}</td>
              <td className={`${td} text-right tabular-nums`}>{a.open}</td>
              <td className={`${td} text-right tabular-nums`}>
                {a.resolved_30d} / {a.resolved_total}
              </td>
              <td className={`${td} text-right tabular-nums`}>{formatMinutes(a.avg_resolution_minutes)}</td>
              <td className={td}>{formatRating(a.avg_rating, a.ratings)}</td>
              <td className={`${td} text-[#5A5546]`}>{lastSeen(a.last_login_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeamCards({ team, meId }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
      {team.map((a) => (
        <li key={a.id} className={`${cardClass} px-4 py-3`}>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[#14241C]">{a.name}</span>
            {a.id === meId && <span className="text-[13px] text-[#5A5546]">(you)</span>}
            <span className="ml-auto text-[12.5px] text-[#7A5E22]">{KIND_LABELS[a.kind]}</span>
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-2 text-[13px] text-[#2E3A33]">
            <Stat label="Open" value={a.open} />
            <Stat label="Resolved 30 d" value={`${a.resolved_30d} / ${a.resolved_total}`} />
            <Stat label="Avg to resolve" value={formatMinutes(a.avg_resolution_minutes)} />
          </div>
          <p className="mt-1.5 text-[12.5px] text-[#5A5546]">
            {formatRating(a.avg_rating, a.ratings)} · last seen {lastSeen(a.last_login_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[11.5px] text-[#5A5546]">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Reviews({ reviews }) {
  if (!reviews.length) {
    return (
      <div className={cardClass}>
        <Empty title="No reviews yet">Members can rate a question once it's resolved.</Empty>
      </div>
    );
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {reviews.map((r) => (
        <li key={`${r.id}-${r.rated_at}`} className={`${cardClass} px-4 py-3`}>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[16px] tracking-[0.06em] text-[#C9A24A]" aria-label={`${r.rating} out of 5`}>
              {"★".repeat(r.rating)}
              <span className="text-[rgba(138,111,52,0.3)]">{"★".repeat(5 - r.rating)}</span>
            </span>
            <span className="ml-auto text-[#5A5546]">{timeAgo(r.rated_at)}</span>
          </div>
          {r.comment && <p className="mt-1 text-[14px] leading-relaxed text-[#2E3A33]">“{r.comment}”</p>}
          <p className="mt-1 text-[12.5px] text-[#5A5546]">
            <Link to={`/support/ticket/${r.id}`}>{r.ref}</Link>
            {r.agent ? ` · handled by ${r.agent}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
