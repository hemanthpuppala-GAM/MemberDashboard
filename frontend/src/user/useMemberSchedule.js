import { useEffect, useMemo, useState } from "react";
import events from "../site/content/events.json";
import home from "../site/content/home.json";
import { useEventSessions, useZoom, visitorZone, zoneAbbr } from "../site/liveSessions";
import { computeSits, countdown } from "../site/home/sits";
import { YOUTUBE_LIVE_URL } from "../site/sitePages";

/**
 * The member area's daily schedule — the same sessions the public Events page lists
 * (admin daily Live Sessions when there are any, else events.json), plus the daily
 * YouTube live stream. Every time is shown in the member's own zone; the session's
 * home time ("4:10 AM IST") rides along underneath.
 */

/** Daily YouTube live stream (Golden Age Gurus channel). Starts 10:45 IST; the end only drives the "Live now" badge. */
export const YOUTUBE_LIVE = {
  title: "Live on YouTube",
  desc: "Dr. HariKrishna live on the Golden Age Gurus channel — free for everyone.",
  start: "10:45",
  end: "12:15",
  tz: "Asia/Kolkata",
  zone: "IST",
  region: "Worldwide",
  kind: "youtube",
  joinUrl: YOUTUBE_LIVE_URL,
};

function bundledDaily() {
  const india = (events.sessionsIndia || []).map((s) => ({ ...s, tz: "Asia/Kolkata", zone: "IST", region: "India" }));
  const abroad = (events.sessionsAbroad || []).map((s) => ({ ...s, region: s.title?.startsWith("USA") ? "USA" : "UK" }));
  return [...india, ...abroad];
}

/** Re-render every `ms` so countdowns and "Live now" stay current. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

const fmtTime = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function dayLabel(t, now) {
  const d = new Date(t).toDateString();
  if (d === new Date(now).toDateString()) return "Today";
  if (d === new Date(now + 864e5).toDateString()) return "Tomorrow";
  return new Date(t).toLocaleDateString([], { weekday: "long" });
}

export function useMemberSchedule() {
  const { daily } = useEventSessions();
  const zoom = useZoom(home.zoom);
  const now = useNow();
  const tz = visitorZone();

  return useMemo(() => {
    const zoomRows = (daily || bundledDaily()).map((r) => ({ ...r, kind: "zoom", joinUrl: r.joinUrl || zoom.url }));
    const sits = computeSits([...zoomRows, YOUTUBE_LIVE].map((r) => ({ ...r, name: r.title })), now).map((s) => ({
      ...s,
      startLocal: fmtTime(s.start),
      endLocal: fmtTime(s.end),
      day: dayLabel(s.start, now),
      inLabel: s.live ? "Live now" : `in ${countdown(s.until)}`,
      sameZone: s.tz === tz,
    }));
    return {
      sits,
      live: sits.filter((s) => s.live),
      next: sits.find((s) => !s.live),
      zoom: { url: zoom.url, id: zoom.id, passcode: zoom.passcode },
      youtube: sits.find((s) => s.kind === "youtube"),
      zoneName: tz,
      zoneShort: zoneAbbr(tz, now),
      now,
    };
  }, [daily, zoom.url, zoom.id, zoom.passcode, now, tz]);
}
