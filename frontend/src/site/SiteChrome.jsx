import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GUTTER, SITE_PAGES, UTILITY_LINKS, YOUTUBE_URL } from "./sitePages";
import { useMemberBadge } from "./useMemberBadge";
import { siteAsset } from "./siteAssets";
import { useViewportWidth } from "./useViewport";
import { useIsSiteAdmin } from "./useSiteAdmin";
import "./site.css";

const CAPS = { textTransform: "uppercase", whiteSpace: "nowrap" };

/** Outer wrapper for every public page: fonts, cream background, scoped CSS. */
export function SitePage({ children, style }) {
  useScrollToHash();
  return (
    <div className="gaw-site" style={{ display: "flex", flexDirection: "column", ...style }}>
      {children}
    </div>
  );
}

/** Links like /wellness#detox: scroll to the anchor once the page has rendered (react-router doesn't). */
function useScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return undefined;
    }
    const t = setTimeout(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => clearTimeout(t);
  }, [pathname, hash]);
}

/** Full-width dark band above the header: Member support · Volunteer · Privacy. ≥900px only. */
export function UtilityRow({ style }) {
  return (
    <nav
      aria-label="Utility"
      style={{
        position: "relative",
        zIndex: 5,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 22,
        padding: `calc(2px + env(safe-area-inset-top)) ${GUTTER} 0`,
        background: "#14241C",
        borderBottom: "1px solid rgba(232,207,131,.12)",
        ...style,
      }}
    >
      {UTILITY_LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="gaw-util-link"
          style={{ display: "inline-flex", alignItems: "center", minHeight: 32, fontSize: 10.5, letterSpacing: ".16em", fontWeight: 600, ...CAPS }}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

/** 48px medallion + "GOLDEN AGE WISDOM" wordmark. */
export function Brand({ to = "/", size = 48, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="gaw-brand" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
      <span
        className="gaw-heartbeat"
        style={{
          position: "relative",
          flex: "none",
          display: "block",
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#0E1A14",
          boxShadow: "0 0 0 2px #1B3328,0 0 0 3px #C9A24A,0 10px 24px -10px rgba(0,0,0,.6)",
        }}
      >
        <img
          src={siteAsset("assets/logo-original.jpg")}
          alt="Golden Age Wisdom emblem"
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.26)" }}
        />
      </span>
      <span
        className="serif"
        style={{
          fontWeight: 500,
          fontSize: "clamp(12px,3.4vw,20px)",
          letterSpacing: "clamp(.1em,.5vw,.18em)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Golden Age Wisdom
      </span>
    </Link>
  );
}

/** About · Mission · Teachings · Meditation · Wisdom · Wellness · Events. `active` = page key. */
export function PageLinks({ active, style }) {
  return (
    <nav aria-label="Pages" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px clamp(10px,1.6vw,28px)", minWidth: 0, ...style }}>
      {SITE_PAGES.map((p) => (
        <Link
          key={p.key}
          to={p.to}
          className={`gaw-nav-link${p.key === active ? " is-active" : ""}`}
          aria-current={p.key === active ? "page" : undefined}
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 44,
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: ".14em",
            borderBottom: p.key === active ? "1px solid #C9A24A" : "1px solid transparent",
            ...CAPS,
          }}
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}

/** Right pill: guest → gold "Join free"; member → initial avatar + first name → dashboard. */
export function MemberPill({ joinLabel = "Join free", height = 44, style, guestProps }) {
  const m = useMemberBadge();
  const base = { display: "inline-flex", alignItems: "center", gap: 10, height, borderRadius: 999, fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", ...CAPS, ...style };
  if (m.isMember) {
    return (
      <Link to="/dashboard" title="Open my dashboard" className="gaw-pill-outline" style={{ ...base, padding: "0 18px 0 6px" }}>
        <span
          className="serif"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,#E8CF83,#C9A24A)",
            color: "#14241C",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {m.initial}
        </span>
        {m.first}
      </Link>
    );
  }
  return (
    <Link to="/join" className="gaw-pill-gold" style={{ ...base, padding: "0 20px" }} {...guestProps}>
      {joinLabel}
    </Link>
  );
}

export function MenuButton({ open, onClick }) {
  const bar = { height: 1.5, background: "currentColor", transition: "transform .25s, opacity .2s" };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "1px solid rgba(246,241,230,.35)",
        background: "rgba(246,241,230,.06)",
        color: "#F6F1E6",
        font: "inherit",
        cursor: "pointer",
      }}
    >
      <span aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 5, width: 18 }}>
        <span style={{ ...bar, transform: open ? "translateY(6.5px) rotate(45deg)" : "none" }} />
        <span style={{ ...bar, opacity: open ? 0 : 1 }} />
        <span style={{ ...bar, transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
      </span>
    </button>
  );
}

/** <900px drop-down: page links, then the utility links, then the join / dashboard pill. */
export function MobileMenu({ active, onClose }) {
  const m = useMemberBadge();
  const row = { display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 50, padding: "0 10px", borderBottom: "1px solid rgba(246,241,230,.08)", fontSize: 13, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase" };
  const chevron = <span aria-hidden="true" style={{ width: 6, height: 6, borderRight: "1.5px solid currentColor", borderBottom: "1.5px solid currentColor", transform: "rotate(-45deg)", opacity: 0.6 }} />;
  return (
    <nav
      aria-label="Menu"
      style={{ position: "relative", zIndex: 6, display: "flex", flexDirection: "column", padding: "6px clamp(12px,3vw,24px) 14px", background: "#1B3328", borderTop: "1px solid rgba(246,241,230,.1)", animation: "gaw-rise .25s both" }}
    >
      {SITE_PAGES.map((p) => (
        <Link key={p.key} to={p.to} onClick={onClose} className={`gaw-nav-link${p.key === active ? " is-active" : ""}`} style={row}>
          {p.label}
          {chevron}
        </Link>
      ))}
      {UTILITY_LINKS.map((l) => (
        <Link key={l.to} to={l.to} onClick={onClose} className="gaw-util-link" style={{ ...row, fontSize: 12 }}>
          {l.label}
          {chevron}
        </Link>
      ))}
      <Link
        to={m.isMember ? "/dashboard" : "/join"}
        onClick={onClose}
        className="gaw-pill-gold"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12, height: 48, borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}
      >
        {m.isMember ? `My dashboard · ${m.first}` : "Join free"}
      </Link>
    </nav>
  );
}

/** Utility row + header + mobile menu, as on every sub-page. */
export function SiteHeader({ active }) {
  const w = useViewportWidth();
  const [menu, setMenu] = useState(false);
  const desk = w >= 900;
  return (
    <div className="gaw-sticky-head">
      {desk && <UtilityRow />}
      <header
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          display: "flex",
          flexWrap: desk ? "wrap" : "nowrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px 24px",
          padding: `12px ${GUTTER}`,
          paddingTop: desk ? 12 : "calc(12px + env(safe-area-inset-top))",
          background: "linear-gradient(180deg,#14241C 0%,#1B3328 100%)",
        }}
      >
        <Brand />
        {desk && <PageLinks active={active} />}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {w >= 480 && <MemberPill />}
          {!desk && <MenuButton open={menu} onClick={() => setMenu((v) => !v)} />}
        </div>
      </header>
      {!desk && menu && <MobileMenu active={active} onClose={() => setMenu(false)} />}
    </div>
  );
}

/** "Home — {current}" breadcrumb under the header. */
export function Breadcrumb({ current }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="gaw-breadcrumb"
      style={{ display: "flex", alignItems: "center", gap: 10, padding: `18px clamp(20px,5vw,72px) 0`, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#7A5E22", animation: "gaw-rise .7s both" }}
    >
      <Link to="/">Home</Link>
      <span aria-hidden="true" style={{ width: 14, height: 1, background: "#C9A24A" }} />
      <span style={{ color: "#3A3128" }}>{current}</span>
    </nav>
  );
}

/** Dark footer band used by the sub-pages: title + sub on the left, Watch live / Join the daily sit on the right. */
export function SiteFooter({ title, sub, children }) {
  return (
    <footer
      id="join"
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "18px 32px", padding: `28px clamp(20px,5vw,72px)`, background: "linear-gradient(180deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <span className="serif" style={{ fontSize: "clamp(22px,2.2vw,32px)", lineHeight: 1.1 }}>
          {title}
        </span>
        <span style={{ fontSize: 12.5, color: "rgba(246,241,230,.72)" }}>{sub}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
        {children ?? (
          <>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="gaw-pill-ghost-light" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 44, padding: "0 20px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, letterSpacing: ".12em", ...CAPS }}>
              Watch live
            </a>
            <Link to="/#world-sits" className="gaw-pill-gold" style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 22px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", boxShadow: "none", ...CAPS }}>
              Join the daily sit
            </Link>
          </>
        )}
      </div>
    </footer>
  );
}

/** Floating "Edit this page" link, visible only when an admin session exists. */
export function AdminEditLink({ page }) {
  const isAdmin = useIsSiteAdmin();
  if (!isAdmin) return null;
  return (
    <Link
      to={`/admin/content/${page}`}
      style={{ position: "fixed", right: 18, bottom: 18, zIndex: 50, display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 999, background: "#14241C", color: "#E8CF83", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", boxShadow: "0 12px 30px -12px rgba(0,0,0,.5)" }}
    >
      ✎ Edit this page
    </Link>
  );
}
