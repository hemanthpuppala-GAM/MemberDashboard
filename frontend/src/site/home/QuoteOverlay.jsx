import { useEffect, useRef, useState } from "react";
import { quoteDay } from "./dailyQuote";

const BTN = { height: 44, padding: "0 18px", borderRadius: 999, border: "1px solid rgba(201,162,74,.6)", background: "rgba(20,36,28,.7)", color: "#E8CF83", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" };

/** Full Daily Musings poster: ‹ › (or ← →) through earlier days, Share, Esc / backdrop / × close. */
export default function QuoteOverlay({ quotes, onClose }) {
  const [i, setI] = useState(0);
  const closeBtn = useRef(null);
  const q = quotes[i];
  const older = i < quotes.length - 1;
  const newer = i > 0;

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setI((n) => Math.min(n + 1, quotes.length - 1));
      else if (e.key === "ArrowRight") setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, quotes.length]);

  const share = async (e) => {
    e.stopPropagation();
    const text = [q.title, q.text, q.author && `— ${q.author}`].filter(Boolean).join("\n\n") || "Golden Age Daily Musings";
    try {
      // Share the poster itself where the browser can (phones); else the link.
      const blob = await fetch(q.image_url).then((r) => (r.ok ? r.blob() : null)).catch(() => null);
      const file = blob && new File([blob], `daily-musings-${q.show_on}.${blob.type.includes("png") ? "png" : "jpg"}`, { type: blob.type });
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text });
      else if (navigator.share) await navigator.share({ title: "Golden Age Daily Musings", text, url: window.location.href });
      else window.open(q.image_url, "_blank", "noopener");
    } catch {
      /* share sheet closed */
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quote of the day"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "clamp(12px,3vw,32px)", background: "rgba(10,18,14,.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", animation: "gaw-rise .3s both" }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, maxWidth: "100%", flex: "0 1 auto" }}>
        <img
          key={q.id}
          src={q.image_url}
          alt={[q.title, q.text, q.author && `— ${q.author}`].filter(Boolean).join(". ") || "Quote of the day"}
          style={{ display: "block", maxWidth: "min(560px,100%)", maxHeight: "calc(100dvh - 140px)", width: "auto", height: "auto", borderRadius: 14, boxShadow: "0 0 0 1px rgba(201,162,74,.5),0 40px 90px -30px rgba(0,0,0,.8)", animation: "gaw-rise .35s both" }}
        />
      </div>
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 10, color: "#E8CF83", flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" className="home-film-btn" aria-label="Previous day" disabled={!older} onClick={() => setI(i + 1)} style={{ ...BTN, width: 44, padding: 0, opacity: older ? 1 : 0.35 }}>‹</button>
        <span style={{ minWidth: 150, textAlign: "center", fontSize: 12.5, fontWeight: 600, letterSpacing: ".06em" }}>{i === 0 ? "Today" : quoteDay(q.show_on)}</span>
        <button type="button" className="home-film-btn" aria-label="Next day" disabled={!newer} onClick={() => setI(i - 1)} style={{ ...BTN, width: 44, padding: 0, opacity: newer ? 1 : 0.35 }}>›</button>
        <button type="button" className="home-film-btn" onClick={share} style={BTN}>Share</button>
      </div>
      <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className="home-film-btn" style={{ ...BTN, position: "absolute", top: 12, right: 12, width: 44, padding: 0, fontSize: 18, letterSpacing: 0 }}>
        ×
      </button>
    </div>
  );
}
