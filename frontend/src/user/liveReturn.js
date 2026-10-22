/**
 * "Join on Zoom / YouTube" from the dashboard: remember when the member left, so that when they come
 * back the dashboard can offer to log the sit (all of it, about half, or none). It measures time away
 * from the dashboard, not time in the meeting, which is why the member decides how much to log.
 * Kept in this browser only (like the old site's gaw_live_open).
 */
const KEY = "gaw_live_open";
const MIN_MINUTES = 3; // shorter than this is not a sit; keep waiting
const STALE_MINUTES = 180; // left the tab open overnight: drop it
export const MAX_LOG_MINUTES = 120;

export const LIVE_LOGGED_EVENT = "gaw:practice-logged";

export function markLiveStart(label, via) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), label, via }));
  } catch {
    /* private mode: no prompt on return */
  }
}

/** { label, via, minutes } once the member has been away long enough, else null. */
export function readLiveReturn() {
  let open;
  try {
    open = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
  if (!open?.t) return null;
  const minutes = Math.round((Date.now() - open.t) / 60000);
  if (minutes < MIN_MINUTES) return null;
  if (minutes > STALE_MINUTES) {
    clearLiveReturn();
    return null;
  }
  return { label: open.label || "the live session", via: open.via === "youtube" ? "youtube" : "zoom", minutes: Math.min(minutes, MAX_LOG_MINUTES) };
}

export function clearLiveReturn() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
