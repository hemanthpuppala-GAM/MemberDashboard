import { useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter, AdminEditLink } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
import { useSiteContent } from "../useSiteContent";
import { useViewportWidth } from "../useViewport";
import { siteAsset } from "../siteAssets";
import "./meditation.css";

const PAD = "clamp(20px,5vw,72px)";
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });
const CARD = {
  borderRadius: 24,
  background: "rgba(255,253,248,.55)",
  border: "1px solid rgba(255,255,255,.7)",
  boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 18px 40px -18px rgba(60,42,16,.3)",
};
const SMALL_CARD = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: "18px 20px",
  borderRadius: 18,
  background: "rgba(255,253,248,.55)",
  border: "1px solid rgba(255,255,255,.7)",
  boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 12px 30px -14px rgba(60,42,16,.28)",
};
const LABEL = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "#7A5E22" };

/** Defaults from Meditation.dc.html DEFAULTS that content/meditation.json may not carry. */
const FALLBACKS = {
  eyebrow: "The Path · Meditation 101",
  title: "Explained simply —",
  titleAccent: "and scientifically",
  photoCaption: "The posture — nothing more than this",
  howKicker: "How to meditate",
  howClose: "That's the whole method. Nothing to buy, nothing to master.",
  scienceKicker: "The science, simply",
  recKicker: "Dr. Hari Krishna recommends",
  techKicker: "Other techniques people use",
  bodyLead: "And the body?",
  bodyCta: "Detox diet →",
  bodyHref: "Wellness.dc.html#detox",
  pathLabel: "Where are you on the path?",
  simpleLabel: "New to this",
  deepLabel: "Seasoned meditator",
  simpleLead: "As Dr. HariKrishna says —",
  simpleQuote: "“Gammuga kurcho”",
  simpleTail: "means simply sit, quietly.",
  cta: "Take the 41-day challenge",
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

/** Content hrefs are stored as design file names ("Wellness.dc.html#detox") — map them to app routes. */
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

function TorusIcon() {
  const arcs = [
    [36, 64, 0.6],
    [26, 74, 0.5],
    [16, 84, 0.42],
    [6, 94, 0.34],
    [-2, 102, 0.26],
  ];
  return (
    <svg className="gaw-med-torus" aria-hidden="true" viewBox="0 0 100 126" style={{ width: 88, flex: "none", overflow: "visible" }}>
      {arcs.map(([l, r, o]) => (
        <g key={l} fill="none" stroke={`rgba(232,207,131,${o})`} strokeWidth="1.1">
          <path d={`M50 12 C ${l} 30, ${l} 96, 50 114`} />
          <path d={`M50 12 C ${r} 30, ${r} 96, 50 114`} />
        </g>
      ))}
      <line x1="50" y1="16" x2="50" y2="110" stroke="rgba(201,162,74,.6)" strokeWidth="1.2" />
      <circle cx="50" cy="63" r="5.4" fill="#F3EAD3" />
      <circle cx="50" cy="63" r="11" fill="none" stroke="rgba(232,207,131,.4)" strokeWidth="1" />
      <circle cx="50" cy="12" r="2.6" fill="#F6F1E6" />
      <circle cx="50" cy="114" r="2.6" fill="#F6F1E6" />
    </svg>
  );
}

/** /meditation — design: Meditation.dc.html */
export default function MeditationPage() {
  const c = useSiteContent("meditation", FALLBACKS);
  const { isMember } = useMemberBadge();
  const w = useViewportWidth();
  const desk = w >= 900;
  const mid = w >= 640;
  const [depth, setDepth] = useState("simple");
  const simple = depth === "simple";
  const photo = (c.photo && c.photo.trim()) || "assets/hari-posture-stream.png";

  const tab = (active) => ({
    height: 36,
    padding: "0 18px",
    borderRadius: 999,
    background: active ? "#14241C" : "transparent",
    color: active ? "#F6F1E6" : "#3A3128",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: ".06em",
  });

  return (
    <SitePage>
      <SiteHeader active="meditation" />
      <Breadcrumb current="Meditation" />

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
          <p style={{ margin: 0, maxWidth: "48ch", fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.55, color: "#3A3128", textWrap: "pretty", ...rise(0.2) }}>{c.sub}</p>
        </div>

        {/* How-to steps + posture photo */}
        <div style={{ display: "grid", gridTemplateColumns: desk ? "minmax(0,1.15fr) minmax(280px,.85fr)" : "1fr", gap: 18, alignItems: "stretch", ...rise(0.25) }}>
          <article style={{ ...CARD, display: "flex", flexDirection: "column", gap: 4, padding: "clamp(20px,2.4vw,28px)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "#7A5E22" }}>{c.howKicker}</h2>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {(c.steps || []).map((h, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr)", gap: 14, alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch", gap: 4 }}>
                    <span
                      className="serif"
                      style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 36% 34%,#F3EAD3,#E8CF83)", border: "1px solid #C9A24A", fontWeight: 500, fontSize: 13, color: "#5A3C0E" }}
                    >
                      {h.n}
                    </span>
                    <span aria-hidden="true" style={{ flex: 1, width: 1, minHeight: 12, background: "linear-gradient(180deg,rgba(201,162,74,.6),rgba(201,162,74,0))" }} />
                  </div>
                  <div style={{ paddingBottom: 12, display: "flex", flexDirection: "column", gap: 3 }}>
                    <span className="serif" style={{ fontWeight: 500, fontSize: 20, lineHeight: 1.15, color: "#12201A" }}>
                      {h.title}
                    </span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty" }}>{h.body}</span>
                  </div>
                </li>
              ))}
            </ol>
            <span style={{ fontSize: 13, fontStyle: "italic", color: "#6B5E48" }}>{c.howClose}</span>
          </article>

          <figure style={{ margin: 0, position: "relative", display: "flex", flexDirection: "column", borderRadius: 24, overflow: "hidden", background: "#14241C", minHeight: 320, boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)" }}>
            <img
              src={siteAsset(photo)}
              alt="Dr. Hari Krishna seated cross-legged in meditation, eyes closed, hands resting together"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "62% 50%" }}
            />
            <figcaption
              className="serif"
              style={{ position: "relative", marginTop: "auto", padding: "18px 20px", background: "linear-gradient(180deg,rgba(20,36,28,0),rgba(20,36,28,.85))", color: "#F6F1E6", fontStyle: "italic", fontSize: 18, lineHeight: 1.2 }}
            >
              {c.photoCaption}
            </figcaption>
          </figure>
        </div>

        {/* Quick answers */}
        <div style={{ display: "grid", gridTemplateColumns: mid ? "repeat(3,minmax(0,1fr))" : "1fr", gap: 14, ...rise(0.3) }}>
          {(c.answers || []).map((q, i) => (
            <article key={i} style={SMALL_CARD}>
              <span style={LABEL}>{q.label}</span>
              <span className="serif" style={{ fontWeight: 500, fontSize: 22, lineHeight: 1.15, color: "#12201A" }}>
                {q.answer}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "#3A3128", textWrap: "pretty" }}>{q.detail}</span>
            </article>
          ))}
        </div>

        {/* Science + recommendation */}
        <div style={{ display: "grid", gridTemplateColumns: desk ? "minmax(0,1fr) minmax(0,1fr)" : "1fr", gap: 18, alignItems: "stretch", ...rise(0.35) }}>
          <article
            style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", padding: "clamp(20px,2.4vw,28px)", borderRadius: 24, background: "linear-gradient(170deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6", boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)" }}
          >
            <TorusIcon />
            <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "#C9A24A" }}>{c.scienceKicker}</span>
              <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 24, lineHeight: 1.15, color: "#F6F1E6" }}>
                {c.scienceTitle}
              </h2>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(246,241,230,.82)", textWrap: "pretty" }}>{c.scienceBody}</p>
            </div>
          </article>

          <article style={{ ...CARD, display: "flex", flexDirection: "column", gap: 12, padding: "clamp(20px,2.4vw,28px)" }}>
            <div
              style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr)", gap: 12, padding: 16, borderRadius: 16, background: "linear-gradient(135deg,rgba(232,207,131,.4),rgba(232,207,131,.12))", border: "1px solid rgba(201,162,74,.5)" }}
            >
              <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#14241C", color: "#E8CF83", fontSize: 12 }}>
                ✦
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={LABEL}>{c.recKicker}</span>
                <span className="serif" style={{ fontWeight: 500, fontSize: 22, lineHeight: 1.15, color: "#12201A" }}>
                  {c.recTitle}
                </span>
                <span style={{ fontSize: 13.5, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty" }}>{c.recBody}</span>
              </div>
            </div>
            <span style={{ ...LABEL, color: "#6B5E48" }}>{c.techKicker}</span>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(c.techniques || []).map((name) => (
                <li key={name} style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(138,111,52,.35)", fontSize: 12, fontWeight: 600, color: "#3A3128", whiteSpace: "nowrap" }}>
                  {name}
                </li>
              ))}
            </ul>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#6B5E48" }}>{c.techNote}</span>
            <span aria-hidden="true" style={{ height: 1, background: "rgba(138,111,52,.2)" }} />
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ margin: 0, flex: 1, minWidth: 200, fontSize: 13.5, lineHeight: 1.55, color: "#3A3128" }}>
                <strong style={{ fontWeight: 600, color: "#8A6F34" }}>{c.bodyLead}</strong> {c.bodyText}
              </p>
              <DesignLink
                href={c.bodyHref}
                isMember={isMember}
                className="gaw-med-outline"
                style={{ flex: "none", display: "inline-flex", alignItems: "center", height: 40, padding: "0 18px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap" }}
              >
                {c.bodyCta}
              </DesignLink>
            </div>
          </article>
        </div>

        {/* Where are you on the path? */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, ...rise(0.4) }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <span id="gaw-med-path" style={{ fontSize: 12.5, color: "#6B5E48" }}>
              {c.pathLabel}
            </span>
            <div role="tablist" aria-labelledby="gaw-med-path" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 999, border: "1px solid rgba(138,111,52,.35)", background: "rgba(255,253,248,.5)" }}>
              <button type="button" role="tab" id="gaw-med-tab-simple" aria-selected={simple} aria-controls="gaw-med-panel" className="gaw-med-tab" onClick={() => setDepth("simple")} style={tab(simple)}>
                {c.simpleLabel}
              </button>
              <button type="button" role="tab" id="gaw-med-tab-deep" aria-selected={!simple} aria-controls="gaw-med-panel" className="gaw-med-tab" onClick={() => setDepth("deep")} style={tab(!simple)}>
                {c.deepLabel}
              </button>
            </div>
          </div>

          <div id="gaw-med-panel" role="tabpanel" aria-labelledby={simple ? "gaw-med-tab-simple" : "gaw-med-tab-deep"} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            {simple ? (
              <p style={{ margin: 0, width: "100%", padding: "18px 24px", borderRadius: 18, border: "1px dashed rgba(201,162,74,.6)", textAlign: "center", fontSize: 15, fontStyle: "italic", color: "#3A3128" }}>
                {c.simpleLead}{" "}
                <span className="serif" style={{ fontStyle: "normal", fontWeight: 500, fontSize: 20, color: "#12201A" }}>
                  {c.simpleQuote}
                </span>{" "}
                {c.simpleTail}
              </p>
            ) : (
              <>
                <div style={{ width: "100%", display: "grid", gridTemplateColumns: desk ? "repeat(4,minmax(0,1fr))" : mid ? "repeat(2,minmax(0,1fr))" : "1fr", gap: 14 }}>
                  {(c.deepCards || []).map((d, i) => (
                    <article key={i} style={SMALL_CARD}>
                      <span aria-hidden="true" className="serif" style={{ fontSize: 22, lineHeight: 1, color: "#8A6F34" }}>
                        {d.glyph}
                      </span>
                      <h3 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 21, lineHeight: 1.15, color: "#12201A" }}>
                        {d.title}
                      </h3>
                      <span style={{ fontSize: 13, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty" }}>{d.body}</span>
                    </article>
                  ))}
                </div>
                <p style={{ margin: 0, textAlign: "center", fontSize: 13.5, fontStyle: "italic", color: "#6B5E48" }}>{c.deepClose}</p>
              </>
            )}
          </div>

          <DesignLink
            href={c.ctaHref}
            isMember={isMember}
            className="gaw-pill-gold"
            style={{ display: "inline-flex", alignItems: "center", height: 50, padding: "0 28px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 12px 30px -10px rgba(201,162,74,.7)" }}
          >
            {c.cta}
          </DesignLink>
        </div>
      </section>

      <SiteFooter title={c.footerTitle} sub={c.footerSub} />
      <AdminEditLink page="meditation" />
    </SitePage>
  );
}
