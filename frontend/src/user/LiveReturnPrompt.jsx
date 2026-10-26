import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, PenLine, X } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "../components/ui/Button";
import { memberAuthApi } from "../lib/memberAuth";
import { useActiveSit } from "./ActiveSitContext";
import { LIVE_LOGGED_EVENT, clearLiveReturn, readLiveReturn } from "./liveReturn";

const plural = (n) => `${n} minute${n === 1 ? "" : "s"}`;

/**
 * Back from a live session joined on the dashboard: "Log all / about half / don't log", then an
 * optional journal entry, as on the old site. Before the session's scheduled end it doesn't interrupt:
 * a quiet bar says it will ask at the end, with "I've left: log N minutes" for leaving early. Checks
 * on load, whenever the dashboard regains focus or becomes visible again, and each minute while it's
 * open (so it asks once the session ends); never while a Sit & Scribe sit is running.
 */
export default function LiveReturnPrompt() {
  const { hasActiveSit } = useActiveSit();
  // On load too, so it also asks when they reopen the dashboard later that day.
  const initial = () => (document.hidden ? null : readLiveReturn());
  const [back, setBack] = useState(() => (initial()?.ended ? initial() : null)); // { label, via, minutes }: ask now
  const [waiting, setWaiting] = useState(() => (initial()?.ended === false ? initial() : null)); // still in the session: the bar
  const [barHidden, setBarHidden] = useState(false);
  const [logged, setLogged] = useState(null); // minutes logged → journal step
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const check = useCallback(() => {
    if (document.hidden || hasActiveSit) return;
    const away = readLiveReturn();
    setWaiting(away && !away.ended ? away : null);
    if (away?.ended) setBack((cur) => cur || away);
  }, [hasActiveSit]);

  useEffect(() => {
    const onVisible = () => !document.hidden && check();
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisible);
    const tick = setInterval(check, 60000);
    return () => {
      clearInterval(tick);
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
    setWaiting(null);
    close();
  };

  const leftEarly = () => {
    setBack(waiting);
    setWaiting(null);
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

  if (!back) {
    if (!waiting || barHidden || hasActiveSit) return null;
    const where = waiting.via === "youtube" ? "YouTube" : "Zoom";
    return (
      <div role="status" className="fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4 lg:pl-[276px]">
        <div className="flex w-full max-w-xl flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-3 pl-4 pr-2 shadow-[0_12px_40px_rgba(14,26,20,0.18)]">
          <p className="min-w-0 flex-1 text-[13.5px] leading-snug text-[var(--color-ink)]">
            In the session on {where}? <span className="text-[var(--color-ink-soft)]">We&apos;ll ask how it went when it ends.</span>
          </p>
          <div className="flex items-center gap-1">
            <Button as="button" variant="secondary" onClick={leftEarly} className="!px-3.5 !py-2 !text-[13px]">
              I&apos;ve left: log {plural(waiting.minutes)}
            </Button>
            <button
              type="button"
              onClick={() => setBarHidden(true)}
              aria-label="Hide until the session ends"
              className="rounded-full p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (hasActiveSit && logged === null) return null;
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
      onClose={back.ended ? skip : close} // opened from the bar by mistake: back to the bar
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
