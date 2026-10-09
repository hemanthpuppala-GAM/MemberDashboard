import { useEffect, useRef, useState } from "react";
import { siteAsset } from "../siteAssets";

/** Peace film in a modal: muted autoplay (so browsers allow it) + "Tap for sound". Esc / backdrop / × close. */
export default function FilmOverlay({ src, onClose }) {
  const vid = useRef(null);
  const closeBtn = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = vid.current;
    closeBtn.current?.focus({ preventScroll: true });
    if (!el) return undefined;
    el.muted = true;
    el.play().catch(() => {});
    // Some browsers stall on frame 0 — nudge once, as the design does.
    const t = setTimeout(() => {
      if (el.currentTime === 0 && !el.paused) {
        el.currentTime = 0.05;
        el.play().catch(() => {});
      }
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const unmute = (e) => {
    e.stopPropagation();
    const v = vid.current;
    if (v) {
      v.muted = false;
      v.play().catch(() => {});
    }
    setMuted(false);
  };

  return (
    <div
      id="film"
      role="dialog"
      aria-modal="true"
      aria-label="Intro film"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px,3vw,40px)", background: "rgba(10,18,14,.9)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", animation: "gaw-rise .3s both" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "min(1100px,100%)", aspectRatio: "16/9", borderRadius: 18, overflow: "hidden", background: "#000", boxShadow: "0 0 0 1px rgba(201,162,74,.5),0 40px 90px -30px rgba(0,0,0,.8)" }}
      >
        <video
          ref={vid}
          src={siteAsset(src)}
          controls
          autoPlay
          playsInline
          muted={muted}
          preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", background: "#000" }}
        />
        {muted && (
          <button
            type="button"
            onClick={unmute}
            className="home-film-btn"
            style={{ position: "absolute", left: "50%", bottom: 72, transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 10, height: 44, padding: "0 20px", borderRadius: 999, border: "1px solid rgba(201,162,74,.7)", background: "rgba(20,36,28,.85)", color: "#E8CF83", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 12px 30px -10px rgba(0,0,0,.6)" }}
          >
            <span aria-hidden="true">🔊</span> Tap for sound
          </button>
        )}
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close film"
          className="home-film-btn"
          style={{ position: "absolute", top: 12, right: 12, width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(201,162,74,.6)", background: "rgba(20,36,28,.7)", color: "#E8CF83", fontSize: 18, lineHeight: 1, cursor: "pointer", fontFamily: "inherit" }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
