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

/** Design defaults for keys the content JSON may omit (Wisdom.dc.html DEFAULTS). */
const FALLBACKS = {
  eyebrow: "Wisdom without boundaries",
  title: "Ancient Wisdom. Modern Science.",
  titleAccent: "Universal Understanding.",
  cards: [],
  intro: "",
  libraryKicker: "Golden Age Wisdom Library",
  libraryTitle: "Explore the Golden Age Wisdom Library",
  libraryBody: "",
  libraryClose: "",
  libraryCloseSub: "",
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
  const cardCols = desk ? "repeat(3,minmax(0,1fr))" : "1fr";
  const twoCols = mid ? "repeat(2,minmax(0,1fr))" : "1fr";

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
            style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.4vw,64px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", maxWidth: "24ch", ...rise(0.1) }}
          >
            {c.title} <em style={{ display: "block", color: "#8A6F34" }}>{c.titleAccent}</em>
          </h1>
          {c.intro ? (
            <p style={{ margin: "4px 0 0", maxWidth: "68ch", fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.65, color: "#3A3128", textWrap: "pretty", ...rise(0.2) }}>{c.intro}</p>
          ) : null}
        </div>

        {/* Wisdom cards */}
        <div style={{ display: "grid", gridTemplateColumns: cardCols, gap: desk ? 18 : 14, ...rise(0.2) }}>
          {(c.cards || []).map((card, i) => (
            <article
              key={i}
              className="wisdom-card"
              style={{ display: "flex", flexDirection: "column", gap: 12, padding: "clamp(20px,2vw,28px)", borderRadius: 20, background: "rgba(255,253,248,.55)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 12px 30px -14px rgba(60,42,16,.28)" }}
            >
              <span
                aria-hidden="true"
                className="serif"
                style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 35% 35%,#F3EAD3,#E8CF83)", border: "1px solid #C9A24A", fontSize: 19, color: "#5A3C0E" }}
              >
                {card.glyph}
              </span>
              <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(22px,1.8vw,26px)", lineHeight: 1.15, color: "#12201A", textWrap: "balance" }}>
                {card.title}
              </h2>
              <p style={{ margin: 0, maxWidth: "68ch", fontSize: 15, lineHeight: 1.65, color: "#3A3128", textWrap: "pretty" }}>{card.body}</p>
            </article>
          ))}
        </div>

        {/* The Golden Age Wisdom Library */}
        <article
          aria-labelledby="wisdom-library-title"
          style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "clamp(26px,4vw,52px) clamp(20px,4vw,48px)", borderRadius: 26, background: "linear-gradient(170deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6", textAlign: "center", boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)", ...rise(0.3) }}
        >
          <span aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 40% at 50% 0%,rgba(232,207,131,.18),transparent 70%)" }} />
          <span style={{ position: "relative", fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#C9A24A" }}>{c.libraryKicker}</span>
          <h2 id="wisdom-library-title" className="serif" style={{ position: "relative", margin: 0, fontWeight: 500, fontSize: "clamp(26px,2.8vw,38px)", lineHeight: 1.1, color: "#F6F1E6", textWrap: "balance" }}>
            {c.libraryTitle}
          </h2>
          <p style={{ position: "relative", margin: 0, maxWidth: "64ch", fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.7, color: "rgba(246,241,230,.84)", textWrap: "pretty" }}>{c.libraryBody}</p>
          <svg viewBox="0 0 260 44" style={{ position: "relative", width: "min(260px,70%)", height: 36 }} aria-hidden="true">
            <path
              d="M0,22 C13,4 26,4 39,22 C52,40 65,40 78,22 C91,4 104,4 117,22 C130,40 143,40 156,22 C169,4 182,4 195,22 C208,40 221,40 234,22 C247,4 254,8 260,16"
              fill="none"
              stroke="#E8CF83"
              strokeWidth="1.6"
              strokeDasharray="6 4"
              style={{ animation: "wisdom-wave 14s linear infinite" }}
            />
          </svg>
          {c.libraryClose ? (
            <p className="serif" style={{ position: "relative", margin: 0, fontSize: "clamp(22px,2.2vw,30px)", lineHeight: 1.2, fontWeight: 500, color: "#E8CF83", textWrap: "balance" }}>
              {c.libraryClose}
            </p>
          ) : null}
          {c.libraryCloseSub ? <p style={{ position: "relative", margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(246,241,230,.72)" }}>{c.libraryCloseSub}</p> : null}
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
