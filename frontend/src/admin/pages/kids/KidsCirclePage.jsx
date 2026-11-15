import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Baby, CameraOff, ClipboardCheck, Download, FileSignature, HeartHandshake, Users, UserPlus, CalendarCheck } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import toast from "react-hot-toast";
import Card from "../../ui/Card";
import StatCard from "../../ui/StatCard";
import Tabs from "../../ui/Tabs";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import { api, downloadAuthed } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";
import ConsentText from "../../../kids/ConsentText";
import { fmtDate } from "../../../kids/kidsUtil";

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "children", label: "Children", icon: Baby },
  { key: "roster", label: "Session roster", icon: ClipboardCheck },
];
const input = "rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-surface)] px-3 py-2 text-[13.5px] text-[var(--a-text-primary)]";

/** Admin → People → Kids Circle. Children's data: every family view and export is written to the activity log. */
export default function KidsCirclePage() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [family, setFamily] = useState(null);

  const loadStats = useCallback(() => api.kidsAnalytics().then(setStats).catch((e) => toast.error(e.message)), []);
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-[var(--a-text-primary)]">Kids Meditation Circle</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
          Registrations, signed parent consents and attendance. Public page: <a href={`${import.meta.env.BASE_URL}kids`} target="_blank" rel="noreferrer" className="text-[var(--a-accent)]">/kids</a>
          {stats && <> · consent version {stats.consent_version}</>}
        </p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "overview" && <Overview stats={stats} />}
      {tab === "children" && <Children groups={stats?.groups ?? []} onOpen={setFamily} />}
      {tab === "roster" && <Roster groups={stats?.groups ?? []} onChange={loadStats} />}
      <FamilyDrawer id={family} onClose={() => setFamily(null)} />
    </div>
  );
}

function Overview({ stats }) {
  if (!stats) return <p className="text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  const t = stats.totals;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Baby} label="Children registered" value={t.children} spark={stats.weekly.map((w) => w.registered)} />
        <StatCard icon={Users} label={`Families · ${t.sibling_families} with siblings`} value={t.families} />
        <StatCard icon={UserPlus} label="New this week" value={t.new_this_week} />
        <StatCard icon={CalendarCheck} label={`Came in the last 4 weeks · ${t.never_attended} never yet`} value={t.attended_last_4_weeks} />
        <StatCard icon={ClipboardCheck} label={`Sessions held · avg ${t.avg_attendance} children`} value={t.sessions_held} spark={stats.weekly.map((w) => w.attended)} />
        <StatCard icon={CameraOff} label="No-photo children" value={t.photo_opt_out} />
        <StatCard icon={FileSignature} label="Families to re-sign" value={t.needs_resign} />
        <StatCard icon={HeartHandshake} label="Withdrawn children" value={t.withdrawn} />
      </div>

      <Card title="Week by week" description="New children registered and attendance ticks, last 12 weeks.">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weekly} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="registered" name="Registered" fill="#C9A24A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="attended" name="Attended" fill="#1B3328" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bars title="By session" rows={stats.by_group} />
        <Bars title="By age" rows={stats.by_age} />
        <Bars title="By state" rows={stats.by_state} />
        <Bars title="How they heard about us" rows={stats.by_heard_about} />
        <Bars title="Meditation before" rows={stats.by_experience} />
        <Card title="Recent sessions">
          {stats.recent_sessions.length ? (
            <ul className="flex flex-col gap-1.5 text-[13.5px]">
              {stats.recent_sessions.map((s) => (
                <li key={`${s.group}-${s.date}`} className="flex justify-between gap-3">
                  <span className="text-[var(--a-text-muted)]">{s.date} · {s.group}</span>
                  <strong>{s.present}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[var(--a-text-muted)]">No attendance ticked yet. Use Session roster during a class.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Bars({ title, rows }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Card title={title}>
      {rows.length ? (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.option} className="grid grid-cols-[minmax(0,1fr)_2fr_auto] items-center gap-3 text-[13px]">
              <span className="truncate text-[var(--a-text-primary)]">{r.option}</span>
              <span className="h-2 rounded-full bg-[var(--a-bg-surface-2)]">
                <span className="block h-full rounded-full bg-[var(--a-accent)]" style={{ width: `${(r.count / max) * 100}%` }} />
              </span>
              <strong className="w-8 text-right">{r.count}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-[var(--a-text-muted)]">No data yet.</p>
      )}
    </Card>
  );
}

function Children({ groups, onOpen }) {
  const [filters, setFilters] = useState({ q: "", group: "", status: "active" });
  const [rows, setRows] = useState(null);
  const labels = useMemo(() => Object.fromEntries(groups.map((g) => [g.key, g.label])), [groups]);

  useEffect(() => {
    const t = setTimeout(() => api.kids(filters).then(setRows).catch((e) => toast.error(e.message)), 250);
    return () => clearTimeout(t);
  }, [filters]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const exportCsv = () => downloadAuthed(api.kidsExportPath(filters), "kids-circle.csv").catch((e) => toast.error(e.message));

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-center gap-2 p-4">
        <input className={`${input} min-w-[220px] flex-1`} placeholder="Search child, parent, email, phone" value={filters.q} onChange={set("q")} />
        <select className={input} value={filters.group} onChange={set("group")}>
          <option value="">All sessions</option>
          {groups.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
        </select>
        <select className={input} value={filters.status} onChange={set("status")}>
          <option value="active">Active</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="">All</option>
        </select>
        <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="border-y border-[var(--a-border)] bg-[var(--a-bg-surface-2)] text-[11.5px] uppercase tracking-wide text-[var(--a-text-muted)]">
            <tr>
              {["Child", "Age", "Session", "Photos", "Parent", "State", "Consent", "Sessions", "Registered"].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              <tr><td colSpan={9} className="px-4 py-6 text-[var(--a-text-muted)]">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-6 text-[var(--a-text-muted)]">No children match.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} onClick={() => onOpen(r.registration_id)} className="cursor-pointer border-b border-[var(--a-border)] hover:bg-[var(--a-accent-muted)]">
                  <td className="px-4 py-2.5 font-semibold text-[var(--a-text-primary)]">{r.name}{r.has_notes && <span title="Has notes for teachers"> 📝</span>}</td>
                  <td className="px-4 py-2.5">{r.age}</td>
                  <td className="px-4 py-2.5">{labels[r.group] ?? r.group}</td>
                  <td className="px-4 py-2.5">{r.photos === "yes" ? "Yes" : <span className="font-semibold text-[var(--a-danger)]">No</span>}</td>
                  <td className="px-4 py-2.5">{r.parent}<div className="text-[11.5px] text-[var(--a-text-muted)]">{r.phone}</div></td>
                  <td className="px-4 py-2.5">{r.state}</td>
                  <td className="px-4 py-2.5">{r.needs_resign ? <span className="text-[var(--a-danger)]">v{r.consent_version} · re-sign</span> : `v${r.consent_version}`}</td>
                  <td className="px-4 py-2.5">{r.sessions}{r.last_attended && <div className="text-[11.5px] text-[var(--a-text-muted)]">last {String(r.last_attended).slice(0, 10)}</div>}</td>
                  <td className="px-4 py-2.5">{r.registered}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/** Today in the program's own zone (Central), as YYYY-MM-DD. */
function programToday() {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function Roster({ groups, onChange }) {
  const { can } = usePermissions();
  const canMark = can("members.edit");
  const [picked, setGroup] = useState("");
  const group = picked || groups[0]?.key || "";
  const [date, setDate] = useState(programToday());
  const [loaded, setLoaded] = useState(null); // { key, data }
  const key = `${group}|${date}`;
  const data = loaded?.key === key ? loaded.data : null;
  const setData = (fn) => setLoaded((l) => (l ? { ...l, data: fn(l.data) } : l));

  useEffect(() => {
    if (!group) return;
    let alive = true;
    api.kidsRoster(group, date).then((d) => alive && setLoaded({ key: `${group}|${date}`, data: d })).catch((e) => toast.error(e.message));
    return () => {
      alive = false;
    };
  }, [group, date]);

  const toggle = async (kid) => {
    const present = !kid.present;
    setData((d) => ({ ...d, kids: d.kids.map((k) => (k.id === kid.id ? { ...k, present } : k)) }));
    try {
      await api.kidsAttendance(kid.id, date, present);
      onChange();
    } catch (e) {
      toast.error(e.message);
      setData((d) => ({ ...d, kids: d.kids.map((k) => (k.id === kid.id ? { ...k, present: !present } : k)) }));
    }
  };

  const count = data?.kids.filter((k) => k.present).length ?? 0;
  return (
    <Card
      title="Session roster"
      description="Tick each child who is in the Zoom room. Children with a no-photo flag must be out of any screenshot."
      actions={
        <div className="flex flex-wrap gap-2">
          <select className={input} value={group} onChange={(e) => setGroup(e.target.value)}>
            {groups.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
          <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      }
    >
      {!data ? (
        <p className="text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>
      ) : !data.kids.length ? (
        <p className="text-[13.5px] text-[var(--a-text-muted)]">No children registered in this session yet.</p>
      ) : (
        <>
          <p className="mb-3 text-[13px] text-[var(--a-text-muted)]">{count} of {data.kids.length} present{!canMark && " · you can view, not tick (needs Members: edit)"}</p>
          <ul className="flex flex-col divide-y divide-[var(--a-border)]">
            {data.kids.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <label className="flex min-w-[220px] flex-1 cursor-pointer items-center gap-3">
                  <input type="checkbox" className="h-5 w-5 accent-[var(--a-accent)]" checked={k.present} disabled={!canMark} onChange={() => toggle(k)} />
                  <span className="text-[14px] font-semibold text-[var(--a-text-primary)]">{k.name}</span>
                  <span className="text-[12.5px] text-[var(--a-text-muted)]">age {k.age} · {k.sessions} sessions</span>
                </label>
                {k.photos === "no" && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11.5px] font-semibold text-red-700"><CameraOff size={12} /> No photos</span>}
                {k.notes && <span className="w-full pl-8 text-[12.5px] text-[var(--a-text-muted)]">📝 {k.notes}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function FamilyDrawer({ id, onClose }) {
  return (
    <Drawer open={!!id} onClose={onClose} title="Family" width="min(560px,100vw)">
      {id && <FamilyBody key={id} id={id} />}
    </Drawer>
  );
}

function FamilyBody({ id }) {
  const [f, setF] = useState(null);
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    api.kidsFamily(id).then(setF).catch((e) => toast.error(e.message));
  }, [id]);

  const r = f?.registration;
  return (
    <>
      {!f ? (
        <p className="text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>
      ) : (
        <div className="flex flex-col gap-5 text-[13.5px]">
          <div>
            <p className="text-[16px] font-semibold text-[var(--a-text-primary)]">{r.guardian_name} <span className="font-normal text-[var(--a-text-muted)]">({r.relationship})</span></p>
            <p>{r.email} · {r.phone}</p>
            <p>{r.city}, {r.state}{r.heard_about && ` · heard via ${r.heard_about}`}</p>
            <p>Emergency: {r.emergency_name} · {r.emergency_phone}</p>
            {f.member && <p className="text-[var(--a-text-muted)]">Member {f.member.member_code ?? `#${f.member.id}`}</p>}
            <p className="mt-1">Status: <strong>{r.status}</strong>{f.needs_resign && <span className="text-[var(--a-danger)]"> · needs to re-sign</span>}</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Children</h3>
            <ul className="flex flex-col gap-2">
              {f.kids.map((k) => (
                <li key={k.id} className="rounded-lg border border-[var(--a-border)] p-3">
                  <strong>{k.first_name} {k.last_name}</strong>, {k.age} · {k.group} · {k.experience} · photos: {k.media_consent} · {k.attendances_count} sessions {k.status !== "active" && <em>({k.status})</em>}
                  {k.notes && <p className="mt-1 text-[var(--a-text-muted)]">📝 {k.notes}</p>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Signed consents</h3>
            <ul className="flex flex-col gap-2">
              {f.consents.map((c) => (
                <li key={c.id} className="rounded-lg border border-[var(--a-border)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span>v{c.version} · <em>{c.signature_name}</em> · {fmtDate(c.signed_at)}</span>
                    <button type="button" className="font-semibold text-[var(--a-accent)]" onClick={() => api.kidsConsent(c.id).then(setConsent).catch((e) => toast.error(e.message))}>View</button>
                  </div>
                  <p className="mt-1 break-all text-[11.5px] text-[var(--a-text-muted)]">KC-{c.id} · IP {c.ip ?? "—"} · {c.text_hash}</p>
                </li>
              ))}
            </ul>
          </div>
          {consent && (
            <div>
              <h3 className="mb-2 font-semibold">{consent.snapshot.title} (v{consent.version})</h3>
              <ConsentText sections={consent.snapshot.sections} agreed={consent.agreed} compact headingClass="font-semibold" />
            </div>
          )}
        </div>
      )}
    </>
  );
}
