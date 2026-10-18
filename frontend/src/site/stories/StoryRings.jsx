import { initials, storyThumb } from "./stories";

/**
 * Round faces with a gold ring, as in WhatsApp / Instagram stories. Watched ones turn grey.
 * `variant="stack"`: overlapping faces (inside a Home card); `"rail"`: a scrollable row with names.
 */
export default function StoryRings({ stories, seen, onOpen, variant = "stack", max = 4, dark = false }) {
  if (!stories.length) return null;

  if (variant === "rail") {
    return (
      <div className="story-rail" role="list" aria-label="Seeker stories — video testimonials">
        {stories.map((s, i) => (
          <button key={s.id} type="button" role="listitem" className={`story-ring-btn${seen.has(s.id) ? " is-seen" : ""}`} onClick={(e) => onOpen(i, e)} aria-label={`Watch ${s.name}'s story`}>
            <Face s={s} size={62} />
            <span className={`story-ring-name${dark ? " is-dark" : ""}`}>{s.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    );
  }

  const shown = stories.slice(0, max);
  return (
    <span className="story-stack" aria-hidden="true">
      {shown.map((s, i) => (
        <span key={s.id} className={`story-stack-face${seen.has(s.id) ? " is-seen" : ""}`} style={{ zIndex: max - i, marginLeft: i ? -12 : 0 }}>
          <Face s={s} size={38} />
        </span>
      ))}
    </span>
  );
}

function Face({ s, size }) {
  const src = storyThumb(s);
  return (
    <span className="story-face" style={{ width: size, height: size }}>
      <span className="story-face-inner">{src ? <img src={src} alt="" loading="lazy" /> : <span className="serif">{initials(s.name)}</span>}</span>
    </span>
  );
}
