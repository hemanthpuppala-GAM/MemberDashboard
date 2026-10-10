import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter, AdminEditLink } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
import { useSiteContent } from "../useSiteContent";
import { usePageQuotes } from "../siteQuotes";
import { useViewportWidth } from "../useViewport";
import { YOUTUBE_URL } from "../sitePages";
import "./wisdom.css";

const PAD = "clamp(20px,5vw,72px)";
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });
const CAPS = { textTransform: "uppercase", whiteSpace: "nowrap" };
const BODY_LIGHT = { margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "rgba(246,241,230,.8)" };

/** Design defaults for keys the content JSON may omit (Wisdom.dc.html DEFAULTS). */
const FALLBACKS = {
  eyebrow: "Wisdom",
  title: "Ancient truths,",
  titleAccent: "scientific clarity",
  cards: [],
  archKicker: "The Architecture of Reality",
  archTitle: "You are an electromagnetic broadcast",
  archSub: "",
  staticLabel: "Static noise · stress",
  staticTag: "cortisol · adrenaline",
  staticBody: "",
  coherentLabel: "Coherence · meditation",
  coherentTag: "oxytocin · DHEA",
  coherentBody: "",
  principles: [],
  protocolKicker: "The Coherence Protocol · daily",
  protocol: [],
  quotes: [],
  filmLabel: "Watch the intro film",
  filmHref: YOUTUBE_URL,
  cta: "Join the live sessions — free",
  ctaHref: "Member Flow.dc.html",
  footerTitle: "Sit with us — free, every day.",
  footerSub: "Guided live on YouTube, Monday to Saturday. No experience needed.",
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

/** Link target from content (may be a design file name, an app path or an external URL). */
function ContentLink({ href, isMember, children, ...rest }) {
  const h = (href || "").trim();
  if (/^https?:/.test(h)) {
    return (
      <a href={h} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  const to = !h || h === "Member Flow.dc.html" ? (isMember ? "/dashboard" : "/join") : DESIGN_ROUTES[h] || h;
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}

/** /wisdom — design: Wisdom.dc.html */
export default function WisdomPage() {
  const c = useSiteContent("wisdom", FALLBACKS);
  const quotes = usePageQuotes("wisdom", c.quotes);
  const w = useViewportWidth();
  const { isMember } = useMemberBadge();
  const desk = w >= 900;
  const mid = w >= 640;
  const cardCols = desk ? "repeat(4,minmax(0,1fr))" : mid ? "repeat(2,minmax(0,1fr))" : "1fr";
  const twoCols = mid ? "repeat(2,minmax(0,1fr))" : "1fr";
  const threeCols = mid ? "repeat(3,minmax(0,1fr))" : "1fr";

  return (
    <SitePage>
      <SiteHeader active="wisdom" />
      <Breadcrumb current="Wisdom" />

      <section
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "clamp(22px,3.5vh,36px)", padding: `clamp(24px,4vh,48px) ${PAD} clamp(40px,6vh,72px)`, maxWidth: 1240, width: "100%", margin: "0 auto" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22", ...rise() }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            {c.eyebrow}
          </span>
          <h1
            className="serif"
            style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.4vw,64px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", maxWidth: "20ch", ...rise(0.1) }}
          >
            {c.title} <em style={{ color: "#8A6F34" }}>{c.titleAccent}</em>
          </h1>
        </div>

        {/* Four wisdom cards */}
        <div style={{ display: "grid", gridTemplateColumns: cardCols, gap: 14, ...rise(0.2) }}>
          {(c.cards || []).map((card, i) => (
            <article
              key={i}
              className="wisdom-card"
              style={{ display: "flex", flexDirection: "column", gap: 10, padding: 20, borderRadius: 20, background: "rgba(255,253,248,.55)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 12px 30px -14px rgba(60,42,16,.28)" }}
            >
              <span
                aria-hidden="true"
                className="serif"
                style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 35% 35%,#F3EAD3,#E8CF83)", border: "1px solid #C9A24A", fontSize: 19, color: "#5A3C0E" }}
              >
                {card.glyph}
              </span>
              <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 22, lineHeight: 1.1, color: "#12201A" }}>
                {card.title}
              </h2>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty" }}>{card.body}</p>
            </article>
          ))}
        </div>

        {/* The Architecture of Reality */}
        <article
          aria-labelledby="wisdom-arch-title"
          style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 22, padding: "clamp(22px,3vw,36px)", borderRadius: 26, background: "linear-gradient(170deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6", boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)", ...rise(0.3) }}
        >
          <span aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 40% at 50% 0%,rgba(232,207,131,.18),transparent 70%)" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#C9A24A" }}>{c.archKicker}</span>
            <h2 id="wisdom-arch-title" className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(24px,2.6vw,34px)", lineHeight: 1.1, color: "#F6F1E6" }}>
              {c.archTitle}
            </h2>
            <p style={{ margin: 0, maxWidth: "62ch", fontSize: 13.5, lineHeight: 1.55, color: "rgba(246,241,230,.8)", textWrap: "pretty" }}>{c.archSub}</p>
          </div>

          <div style={{ position: "relative", display: "grid", gridTemplateColumns: twoCols, gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 18px", borderRadius: 18, border: "1px solid rgba(246,241,230,.14)", background: "rgba(246,241,230,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#E39A9A" }}>{c.staticLabel}</span>
                <span style={{ fontSize: 10, color: "rgba(246,241,230,.55)" }}>{c.staticTag}</span>
              </div>
              <svg viewBox="0 0 260 44" style={{ width: "100%", height: 44 }} aria-hidden="true">
                <polyline
                  points="0,24 14,10 22,34 34,16 42,38 56,8 66,30 78,14 88,36 100,12 112,32 124,18 134,40 148,10 158,28 170,16 182,34 194,12 206,30 218,20 230,36 244,14 260,26"
                  fill="none"
                  stroke="rgba(227,154,154,.85)"
                  strokeWidth="1.6"
                />
              </svg>
              <p style={BODY_LIGHT}>{c.staticBody}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 18px", borderRadius: 18, border: "1px solid rgba(201,162,74,.5)", background: "rgba(201,162,74,.1)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#E8CF83" }}>{c.coherentLabel}</span>
                <span style={{ fontSize: 10, color: "rgba(246,241,230,.55)" }}>{c.coherentTag}</span>
              </div>
              <svg viewBox="0 0 260 44" style={{ width: "100%", height: 44 }} aria-hidden="true">
                <path
                  d="M0,22 C13,4 26,4 39,22 C52,40 65,40 78,22 C91,4 104,4 117,22 C130,40 143,40 156,22 C169,4 182,4 195,22 C208,40 221,40 234,22 C247,4 254,8 260,16"
                  fill="none"
                  stroke="#E8CF83"
                  strokeWidth="1.6"
                  strokeDasharray="6 4"
                  style={{ animation: "wisdom-wave 14s linear infinite" }}
                />
              </svg>
              <p style={BODY_LIGHT}>{c.coherentBody}</p>
            </div>
          </div>

          <div style={{ position: "relative", display: "grid", gridTemplateColumns: threeCols, gap: 14 }}>
            {(c.principles || []).map((p, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5, padding: "4px 6px" }}>
                <span className="serif" style={{ fontWeight: 500, fontSize: 19, color: "#E8CF83" }}>
                  {p.glyph} {p.title}
                </span>
                <p style={{ ...BODY_LIGHT, color: "rgba(246,241,230,.72)" }}>{p.body}</p>
              </div>
            ))}
          </div>

          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, paddingTop: 18, borderTop: "1px solid rgba(246,241,230,.12)" }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".24em", textTransform: "uppercase", color: "#C9A24A", textAlign: "center" }}>{c.protocolKicker}</span>
            <div style={{ display: "grid", gridTemplateColumns: threeCols, gap: 12 }}>
              {(c.protocol || []).map((s, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5, padding: "14px 16px", borderRadius: 16, background: "rgba(201,162,74,.08)", border: "1px solid rgba(201,162,74,.3)" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", color: "#E8CF83" }}>
                    {s.n} · {s.title}
                  </span>
                  <p style={BODY_LIGHT}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Testimonials */}
        <div style={{ display: "grid", gridTemplateColumns: twoCols, gap: 12, ...rise(0.35) }}>
          {quotes.map((t, i) => (
            <blockquote key={i} style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6, padding: "16px 20px", borderRadius: 16, background: "rgba(232,207,131,.22)", border: "1px solid rgba(201,162,74,.4)" }}>
              <p className="serif" style={{ margin: 0, fontSize: 19, lineHeight: 1.3, color: "#12201A", textWrap: "pretty" }}>
                {t.text}
              </p>
              <footer style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#7A5E22" }}>— {t.name}, via NeoSouth</footer>
            </blockquote>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 14, ...rise(0.4) }}>
          <ContentLink
            href={c.filmHref}
            isMember={isMember}
            className="wisdom-film-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 48, padding: "0 22px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", ...CAPS }}
          >
            <span aria-hidden="true" style={{ display: "inline-block", width: 0, height: 0, borderLeft: "7px solid currentColor", borderTop: "4.5px solid transparent", borderBottom: "4.5px solid transparent" }} />
            {c.filmLabel}
          </ContentLink>
          <ContentLink
            href={c.ctaHref}
            isMember={isMember}
            className="gaw-pill-gold"
            style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 26px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", boxShadow: "0 12px 30px -10px rgba(201,162,74,.7)", ...CAPS }}
          >
            {c.cta}
          </ContentLink>
        </div>
      </section>

      <SiteFooter title={c.footerTitle} sub={c.footerSub} />
      <AdminEditLink page="wisdom" />
    </SitePage>
  );
}
