import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Rocket, CalendarClock, Undo2, CheckCircle2, XCircle, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Modal from "../../ui/Modal";
import { api } from "../../../lib/api";

/** Date-time in the site's time zone (India), for display. */
const fmt = (iso, timeZone) =>
  iso ? new Date(iso).toLocaleString("en-IN", { timeZone, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : "";

/** "2026-11-01T06:00" for a datetime-local input, in the site's time zone. */
function localInput(date, timeZone) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

const STATUS = {
  staging: { tone: "neutral", label: "Not live yet" },
  scheduled: { tone: "info", label: "Scheduled" },
  live: { tone: "success", label: "Live" },
  failed: { tone: "danger", label: "Scheduled switch failed" },
};

/**
 * Go live: make this app the main goldenagewisdom.org site at a chosen time, or now — and roll back.
 * The production build waits in app/ on the server; the switch swaps the site's routing (instant).
 */
export default function GoLivePage() {
  const [s, setS] = useState(null);
  const [at, setAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null); // "now" | "rollback"

  const load = useCallback(() => api.goLive().then(setS).catch((err) => toast.error(err.message ?? "Failed to load")), []);
  useEffect(() => {
    load();
  }, [load]);
  // While scheduled, refresh each minute so the page shows the switch when it happens.
  useEffect(() => {
    if (s?.status !== "scheduled") return undefined;
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [s?.status, load]);

  const act = async (fn, ok) => {
    setBusy(true);
    try {
      setS(await fn());
      toast.success(ok, { duration: 6000 });
    } catch (err) {
      toast.error(err.message ?? "That didn't work", { duration: 10000 });
      load();
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  if (!s) return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;

  const tz = s.timezone || "Asia/Kolkata";
  const st = STATUS[s.status] ?? STATUS.staging;
  const blocked = s.checks.filter((c) => c.blocking && !c.ok);
  const ready = blocked.length === 0;
  const cron = s.checks.find((c) => c.key === "cron");
  const live = s.status === "live";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Go live</h1>
          <p className="mt-1 max-w-3xl text-[13.5px] text-[var(--a-text-muted)]">
            Makes this new site the main <strong>{s.live_url.replace(/^https?:\/\//, "")}</strong> — at a time you pick, or right now. The switch is instant, keeps every
            old link working (old pages open their new versions), and can be rolled back in a minute.
          </p>
        </div>
        <Badge tone={st.tone} dot>{st.label}</Badge>
      </div>

      {live && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-[var(--a-success)]" />
              <div className="text-[13.5px] text-[var(--a-text-muted)]">
                <p className="text-[15px] font-semibold text-[var(--a-text-primary)]">The new site is live</p>
                <p>Since {fmt(s.live_at, tz)}{s.live_by ? ` · by ${s.live_by}` : ""}.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button as="a" variant="secondary" icon={ExternalLink} href={s.live_url} target="_blank" rel="noopener noreferrer">Open the site</Button>
              <Button variant="danger" icon={Undo2} onClick={() => setConfirm("rollback")} disabled={busy}>Roll back</Button>
            </div>
          </div>
        </Card>
      )}

      {s.status === "failed" && (
        <p className="flex items-start gap-2 rounded-xl border border-[var(--a-danger)]/30 bg-[var(--a-danger-muted)] px-3.5 py-2.5 text-[13px] text-[var(--a-danger)]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>The scheduled switch didn&apos;t happen: {s.error} The old site is still live. Fix the item below, then schedule again or go live now.</span>
        </p>
      )}

      {!live && (
      <Card title="Ready to switch?" description="Red items stop the switch. Amber ones are reminders." actions={<Button variant="secondary" size="sm" icon={RefreshCw} onClick={load}>Check again</Button>}>
        <ul className="flex flex-col divide-y divide-[var(--a-border)]">
          {s.checks.map((c) => (
            <li key={c.key} className="flex items-start gap-3 py-2.5">
              {c.ok ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--a-success)]" aria-label="OK" />
              ) : c.blocking ? (
                <XCircle size={18} className="mt-0.5 shrink-0 text-[var(--a-danger)]" aria-label="Must fix" />
              ) : (
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--a-warning)]" aria-label="Reminder" />
              )}
              <div className="min-w-0 text-[13px]">
                <p className="font-semibold text-[var(--a-text-primary)]">{c.label}</p>
                <p className="text-[var(--a-text-muted)]">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      )}

      {!live && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Schedule it" description={`Pick the moment, India time (${tz}). The server switches by itself within a minute of it.`}>
            {s.status === "scheduled" ? (
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-2 text-[14px] text-[var(--a-text-primary)]">
                  <CalendarClock size={18} className="text-[var(--a-info)]" />
                  <span>
                    Goes live <strong>{fmt(s.scheduled_at, tz)}</strong>
                    {s.scheduled_by ? <span className="text-[var(--a-text-muted)]"> · set by {s.scheduled_by}</span> : null}
                  </span>
                </p>
                {cron && !cron.ok && <p className="text-[12.5px] text-[var(--a-warning)]">The scheduler isn&apos;t running yet, so the scheduled time won&apos;t fire on its own — fix the cPanel cron, or use Go live now.</p>}
                <div>
                  <Button variant="secondary" onClick={() => act(api.cancelGoLive, "Schedule cancelled")} disabled={busy}>Cancel schedule</Button>
                </div>
              </div>
            ) : (
              <form
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (at) act(() => api.scheduleGoLive(at), "Scheduled — the site will switch by itself");
                }}
              >
                <label className="flex flex-1 flex-col gap-1 text-[12.5px] font-semibold text-[var(--a-text-primary)]">
                  Date and time (India)
                  <input
                    type="datetime-local"
                    required
                    min={localInput(new Date(), tz)}
                    value={at}
                    onChange={(e) => setAt(e.target.value)}
                    className="rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-surface)] px-3 py-2 text-[14px] font-normal text-[var(--a-text-primary)]"
                  />
                </label>
                <Button type="submit" icon={CalendarClock} disabled={busy || !at}>Schedule</Button>
              </form>
            )}
          </Card>

          <Card title="Go live now" description="Switches within seconds: a last copy of the old site's sign-ups, a database backup, then the new site.">
            <Button icon={Rocket} onClick={() => setConfirm("now")} disabled={busy || !ready} title={ready ? undefined : "Fix the red items first"}>
              {busy && confirm === "now" ? "Switching…" : "Go live now"}
            </Button>
            {!ready && <p className="mt-2 text-[12.5px] text-[var(--a-danger)]">Fix the red items above first.</p>}
          </Card>
        </div>
      )}

      {s.log?.length > 0 && (
        <Card title="History">
          <ul className="flex flex-col gap-1.5 text-[13px]">
            {s.log.map((l, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 text-[var(--a-text-muted)]">
                <span className="text-[var(--a-text-faint)]">{fmt(l.at, tz)}</span>
                <span className="text-[var(--a-text-primary)]">{l.message}</span>
                <span>· {l.by}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={confirm !== null}
        onClose={() => !busy && setConfirm(null)}
        title={confirm === "rollback" ? "Put the old site back?" : "Make the new site live now?"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={busy}>Cancel</Button>
            {confirm === "rollback" ? (
              <Button variant="danger" icon={Undo2} disabled={busy} onClick={() => act(api.rollbackGoLive, "Rolled back — the old site is live again")}>
                {busy ? "Rolling back…" : "Roll back"}
              </Button>
            ) : (
              <Button icon={Rocket} disabled={busy} onClick={() => act(api.goLiveNow, "The new site is live!")}>
                {busy ? "Switching…" : "Go live"}
              </Button>
            )}
          </>
        }
      >
        <p className="text-[13.5px] text-[var(--a-text-muted)]">
          {confirm === "rollback"
            ? `${s.live_url.replace(/^https?:\/\//, "")} will show the previous site again within a minute. Nothing in this admin panel is lost, and you can go live again later.`
            : `Everyone visiting ${s.live_url.replace(/^https?:\/\//, "")} will see the new site straight away. You can roll back from this page at any time.`}
        </p>
      </Modal>
    </div>
  );
}
