import { useState } from "react";
import { Link } from "react-router-dom";
import { PageLinks, MemberPill, MenuButton } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
import { GUTTER, NAV_INLINE_MIN, SITE_PAGES, UTILITY_LINKS } from "../sitePages";
import { siteAsset } from "../siteAssets";

const CAPS = { textTransform: "uppercase", whiteSpace: "nowrap" };
const CREAM_CARD = "linear-gradient(160deg,#FFFDF8 0%,#F3EAD3 100%)";

/**
 * Utility row as on every page (same look as SiteChrome's UtilityRow), plus
 * the Home-only "Give a little time" hint that drops from Volunteer on
 * hover / focus (design: volunteerHintTitle / volunteerHint).
 */
function HomeUtilityRow({ c }) {
  const [vol, setVol] = useState(false);
  const link = { display: "inline-flex", alignItems: "center", minHeight: 32, fontSize: 10.5, letterSpacing: ".16em", fontWeight: 600, ...CAPS };
  return (
    <nav
      aria-label="Utility"
      style={{
        position: "relative",
        zIndex: 7,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 22,
        padding: `calc(2px + env(safe-area-inset-top)) ${GUTTER} 0`,
        background: "#14241C",
        borderBottom: "1px solid rgba(232,207,131,.12)",
      }}
    >
      {UTILITY_LINKS.map((l) =>
        l.to === "/volunteer" ? (
          <span key={l.to} style={{ position: "relative", display: "inline-flex" }} onMouseEnter={() => setVol(true)} onMouseLeave={() => setVol(false)}>
            <Link to={l.to} className="gaw-util-link" style={link} onFocus={() => setVol(true)} onBlur={() => setVol(false)} aria-describedby="home-vol-hint">
              {l.label}
            </Link>
            <span
              id="home-vol-hint"
              role="tooltip"
              style={{ position: "absolute", left: "50%", top: "100%", transform: "translateX(-50%)", paddingTop: 14, display: vol ? "block" : "none", zIndex: 20, animation: "gaw-rise .3s both" }}
            >
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  width: 260,
                  padding: "16px 18px",
                  borderRadius: 18,
                  background: CREAM_CARD,
                  boxShadow: "0 1px 0 rgba(255,255,255,.9) inset,0 -1px 0 rgba(138,111,52,.25) inset,0 18px 34px -10px rgba(60,42,16,.45)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#7A5E22" }}>{c.volunteerHintTitle}</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: "#3A3128", fontWeight: 400 }}>{c.volunteerHint}</span>
              </span>
            </span>
          </span>
        ) : (
          <Link key={l.to} to={l.to} className="gaw-util-link" style={link}>
            {l.label}
          </Link>
        ),
      )}
    </nav>
  );
}

/** Guest "Join as member" pill with the member-QR card on hover; members get the shared dashboard pill. */
function JoinPill({ c, phone, desk }) {
  const m = useMemberBadge();
  const [qr, setQr] = useState(false);
  if (m.isMember) return <MemberPill height={44} />;
  return (
    <span style={{ position: "relative", display: "inline-flex" }} onMouseEnter={() => setQr(true)} onMouseLeave={() => setQr(false)}>
      <Link
        to="/join"
        className="home-join-pill"
        aria-haspopup="true"
        aria-expanded={qr}
        onFocus={() => setQr(true)}
        onBlur={() => setQr(false)}
        style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 44, padding: desk ? "0 18px" : "0 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", ...CAPS }}
      >
        {phone ? c.joinShortLabel || "Join" : c.joinLabel}
        <span aria-hidden="true" style={{ width: 5, height: 5, borderRight: "1.5px solid currentColor", borderBottom: "1.5px solid currentColor", transform: "rotate(45deg) translateY(-2px)", opacity: 0.7 }} />
      </Link>
      <span style={{ position: "absolute", right: 0, top: "100%", paddingTop: 12, display: qr ? "block" : "none", zIndex: 20, animation: "gaw-rise .35s both" }}>
        <Link to="/join" className="home-qr-card" tabIndex={-1} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px 10px 10px", borderRadius: 22, background: CREAM_CARD }}>
          <span style={{ position: "relative", flex: "none", width: 74, height: 74, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 14, background: "linear-gradient(135deg,#E8CF83,#C9A24A 45%,#8A6F34)" }} />
            <span aria-hidden="true" style={{ position: "absolute", inset: 1.5, borderRadius: 12.5, background: "#FCFAF5" }} />
            <img src={siteAsset("assets/qr-join.svg")} alt="QR code for members" style={{ position: "relative", width: 60, height: 60, display: "block" }} />
            <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 18, height: 18, transform: "translate(-50%,-50%)", borderRadius: "50%", overflow: "hidden", background: "#0E1A14", boxShadow: "0 0 0 2px #FCFAF5,0 0 0 2.5px #C9A24A" }}>
              <img src={siteAsset("assets/logo-coin-tight.png")} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#7A5E22" }}>{c.qrEyebrow}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#3A3128", whiteSpace: "nowrap" }}>{c.qrSub}</span>
          </span>
        </Link>
      </span>
    </span>
  );
}

/** Home's header variant (design: <header ref=headerRef> in Home Bodhi Tree v2.dc.html). */
export default function HomeHeader({ c, vp, headerRef }) {
  const { w, desk, phone } = vp;
  const wide = w >= NAV_INLINE_MIN; // page links inline only where they fit; tablets use the menu
  const big = desk || w >= 700; // tablet portrait gets the desktop-size brand and spacing
  const [menu, setMenu] = useState(false);
  const menuOpen = !wide && menu;
  const close = () => setMenu(false);
  const smallUtil = { display: "inline-flex", alignItems: "center", minHeight: 40, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600 };

  return (
    <div className="gaw-sticky-head" style={{ order: 0 }}>
      {wide && <HomeUtilityRow c={c} />}
      <header
        ref={headerRef}
        style={{
          position: "relative",
          zIndex: 5,
          order: 0,
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: big ? "12px 24px" : "4px 16px",
          padding: big ? `12px ${GUTTER}` : "10px 22px 4px",
          paddingTop: wide ? 12 : `calc(${big ? 12 : 10}px + env(safe-area-inset-top))`,
          background: big ? "linear-gradient(180deg,#14241C 0%,#1B3328 100%)" : "#14241C",
        }}
      >
        <Link to="/" className="gaw-brand" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: big ? "none" : "1 1 0" }}>
          <span
            style={{
              position: "relative",
              flex: "none",
              display: "block",
              width: big ? 48 : 36,
              height: big ? 48 : 36,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#0E1A14",
              boxShadow: "0 0 0 2px #1B3328,0 0 0 3px #C9A24A,0 10px 24px -10px rgba(0,0,0,.6)",
              animation: "home-heartbeat 8s 1.4s cubic-bezier(.45,0,.55,1) infinite",
            }}
          >
            <img src={siteAsset("assets/logo-original.jpg")} alt="Golden Age Wisdom emblem" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.26)" }} />
          </span>
          <span
            className="serif"
            style={{ fontWeight: 500, fontSize: big ? "clamp(12px,3.4vw,20px)" : "clamp(11px,3vw,13px)", letterSpacing: big ? "clamp(.1em,.5vw,.18em)" : ".1em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            Golden Age Wisdom
          </span>
        </Link>

        {wide && <PageLinks style={{ flex: "0 1 auto", justifyContent: "center" }} />}

        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, marginLeft: wide ? 0 : "auto" }}>
          <JoinPill c={c} phone={phone} desk={big} />
        </div>

        {!wide && <MenuButton open={menu} onClick={() => setMenu((v) => !v)} />}

        {menuOpen && (
          <nav aria-label="Menu" style={{ order: 3, width: "100%", display: "flex", flexDirection: "column", padding: "6px 0 10px", borderTop: "1px solid rgba(246,241,230,.1)", animation: "gaw-rise .25s both" }}>
            {SITE_PAGES.map((p) => (
              <Link
                key={p.key}
                to={p.to}
                onClick={close}
                className="home-menu-link"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 50, padding: "0 6px", borderBottom: "1px solid rgba(246,241,230,.08)", fontSize: 13, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase" }}
              >
                {p.label}
                <span aria-hidden="true" style={{ width: 6, height: 6, borderRight: "1.5px solid currentColor", borderBottom: "1.5px solid currentColor", transform: "rotate(-45deg)", opacity: 0.6 }} />
              </Link>
            ))}
            <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", padding: "12px 6px 0" }}>
              <Link to="/ask" onClick={close} className="home-menu-util" style={smallUtil}>
                {c.supportLabel}
              </Link>
              <Link to="/volunteer" onClick={close} className="home-menu-util" style={smallUtil}>
                {c.volunteerNavLabel}
              </Link>
              <Link to="/privacy" onClick={close} className="home-menu-util" style={smallUtil}>
                {c.privacyLabel || "Privacy"}
              </Link>
            </span>
          </nav>
        )}
      </header>
    </div>
  );
}
