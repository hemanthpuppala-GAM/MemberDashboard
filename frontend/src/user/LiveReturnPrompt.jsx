import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, PenLine } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "../components/ui/Button";
import { memberAuthApi } from "../lib/memberAuth";
import { useActiveSit } from "./ActiveSitContext";
import { LIVE_LOGGED_EVENT, clearLiveReturn, readLiveReturn } from "./liveReturn";

const plural = (n) => `${n} minute${n === 1 ? "" : "s"}`;

/**
 * Back from a live session joined on the dashboard: "Log all / about half / don't log", then an
 * optional journal entry, as on the old site. Checks on load and whenever the dashboard regains
 * focus or becomes visible again; never while a Sit & Scribe sit is running.
 */
export default function LiveReturnPrompt() {
  const { hasActiveSit } = useActiveSit();
  // On load too, so it also asks when they reopen the dashboard later that day.
  const [back, setBack] = useState(() => (document.hidden ? null : readLiveReturn())); // { label, via, minutes }
  const [logged, setLogged] = useState(null); // minutes logged → journal step
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const check = useCallback(() => {
    if (document.hidden || hasActiveSit) return;
    setBack((cur) => cur || readLiveReturn());
  }, [hasActiveSit]);

  useEffect(() => {
    const onVisible = () => !document.hidden && check();
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  const close = () => {
    setBack(null);
    setLogged(null);
    setDraft("");
    setError("");
  };

  const log = async (minutes) => {
    setBusy(true);
    setError("");
    try {
      await memberAuthApi.logPracticeSession(minutes, null, back.via);
      clearLiveReturn();
      window.dispatchEvent(new Event(LIVE_LOGGED_EVENT));
      setLogged(minutes);
    } catch (e) {
      setError(e.message || "Could not save that sit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const skip = () => {
    clearLiveReturn();
    close();
  };

  const saveJournal = async () => {
    setBusy(true);
    setError("");
    try {
      await memberAuthApi.addJournalEntry(draft.trim());
      close();
    } catch (e) {
      setError(e.message || "Could not save your entry. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!back || (hasActiveSit && logged === null)) return null;
  const where = back.via === "youtube" ? "YouTube" : "Zoom";

  if (logged !== null) {
    return (
      <Modal open onClose={close} title="Sit logged" description={`${plural(logged)} added to your practice. Anything you'd like to remember from this sit?`}>
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-[13px] text-[var(--color-ink-soft)]">
            <CheckCircle2 size={16} className="text-[var(--color-gold-deep)]" /> {back.label} · live on {where}
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="What came up during your sit today?"
            aria-label="Journal entry"
            className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] p-3 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] transition-all focus:border-[var(--color-gold-deep)] focus:bg-[var(--color-surface)] focus:shadow-[0_0_0_3px_rgba(198,161,91,0.28)] focus:outline-none"
          />
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button as="button" variant="secondary" onClick={close} disabled={busy}>
              Skip
            </Button>
            <Button as="button" onClick={saveJournal} disabled={!draft.trim() || busy}>
              <PenLine size={15} />
              {busy ? "Saving…" : "Save to journal"}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const half = Math.max(1, Math.round(back.minutes / 2));
  return (
    <Modal
      open
      onClose={skip}
      title={`${plural(back.minutes)} with ${back.label}`}
      description={`You were away on ${where} for about ${plural(back.minutes)}. Shall we add that to your practice? Only you know how much of it was true stillness.`}
    >
      <div className="flex flex-col gap-2">
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        <Button as="button" onClick={() => log(back.minutes)} disabled={busy}>
          {busy ? "Saving…" : `Log all ${plural(back.minutes)}`}
        </Button>
        <Button as="button" variant="secondary" onClick={() => log(half)} disabled={busy}>
          I sat for about half of it ({plural(half)})
        </Button>
        <button type="button" onClick={skip} disabled={busy} className="mt-1 self-center rounded-lg px-3 py-1.5 text-[13px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
          Don&apos;t log this one
        </button>
      </div>
    </Modal>
  );
}
