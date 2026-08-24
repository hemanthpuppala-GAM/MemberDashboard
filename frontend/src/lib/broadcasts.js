const SEEN_PREFIX = "gaw_broadcast_seen_";
const VISITED_KEY = "gaw_visited_before";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** "new_visitors" the first time this browser is ever seen, "returning" every time after. */
export function getVisitorType() {
  try {
    if (localStorage.getItem(VISITED_KEY)) return "returning";
    localStorage.setItem(VISITED_KEY, "1");
    return "new_visitors";
  } catch {
    return "returning";
  }
}

/** Whether a broadcast has already satisfied its `frequency` limit for this visitor. */
export function isBroadcastSuppressed(broadcast) {
  try {
    const key = SEEN_PREFIX + broadcast.id;
    switch (broadcast.frequency) {
      case "once_per_session":
        return sessionStorage.getItem(key) === "1";
      case "once_per_day":
        return localStorage.getItem(key) === todayKey();
      case "once_ever":
        return localStorage.getItem(key) === "1";
      default: // every_visit
        return false;
    }
  } catch {
    return false;
  }
}

/** Records that a broadcast has been shown, per its `frequency` rule. */
export function markBroadcastSeen(broadcast) {
  try {
    const key = SEEN_PREFIX + broadcast.id;
    if (broadcast.frequency === "once_per_session") sessionStorage.setItem(key, "1");
    else if (broadcast.frequency === "once_per_day") localStorage.setItem(key, todayKey());
    else if (broadcast.frequency === "once_ever") localStorage.setItem(key, "1");
  } catch {
    // storage unavailable — broadcast may reappear more often than intended, not worth failing over
  }
}
