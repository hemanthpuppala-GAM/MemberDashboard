import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { SOURCE_LABELS, sourceLabel, timeAgo } from "../format";
import { Button, Empty, ErrorNote, Loading, StatusPill, UrgentBadge, cardClass, inputClass } from "./ui";

const SCOPES = [
  { value: "mine", label: "My tickets", count: (s) => s.mine_open },
  { value: "unassigned", label: "Unassigned", count: (s) => s.unassigned },
  { value: "open", label: "All open", count: (s) => s.open + s.in_progress + s.waiting },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
];

const EMPTY_COPY = {
  mine: ["Nothing on your plate", "Tickets you take or are given will show here. Try “Unassigned” to pick one up."],
  unassigned: ["Everything has an owner", "No open ticket is waiting for someone to pick it up."],
  open: ["All caught up", "There are no open questions right now."],
  resolved: ["No resolved tickets yet", "Tickets you mark resolved will show here."],
  all: ["No tickets yet", "Questions from the Ask page, member dashboard, calls and WhatsApp will show here."],
};

/** Scope tabs + search + source filter. */
export function TicketFilters({ scope, onScope, search, onSearch, source, onSource, stats }) {
  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Which tickets" className="desk-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {SCOPES.map((s) => {
          const n = stats && s.count ? s.count(stats) : null;
          const active = scope === s.value;
          return (
            <button
              key={s.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onScope(s.value)}
              className={`inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[14px] font-semibold transition ${
                active
                  ? "border-[#14241C] bg-[#14241C] text-[#F6F1E6]"
                  : "border-[rgba(138,111,52,0.28)] bg-[#FFFDF8] text-[#1B3328] hover:border-[#C9A24A]"
              }`}
            >
              {s.label}
              {n !== null && n !== undefined && (
                <span className={`rounded-full px-1.5 text-[12px] ${active ? "bg-[rgba(232,207,131,0.25)] text-[#E8CF83]" : "bg-[rgba(201,162,74,0.16)] text-[#7A5E22]"}`}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search tickets</span>
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5546]" aria-hidden />
          <input
            type="search"
            className={`${inputClass} pl-10`}
            placeholder="Search name, phone, email, words or T-0042"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>
        <label className="sm:w-[210px]">
          <span className="sr-only">Where it came from</span>
          <select className={`${inputClass} cursor-pointer`} value={source} onChange={(e) => onSource(e.target.value)}>
            <option value="">All sources</option>
            {Object.entries(SOURCE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

/** The ticket rows, with loading / empty / error states and "Load more". */
export function TicketList({ list, scope, filtered, selectedId }) {
  if (list.loading && !list.items.length) return <Loading label="Loading tickets…" />;
  if (list.error && !list.items.length) return <ErrorNote onRetry={list.reload}>Couldn't load tickets. {list.error}</ErrorNote>;
  if (!list.items.length) {
    const [title, text] = filtered ? ["No matches", "Nothing matches your search or filter. Try fewer words or “All sources”."] : EMPTY_COPY[scope];
    return (
      <div className={cardClass}>
        <Empty title={title}>{text}</Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-[#5A5546]" aria-live="polite">
        {list.total} ticket{list.total === 1 ? "" : "s"}
      </p>
      <ul className={`${cardClass} m-0 list-none divide-y divide-[rgba(138,111,52,0.14)] overflow-hidden p-0`}>
        {list.items.map((t) => (
          <TicketRow key={t.id} ticket={t} selected={String(t.id) === String(selectedId)} />
        ))}
      </ul>
      {list.error && <ErrorNote>{list.error}</ErrorNote>}
      {list.hasMore && (
        <Button variant="outline" onClick={list.loadMore} busy={list.loadingMore} className="self-center px-6">
          Load more
        </Button>
      )}
    </div>
  );
}

function TicketRow({ ticket: t, selected }) {
  return (
    <li>
      <Link
        to={`/support/ticket/${t.id}`}
        aria-current={selected ? "true" : undefined}
        className={`block px-4 py-3.5 transition hover:bg-[#FBF6EA] ${selected ? "bg-[#FBF1D6] shadow-[inset_3px_0_0_#C9A24A]" : ""}`}
        style={{ color: "inherit" }}
      >
        <div className="flex items-center gap-2 text-[12px] text-[#5A5546]">
          <span className="font-semibold text-[#7A5E22]">{t.ref}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{sourceLabel(t.source)}</span>
          <span className="ml-auto shrink-0 whitespace-nowrap" title={t.created_at}>
            {timeAgo(t.created_at)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-[#14241C]">{t.subject}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[#2E3A33]">
          <span className="min-w-0 truncate">{t.requester?.name || t.requester?.phone || t.requester?.email || "Unknown person"}</span>
          <span className="text-[#5A5546]">→ {t.assignee?.name ?? <em className="not-italic text-[#7A5E22]">Unassigned</em>}</span>
          <span className="ml-auto flex items-center gap-1.5">
            {t.priority === "urgent" && <UrgentBadge />}
            <StatusPill status={t.status} />
          </span>
        </div>
      </Link>
    </li>
  );
}
