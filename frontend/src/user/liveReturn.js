/**
 * "Join on Zoom / YouTube" from the dashboard: remember when the member left, so that when they come
 * back the dashboard can offer to log the sit (all of it, about half, or none). It measures time away
 * from the dashboard, not time in the meeting, which is why the member decides how much to log.
 * It never asks before the session's scheduled end: a peek at the dashboard mid-sit is not a return.
 * Kept in this browser only (like the old site's gaw_live_open).
 */
const KEY = "gaw_live_open";
const MIN_MINUTES = 3; // shorter than this is not a sit; keep waiting
const STALE_MINUTES = 180; // this long after the sit ended (left the tab open overnight): drop it
const MAX_AHEAD = 12 * 3600000; // an "end" further off than this is a later day's session: ignore it
export const MAX_LOG_MINUTES = 120;

export const LIVE_LOGGED_EVENT = "gaw:practice-logged";

/** `end` is when the session is scheduled to finish (ms), if known. */
export function markLiveStart(label, via, end) {
  const t = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify({ t, label, via, end: end > t && end - t < MAX_AHEAD ? end : null }));
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
  const now = Date.now();
  if (open.end && now < open.end) return null; // still in the session
  const until = open.end ? Math.min(now, open.end) : now;
  const minutes = Math.round((until - open.t) / 60000);
  if (minutes < MIN_MINUTES) return null;
  if ((now - until) / 60000 > STALE_MINUTES || (!open.end && minutes > STALE_MINUTES)) {
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
