import { useEffect, useMemo, useState } from "react";

/**
 * Daily group-sit schedule maths, ported from Home Bodhi Tree v2.dc.html
 * (tzParts / windowFor / sits / countdown). Each session is a daily window in
 * its home time zone; we find the next (or current) window and describe it in
 * the viewer's local time.
 */

function tzParts(d, tz) {
  const p = {};
  new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })
    .formatToParts(d)
    .forEach((x) => {
      if (x.type !== "literal") p[x.type] = +x.value;
    });
  if (p.hour === 24) p.hour = 0;
  return p;
}

function windowFor(sess, now) {
  try {
    const p = tzParts(new Date(now), sess.tz);
    const off = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(now / 60000) * 60000;
    const [sh, sm] = sess.start.split(":").map(Number);
    const [eh, em] = sess.end.split(":").map(Number);
    let start = Date.UTC(p.year, p.month - 1, p.day, sh, sm) - off;
    let end = Date.UTC(p.year, p.month - 1, p.day, eh, em) - off;
    if (end <= start) end += 864e5;
    if (now > end) {
      start += 864e5;
      end += 864e5;
    }
    return { start, end, live: now >= start && now <= end };
  } catch {
    return null;
  }
}

const fmtLocal = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmtIn = (sess, t) => new Date(t).toLocaleTimeString("en-US", { timeZone: sess.tz, hour: "numeric", minute: "2-digit" }) + " " + sess.zone;

function localZone() {
  try {
    return new Date().toLocaleTimeString([], { timeZoneName: "short" }).split(" ").pop();
  } catch {
    return "";
  }
}

export function countdown(ms) {
  const m = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h ? `${h}h ${mm}m` : `${mm}m`;
}

/** Sessions → sorted list (live first, then soonest) with display fields. */
export function computeSits(sessions, now) {
  let viewerTz = "";
  try {
    viewerTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    /* ignore */
  }
  const list = (sessions || [])
    .map((s) => {
      const w = windowFor(s, now);
      if (!w) return null;
      const same = viewerTz === s.tz;
      return {
        ...s,
        ...w,
        local: fmtLocal(w.start) + (same ? "" : " " + localZone()),
        home: fmtIn(s, w.start),
        until: w.start - now,
        state: w.live ? "Live now" : "in " + countdown(w.start - now),
        stateColor: w.live ? "#E8CF83" : "rgba(246,241,230,.6)",
        nameColor: w.live ? "#E8CF83" : "rgba(246,241,230,.78)",
        dotBg: w.live ? "#E8CF83" : "rgba(246,241,230,.35)",
        dotGlow: w.live ? "0 0 0 3px rgba(201,162,74,.25)" : "none",
        tileBg: w.live ? "rgba(232,207,131,.16)" : "rgba(255,255,255,.05)",
      };
    })
    .filter(Boolean);
  return list.sort((a, b) => b.live - a.live || a.until - b.until);
}

/** All the status strings the hero pill, phone band and footer show. */
export function sitsSummary(sits) {
  const live = sits.filter((x) => x.live);
  const next = sits.find((x) => !x.live);
  return {
    live,
    next,
    status: live.length
      ? live.length === 1
        ? `${live[0].name} is live now`
        : `${live.length} groups live now`
      : next
        ? `Next group meditation in ${countdown(next.until)}`
        : "Daily, in five time zones",
    heroKicker: live.length ? "Group meditation live now" : "Next group meditation",
    heroLine: live.length ? `${live[0].name} · ${live[0].home}` : next ? `${next.name} · ${next.local} · in ${countdown(next.until)}` : "Sits around the world",
    statusShort: live.length ? `${live[0].name} · live now` : next ? `Next in ${countdown(next.until)}` : "Daily · 5 time zones",
    dot: live.length ? "#C9A24A" : "#12201A",
    dotGlow: live.length ? "0 0 0 3px rgba(201,162,74,.25)" : "none",
    dotAnim: live.length ? "home-pulse 2.4s ease-out infinite" : "none",
  };
}

/** Live schedule from content.sessions, re-computed every 30s (as the design's _tick). */
export function useSits(sessions) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    const sits = computeSits(sessions, now);
    return { sits, loop: sits.length ? sits.concat(sits) : [], ...sitsSummary(sits) };
  }, [sessions, now]);
}
