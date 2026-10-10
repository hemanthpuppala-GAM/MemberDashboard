import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter, AdminEditLink } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
import { useSiteContent } from "../useSiteContent";
import { usePageQuotes } from "../siteQuotes";
import { useEventSessions, eventRow, visitorZone } from "../liveSessions";
import { useViewportWidth } from "../useViewport";
import { YOUTUBE_URL } from "../sitePages";
import "./events.css";

const PAD = "clamp(20px,5vw,72px)";
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });
const CARD = {
  borderRadius: 24,
  background: "rgba(255,253,248,.55)",
  border: "1px solid rgba(255,255,255,.7)",
  boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 18px 40px -18px rgba(60,42,16,.3)",
};
const PILL = { display: "inline-flex", alignItems: "center", height: 44, borderRadius: 999, fontSize: 11.5, letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap" };

/** Defaults from Events.dc.html DEFAULTS that content/events.json may not carry. */
const FALLBACKS = {
  eyebrow: "Events",
  title: "Daily live sessions",
  titleAccent: "& gatherings",
  indiaKicker: "India · IST",
  indiaNote: "Every day · including Sunday",
  abroadKicker: "USA & UK",
  abroadNote: "Local time · every day",
  watchLabel: "▶ Watch live on YouTube — free, worldwide",
  watchHref: "https://youtube.com/@goldenagegurus",
  zoomTitle: "Zoom circle — members only",
  zoomCta: "Sign in →",
  zoomHref: "Member Flow.dc.html",
  upcomingTitle: "Upcoming gatherings",
  pastTitle: "Past gatherings",
  registerLabel: "Register as a member →",
  registerHref: "Member Flow.dc.html",
  footerTitle: "Sit with us — free, every day.",
};

const DESIGN_ROUTES = {
  "Home Bodhi Tree v2.dc.html": "/",
  "About.dc.html": "/about",
  "Mission.dc.html": "/mission",
  "Meditation.dc.html": "/meditation",
  "Wisdom.dc.html": "/wisdom",
  "Wellness.dc.html": "/wellness",
  "Events.dc.html": "/events",
  "Volunteer.dc.html": "/volunteer",
  "Privacy.dc.html": "/privacy",
  "Ask.dc.html": "/ask",
};

/** Content hrefs are stored as design file names ("Member Flow.dc.html") — map them to app routes. */
function DesignLink({ href, isMember, children, ...rest }) {
  const h = (href || "").trim();
  if (/^(https?:|mailto:|tel:)/.test(h)) {
    return (
      <a href={h} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  const [file, hash] = h.split("#");
  let to;
  if (!file) to = hash ? `#${hash}` : "/";
  else if (file === "Member Flow.dc.html") to = isMember ? "/dashboard" : "/join";
  else to = (DESIGN_ROUTES[file] || (file.startsWith("/") ? file : "/")) + (hash ? `#${hash}` : "");
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}

/** Today's `hhmm` in zone `tz`, as an absolute Date (design: localOf). */
function localOf(hhmm, tz, now) {
  const [h, m] = String(hhmm || "0:0").split(":").map(Number);
  const d = new Date(now);
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(d)
      .reduce((a, p) => ((a[p.type] = p.value), a), {});
    const tzNowMin = (+parts.hour % 24) * 60 + +parts.minute;
    return new Date(d.getTime() + (h * 60 + m - tzNowMin) * 60000);
  } catch {
    return d; // unknown zone → treat as now; never crash the page
  }
}
const fmt = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
function fmtIn(hhmm) {
  const [h, m] = String(hhmm || "0:0").split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h < 12 ? " AM" : " PM"}`;
}
function buildSession(s, zoneTz, zone, now, tz) {
  const a = localOf(s.start, zoneTz, now);
  const b = localOf(s.end, zoneTz, now);
  const live = now >= a.getTime() && now <= b.getTime();
  return { ...s, zone, range: `${fmtIn(s.start)} – ${fmtIn(s.end)}`, live, showLocal: tz !== zoneTz, local: `${fmt(a)} – ${fmt(b)}` };
}

function SessionCard({ kicker, note, sessions }) {
  return (
    <article style={{ ...CARD, display: "flex", flexDirection: "column", gap: 12, padding: "clamp(20px,2.4vw,28px)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 26, lineHeight: 1.1, color: "#12201A" }}>
          {kicker}
        </h2>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#7A5E22", whiteSpace: "nowrap" }}>{note}</span>
      </div>
      {sessions.map((s, i) => (
        <div
          key={i}
          className="gaw-ev-row"
          style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr)", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 18, background: "rgba(255,253,248,.7)", border: `1px solid ${s.live ? "#C9A24A" : "rgba(138,111,52,.2)"}` }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 4px", borderRadius: 14, background: s.live ? "#14241C" : "rgba(232,207,131,.25)", border: "1px solid rgba(201,162,74,.4)" }}>
            <span className="serif" style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.2, color: s.live ? "#E8CF83" : "#12201A", textAlign: "center" }}>
              {s.range}
            </span>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".16em", color: s.live ? "#C9A24A" : "#7A5E22" }}>{s.zone}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 15, color: "#12201A" }}>
              {s.live && <span className="gaw-ev-live" role="img" aria-label="Live now" style={{ flex: "none", width: 8, height: 8, borderRadius: "50%", background: "#C9A24A" }} />}
              {s.title}
            </span>
            <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "#5A4E3C" }}>{s.desc}</span>
            {s.showLocal && <span style={{ fontSize: 11.5, fontWeight: 600, color: "#7A5E22" }}>✦ {s.local} your time</span>}
          </div>
        </div>
      ))}
    </article>
  );
}

/** /events — design: Events.dc.html (sessions + gatherings from content/events.json) */
export default function EventsPage() {
  const c = useSiteContent("events", FALLBACKS);
  const quotes = usePageQuotes("events", c.quotes);
  const { isMember } = useMemberBadge();
  const w = useViewportWidth();
  const desk = w >= 900;
  const [now, setNow] = useState(() => Date.now());
  const [tz] = useState(visitorZone);

  // Re-evaluate "live now" every 30s, as the design does.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Admin Live Sessions when published (daily → schedule cards, one-off → gatherings), else events.json.
  const live = useEventSessions();
  let india, abroad;
  if (live.daily) {
    india = live.daily.filter((s) => s.tz === "Asia/Kolkata").map((s) => buildSession(s, s.tz, s.zone, now, tz));
    abroad = live.daily.filter((s) => s.tz !== "Asia/Kolkata").map((s) => buildSession(s, s.tz, s.zone, now, tz));
  } else {
    india = (c.sessionsIndia || []).map((s) => buildSession(s, "Asia/Kolkata", "IST", now, tz));
    abroad = (c.sessionsAbroad || []).map((s) => buildSession(s, s.tz || "UTC", s.zone || "", now, tz));
  }
  const abroadKicker = live.daily && abroad.some((s) => !/^(America|Europe\/London)/.test(s.tz)) ? "Around the world" : c.abroadKicker;
  const upcoming = live.upcoming ? live.upcoming.slice(0, 5).map(eventRow) : c.upcoming || [];
  const past = live.past ? live.past.map(eventRow) : c.past || [];

  return (
    <SitePage>
      <SiteHeader active="events" />
      <Breadcrumb current="Events" />

      <section
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "clamp(22px,3.5vh,36px)", padding: `clamp(24px,4vh,48px) ${PAD} clamp(40px,6vh,72px)`, maxWidth: 1240, width: "100%", margin: "0 auto" }}
      >
        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22", ...rise() }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            {c.eyebrow}
          </span>
          <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.4vw,64px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", maxWidth: "20ch", ...rise(0.1) }}>
            {c.title} <em style={{ color: "#8A6F34" }}>{c.titleAccent}</em>
          </h1>
          {c.sub && <p style={{ margin: 0, maxWidth: "48ch", fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.55, color: "#3A3128", ...rise(0.2) }}>{c.sub}</p>}
          <span
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "4px 8px", padding: "7px 14px", borderRadius: 999, border: "1px solid rgba(138,111,52,.4)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#7A5E22", textAlign: "center", ...rise(0.25) }}
          >
            <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A24A" }} />
            <span>Your time zone</span>
            <span style={{ color: "#3A3128" }}>{tz.replace(/_/g, " ")}</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: desk ? "minmax(0,1.15fr) minmax(300px,.85fr)" : "1fr", gap: 18, alignItems: "start", ...rise(0.3) }}>
          {/* Left: daily sessions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
            {india.length > 0 && <SessionCard kicker={c.indiaKicker} note={c.indiaNote} sessions={india} />}
            {abroad.length > 0 && <SessionCard kicker={abroadKicker} note={c.abroadNote} sessions={abroad} />}

            <DesignLink
              href={c.watchHref}
              isMember={isMember}
              className="gaw-pill-gold"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 24px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", textAlign: "center", boxShadow: "0 12px 30px -10px rgba(201,162,74,.7)" }}
            >
              {c.watchLabel}
            </DesignLink>

            <div
              style={{ display: "grid", gridTemplateColumns: "38px minmax(0,1fr) auto", alignItems: "center", gap: 13, padding: "14px 16px", borderRadius: 18, border: "1px dashed rgba(201,162,74,.6)", background: "rgba(232,207,131,.14)" }}
            >
              <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#14241C" }}>
                <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, display: "block" }}>
                  <rect x="5" y="11" width="14" height="9" rx="2.5" fill="none" stroke="#E8CF83" strokeWidth="1.6" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#E8CF83" strokeWidth="1.6" />
                </svg>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#12201A" }}>{c.zoomTitle}</span>
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "#5A4E3C" }}>{c.zoomBody}</span>
              </span>
              <DesignLink href={c.zoomHref} isMember={isMember} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                {c.zoomCta}
              </DesignLink>
            </div>
          </div>

          {/* Right: gatherings + testimonials */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
            <article
              style={{ display: "flex", flexDirection: "column", gap: 14, padding: "clamp(22px,2.6vw,30px)", borderRadius: 24, background: "linear-gradient(170deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6", boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)" }}
            >
              <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 26, lineHeight: 1.1, color: "#E8CF83" }}>
                {c.upcomingTitle}
              </h2>
              {!upcoming.length && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(246,241,230,.78)", textWrap: "pretty" }}>{c.upcomingEmpty}</p>}
              {upcoming.map((e, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "56px minmax(0,1fr)", gap: 16, padding: "12px 0", borderBottom: "1px solid rgba(246,241,230,.1)" }}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "start", padding: "7px 0", borderRadius: 14, background: "rgba(232,207,131,.14)", border: "1px solid rgba(201,162,74,.5)" }}>
                    <span className="serif" style={{ fontSize: 22, lineHeight: 1.1, color: "#E8CF83" }}>
                      {e.day}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: "#C9A24A" }}>{e.month}</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: "#F6F1E6" }}>{e.title}</span>
                    <span style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(246,241,230,.72)" }}>{e.meta}</span>
                    {e.desc && <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "rgba(246,241,230,.6)", textWrap: "pretty" }}>{e.desc}</span>}
                    {e.joinUrl && (
                      <a href={e.joinUrl} target="_blank" rel="noopener noreferrer" className="gaw-ev-register" style={{ display: "inline-flex", alignItems: "center", alignSelf: "flex-start", minHeight: 32, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
                        Join →
                      </a>
                    )}
                  </span>
                </div>
              ))}
              <DesignLink href={c.registerHref} isMember={isMember} className="gaw-ev-register" style={{ display: "inline-flex", alignItems: "center", alignSelf: "flex-start", minHeight: 44, fontSize: 13.5, fontWeight: 600 }}>
                {c.registerLabel}
              </DesignLink>
            </article>

            <article style={{ ...CARD, display: "flex", flexDirection: "column", gap: 12, padding: "clamp(20px,2.4vw,28px)" }}>
              <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 22, lineHeight: 1.1, color: "#12201A" }}>
                {c.pastTitle}
              </h2>
              {past.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "56px minmax(0,1fr) auto", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(138,111,52,.15)" }}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "7px 0", borderRadius: 14, background: "rgba(232,207,131,.25)", border: "1px solid rgba(201,162,74,.4)" }}>
                    <span className="serif" style={{ fontSize: 20, lineHeight: 1.1, color: "#12201A" }}>
                      {p.day}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#7A5E22" }}>{p.month}</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 14.5, color: "#12201A" }}>{p.title}</span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "#5A4E3C" }}>{p.meta}</span>
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#7A5E22", whiteSpace: "nowrap" }}>Complete</span>
                </div>
              ))}
            </article>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quotes.map((t, i) => (
                <blockquote key={i} style={{ margin: 0, padding: "12px 16px", borderRadius: 14, background: "rgba(232,207,131,.22)", border: "1px solid rgba(201,162,74,.4)", fontSize: 13, lineHeight: 1.5, fontStyle: "italic", color: "#3A3128" }}>
                  {t.text}{" "}
                  <span style={{ fontStyle: "normal", fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#7A5E22" }}>— {t.name}, via NeoSouth</span>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter title={c.footerTitle} sub={c.footerSub}>
        <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="gaw-pill-ghost-light" style={{ ...PILL, gap: 10, padding: "0 20px", fontWeight: 600 }}>
          Watch live
        </a>
        <Link to={isMember ? "/dashboard" : "/join"} className="gaw-pill-gold" style={{ ...PILL, padding: "0 22px", fontWeight: 700, boxShadow: "none" }}>
          Join free
        </Link>
      </SiteFooter>
      <AdminEditLink page="events" />
    </SitePage>
  );
}
