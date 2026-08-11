/** Format the daily sit (8:30 PM IST) in the visitor's local clock. */
export function getPeaceLocalLabel() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata") return "8:30 PM IST";

    const now = new Date();
    // Build today's 20:30 Asia/Kolkata as an absolute instant
    const istParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const get = (type) => istParts.find((p) => p.type === type)?.value;
    const y = Number(get("year"));
    const m = Number(get("month"));
    const d = Number(get("day"));
    // IST = UTC+5:30 → 20:30 IST = 15:00 UTC
    const utc = Date.UTC(y, m - 1, d, 15, 0, 0);
    const local = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(utc));
    return `${local} your time`;
  } catch {
    return "8:30 PM IST";
  }
}
