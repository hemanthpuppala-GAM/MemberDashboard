import { SitePage, SiteHeader, Breadcrumb, SiteFooter, AdminEditLink } from "../SiteChrome";
import { useSiteContent } from "../useSiteContent";
import { usePageQuotes } from "../siteQuotes";
import { useViewportWidth } from "../useViewport";
import { siteAsset } from "../siteAssets";

const PAD = "clamp(20px,5vw,72px)";
const KICKER = { display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22" };
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });

/** /about — design: About.dc.html */
export default function AboutPage() {
  const c = useSiteContent("about");
  const quotes = usePageQuotes("about", c.quotes);
  const w = useViewportWidth();
  const desk = w >= 900;
  const mid = w >= 640;
  const photo = (c.photo && c.photo.trim()) || "assets/hari-portrait-white.jpg";

  return (
    <SitePage>
      <SiteHeader active="about" />
      <Breadcrumb current="About" />

      <section
        style={{ flex: 1, display: "grid", gridTemplateColumns: desk ? "minmax(280px,.8fr) minmax(0,1.2fr)" : "1fr", gap: "clamp(28px,5vw,80px)", alignItems: "center", padding: `clamp(24px,4vh,48px) ${PAD} clamp(40px,6vh,72px)`, maxWidth: 1360, width: "100%", margin: "0 auto" }}
      >
        <figure style={{ margin: 0, position: "relative", ...rise(0.1) }}>
          <img
            src={siteAsset(photo)}
            alt="Dr. Hari Krishna standing in a garden, dressed in white"
            style={{ display: "block", width: "100%", aspectRatio: desk ? "3 / 4" : "4 / 5", objectFit: "cover", objectPosition: "50% 18%", borderRadius: 22, boxShadow: "0 40px 90px -36px rgba(20,14,6,.55),0 0 0 1px rgba(138,111,52,.2)" }}
          />
          <figcaption
            style={{ position: "absolute", left: 18, bottom: 18, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", borderRadius: 999, background: "rgba(20,36,28,.78)", backdropFilter: "blur(10px)", color: "#F6F1E6", fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase" }}
          >
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8CF83" }} />
            {c.photoCaption}
          </figcaption>
        </figure>

        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px,2vh,22px)", minWidth: 0 }}>
          <span style={{ ...KICKER, ...rise() }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            {c.eyebrow}
          </span>
          <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(36px,4.4vw,66px)", lineHeight: 1, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", ...rise(0.1) }}>
            {c.title} <em style={{ color: "#8A6F34" }}>{c.titleAccent}</em>
          </h1>
          <p style={{ margin: 0, fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.6, color: "#3A3128", textWrap: "pretty", maxWidth: "54ch", ...rise(0.2) }}>{c.intro}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", ...rise(0.3) }}>
            {[c.badge1, c.badge2].filter(Boolean).map((b) => (
              <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(138,111,52,.35)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#7A5E22" }}>
                {b}
              </span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mid ? "repeat(3,minmax(0,1fr))" : "1fr", gap: 14, marginTop: "clamp(6px,1vh,14px)", ...rise(0.4) }}>
            {(c.strengths || []).map((g, i) => (
              <article
                key={i}
                style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 18px 20px", borderRadius: 18, background: "rgba(255,253,248,.55)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 12px 30px -14px rgba(60,42,16,.28)" }}
              >
                <span aria-hidden="true" className="serif" style={{ fontSize: 26, lineHeight: 1, color: "#8A6F34" }}>
                  {g.glyph}
                </span>
                <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 22, lineHeight: 1.1, color: "#12201A" }}>
                  {g.title}
                </h2>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty" }}>{g.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="What members say" style={{ padding: `clamp(32px,5vh,56px) ${PAD}`, background: "linear-gradient(180deg,rgba(243,234,211,0),rgba(232,207,131,.18))" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
          <span style={KICKER}>
            <span aria-hidden="true" style={{ width: 18, height: 1, background: "#C9A24A" }} />
            {c.quotesKicker}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(4,minmax(0,1fr))" : mid ? "repeat(2,minmax(0,1fr))" : "1fr", gap: 16 }}>
            {quotes.map((t, i) => (
              <blockquote key={i} style={{ margin: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16, padding: 22, borderRadius: 18, background: "#14241C", color: "#F6F1E6", boxShadow: "0 18px 40px -20px rgba(0,0,0,.5)" }}>
                <p className="serif" style={{ margin: 0, fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.3, textWrap: "pretty" }}>
                  {t.text}
                </p>
                <footer style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#E8CF83" }}>— {t.name}, via NeoSouth</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter title={c.footerTitle} sub={c.footerSub} />
      <AdminEditLink page="about" />
    </SitePage>
  );
}
