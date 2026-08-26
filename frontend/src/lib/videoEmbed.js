/** Converts a YouTube/Vimeo watch/share URL into its embeddable iframe-src form, or null if unrecognized. */
export function toEmbedUrl(url) {
  let u;
  try {
    u = new URL(url.trim());
  } catch {
    // Tolerate a link pasted without "https://", e.g. "www.youtube.com/watch?v=...".
    try {
      u = new URL(`https://${url.trim()}`);
    } catch {
      return null;
    }
  }

  if (u.hostname === "youtu.be") {
    const id = u.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (u.hostname.includes("youtube.com")) {
    const watchId = u.searchParams.get("v");
    if (watchId) return `https://www.youtube.com/embed/${watchId}`;

    // Covers /live/ID, /shorts/ID, and already-embed /embed/ID links.
    const match = u.pathname.match(/^\/(?:live|shorts|embed)\/([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  if (u.hostname.includes("vimeo.com")) {
    return `https://player.vimeo.com/video${u.pathname}`;
  }

  return null;
}
