/**
 * Admin Live Sessions (GET /events) + Zoom settings → the shapes the site's schedule
 * components already render. Every helper returns `null` / the bundled value when the
 * backend has nothing, so callers keep today's content offline.
 */
import { useMemo } from "react";
import { useLiveSessions, useSiteSettings } from "./usePublicData";

export const MAX_SITS = 4; // home footer ticker / hero pill stay one line long

/** Browsers still report a few old zone names (Chrome: "Asia/Calcutta"); use the names admin stores. */
const ZONE_ALIASES = { "Asia/Calcutta": "Asia/Kolkata", "Asia/Katmandu": "Asia/Kathmandu", "Asia/Saigon": "Asia/Ho_Chi_Minh", "Asia/Rangoon": "Asia/Yangon" };
export const canonicalZone = (tz) => ZONE_ALIASES[tz] || tz;

export function visitorZone() {
  try {
    return canonicalZone(Intl.DateTimeFormat().resolvedOptions().timeZone) || "UTC";
  } catch {
    return "UTC";
  }
}

/** Short zone name ("IST", "CDT", "BST"); tries a few English locales before settling for "GMT+5:30". */
export function zoneAbbr(tz, at = Date.now()) {
  let fallback = "";
  for (const loc of [undefined, "en-US", "en-GB", "en-IN", "en-AU"]) {
    try {
      const name = new Intl.DateTimeFormat(loc, { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date(at)).find((p) => p.type === "timeZoneName")?.value;
      if (!name) continue;
      if (!/^(GMT|UTC)[+-−]/.test(name)) return name;
      fallback ||= name;
    } catch {
      /* unknown zone / locale */
    }
  }
  return fallback;
}

/** "HH:mm" of instant `iso` on the clock in `tz`. */
function hhmmIn(iso, tz) {
  try {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(iso));
    const get = (t) => p.find((x) => x.type === t)?.value || "00";
    return `${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}`;
  } catch {
    return "";
  }
}

const valid = (iso) => iso && !Number.isNaN(new Date(iso).getTime());

/** Daily sessions as { title, desc, start, end, tz, zone, joinUrl } (start/end = "HH:mm" in tz), soonest first. */
function dailyRows(events) {
  if (!Array.isArray(events)) return [];
  return events
    .filter((e) => e && e.recurrence === "daily" && valid(e.next_starts_at))
    .sort((a, b) => new Date(a.next_starts_at) - new Date(b.next_starts_at))
    .map((e) => {
      const tz = e.timezone || "UTC";
      const start = hhmmIn(e.next_starts_at, tz) || e.local_time || "00:00";
      const endIso = valid(e.next_ends_at) ? e.next_ends_at : new Date(new Date(e.next_starts_at).getTime() + 36e5).toISOString();
      return { title: e.title, desc: e.description || e.location || "", start, end: hhmmIn(endIso, tz) || start, tz, zone: zoneAbbr(tz, e.next_starts_at), joinUrl: e.join_url || "" };
    });
}

/**
 * Home "Sits around the world": admin daily sessions mapped to home.json's session shape
 * ({ name, start, end, tz, zone }), capped at MAX_SITS; else the bundled list.
 */
export function useHomeSessions(bundled) {
  const events = useLiveSessions();
  return useMemo(() => {
    const rows = dailyRows(events).slice(0, MAX_SITS);
    return rows.length ? rows.map((r) => ({ name: r.title, start: r.start, end: r.end, tz: r.tz, zone: r.zone })) : bundled;
  }, [events, bundled]);
}

/** Events page: { daily, upcoming, past } from admin sessions; each is null when the API has none. */
export function useEventSessions() {
  const events = useLiveSessions();
  return useMemo(() => {
    const list = Array.isArray(events) ? events.filter((e) => e && valid(e.next_starts_at)) : [];
    const once = list.filter((e) => e.recurrence !== "daily");
    const daily = dailyRows(list);
    const upcoming = once.filter((e) => !e.is_past).sort((a, b) => new Date(a.next_starts_at) - new Date(b.next_starts_at));
    const past = once
      .filter((e) => e.is_past)
      .sort((a, b) => new Date(b.next_starts_at) - new Date(a.next_starts_at))
      .slice(0, 3);
    return { daily: daily.length ? daily : null, upcoming: upcoming.length ? upcoming : null, past: past.length ? past : null };
  }, [events]);
}

/** A one-off session as the events list rows' { day, month, title, meta, desc, joinUrl }, in the visitor's zone. */
export function eventRow(e) {
  const a = new Date(e.next_starts_at);
  const b = valid(e.next_ends_at) ? new Date(e.next_ends_at) : null;
  const t = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const when = `${a.toLocaleDateString([], { weekday: "short" })} · ${t(a)}${b ? ` – ${t(b)}` : ""} ${zoneAbbr(visitorZone(), a)}`.trim();
  return {
    day: a.toLocaleDateString([], { day: "numeric" }),
    month: a.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    title: e.title,
    meta: [when, e.location].filter(Boolean).join(" · "),
    desc: e.description || "",
    joinUrl: e.join_url || "",
  };
}

/** Zoom room: admin Settings when a URL is set there (ID / passcode from Settings too), else the bundled one. */
export function useZoom(bundled = {}) {
  const s = useSiteSettings();
  const url = (s?.["zoom.url"] || "").trim();
  if (url) return { url, id: (s["zoom.meeting_id"] || "").trim(), passcode: (s["zoom.passcode"] || "").trim() };
  return { url: bundled.url || "", id: bundled.id || "", passcode: bundled.passcode || "" };
}
