import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { initials, storyThumb, youTubeId } from "./stories";
import { YOUTUBE_SUBSCRIBE_URL } from "../sitePages";

const RailIcon = ({ d }) => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

/**
 * Full-screen "Seeker stories" player, like phone stories: a progress bar per story, tap the
 * right edge for the next one and the left edge for the previous one, swipe down or Esc to close.
 * Uploaded videos and YouTube links both move on to the next story when they end.
 * `youtubeActions`: channel clips get a Shorts-style rail (Like, Comment, Share, Subscribe) and a
 * "Watch the full video" link when the Short's description points to one.
 */
export default function StoriesViewer({ stories, start = 0, onClose, onSeen, onIndex, label = "Seeker stories", youtubeActions = false }) {
  const [i, setI] = useState(start);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [shared, setShared] = useState(false); // "Link copied" after Share on a computer
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

  // Leaving for YouTube: pause here so the clip doesn't keep playing behind the YouTube tab.
  const pauseYt = () => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "*");

  // Share: the phone's share sheet (WhatsApp, …); on a computer, copy the YouTube link.
  const share = async () => {
    const url = s.video_url;
    try {
      if (navigator.share) return await navigator.share({ title: s.name, url });
    } catch (err) {
      if (err?.name === "AbortError") return undefined;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2200);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${s.name} ${url}`)}`, "_blank", "noopener");
    }
    return undefined;
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

  // Rendered at the site root: an animated ancestor (the chapter panels keep a `translate`) would
  // otherwise become the containing block and the full-screen player would sit inside it.
  return createPortal(
    <div className="story-viewer" role="dialog" aria-modal="true" aria-label={`${label} — ${s.name}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button type="button" className="story-side story-side-prev" aria-label="Previous story" disabled={i === 0} onClick={() => go(i - 1)}>
        <span aria-hidden="true">‹</span>
      </button>
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
          {youtubeActions && yt ? (
            // Shorts-style actions, always shown: YouTube decides whether its own embed shows a like
            // button, so these take viewers to the clip on YouTube, where likes and comments count.
            <nav className="story-rail" aria-label="On YouTube">
              <a href={s.video_url} target="_blank" rel="noopener noreferrer" onClick={pauseYt}>
                <span className="story-rail-btn"><RailIcon d="M7 10v11M2 11.5A1.5 1.5 0 0 1 3.5 10H7v11H3.5A1.5 1.5 0 0 1 2 19.5zM7 10l4.3-7.2a1.7 1.7 0 0 1 3.1 1.2L13.6 9H19a2 2 0 0 1 2 2.3l-1.3 7.6A2.5 2.5 0 0 1 17.2 21H7" /></span>
                Like
              </a>
              <a href={`https://www.youtube.com/watch?v=${yt}`} target="_blank" rel="noopener noreferrer" onClick={pauseYt}>
                <span className="story-rail-btn"><RailIcon d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.5-5.2A8.5 8.5 0 1 1 21 12z" /></span>
                Comment
              </a>
              <button type="button" onClick={share}>
                <span className="story-rail-btn"><RailIcon d="M14 4l7 7-7 7M21 11h-9a8 8 0 0 0-8 8v1" /></span>
                {shared ? "Copied" : "Share"}
              </button>
              <a href={YOUTUBE_SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" onClick={pauseYt} className="story-rail-sub">
                <span className="story-rail-btn"><RailIcon d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" /></span>
                Subscribe
              </a>
            </nav>
          ) : null}
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

        {/* Edge tap zones — the middle stays free for the player's own controls. On YouTube clips they
            stop halfway down, clear of the action rail and YouTube's own buttons below. */}
        <button type="button" className={`story-tap story-tap-prev${yt ? " story-tap-yt" : ""}`} aria-label="Previous story" disabled={i === 0} onClick={() => go(i - 1)}>
          <span aria-hidden="true">‹</span>
        </button>
        <button type="button" className={`story-tap story-tap-next${yt ? " story-tap-yt" : ""}`} aria-label={i === stories.length - 1 ? "Close stories" : "Next story"} onClick={() => go(i + 1)}>
          <span aria-hidden="true">›</span>
        </button>

        {s.quote || (youtubeActions && yt && s.full_url) ? (
          <footer className="story-foot">
            {s.quote ? <p className="serif">“{s.quote.replace(/^[“"]|[”"]$/g, "")}”</p> : null}
            {youtubeActions && yt && s.full_url ? (
              <a href={s.full_url} target="_blank" rel="noopener noreferrer" onClick={pauseYt} className="story-full">
                <span aria-hidden="true">▶</span> Watch the full video on YouTube
              </a>
            ) : null}
          </footer>
        ) : null}
      </div>

      {/* Bigger screens: previous / next beside the player, clear of the video and YouTube's own buttons. */}
      <button type="button" className="story-side story-side-next" aria-label={i === stories.length - 1 ? "Close stories" : "Next story"} onClick={() => go(i + 1)}>
        <span aria-hidden="true">›</span>
      </button>
    </div>,
    document.querySelector(".gaw-site") || document.body,
  );
}
