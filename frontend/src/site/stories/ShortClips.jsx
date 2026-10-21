import { useRef } from "react";
import { useChannelShorts } from "./stories";
import { YOUTUBE_SUBSCRIBE_URL, YOUTUBE_URL } from "../sitePages";
import "./stories.css";

/** How many clips each row shows; the rest are a tap away on YouTube. */
const PER_ROW = 6;

/** YouTube's play mark, for the links that leave the site for the channel. */
export function YouTubeMark({ size = 16 }) {
  return (
    <svg aria-hidden="true" width={size} height={(size * 7) / 10} viewBox="0 0 20 14" style={{ flex: "none" }}>
      <rect width="20" height="14" rx="3.5" fill="#FF0033" />
      <path d="M8 4v6l5.2-3z" fill="#fff" />
    </svg>
  );
}

/** One sideways row of clips; each opens on YouTube (the app on phones), and the row ends with "See all". */
function ClipRow({ label, link, clips, markNew }) {
  const row = useRef(null);
  const scroll = (dir) => {
    const el = row.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div className="short-clips-group">
      <div className="short-clips-rowhead">
        <h3>{label}</h3>
        <a href={link} target="_blank" rel="noopener noreferrer" className="short-clips-all">
          See all on YouTube <span aria-hidden="true">↗</span>
        </a>
        <div className="short-clips-arrows">
          <button type="button" onClick={() => scroll(-1)} aria-label={`${label}: scroll back`}>‹</button>
          <button type="button" onClick={() => scroll(1)} aria-label={`${label}: scroll on`}>›</button>
        </div>
      </div>
      <div ref={row} className="short-clips-row">
        {clips.slice(0, PER_ROW).map((s, i) => (
          <a key={s.id} href={s.video_url} target="_blank" rel="noopener noreferrer" className="short-clip" aria-label={`Watch on YouTube: ${s.name}`}>
            <span className="short-clip-thumb">
              <img src={s.photo_path} alt="" loading="lazy" />
              <span aria-hidden="true" className="short-clip-play">
                <YouTubeMark size={30} />
              </span>
              {markNew && i === 0 ? <span className="short-clip-new">New</span> : null}
            </span>
            <span className="short-clip-title">{s.name}</span>
          </a>
        ))}
        <a href={link} target="_blank" rel="noopener noreferrer" className="short-clip short-clip-more">
          <span className="short-clip-thumb">
            <YouTubeMark size={40} />
            <span>See all on YouTube</span>
          </span>
        </a>
      </div>
    </div>
  );
}

/**
 * "Short clips": the newest Shorts, then one row per topic playlist chosen in Admin → Site content →
 * Meditation. Shorts belong to YouTube: each clip opens there (the app on phones), where a like,
 * comment or subscribe is one tap and counts for the channel.
 * Renders nothing until the channel's Shorts load (or if they can't be read).
 */
export default function ShortClips({ title, intro, shorts: given, topics = [] }) {
  const fetched = useChannelShorts(!given);
  const shorts = given || fetched;
  const rows = [...(shorts.length ? [{ title: "Newest", clips: shorts, url: `${YOUTUBE_URL}/shorts`, markNew: true }] : []), ...topics];
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
        <ClipRow key={r.title} label={r.title} link={r.url} clips={r.clips} markNew={r.markNew} />
      ))}
    </section>
  );
}
