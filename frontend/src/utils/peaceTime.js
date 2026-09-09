/**
 * Format an IST clock time (24h) in the visitor's local zone — or in a given
 * zone. Returns e.g. "8:30 PM". IST = UTC+5:30 with no DST, so today's date
 * in Kolkata + the given hour is an exact instant.
 */
export function istToLocal(h, m, timeZone) {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const get = (t) => Number(parts.find((p) => p.type === t)?.value);
    const utc = Date.UTC(get("year"), get("month") - 1, get("day"), h - 5, m - 30, 0);
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone }).format(new Date(utc));
  } catch {
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  }
}

/** Format the daily sit (8:30 PM IST) in the visitor's local clock. */
export function getPeaceLocalLabel() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata") return "8:30 PM IST";
    return `${istToLocal(20, 30)} your time`;
  } catch {
    return "8:30 PM IST";
  }
}

/** Short zone name for the visitor ("EDT", "GMT+2", …); empty when unknown. */
function localZoneAbbrev() {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/**
 * Hero subline label. IST visitors: "Daily at 8:30 PM IST".
 * Everyone else sees their own clock first, then the source time:
 * "Daily at 11:00 AM EDT · 8:30 PM IST".
 */
export function getSessionTimeLabel() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "Daily at 8:30 PM IST";
    const zone = localZoneAbbrev();
    return `Daily at ${istToLocal(20, 30)}${zone ? ` ${zone}` : ""} · 8:30 PM IST`;
  } catch {
    return "Daily at 8:30 PM IST";
  }
}
