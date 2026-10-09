import { useEffect, useMemo, useState } from "react";
import { siteAsset } from "../siteAssets";
import { computeSits, sitsSummary } from "./sits";

const FADE = (a, b) => `linear-gradient(90deg,transparent,#000 ${a}%,#000 ${b}%,transparent)`;

/** Live schedule from content.sessions, re-computed every 30s (as the design's _tick). */
export function useSits(sessions) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    const sits = computeSits(sessions, now);
    return { sits, loop: sits.length ? sits.concat(sits) : [], ...sitsSummary(sits) };
  }, [sessions, now]);
}

/** Desktop footer band "Meditations around the world" (#world-sits). */
export function WorldSitsFooter({ c, s }) {
  const zoom = c.zoom || {};
  return (
    <footer
      id="world-sits"
      aria-label="Meditations around the world"
      style={{ position: "relative", zIndex: 6, order: 4, width: "100%", display: "flex", alignItems: "center", gap: "clamp(16px,2vw,28px)", padding: "12px clamp(24px,5vw,72px) 10px", borderTop: "1px solid rgba(232,207,131,.18)", background: "linear-gradient(180deg,#1B3328 0%,#14241C 100%)", boxShadow: "0 1px 0 rgba(255,255,255,.05) inset", scrollMarginTop: 12 }}
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
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", WebkitMaskImage: FADE(5, 95), maskImage: FADE(5, 95) }}>
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
        style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 10, minHeight: 44, padding: "0 18px 0 14px", borderRadius: 999, background: "linear-gradient(90deg,#E8CF83,#C9A24A)", fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 8px 22px -8px rgba(201,162,74,.6)" }}
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

/** Phone / portrait band under the hero copy: label, status and a sits ticker. Holds #world-sits when the footer is hidden. */
export function PhoneSitsBand({ c, s, phone, withAnchor }) {
  return (
    <div
      id={withAnchor ? "world-sits" : undefined}
      aria-label={withAnchor ? "Meditations around the world" : undefined}
      role={withAnchor ? "region" : undefined}
      style={{ display: "flex", order: 1, position: "relative", zIndex: 5, flex: "none", flexDirection: "column", padding: "0 0 12px", overflow: "hidden", background: "rgba(243,234,211,.92)", scrollMarginTop: 12 }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "4px 12px", padding: "2px 22px 10px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span aria-hidden="true" style={{ flex: "none", width: 18, height: 1, background: "#C9A24A" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: phone ? ".1em" : ".22em", textTransform: "uppercase", color: "#7A5E22", whiteSpace: "nowrap" }}>{c.phoneJoinLabel}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>
          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, boxShadow: s.dotGlow, animation: s.dotAnim }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#3A3128", whiteSpace: "nowrap" }}>{s.statusShort}</span>
        </span>
      </div>
      <div style={{ overflow: "hidden", WebkitMaskImage: FADE(6, 94), maskImage: FADE(6, 94) }}>
        <div className="home-marquee" style={{ display: "flex", gap: 8, width: "max-content", padding: "0 4px", animationDuration: "40s" }}>
          {s.loop.map((x, i) => (
            <span
              key={`${x.name}-${i}`}
              aria-hidden={i >= s.sits.length ? "true" : undefined}
              style={{ flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "rgba(255,253,248,.45)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 8px 20px -10px rgba(60,42,16,.3)" }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: x.dotBg }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#3A3128" }}>{x.name}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#14241C", whiteSpace: "nowrap" }}>{x.local}</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: x.stateColor, whiteSpace: "nowrap" }}>{x.state}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
