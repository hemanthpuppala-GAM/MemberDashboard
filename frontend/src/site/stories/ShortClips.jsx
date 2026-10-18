import { useRef, useState } from "react";
import StoriesViewer from "./StoriesViewer";
import { useChannelShorts } from "./stories";
import "./stories.css";

/**
 * "Short clips": every Short on the YouTube channel, newest first, in one sideways row.
 * Tap one and the full-screen player rolls on from there to the older clips.
 * Renders nothing until the channel's Shorts load (or if they can't be read).
 */
export default function ShortClips({ title, intro, joinTo = "/join", ctaLabel, shorts: given }) {
  const fetched = useChannelShorts(!given);
  const shorts = given || fetched;
  const [at, setAt] = useState(null);
  const row = useRef(null);
  if (!shorts.length) return null;

  const scroll = (dir) => {
    const el = row.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id="clips" aria-labelledby="short-clips-title" className="short-clips">
      <header className="short-clips-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <h2 id="short-clips-title" className="serif">{title}</h2>
          {intro ? <p>{intro}</p> : null}
        </div>
        <div className="short-clips-arrows">
          <button type="button" onClick={() => scroll(-1)} aria-label="Scroll to newer clips">‹</button>
          <button type="button" onClick={() => scroll(1)} aria-label="Scroll to older clips">›</button>
        </div>
      </header>
      <div ref={row} className="short-clips-row">
        {shorts.map((s, i) => (
          <button key={s.id} type="button" className="short-clip" onClick={() => setAt(i)} aria-label={`Play: ${s.name}`}>
            <span className="short-clip-thumb">
              <img src={s.photo_path} alt="" loading="lazy" />
              <span aria-hidden="true" className="short-clip-play">▶</span>
              {i === 0 ? <span className="short-clip-new">New</span> : null}
            </span>
            <span className="short-clip-title">{s.name}</span>
          </button>
        ))}
      </div>
      {at !== null ? <StoriesViewer stories={shorts} start={at} onClose={() => setAt(null)} joinTo={joinTo} label={title} ctaLabel={ctaLabel} /> : null}
    </section>
  );
}
