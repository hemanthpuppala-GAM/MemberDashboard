import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter, AdminEditLink, useMemberBadge } from "../SiteChrome";
import { useSiteContent } from "../useSiteContent";
import { useViewportWidth } from "../useViewport";
import { siteAsset } from "../siteAssets";
import "./wellness.css";

const PAD = "clamp(20px,5vw,72px)";
const SERIF = "'Cormorant Garamond',serif";
const KICKER = { display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22" };
const PILL = { display: "inline-flex", alignItems: "center", height: 44, borderRadius: 999, fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap" };
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });

/** Line icons from the design (Component.ICONS); unknown keys fall back to meditation. */
const ICONS = {
  meditation:
    "M12 3.1a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6zM12 8.4c-2 0-3.3 1.5-3.6 3.4l-.4 2.4M12 8.4c2 0 3.3 1.5 3.6 3.4l.4 2.4M5.4 18.2c1.6-2.2 4-3.3 6.6-3.3s5 1.1 6.6 3.3c.5.7 0 1.6-.9 1.6H6.3c-.9 0-1.4-.9-.9-1.6z",
  sun: "M12 7.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zM12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7",
  earth:
    "M12 6.2c3 0 5 1.9 5 4.4 0 1.6-.9 2.6-1.5 3.6-.5.9-.6 1.5-.6 2.2 0 1.6-1.3 2.7-2.9 2.7s-2.9-1.1-2.9-2.7c0-.7-.1-1.3-.6-2.2-.6-1-1.5-2-1.5-3.6 0-2.5 2-4.4 5-4.4zM8.1 3.6v1.4M11.1 2.8v1.4M14.2 3v1.4M16.7 4.2v1.4M3.6 21.4h16.8",
  food: "M20 4c0 8-4.6 12.4-10.2 12.4-2 0-3.6-.6-4.6-1.5C4 13.6 4.6 8.8 9 6.4 12.4 4.6 16.6 4.6 20 4zM17 7.2C12.4 8.6 8 12 5.2 20",
  water: "M12 3.2c3.4 4 5.6 6.8 5.6 9.6a5.6 5.6 0 1 1-11.2 0c0-2.8 2.2-5.6 5.6-9.6zM8.6 13.9c1.2 1 2 1 3.4 0s2.2-1 3.4 0",
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: "58%", height: "58%", display: "block" }}>
      <path d={ICONS[name] || ICONS.meditation} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

/** Content hrefs are stored as design file names; map them to app routes. */
function resolveHref(href, isMember) {
  const h = (href || "").trim();
  if (!h || h === "Member Flow.dc.html") return { to: isMember ? "/dashboard" : "/join" };
  if (/^https?:/.test(h)) return { href: h };
  const [file, hash] = h.split("#");
  if (DESIGN_ROUTES[file]) return { to: DESIGN_ROUTES[file] + (hash ? `#${hash}` : "") };
  return { to: h.startsWith("/") || h.startsWith("#") ? h : `/${h}` };
}

function SmartLink({ target, children, ...rest }) {
  if (target.href) {
    return (
      <a href={target.href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={target.to} {...rest}>
      {children}
    </Link>
  );
}

/** /wellness — design: Wellness.dc.html */
export default function WellnessPage() {
  const c = useSiteContent("wellness");
  const w = useViewportWidth();
  const { isMember } = useMemberBadge();
  const desk = w >= 900;
  const [tab, setTab] = useState(0);
  const tabRefs = useRef([]);

  const detox = c.detox || [];
  const ti = Math.min(tab, Math.max(0, detox.length - 1));
  const cur = detox[ti] || { glyph: "", title: "", desc: "", items: [] };

  const onTabKey = (e) => {
    if (!detox.length) return;
    let next = null;
    if (e.key === "ArrowRight") next = (ti + 1) % detox.length;
    else if (e.key === "ArrowLeft") next = (ti - 1 + detox.length) % detox.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = detox.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const goDetox = (e) => {
    e.preventDefault();
    document.getElementById("detox")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SitePage>
      <SiteHeader active="wellness" />
      <Breadcrumb current="Wellness" />

      <section style={{ display: "flex", flexDirection: "column", gap: "clamp(22px,3.5vh,36px)", padding: `clamp(24px,4vh,48px) ${PAD} clamp(32px,5vh,56px)`, maxWidth: 1240, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <span style={{ ...KICKER, ...rise() }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            {c.eyebrow}
          </span>
          <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.4vw,64px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", maxWidth: "20ch", ...rise(0.1) }}>
            {c.title} <em style={{ color: "#8A6F34" }}>{c.titleAccent}</em>
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: desk ? "minmax(0,1fr) minmax(0,1.05fr)" : "1fr", gap: 18, alignItems: "stretch", ...rise(0.2) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(c.benefits || []).map((h, i) => (
                <article
                  key={i}
                  className="wel-benefit"
                  style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr)", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 18, background: "rgba(255,253,248,.55)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 12px 30px -14px rgba(60,42,16,.28)" }}
                >
                  <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 35% 35%,#F3EAD3,#E8CF83)", border: "1px solid #C9A24A", color: "#5A3C0E" }}>
                    <Icon name={h.icon} />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 20, lineHeight: 1.1, color: "#12201A" }}>{h.title}</span>
                    <span style={{ fontSize: 13, lineHeight: 1.5, color: "#3A3128" }}>{h.body}</span>
                  </span>
                </article>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, paddingTop: 4 }}>
              <a href="#detox" onClick={goDetox} className="gaw-pill-gold" style={{ ...PILL, padding: "0 22px", fontWeight: 700, boxShadow: "0 12px 30px -10px rgba(201,162,74,.7)" }}>
                {c.exploreLabel}
              </a>
              <SmartLink target={resolveHref(c.ctaHref, isMember)} className="wel-outline" style={{ ...PILL, padding: "0 20px", fontWeight: 600 }}>
                {c.cta}
              </SmartLink>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(c.quotes || []).map((t, i) => (
                <blockquote key={i} style={{ margin: 0, padding: "12px 16px", borderRadius: 14, background: "rgba(232,207,131,.22)", border: "1px solid rgba(201,162,74,.4)", fontSize: 13, lineHeight: 1.5, fontStyle: "italic", color: "#3A3128" }}>
                  {t.text}{" "}
                  <span style={{ fontStyle: "normal", fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#7A5E22" }}>— {t.name}, via NeoSouth</span>
                </blockquote>
              ))}
            </div>
          </div>

          <aside
            aria-labelledby="wel-rules-title"
            style={{ display: "flex", flexDirection: "column", gap: 18, padding: "clamp(22px,2.6vw,30px)", borderRadius: 24, background: "linear-gradient(170deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6", boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)", minWidth: 0 }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center" }}>
              <h2 id="wel-rules-title" className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(22px,2.2vw,28px)", lineHeight: 1.1, color: "#E8CF83" }}>
                <span style={{ fontSize: "1.4em" }}>{c.rulesNumber}</span> {c.rulesTitle}
              </h2>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "#C9A24A" }}>{c.rulesSub}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(c.rules || []).map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "38px minmax(0,1fr)", alignItems: "center", gap: 13 }}>
                  <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(232,207,131,.14)", border: "1px solid rgba(201,162,74,.55)", color: "#E8CF83" }}>
                    <Icon name={r.icon} />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 19, lineHeight: 1.1, color: "#F6F1E6" }}>
                      <span style={{ color: "#C9A24A" }}>{i + 1}.</span> {r.title}
                    </span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "rgba(246,241,230,.75)" }}>{r.body}</span>
                  </span>
                </div>
              ))}
            </div>
            <span style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#E8CF83" }}>{c.rulesMotto}</span>
          </aside>
        </div>
      </section>

      <section
        id="detox"
        aria-labelledby="wel-detox-title"
        style={{ display: "flex", flexDirection: "column", gap: 18, padding: `clamp(28px,5vh,56px) ${PAD} clamp(40px,6vh,72px)`, background: "linear-gradient(180deg,rgba(243,234,211,0),rgba(232,207,131,.22))", scrollMarginTop: 12 }}
      >
        <div style={{ maxWidth: 1240, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
            <span style={KICKER}>
              <span aria-hidden="true" style={{ width: 18, height: 1, background: "#C9A24A" }} />
              {c.detoxEyebrow}
            </span>
            <h2 id="wel-detox-title" className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(28px,3.4vw,46px)", lineHeight: 1.05, color: "#12201A" }}>
              {c.detoxTitle}
            </h2>
            <span style={{ display: "inline-flex", padding: "7px 16px", borderRadius: 999, border: "1px solid rgba(138,111,52,.45)", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#7A5E22" }}>{c.detoxBadge}</span>
          </div>

          <div role="tablist" aria-label={c.detoxTitle} onKeyDown={onTabKey} style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {detox.map((t, i) => {
              const on = i === ti;
              return (
                <button
                  key={i}
                  ref={(el) => (tabRefs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`wel-tab-${i}`}
                  aria-selected={on}
                  aria-controls="wel-detox-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setTab(i)}
                  className="wel-tab"
                  style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, border: `1px solid ${on ? "#14241C" : "rgba(138,111,52,.4)"}`, background: on ? "#14241C" : "transparent", color: on ? "#F6F1E6" : "#3A3128", fontSize: 12.5, fontWeight: 600 }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <article
            id="wel-detox-panel"
            role="tabpanel"
            aria-labelledby={`wel-tab-${ti}`}
            style={{ maxWidth: 780, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 14, padding: "clamp(22px,3vw,32px)", borderRadius: 26, background: "rgba(255,253,248,.7)", border: "1px solid rgba(255,255,255,.8)", boxShadow: "0 1px 0 rgba(255,255,255,.9) inset,0 24px 50px -20px rgba(60,42,16,.35)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <span aria-hidden="true" style={{ width: 48, height: 48, flex: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 35% 35%,#F3EAD3,#E8CF83)", border: "1px solid #C9A24A", fontFamily: SERIF, fontSize: 22, color: "#5A3C0E" }}>
                  {cur.glyph}
                </span>
                <h3 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(22px,2.4vw,30px)", lineHeight: 1.1, color: "#12201A" }}>
                  {cur.title}
                </h3>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "#7A5E22", whiteSpace: "nowrap" }}>
                {ti + 1} / {detox.length}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#3A3128", textWrap: "pretty" }}>{cur.desc}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {(cur.items || []).map((text, i) => (
                <li key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 14, lineHeight: 1.5, color: "#12201A" }}>
                  <span aria-hidden="true" style={{ color: "#C9A24A", fontSize: 11 }}>
                    ✦
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </article>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <a
              href={siteAsset(c.pdfHref || "assets/detox-diet.pdf")}
              download="GoldenAge Detox Diet.pdf"
              className="gaw-pill-gold"
              style={{ ...PILL, height: 46, padding: "0 24px", fontSize: 12, fontWeight: 700, boxShadow: "0 12px 30px -10px rgba(201,162,74,.7)" }}
            >
              {c.pdfLabel}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter title={c.footerTitle} sub={c.footerSub} />
      <AdminEditLink page="wellness" />
    </SitePage>
  );
}
