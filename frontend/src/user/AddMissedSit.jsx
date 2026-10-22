import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "../components/ui/Button";
import { memberAuthApi } from "../lib/memberAuth";
import { toLocalDateKey } from "./dateKey";
import { LIVE_LOGGED_EVENT } from "./liveReturn";

const KINDS = [
  { via: "zoom", label: "Live on Zoom" },
  { via: "youtube", label: "Live on YouTube" },
  { via: "own", label: "My own sit" },
];
const QUICK_MINUTES = [15, 30, 45, 60];

/** Today and the two days before, in the member's own calendar. */
function recentDays() {
  return [0, 1, 2].map((back) => {
    const d = new Date();
    d.setDate(d.getDate() - back);
    const name = back === 0 ? "Today" : back === 1 ? "Yesterday" : d.toLocaleDateString(undefined, { weekday: "long" });
    return { key: toLocalDateKey(d), label: `${name} · ${d.toLocaleDateString(undefined, { day: "numeric", month: "short" })}` };
  });
}

const chip = (on) =>
  `rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
    on
      ? "border-[var(--color-gold-deep)] bg-[var(--color-gold-deep)] text-white"
      : "border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] text-[var(--color-ink)] hover:border-[var(--color-gold-deep)]"
  }`;

/**
 * "Add a missed sit": for a session the member sat but didn't log (no prompt after Zoom, a sit away from
 * the dashboard). Today or up to two days back, so the streak and challenge can still count it.
 */
export default function AddMissedSit() {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(recentDays);
  const [day, setDay] = useState(null);
  const [via, setVia] = useState("zoom");
  const [minutes, setMinutes] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const start = () => {
    const fresh = recentDays();
    setDays(fresh);
    setDay(fresh[1].key); // usually it's yesterday's sit that was missed
    setVia("zoom");
    setMinutes(30);
    setError("");
    setDone("");
    setOpen(true);
  };

  const mins = Number(minutes);
  const valid = day && Number.isInteger(mins) && mins >= 1 && mins <= 180;

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await memberAuthApi.logPracticeSession(mins, null, via, day);
      window.dispatchEvent(new Event(LIVE_LOGGED_EVENT));
      setDone(`${mins} minute${mins === 1 ? "" : "s"} added for ${days.find((d) => d.key === day)?.label.split(" · ")[0].toLowerCase()}.`);
    } catch (e) {
      setError(e.message || "Could not add that sit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button as="button" variant="secondary" onClick={start} className="!px-3.5 !py-2 !text-[13px]">
        <CalendarPlus size={15} />
        Add a missed sit
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={done ? "Sit added" : "Add a missed sit"}
        description={done || "Sat but didn't log it? Add it here, for today or the two days before, and it counts towards your streak and challenge."}
      >
        {done ? (
          <div className="flex justify-end">
            <Button as="button" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] font-medium text-[var(--color-ink)]">When</legend>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <button key={d.key} type="button" aria-pressed={day === d.key} onClick={() => setDay(d.key)} className={chip(day === d.key)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] font-medium text-[var(--color-ink)]">What</legend>
              <div className="flex flex-wrap gap-2">
                {KINDS.map((k) => (
                  <button key={k.via} type="button" aria-pressed={via === k.via} onClick={() => setVia(k.via)} className={chip(via === k.via)}>
                    {k.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-2">
              <label htmlFor="missed-minutes" className="text-[13px] font-medium text-[var(--color-ink)]">
                How many minutes did you sit?
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_MINUTES.map((m) => (
                  <button key={m} type="button" aria-pressed={mins === m} onClick={() => setMinutes(m)} className={chip(mins === m)}>
                    {m}
                  </button>
                ))}
                <input
                  id="missed-minutes"
                  type="number"
                  min={1}
                  max={180}
                  inputMode="numeric"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-20 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] px-3 py-2 text-[14px] text-[var(--color-ink)] focus:border-[var(--color-gold-deep)] focus:outline-none"
                />
                <span className="text-[13px] text-[var(--color-ink-soft)]">min</span>
              </div>
              {!valid && minutes !== "" && <p className="text-[12.5px] text-red-600">Enter 1 to 180 minutes.</p>}
            </div>
            {error && <p className="text-[13px] text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button as="button" variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button as="button" onClick={save} disabled={!valid || busy}>
                {busy ? "Saving…" : "Add sit"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
