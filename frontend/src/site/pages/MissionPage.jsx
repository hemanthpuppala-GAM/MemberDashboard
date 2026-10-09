import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter, AdminEditLink, useMemberBadge } from "../SiteChrome";
import { useSiteContent } from "../useSiteContent";
import { useViewportWidth } from "../useViewport";
import "./mission.css";

const PAD = "clamp(20px,5vw,72px)";
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });
const GOLD_DOT = "radial-gradient(circle at 35% 35%,#F3EAD3,#C9A24A)";
const LIT = [7, 19, 26, 38, 51, 64, 77, 90];

/** 100-dot "8% of humanity" grid: 8 lit dots glow on staggered loops. */
const DOTS = Array.from({ length: 100 }, (_, i) => {
  const on = LIT.includes(i);
  return {
    background: on ? GOLD_DOT : "rgba(246,241,230,.12)",
    boxShadow: on ? "0 0 10px rgba(232,207,131,.8)" : "none",
    animation: on ? `mission-dotglow ${2.6 + (i % 5) * 0.4}s ${(i % 7) * 0.3}s ease-in-out infinite` : "none",
  };
});

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

/** CTA target from content (may be a design file name, an app path or an external URL). */
function CtaLink({ href, isMember, children, ...rest }) {
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

/** /mission — design: Mission.dc.html */
export default function MissionPage() {
  const c = useSiteContent("mission");
  const w = useViewportWidth();
  const { isMember } = useMemberBadge();
  const desk = w >= 900;
  const yugas = c.yugas || [];

  return (
    <SitePage>
      <SiteHeader active="mission" />
      <Breadcrumb current="Mission" />

      <section
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "clamp(22px,3.5vh,40px)", padding: `clamp(24px,4vh,48px) ${PAD} clamp(40px,6vh,72px)`, maxWidth: 1200, width: "100%", margin: "0 auto" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: desk ? "minmax(0,1.15fr) minmax(300px,.85fr)" : "1fr", gap: 18, alignItems: "stretch", ...rise(0.25) }}>
          <article
            style={{ display: "flex", flexDirection: "column", gap: 18, padding: "clamp(22px,2.6vw,32px)", borderRadius: 24, background: "rgba(255,253,248,.55)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 18px 40px -18px rgba(60,42,16,.3)" }}
          >
            <p style={{ margin: 0, fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.65, color: "#3A3128", textWrap: "pretty" }}>
              {c.intro1} <strong style={{ fontWeight: 600, color: "#12201A" }}>{c.intro1Accent}</strong> {c.intro1Tail}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 18px", borderRadius: 16, background: "rgba(243,234,211,.7)", border: "1px solid rgba(138,111,52,.18)" }}>
              {yugas.map((y, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "12px 92px minmax(0,1fr)", alignItems: "center", gap: 12 }}>
                  <span
                    aria-hidden="true"
                    style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? GOLD_DOT : "rgba(20,36,28,.18)", boxShadow: i === 0 ? "0 0 10px rgba(201,162,74,.7)" : "none" }}
                  />
                  <span className="serif" style={{ fontSize: 19, fontWeight: 500, color: i === 0 ? "#8A6F34" : "#12201A" }}>
                    {y.name}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.4, color: "#5A4E3C" }}>{y.tag}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.65, color: "#3A3128", textWrap: "pretty" }}>
              {c.intro2} <strong style={{ fontWeight: 600, color: "#12201A" }}>{c.intro2Accent}</strong>
            </p>
          </article>

          <aside
            aria-label="Our end goal"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "clamp(22px,2.6vw,32px)", borderRadius: 24, background: "linear-gradient(170deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6", textAlign: "center", boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)" }}
          >
            <span className="serif" style={{ fontSize: "clamp(64px,6vw,96px)", lineHeight: 0.9, color: "#E8CF83", textShadow: "0 2px 30px rgba(201,162,74,.45)" }}>
              {c.goalNumber}
              <span style={{ fontSize: ".45em", verticalAlign: "top", marginLeft: 4 }}>%</span>
            </span>
            <p style={{ margin: 0, maxWidth: "34ch", fontSize: 14.5, lineHeight: 1.55, color: "rgba(246,241,230,.82)", textWrap: "pretty" }}>
              {c.goalLead} <strong style={{ fontWeight: 600, color: "#E8CF83" }}>{c.goalAccent}</strong> {c.goalTail}
            </p>
            <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(20,9px)", gap: 5 }}>
              {DOTS.map((d, i) => (
                <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", ...d }} />
              ))}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#C9A24A" }}>{c.dotsCaption}</span>
            <CtaLink
              href={c.ctaHref}
              isMember={isMember}
              className="gaw-pill-gold"
              style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 26px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 12px 30px -10px rgba(201,162,74,.7)" }}
            >
              {c.cta}
            </CtaLink>
          </aside>
        </div>
      </section>

      <SiteFooter title={c.footerTitle} sub={c.footerSub} />
      <AdminEditLink page="mission" />
    </SitePage>
  );
}
