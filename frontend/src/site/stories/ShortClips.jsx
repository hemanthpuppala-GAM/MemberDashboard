import { useRef, useState } from "react";
import StoriesViewer from "./StoriesViewer";
import { useChannelShorts } from "./stories";
import { YOUTUBE_SUBSCRIBE_URL } from "../sitePages";
import "./stories.css";

/** YouTube's play mark, for the links that leave the site for the channel. */
export function YouTubeMark({ size = 16 }) {
  return (
    <svg aria-hidden="true" width={size} height={(size * 7) / 10} viewBox="0 0 20 14" style={{ flex: "none" }}>
      <rect width="20" height="14" rx="3.5" fill="#FF0033" />
      <path d="M8 4v6l5.2-3z" fill="#fff" />
    </svg>
  );
}

/** One sideways row of clips with its own arrows; tapping a clip plays that row from there. */
function ClipRow({ label, link, clips, onPlay, markNew }) {
  const row = useRef(null);
  const scroll = (dir) => {
    const el = row.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className="short-clips-group">
      <div className="short-clips-rowhead">
        <h3>{label}</h3>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="short-clips-all">
            See all on YouTube <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        <div className="short-clips-arrows">
          <button type="button" onClick={() => scroll(-1)} aria-label={`${label}: scroll back`}>‹</button>
          <button type="button" onClick={() => scroll(1)} aria-label={`${label}: scroll on`}>›</button>
        </div>
      </div>
      <div ref={row} className="short-clips-row">
        {clips.map((s, i) => (
          <button key={s.id} type="button" className="short-clip" onClick={() => onPlay(i)} aria-label={`Play: ${s.name}`}>
            <span className="short-clip-thumb">
              <img src={s.photo_path} alt="" loading="lazy" />
              <span aria-hidden="true" className="short-clip-play">▶</span>
              {markNew && i === 0 ? <span className="short-clip-new">New</span> : null}
            </span>
            <span className="short-clip-title">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * "Short clips": the channel's Shorts, newest first, then one row per topic playlist chosen in
 * Admin → Site content → Meditation. Clips play here (in YouTube's own player, so plays reach the
 * channel), and every clip offers Like & comment, Subscribe and the full video on YouTube.
 * Renders nothing until the channel's Shorts load (or if they can't be read).
 */
export default function ShortClips({ title, intro, shorts: given, topics = [] }) {
  const fetched = useChannelShorts(!given);
  const shorts = given || fetched;
  const [playing, setPlaying] = useState(null); // { clips, at, label }
  const rows = [...(shorts.length ? [{ title: "Newest", clips: shorts, markNew: true }] : []), ...topics];
  if (!rows.length) return null;

  return (
    <section id="clips" aria-labelledby="short-clips-title" className="short-clips">
      <header className="short-clips-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <h2 id="short-clips-title" className="serif">{title}</h2>
          {intro ? <p>{intro}</p> : null}
        </div>
        <a href={YOUTUBE_SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" className="short-clips-subscribe">
          <YouTubeMark size={18} /> Subscribe on YouTube
        </a>
      </header>
      {rows.map((r) => (
        <ClipRow key={r.title} label={r.title} link={r.url} clips={r.clips} markNew={r.markNew} onPlay={(at) => setPlaying({ clips: r.clips, at, label: r.title === "Newest" ? title : r.title })} />
      ))}
      {playing ? <StoriesViewer stories={playing.clips} start={playing.at} onClose={() => setPlaying(null)} label={playing.label} youtubeActions /> : null}
    </section>
  );
}
