import { useCallback, useEffect, useState } from "react";
import { publicApi } from "../../lib/api";

const SEEN_KEY = "gaw_seen_stories";

/** "Seeker stories": video testimonials from CMS → Testimonials (published, with a video). */
export function useVideoStories() {
  const [stories, setStories] = useState([]);
  useEffect(() => {
    let live = true;
    publicApi
      .videoStories()
      .then((list) => live && Array.isArray(list) && setStories(list.filter((s) => s.video_url)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return stories;
}

/** A channel video shaped like a story; `full_url` is the long video its description points to. */
const toClip = (v) => ({ id: `yt-${v.id}`, name: v.title, role: null, place: null, photo_path: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, quote: "", video_url: v.url, full_url: v.full_url || null, published: v.published });

/** Every Short on the channel (wisdom clips + testimonials), newest first, shaped like stories. */
export function useChannelShorts(enabled = true) {
  const [shorts, setShorts] = useState([]);
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    publicApi
      .channelShorts()
      .then((list) => live && Array.isArray(list) && setShorts(list.map(toClip)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [enabled]);
  return shorts;
}

/** Topic rows (YouTube playlists picked in Admin → Site content → Meditation): [{ title, url, clips }]. */
export function useClipTopics() {
  const [topics, setTopics] = useState([]);
  useEffect(() => {
    let live = true;
    publicApi
      .clipTopics()
      .then((list) => live && Array.isArray(list) && setTopics(list.map((t) => ({ title: t.title, url: t.url, clips: (t.items || []).map(toClip) })).filter((t) => t.clips.length)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return topics;
}

function readSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

/** Which stories this visitor has already watched (rings turn grey, like on WhatsApp / Instagram). */
export function useSeenStories() {
  const [seen, setSeen] = useState(readSeen);
  const markSeen = useCallback((id) => {
    setSeen((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...next].slice(-200)));
      } catch {
        /* private mode */
      }
      return next;
    });
  }, []);
  return [seen, markSeen];
}

/** YouTube video id from watch / youtu.be / shorts / embed links, else null. */
export function youTubeId(url = "") {
  const m = String(url).match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
  return m ? m[1] : null;
}

/** Picture for a story ring: the testimonial photo, else the YouTube thumbnail. */
export function storyThumb(s) {
  if (s.photo_path) return s.photo_path;
  const id = youTubeId(s.video_url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
