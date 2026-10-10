import { siteAsset } from "../siteAssets";

const FADE = (a, b) => `linear-gradient(90deg,transparent,#000 ${a}%,#000 ${b}%,transparent)`;

/** Footer band "Meditations around the world" (#world-sits). `compact` (phones / portrait) stacks it: title, ticker, Zoom. */
export function WorldSitsFooter({ c, s, compact = false }) {
  const zoom = c.zoom || {};
  return (
    <footer
      id="world-sits"
      aria-label="Meditations around the world"
      style={{ position: "relative", zIndex: 6, order: 4, width: "100%", display: "flex", flexWrap: compact ? "wrap" : "nowrap", alignItems: "center", gap: compact ? "12px 16px" : "clamp(16px,2vw,28px)", padding: compact ? "16px 18px 18px" : "12px clamp(24px,5vw,72px) 10px", borderTop: "1px solid rgba(232,207,131,.18)", background: "linear-gradient(180deg,#1B3328 0%,#14241C 100%)", boxShadow: "0 1px 0 rgba(255,255,255,.05) inset", scrollMarginTop: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
        <span aria-hidden="true" style={{ position: "relative", flex: "none", width: 56, height: 56, borderRadius: "50%", overflow: "hidden", background: "#12201A", boxShadow: "0 0 0 1.5px #C9A24A" }}>
          <img src={siteAsset("assets/globe-meditator.png")} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 150 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#E8CF83" }}>{c.sitsTitle}</span>
          <span aria-live="polite" style={{ fontSize: 12.5, color: "rgba(246,241,230,.75)", whiteSpace: "nowrap" }}>
            {s.status}
          </span>
        </div>
      </div>
      <div className="home-marquee-wrap" style={{ flex: compact ? "1 1 100%" : 1, minWidth: 0, overflow: "hidden", WebkitMaskImage: FADE(5, 95), maskImage: FADE(5, 95) }}>
        <ul className="home-marquee" style={{ listStyle: "none", margin: 0, padding: "2px 0", display: "flex", gap: 10, width: "max-content" }}>
          {s.loop.map((x, i) => (
            <li
              key={`${x.name}-${i}`}
              aria-hidden={i >= s.sits.length ? "true" : undefined}
              className="home-sit-tile"
              style={{ flex: "none", display: "flex", alignItems: "center", gap: 12, padding: "8px 14px 8px 10px", borderRadius: 14, background: x.tileBg, border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 1px 0 rgba(255,255,255,.06) inset" }}
            >
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: x.dotBg, boxShadow: x.dotGlow }} />
              <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: x.nameColor }}>{x.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F6F1E6", whiteSpace: "nowrap" }}>
                  {x.local} <span style={{ fontWeight: 400, color: "rgba(246,241,230,.55)" }}>· {x.home}</span>
                </span>
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: x.stateColor, whiteSpace: "nowrap", paddingLeft: 10, borderLeft: "1px solid rgba(232,207,131,.25)" }}>{x.state}</span>
            </li>
          ))}
        </ul>
      </div>
      <a
        href={zoom.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="home-zoom"
        style={{ flex: compact ? "1 1 100%" : "none", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 10, minHeight: 44, padding: "0 18px 0 14px", borderRadius: 999, background: "linear-gradient(90deg,#E8CF83,#C9A24A)", fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 8px 22px -8px rgba(201,162,74,.6)" }}
      >
        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: "#14241C", boxShadow: "0 0 0 3px rgba(20,36,28,.18)" }} />
        <span style={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "left" }}>
          <span>Join on Zoom</span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", color: "#3E2E0E" }}>
            ID {zoom.id || ""} · Passcode {zoom.passcode || ""}
          </span>
        </span>
      </a>
    </footer>
  );
}
