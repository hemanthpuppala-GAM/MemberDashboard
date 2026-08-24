import Reveal from "../ui/Reveal";

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
    return null;
  } catch {
    return null;
  }
}

/** Image or embedded video (YouTube/Vimeo) — the `media_embed` CMS section type. */
export default function MediaEmbedSection({ fields }) {
  if (!fields) return null;

  const embedUrl = fields.video_url ? toEmbedUrl(fields.video_url) : null;

  if (!embedUrl && !fields.image) return null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4 px-2 py-6 sm:px-4">
      {fields.heading && (
        <h3 className="text-xl font-medium text-[var(--color-ink)]">{fields.heading}</h3>
      )}
      <Reveal animation={fields.animation} className="overflow-hidden rounded-2xl border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50">
        {embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={fields.heading || "Embedded video"}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={fields.image_shape === "vertical" ? "aspect-[3/4]" : fields.image_shape === "circle" ? "mx-auto aspect-square max-w-[320px]" : "aspect-video"}>
            <img src={fields.image} alt={fields.heading || ""} className="h-full w-full object-cover" />
          </div>
        )}
      </Reveal>
    </section>
  );
}
