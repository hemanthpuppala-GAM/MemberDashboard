import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, UserPlus, Eye, ClipboardList, CheckCircle2, FileSpreadsheet, Camera, Info } from "lucide-react";
import { supportApi } from "../supportApi";
import { Button, ErrorNote, inputClass, cardClass } from "./ui";

const NEW_ROW = () => ({ key: Math.random().toString(36).slice(2), name: "", phone: "", email: "" });
const today = () => new Date().toISOString().slice(0, 10);

const RESULT = {
  new: { label: "Will be added", cls: "bg-[rgba(201,162,74,0.18)] text-[#7A5E22]" },
  created: { label: "Registered", cls: "bg-[#2F6B45] text-white" },
  existing: { label: "Already a member", cls: "bg-[rgba(20,36,28,0.08)] text-[#1B3328]" },
  repeat: { label: "Same as above", cls: "bg-[rgba(90,85,70,0.1)] text-[#5A5546]" },
  invalid: { label: "Check number", cls: "bg-[rgba(163,58,42,0.12)] text-[#A33A2A]" },
};

/**
 * Support desk → Event registration. At a satsang or camp, type each person's name and phone (or paste
 * a list). Everyone becomes a member with a GAW member ID; a phone or email already registered is
 * recognised and keeps its ID. Email is optional.
 */
export default function RegisterPanel() {
  const [events, setEvents] = useState(null);
  const [eventId, setEventId] = useState("");
  const [newEvent, setNewEvent] = useState({ name: "", place: "", held_on: today() });
  const [rows, setRows] = useState(() => [NEW_ROW(), NEW_ROW(), NEW_ROW()]);
  const [paste, setPaste] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lastPhone = useRef(null);
  const csvInput = useRef(null);
  const photoInput = useRef(null);
  const [reading, setReading] = useState("");
  const [readNote, setReadNote] = useState("");

  // CSV or a photo of the sign-up sheet → rows below, to check before registering.
  const readFile = async (file, kind) => {
    if (!file) return;
    setReading(kind);
    setError("");
    setReadNote("");
    try {
      const res = await supportApi.readListFile(file);
      const found = (res.people || []).map((p) => ({ ...NEW_ROW(), name: p.name || "", phone: p.phone || "", email: p.email || "" }));
      if (!found.length) throw new Error("No names or numbers found in that file.");
      setRows((rs) => [...rs.filter((r) => r.name.trim() || r.phone.trim() || r.email), ...found, NEW_ROW()]);
      setResult(null);
      setReadNote(`Read ${found.length} ${found.length === 1 ? "person" : "people"} from the ${res.source === "photo" ? "photo" : "file"} — check the names and numbers, then press Check first.${res.note ? ` ${res.note}` : ""}`);
    } catch (e) {
      setError(e.message || "Could not read that file.");
    } finally {
      setReading("");
      if (csvInput.current) csvInput.current.value = "";
      if (photoInput.current) photoInput.current.value = "";
    }
  };

  useEffect(() => {
    supportApi
      .events()
      .then((list) => {
        setEvents(list);
        if (list[0] && list[0].held_on?.slice(0, 10) === today()) setEventId(String(list[0].id)); // today's event, if any
      })
      .catch(() => setEvents([]));
  }, []);

  const people = useMemo(() => rows.filter((r) => r.name.trim() || r.phone.trim() || r.email).map(({ name, phone, email }) => ({ name, phone, email })), [rows]);
  const hasInput = people.length > 0 || paste.trim() !== "";
  const creatingEvent = eventId === "new" || (events && events.length === 0);

  const setRow = (key, patch) => {
    setResult(null);
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };
  const addRow = () => {
    setRows((rs) => [...rs, NEW_ROW()]);
    setTimeout(() => lastPhone.current?.focus(), 0);
  };

  const ensureEvent = async () => {
    if (!creatingEvent) return eventId;
    if (!newEvent.name.trim()) throw new Error("Give the event a name first (e.g. “Guntur satsang”).");
    const created = await supportApi.createEvent({ ...newEvent, held_on: newEvent.held_on || null });
    setEvents((list) => [created, ...(list || [])]);
    setEventId(String(created.id));
    return String(created.id);
  };

  const submit = async (preview) => {
    setBusy(true);
    setError("");
    try {
      let res;
      let id = null;
      if (preview && creatingEvent) {
        res = await supportApi.checkRegistrations({ people, lines: paste }); // event not created yet
      } else {
        id = await ensureEvent();
        res = await supportApi.registerAtEvent(id, { people, lines: paste, preview });
      }
      setResult({ ...res, preview });
      if (!preview) {
        setRows([NEW_ROW(), NEW_ROW(), NEW_ROW()]);
        setPaste("");
        setEvents((list) => (list || []).map((e) => (String(e.id) === id ? { ...e, members_count: (e.members_count || 0) + res.summary.created } : e)));
      }
    } catch (e) {
      setError(e.message || "Could not register. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const s = result?.summary;

  return (
    <section aria-label="Event registration" className="flex flex-col gap-4">
      <div className={`${cardClass} flex flex-col gap-4 p-4 sm:p-5`}>
        <div>
          <h2 className="text-[20px] text-[#14241C]">Register people at an event</h2>
          <p className="mt-1 text-[14px] text-[#5A5546]">
            Name and phone are enough — email is optional. Everyone gets a member ID (GAW-…). Someone already registered with the same phone or email keeps
            their ID; nobody is added twice.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[#1B3328]">Event</span>
          <select className={inputClass} value={creatingEvent ? "new" : eventId} onChange={(e) => { setEventId(e.target.value); setResult(null); }}>
            <option value="" disabled>
              Choose an event…
            </option>
            {(events || []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
                {e.held_on ? ` · ${new Date(e.held_on).toLocaleDateString(undefined, { day: "numeric", month: "short" })}` : ""} · {e.members_count} registered
              </option>
            ))}
            <option value="new">+ New event</option>
          </select>
        </label>

        {creatingEvent && (
          <div className="grid gap-3 sm:grid-cols-[2fr_1.5fr_1fr]">
            <input className={inputClass} placeholder="Event name, e.g. Guntur satsang" value={newEvent.name} onChange={(e) => setNewEvent((n) => ({ ...n, name: e.target.value }))} />
            <input className={inputClass} placeholder="Place (optional)" value={newEvent.place} onChange={(e) => setNewEvent((n) => ({ ...n, place: e.target.value }))} />
            <input className={inputClass} type="date" value={newEvent.held_on} onChange={(e) => setNewEvent((n) => ({ ...n, held_on: e.target.value }))} aria-label="Date" />
          </div>
        )}
      </div>

      <div className={`${cardClass} flex flex-col gap-3 p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => photoInput.current?.click()} busy={reading === "photo"} disabled={!!reading}>
            {reading !== "photo" && <Camera size={16} aria-hidden />} {reading === "photo" ? "Reading the photo…" : "Photo of a list"}
          </Button>
          <Button onClick={() => csvInput.current?.click()} busy={reading === "csv"} disabled={!!reading}>
            {reading !== "csv" && <FileSpreadsheet size={16} aria-hidden />} Upload CSV
          </Button>
          <span className="text-[12.5px] text-[#5A5546]">A sign-up sheet photo (handwritten is fine) or a CSV fills the rows below.</span>
          <input ref={photoInput} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => readFile(e.target.files?.[0], "photo")} />
          <input ref={csvInput} type="file" accept=".csv,.tsv,.txt,text/csv" className="hidden" onChange={(e) => readFile(e.target.files?.[0], "csv")} />
        </div>
        {readNote && (
          <p className="flex items-start gap-2 rounded-xl bg-[rgba(201,162,74,0.14)] px-3.5 py-2.5 text-[13.5px] text-[#5C4718]" role="status">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden /> {readNote}
          </p>
        )}
        <div className="hidden grid-cols-[1.3fr_1fr_44px] gap-2 px-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5A5546] sm:grid">
          <span>Name</span>
          <span>Phone</span>
          <span />
        </div>
        {rows.map((r, i) => (
          <div key={r.key} className="grid grid-cols-[1fr_44px] gap-2 rounded-xl border border-[rgba(138,111,52,0.14)] p-2 sm:grid-cols-[1.3fr_1fr_44px] sm:border-0 sm:p-0">
            <input
              className={inputClass}
              placeholder="Name"
              autoComplete="off"
              value={r.name}
              onChange={(e) => setRow(r.key, { name: e.target.value })}
              aria-label={`Name, person ${i + 1}`}
            />
            <input
              ref={i === rows.length - 1 ? lastPhone : undefined}
              className={`${inputClass} col-start-1 sm:col-start-auto ${r.phone.includes("?") ? "border-[#A33A2A]! bg-[rgba(163,58,42,0.05)]!" : ""}`}
              title={r.phone.includes("?") ? "Some digits couldn't be read — fix them from the sheet" : undefined}
              placeholder="Phone (10 digits = India)"
              inputMode="tel"
              autoComplete="off"
              value={r.phone}
              onChange={(e) => setRow(r.key, { phone: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && i === rows.length - 1) {
                  e.preventDefault();
                  addRow();
                }
              }}
              aria-label={`Phone, person ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : [NEW_ROW()]))}
              className="row-span-2 row-start-1 col-start-2 flex min-h-[44px] items-center justify-center rounded-xl text-[#5A5546] hover:bg-[rgba(163,58,42,0.08)] hover:text-[#A33A2A] sm:row-span-1 sm:col-start-auto sm:row-start-auto"
              aria-label={`Remove person ${i + 1}`}
            >
              <Trash2 size={17} aria-hidden />
            </button>
            {r.email && <p className="col-span-full m-0 px-1 text-[12.5px] text-[#5A5546]">Email: {r.email}</p>}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button onClick={addRow}>
            <Plus size={16} aria-hidden /> Add another person
          </Button>
          <Button variant="ghost" onClick={() => setShowPaste((v) => !v)}>
            <ClipboardList size={16} aria-hidden /> {showPaste ? "Hide pasted list" : "Paste a list instead"}
          </Button>
        </div>
        {showPaste && (
          <textarea
            className={`${inputClass} min-h-[140px] font-mono text-[13.5px]`}
            placeholder={"One person per line:\nRavi Kumar, 9876543210\n9876543211, Lakshmi\n9876543212"}
            value={paste}
            onChange={(e) => { setPaste(e.target.value); setResult(null); }}
          />
        )}

        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[rgba(138,111,52,0.14)] pt-3">
          <span className="mr-auto text-[13px] text-[#5A5546]">
            {people.length} {people.length === 1 ? "person" : "people"} typed{paste.trim() ? " + pasted list" : ""}
          </span>
          <Button onClick={() => submit(true)} disabled={!hasInput || busy}>
            <Eye size={16} aria-hidden /> Check first
          </Button>
          <Button variant="dark" onClick={() => submit(false)} busy={busy} disabled={!hasInput || (!creatingEvent && !eventId)}>
            <UserPlus size={16} aria-hidden /> Register
          </Button>
        </div>
      </div>

      {result && (
        <div className={`${cardClass} flex flex-col gap-3 p-4 sm:p-5`} aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            {!result.preview && <CheckCircle2 size={18} className="text-[#2F6B45]" aria-hidden />}
            <h3 className="text-[17px] text-[#14241C]">{result.preview ? "Check before registering" : `${s.created} registered`}</h3>
            {Object.entries(RESULT).map(([k, v]) =>
              s[k] ? (
                <span key={k} className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${v.cls}`}>
                  {s[k]} · {v.label}
                </span>
              ) : null
            )}
          </div>
          <ul className="flex flex-col divide-y divide-[rgba(138,111,52,0.14)]">
            {result.rows.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[14px]">
                <span className="min-w-0 flex-1 font-semibold text-[#14241C]">{r.name || <span className="font-normal text-[#5A5546]">No name</span>}</span>
                <span className="text-[#5A5546]">{r.phone || r.email || r.line}</span>
                {r.member_code && <span className="font-mono text-[13px] font-semibold text-[#7A5E22]">{r.member_code}</span>}
                <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${RESULT[r.status]?.cls}`}>
                  {r.status === "invalid" ? r.message : RESULT[r.status]?.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
