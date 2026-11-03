import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, BarChart3, Download, Filter, Users, X } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { Select } from "../../ui/Field";
import { api, downloadAuthed } from "../../../lib/api";

const pct = (n, of) => (of ? Math.round((n / of) * 100) : 0);
const fmtDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/**
 * A form's answers as charts: a bar per choice (count and %), tick-all questions ranked, the "Any other" texts,
 * written answers to read, and responses per day. "Show only people who answered …" narrows every chart to one
 * answer group; clicking a bar does the same.
 */
export default function RegistrationFormResultsPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [results, setResults] = useState(null);
  const [filter, setFilter] = useState({ field: "", value: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.registrationForm(id).then(setForm).catch((err) => toast.error(err.message ?? "Failed to load form"));
  }, [id]);

  useEffect(() => {
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- spinner while the filtered results load
    setLoading(true);
    api
      .registrationResults(id, filter.field && filter.value ? { filter_field: filter.field, filter_value: filter.value } : {})
      .then((r) => live && setResults(r))
      .catch((err) => toast.error(err.message ?? "Failed to load results"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, filter]);

  // Questions with choices can narrow the results; their answers are the filter values.
  const filterable = useMemo(() => (results?.questions ?? []).filter((q) => q.kind === "choice"), [results]);
  const filterQuestion = filterable.find((q) => q.key === filter.field);
  const filtered = !!(filter.field && filter.value);

  const exportCsv = () =>
    downloadAuthed(api.registrationSubmissionsExportPath(id), `${form?.slug ?? "form"}-registrations.csv`).catch((err) => toast.error(err.message ?? "Export failed"));

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/registration-forms" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> Registration forms
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">{form?.title ?? "Results"}</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            {results
              ? filtered
                ? `${results.matching} of ${results.total} responses match the filter`
                : `${results.total} response${results.total === 1 ? "" : "s"}`
              : "Loading…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button as={Link} to={`/admin/registration-forms/${id}/submissions`} variant="secondary" icon={Users}>
            All answers
          </Button>
          <Button as="button" variant="secondary" icon={Download} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <span className="inline-flex items-center gap-1.5 pb-2.5 text-[13px] font-semibold text-[var(--a-text-primary)]">
            <Filter size={14} /> Show only people who answered
          </span>
          <Select
            value={filter.field}
            onChange={(e) => setFilter({ field: e.target.value, value: "" })}
            className="w-auto! max-w-full min-w-[220px] flex-1"
            aria-label="Question"
          >
            <option value="">Choose a question…</option>
            {filterable.map((q) => (
              <option key={q.key} value={q.key}>
                {q.label}
              </option>
            ))}
          </Select>
          <Select
            value={filter.value}
            onChange={(e) => setFilter((f) => ({ ...f, value: e.target.value }))}
            disabled={!filterQuestion}
            className="w-auto! min-w-[160px]"
            aria-label="Answer"
          >
            <option value="">…this answer</option>
            {(filterQuestion?.counts ?? []).map((c) => (
              <option key={c.option} value={c.option}>
                {c.option}
              </option>
            ))}
          </Select>
          {(filter.field || filter.value) && (
            <Button as="button" variant="ghost" icon={X} onClick={() => setFilter({ field: "", value: "" })}>
              Clear
            </Button>
          )}
        </div>
        {filtered && filterQuestion && (
          <p className="mt-3 rounded-lg bg-[var(--a-accent-muted)] px-3 py-2 text-[13px] text-[var(--a-text-primary)]">
            Showing people who answered <strong>“{filter.value}”</strong> to “{filterQuestion.label}”. Tip: click any bar below to filter by it.
          </p>
        )}
      </Card>

      {results && results.matching === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <BarChart3 size={28} className="text-[var(--a-text-faint)]" />
            <p className="text-[15px] font-semibold text-[var(--a-text-primary)]">{filtered ? "No one matches this filter" : "No responses yet"}</p>
            <p className="text-[13px] text-[var(--a-text-muted)]">{filtered ? "Try another answer, or clear the filter." : "Charts appear here as soon as people fill in the form."}</p>
          </div>
        </Card>
      ) : (
        results && (
          <div className={`flex flex-col gap-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
            <PerDay days={results.per_day} />
            {results.questions.map((q, i) => (
              <QuestionCard key={q.key} n={i + 1} q={q} of={results.matching} onPick={(option) => setFilter({ field: q.key, value: option })} active={filter.field === q.key ? filter.value : ""} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function PerDay({ days }) {
  if (!days?.length) return null;
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <Card title="Responses per day">
      <div className="flex h-28 items-end gap-[3px]" role="img" aria-label="Responses per day">
        {days.map((d) => (
          <div key={d.date} className="group relative flex h-full min-w-[4px] flex-1 items-end" title={`${fmtDay(d.date)}: ${d.count}`}>
            <div className="w-full rounded-t-sm bg-[var(--a-accent)] opacity-80 group-hover:opacity-100" style={{ height: `${d.count ? Math.max(6, (d.count / max) * 100) : 2}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11.5px] text-[var(--a-text-faint)]">
        <span>{fmtDay(days[0].date)}</span>
        <span>{fmtDay(days[days.length - 1].date)}</span>
      </div>
    </Card>
  );
}

function QuestionCard({ n, q, of, onPick, active }) {
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-[var(--a-text-primary)]">
          <span className="mr-1.5 text-[var(--a-text-faint)]">{n}.</span>
          {q.label}
        </h2>
        <span className="text-[12.5px] text-[var(--a-text-muted)]">
          {q.answered} of {of} answered{q.multi ? " · tick all that apply" : ""}
        </span>
      </div>
      {q.kind === "choice" ? <Bars q={q} onPick={onPick} active={active} /> : <Texts q={q} />}
    </Card>
  );
}

function Bars({ q, onPick, active }) {
  const max = Math.max(1, ...q.counts.map((c) => c.count));
  return (
    <div className="flex flex-col gap-2.5">
      {q.counts.map((c) => (
        <button
          key={c.option}
          type="button"
          onClick={() => onPick(c.option)}
          title={`Show only people who answered “${c.option}”`}
          className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg p-1.5 text-left transition-colors hover:bg-[var(--a-bg-surface-2)] ${active === c.option ? "bg-[var(--a-accent-muted)]" : ""}`}
        >
          <span className="truncate text-[13.5px] text-[var(--a-text-primary)]">{c.option}</span>
          <span className="text-[13px] font-semibold text-[var(--a-text-primary)] tabular-nums">
            {c.count} <span className="font-normal text-[var(--a-text-muted)]">· {pct(c.count, q.answered)}%</span>
          </span>
          <span className="col-span-2 h-2.5 overflow-hidden rounded-full bg-[var(--a-bg-surface-2)]">
            <span className="block h-full rounded-full bg-[var(--a-accent)] transition-[width]" style={{ width: `${(c.count / max) * 100}%` }} />
          </span>
        </button>
      ))}
      {q.others?.length > 0 && (
        <details className="mt-1 rounded-lg border border-[var(--a-border)] px-3 py-2">
          <summary className="cursor-pointer text-[13px] font-semibold text-[var(--a-text-primary)]">“Any other” answers ({q.others.length})</summary>
          <ul className="mt-2 flex flex-col gap-1.5 text-[13px] text-[var(--a-text-muted)]">
            {q.others.map((t, i) => (
              <li key={i}>• {t}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Texts({ q }) {
  if (!q.answers.length) return <p className="text-[13px] text-[var(--a-text-faint)]">No written answers yet.</p>;
  return (
    <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
      {q.answers.map((a, i) => (
        <li key={i} className="rounded-lg bg-[var(--a-bg-surface-2)] px-3 py-2 text-[13.5px] leading-relaxed whitespace-pre-line text-[var(--a-text-primary)]">
          {a.text}
          <span className="mt-1 block text-[11.5px] text-[var(--a-text-faint)]">{new Date(a.at).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  );
}
