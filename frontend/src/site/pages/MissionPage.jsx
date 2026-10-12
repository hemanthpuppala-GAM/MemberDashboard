import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter, AdminEditLink } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
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
  const paras = [c.intro1, c.intro2, c.intro3].filter(Boolean);

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
            style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.4vw,64px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", maxWidth: "24ch", ...rise(0.1) }}
          >
            {c.title} <em style={{ display: "block", color: "#8A6F34" }}>{c.titleAccent}</em>
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: desk ? "minmax(0,1.15fr) minmax(300px,.85fr)" : "1fr", gap: 18, alignItems: "stretch", ...rise(0.25) }}>
          <article
            style={{ display: "flex", flexDirection: "column", gap: 18, padding: "clamp(22px,2.6vw,36px)", borderRadius: 24, background: "rgba(255,253,248,.55)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 18px 40px -18px rgba(60,42,16,.3)" }}
          >
            {paras.map((p, i) => (
              <p
                key={i}
                className={i === 0 ? "serif" : undefined}
                style={i === 0 ? { margin: 0, maxWidth: "62ch", fontSize: "clamp(19px,1.5vw,22px)", lineHeight: 1.45, color: "#12201A", textWrap: "pretty" } : { margin: 0, maxWidth: "68ch", fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.7, color: "#3A3128", textWrap: "pretty" }}
              >
                {p}
              </p>
            ))}
          </article>

          <aside
            aria-label="Together, a peaceful world"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "clamp(22px,2.6vw,32px)", borderRadius: 24, background: "linear-gradient(170deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6", textAlign: "center", boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)" }}
          >
            <span aria-hidden="true" className="serif" style={{ fontSize: 30, lineHeight: 1, color: "#E8CF83" }}>
              ༄
            </span>
            <p className="serif" style={{ margin: 0, maxWidth: "18ch", fontSize: "clamp(26px,2.4vw,36px)", lineHeight: 1.2, fontWeight: 500, color: "#F6F1E6", textWrap: "balance", textShadow: "0 2px 30px rgba(201,162,74,.35)" }}>
              {c.closing}
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
