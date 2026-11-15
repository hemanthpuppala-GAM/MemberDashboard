/** Kids Meditation Circle helpers shared by /kids, /kids/register, My family and the admin pages. */

/** "7:00 PM" in the viewer's own zone, plus that zone's short name ("PST", "GMT+5:30"). */
export function localTime(isoStart, isoEnd) {
  try {
    const opts = { hour: "numeric", minute: "2-digit" };
    const start = new Date(isoStart).toLocaleTimeString([], opts);
    const end = new Date(isoEnd).toLocaleTimeString([], { ...opts, timeZoneName: "short" });
    return `${start} – ${end}`;
  } catch {
    return "";
  }
}

export function viewerZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

/** US zones the program publishes; a viewer elsewhere (India, UK…) gets their own time shown too. */
export const isUsZone = (zone) => /^America\/(New_York|Detroit|Chicago|Denver|Phoenix|Boise|Los_Angeles|Anchorage|Indiana|Kentucky|North_Dakota)|^Pacific\/Honolulu/.test(zone);

export const groupFor = (groups, age) => {
  const a = Number(age);
  if (!a) return "";
  return groups.find((g) => a >= g.ages[0] && a <= g.ages[1])?.key ?? "";
};

export const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

export const phoneDisplay = (digits) => {
  const d = String(digits || "").replace(/\D/g, "");
  return d.length === 11 && d.startsWith("1") ? `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}` : `+${d}`;
};
