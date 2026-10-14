import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter } from "../SiteChrome";
import SiteCmsSection from "../cms/SiteCmsSection";
import { usePage } from "../../hooks/usePage";

/**
 * /:slug — a page built in Admin → CMS → Pages, drawn in the site's design. Everything on it
 * (sections, order, visibility, publish state) comes from the backend; no code per page.
 */
export default function CmsPage() {
  const { slug } = useParams();
  const { page, loading } = usePage(slug);
  const sections = page?.sections || [];
  const title = page?.title || "";
  const firstIsHero = sections[0]?.type === "hero";
  const { hash } = useLocation();

  // Admin "view on site" links point at #cms-section-{id}; sections arrive async, so scroll once they exist.
  useEffect(() => {
    if (!hash || !sections.length) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash, sections.length]);

  return (
    <SitePage>
      <SiteHeader active={slug} />
      <Breadcrumb current={title || (loading ? "…" : "Page")} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {loading && !page ? (
          <div aria-busy="true" style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: "48px clamp(20px,5vw,72px)", display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ width: 140, height: 12, borderRadius: 99, background: "rgba(201,162,74,.25)" }} />
            <span style={{ width: "60%", height: 36, borderRadius: 12, background: "rgba(201,162,74,.18)" }} />
            <span style={{ width: "80%", height: 14, borderRadius: 99, background: "rgba(201,162,74,.14)" }} />
          </div>
        ) : !page ? (
          <section style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "72px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#7A5E22" }}>Page not found</span>
            <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(30px,4vw,48px)", color: "#12201A" }}>
              This page isn&apos;t here.
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: "#3A3128" }}>It may have moved, or it hasn&apos;t been published yet.</p>
            <Link to="/" className="gaw-pill-gold" style={{ display: "inline-flex", alignItems: "center", height: 46, padding: "0 24px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
              Back to home
            </Link>
          </section>
        ) : (
          <>
            {!firstIsHero && title ? (
              <header style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: "clamp(20px,4vh,40px) clamp(20px,5vw,72px) 0", textAlign: "center" }}>
                <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.4vw,60px)", lineHeight: 1.04, letterSpacing: "-.015em", color: "#12201A", textWrap: "balance" }}>
                  {title}
                </h1>
              </header>
            ) : null}
            {sections.map((s) => (
              <div key={s.id} id={`cms-section-${s.id}`}>
                <SiteCmsSection section={s} />
              </div>
            ))}
          </>
        )}
      </main>

      <SiteFooter title="Sit with us — free, every day." sub="Guided live sessions every day. No experience needed." />
    </SitePage>
  );
}
