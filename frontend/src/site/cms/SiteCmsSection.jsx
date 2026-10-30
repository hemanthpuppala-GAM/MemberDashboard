import { Link } from "react-router-dom";
import { toEmbedUrl } from "../../lib/videoEmbed";
import { eventRow, useEventSessions } from "../liveSessions";
import ContactFormSection from "../../components/sections/ContactFormSection";
import SciencePanelSection from "../../components/sections/SciencePanelSection";
import DeepCardsSection from "../../components/sections/DeepCardsSection";
import MissionCosmologySection from "../../components/sections/MissionCosmologySection";
import "./cms.css";

/**
 * Admin → CMS → Pages sections, drawn in the public site's design (cream canvas, forest + gold,
 * Cormorant headings). Used by CMS-built pages (/:slug) and by the extra sections the team adds
 * under the hand-built pages. Field names match the section editor (SectionEditorPage.jsx).
 */

const INK = "#12201A";
const BODY = "#3A3128";
const GOLD_INK = "#7A5E22";
const GOLD = "#C9A24A";

const WRAP = { width: "100%", maxWidth: 1180, margin: "0 auto", padding: "clamp(28px,5vh,56px) clamp(20px,5vw,72px)" };
const KICK = { fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: GOLD_INK };
const H2 = { margin: 0, fontWeight: 500, fontSize: "clamp(28px,3vw,44px)", lineHeight: 1.08, letterSpacing: "-.01em", color: INK, textWrap: "balance" };
const P = { margin: 0, fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.7, color: BODY, textWrap: "pretty" };

/** CTA / card link: in-site paths use the router, anything else opens in a new tab. */
export function SmartHref({ href, children, ...rest }) {
  const h = String(href || "").trim();
  if (!h) return null;
  if (/^(https?:|mailto:|tel:)/.test(h)) {
    return (
      <a href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={h.startsWith("/") ? h : `/${h}`} {...rest}>
      {children}
    </Link>
  );
}

function Cta({ label, href }) {
  if (!label || !href) return null;
  return (
    <SmartHref href={href} className="gaw-pill-gold" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", height: 48, padding: "0 26px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 12px 30px -10px rgba(201,162,74,.7)" }}>
      {label}
    </SmartHref>
  );
}

function Heading({ eyebrow, heading, center = false, as: Tag = "h2" }) {
  if (!eyebrow && !heading) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: center ? "center" : "flex-start", textAlign: center ? "center" : "left" }}>
      {eyebrow ? <span style={KICK}>{eyebrow}</span> : null}
      {heading ? (
        <Tag className="serif" style={H2}>
          {heading}
        </Tag>
      ) : null}
    </div>
  );
}

function Hero({ f }) {
  const img = f.image;
  return (
    <section style={{ ...WRAP, paddingTop: "clamp(16px,3vh,32px)" }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "clamp(32px,6vw,72px) clamp(22px,5vw,64px)",
          borderRadius: 28,
          color: "#F6F1E6",
          background: img ? "#14241C" : "linear-gradient(160deg,#1F3B2E 0%,#14241C 100%)",
          boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)",
          minHeight: img ? "clamp(280px,40vw,460px)" : 0,
          justifyContent: "flex-end",
        }}
      >
        {img ? <img src={img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${f.focal_x ?? 50}% ${f.focal_y ?? 50}%` }} /> : null}
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: img ? "linear-gradient(180deg,rgba(20,36,28,.15) 0%,rgba(20,36,28,.82) 100%)" : "radial-gradient(ellipse 60% 50% at 100% 0%,rgba(232,207,131,.2),transparent 70%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, maxWidth: "62ch" }}>
          {f.eyebrow ? <span style={{ ...KICK, color: "#E8CF83" }}>{f.eyebrow}</span> : null}
          {f.heading ? (
            <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.6vw,64px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance" }}>
              {f.heading}
              {f.subheading ? <em style={{ display: "block", color: "#E8CF83" }}>{f.subheading}</em> : null}
            </h1>
          ) : null}
          {f.description ? <p style={{ ...P, color: "rgba(246,241,230,.86)" }}>{f.description}</p> : null}
          <div style={{ marginTop: 6 }}>
            <Cta label={f.cta_label} href={f.cta_href} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContentBlock({ f }) {
  const img = f.image;
  const left = (f.image_position || (f.reverse ? "left" : "right")) === "left";
  const shape = f.image_shape === "circle" ? { aspectRatio: "1", borderRadius: "50%" } : f.image_shape === "vertical" ? { aspectRatio: "3/4", borderRadius: 24 } : { aspectRatio: "4/3", borderRadius: 24 };
  const points = (f.points || []).filter((p) => (typeof p === "string" ? p : p?.text));
  return (
    <section style={WRAP}>
      <div className={`cms-split${img ? "" : " no-media"}${left ? " media-left" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Heading eyebrow={f.eyebrow} heading={f.heading} />
          {f.description ? <div className="cms-rich" style={P} dangerouslySetInnerHTML={{ __html: f.description }} /> : null}
          {points.length ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {points.map((p, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "baseline", ...P }}>
                  <span aria-hidden="true" style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: GOLD, transform: "translateY(-2px)" }} />
                  <span>{typeof p === "string" ? p : p.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Cta label={f.cta_label} href={f.cta_href} />
        </div>
        {img ? (
          <div style={{ ...shape, overflow: "hidden", width: "100%", maxWidth: f.image_shape === "circle" ? 380 : "none", justifySelf: "center", boxShadow: "0 24px 50px -24px rgba(60,42,16,.5)" }}>
            <img src={img} alt={f.heading || ""} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CardGrid({ f, kind }) {
  const items = (kind === "answers" ? f.items : f.cards) || [];
  if (!items.length && !f.heading) return null;
  return (
    <section style={WRAP}>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(18px,3vh,28px)" }}>
        <Heading eyebrow={f.eyebrow} heading={f.heading} center />
        <div className="cms-grid">
          {items.map((c, i) => (
            <article key={i} className="cms-card">
              {c.image ? <img src={c.image} alt="" style={{ display: "block", width: "100%", aspectRatio: "16/10", objectFit: "cover", borderRadius: 14 }} /> : null}
              {kind !== "answers" && c.icon && !c.image ? (
                <span aria-hidden="true" className="serif" style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 35% 35%,#F3EAD3,#E8CF83)", border: `1px solid ${GOLD}`, fontSize: 19, color: "#5A3C0E" }}>
                  {c.icon}
                </span>
              ) : null}
              {kind === "answers" && c.label ? <span style={KICK}>{c.label}</span> : null}
              {c.title ? (
                <h3 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(21px,1.7vw,25px)", lineHeight: 1.15, color: INK, textWrap: "balance" }}>
                  {c.title}
                </h3>
              ) : null}
              {c.body ? <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: BODY, textWrap: "pretty" }}>{c.body}</p> : null}
              {c.cta_href || c.href ? (
                <SmartHref href={c.cta_href || c.href} style={{ ...KICK, letterSpacing: ".18em", marginTop: "auto" }}>
                  {c.cta_label || "Learn more"} →
                </SmartHref>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Media({ f }) {
  const raw = f.videos?.length ? f.videos : f.video_url ? [{ url: f.video_url }] : [];
  const videos = raw.filter((v) => v?.url).map((v) => ({ ...v, src: toEmbedUrl(v.url) })).filter((v) => v.src);
  if (!videos.length && !f.image) return null;
  return (
    <section style={WRAP}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Heading eyebrow={f.eyebrow} heading={f.heading} center />
        {videos.length ? (
          <div className="cms-grid wide" style={videos.length === 1 ? { maxWidth: 880, width: "100%", margin: "0 auto" } : undefined}>
            {videos.map((v, i) => (
              <figure key={i} style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ aspectRatio: "16/9", overflow: "hidden", borderRadius: 20, background: "#14241C", boxShadow: "0 24px 50px -24px rgba(60,42,16,.5)" }}>
                  <iframe src={v.src} title={v.title || f.heading || `Video ${i + 1}`} style={{ width: "100%", height: "100%", border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                {v.title ? <figcaption style={{ fontSize: 14, color: BODY }}>{v.title}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : (
          <img src={f.image} alt={f.heading || ""} style={{ display: "block", width: "100%", maxWidth: f.image_shape === "vertical" ? 520 : "100%", margin: "0 auto", borderRadius: 24, boxShadow: "0 24px 50px -24px rgba(60,42,16,.5)" }} />
        )}
      </div>
    </section>
  );
}

function Events({ f }) {
  const { upcoming } = useEventSessions();
  const rows = (upcoming || []).slice(0, 6).map((e) => eventRow(e));
  return (
    <section style={WRAP}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Heading eyebrow={f.eyebrow} heading={f.heading || "Upcoming gatherings"} />
        {rows.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((r, i) => (
              <li key={i} className="cms-card" style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
                <span style={{ flex: "none", width: 64, textAlign: "center" }}>
                  <span className="serif" style={{ display: "block", fontSize: 30, lineHeight: 1, color: INK }}>{r.day}</span>
                  <span style={{ ...KICK, letterSpacing: ".16em" }}>{r.month}</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span className="serif" style={{ fontSize: 22, color: INK }}>{r.title}</span>
                  <span style={{ fontSize: 13.5, color: BODY }}>{r.meta}</span>
                  {r.desc ? <span style={{ fontSize: 14, color: BODY }}>{r.desc}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={P}>New gatherings are announced here first — the free daily sessions run every day.</p>
        )}
      </div>
    </section>
  );
}

function Html({ f }) {
  if (!f.html) return null;
  return (
    <section style={WRAP}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Heading heading={f.heading} />
        <div className="cms-rich" style={P} dangerouslySetInnerHTML={{ __html: f.html }} />
      </div>
    </section>
  );
}

/** One CMS section in the site's design; `null` for unknown / empty types. */
export default function SiteCmsSection({ section }) {
  const f = section?.fields || {};
  switch (section?.type) {
    case "hero":
      return <Hero f={f} />;
    case "content_block":
      return <ContentBlock f={f} />;
    case "card_grid":
      return <CardGrid f={f} />;
    case "quick_answers":
      return <CardGrid f={f} kind="answers" />;
    case "media_embed":
      return <Media f={f} />;
    case "event_list":
      return <Events f={f} />;
    case "custom_html":
      return <Html f={f} />;
    case "contact_form":
      return <ContactFormSection fields={f} color={GOLD} />;
    case "science_panel":
      return <SciencePanelSection fields={f} color={GOLD} />;
    case "deep_cards":
      return <DeepCardsSection fields={f} color={GOLD} />;
    case "mission_cosmology":
      return <MissionCosmologySection fields={f} color={GOLD} />;
    default:
      return null;
  }
}
