import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { initials, storyThumb, youTubeId } from "./stories";

/**
 * Full-screen "Seeker stories" player, like phone stories: a progress bar per story, tap the
 * right edge for the next one and the left edge for the previous one, swipe down or Esc to close.
 * Uploaded videos and YouTube links both move on to the next story when they end.
 */
export default function StoriesViewer({ stories, start = 0, onClose, onSeen, onIndex, joinTo = "/join", label = "Seeker stories", ctaLabel = "Start your own story — free" }) {
  const [i, setI] = useState(start);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const video = useRef(null);
  const closeBtn = useRef(null);
  const frame = useRef(null);
  const touch = useRef(null);
  const s = stories[i];
  const yt = youTubeId(s?.video_url);

  const go = useCallback(
    (n) => {
      if (n < 0) return;
      if (n >= stories.length) return onClose();
      setProgress(0);
      setI(n);
    },
    [stories.length, onClose],
  );

  useEffect(() => {
    if (!s) return;
    onSeen?.(s.id);
    onIndex?.(i);
  }, [i, s, onSeen, onIndex]);

  // Play with sound when the browser allows it; otherwise (e.g. opened from a shared link,
  // no tap yet) play muted and offer "Tap for sound". Once unmuted, later stories keep sound.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  }, [i, muted]);

  const unmute = (e) => {
    e.stopPropagation();
    setMuted(false);
    const v = video.current;
    if (v) {
      v.muted = false;
      v.play().catch(() => {});
    }
  };

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, onClose]);

  // YouTube: listen to the embedded player's own messages for progress and "ended".
  useEffect(() => {
    if (!yt) return undefined;
    const onMsg = (e) => {
      if (!/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(e.origin)) return;
      let d;
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      const info = d?.info;
      if (d?.event === "onStateChange" && info === 0) go(i + 1);
      if (d?.event === "infoDelivery" && info) {
        if (info.playerState === 0) go(i + 1);
        if (info.duration > 0 && typeof info.currentTime === "number") setProgress(Math.min(1, info.currentTime / info.duration));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [yt, i, go]);

  const ytLoaded = () => {
    // Ask the player to send its state (the YouTube iframe API handshake, without loading the API script).
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const t0 = touch.current;
    if (!t0) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - t0.x;
    const dy = t.clientY - t0.y;
    touch.current = null;
    if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
    else if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? i + 1 : i - 1);
  };

  if (!s) return null;
  const thumb = storyThumb(s);
  const sub = [s.role, s.place].filter(Boolean).join(" · ");

  return (
    <div className="story-viewer" role="dialog" aria-modal="true" aria-label={`${label} — ${s.name}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="story-stage">
        {/* Progress — one bar per story */}
        <div className="story-bars" aria-hidden="true">
          {stories.map((x, n) => (
            <span key={x.id} className="story-bar">
              <span style={{ width: n < i ? "100%" : n === i ? `${Math.round(progress * 100)}%` : "0%" }} />
            </span>
          ))}
        </div>

        <header className="story-head">
          <span className="story-face" style={{ width: 38, height: 38 }}>
            <span className="story-face-inner">{thumb ? <img src={thumb} alt="" /> : <span className="serif">{initials(s.name)}</span>}</span>
          </span>
          <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <strong className="story-title" style={{ fontSize: 14, color: "#F6F1E6" }}>{s.name}</strong>
            {sub ? <span style={{ fontSize: 12, color: "rgba(246,241,230,.75)" }}>{sub}</span> : null}
          </span>
          <button ref={closeBtn} type="button" className="story-close" onClick={onClose} aria-label="Close stories">
            ×
          </button>
        </header>

        <div className="story-video" key={s.id}>
          {yt ? (
            <iframe
              ref={frame}
              title={`${s.name} — video testimonial`}
              src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={ytLoaded}
            />
          ) : (
            <video
              ref={video}
              src={s.video_url}
              playsInline
              controls
              onTimeUpdate={(e) => e.currentTarget.duration && setProgress(e.currentTarget.currentTime / e.currentTarget.duration)}
              onEnded={() => go(i + 1)}
            />
          )}
        </div>

        {muted && !yt ? (
          <button type="button" className="story-sound" onClick={unmute}>
            <span aria-hidden="true">🔊</span> Tap for sound
          </button>
        ) : null}

        {/* Edge tap zones — the middle stays free for the player's own controls */}
        <button type="button" className="story-tap story-tap-prev" aria-label="Previous story" disabled={i === 0} onClick={() => go(i - 1)}>
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" className="story-tap story-tap-next" aria-label={i === stories.length - 1 ? "Close stories" : "Next story"} onClick={() => go(i + 1)}>
          <span aria-hidden="true">›</span>
        </button>

        <footer className="story-foot">
          {s.quote ? <p className="serif">“{s.quote.replace(/^[“"]|[”"]$/g, "")}”</p> : null}
          <Link to={joinTo} className="gaw-pill-gold story-join" onClick={onClose}>
            {ctaLabel}
          </Link>
        </footer>
      </div>
    </div>
  );
}
