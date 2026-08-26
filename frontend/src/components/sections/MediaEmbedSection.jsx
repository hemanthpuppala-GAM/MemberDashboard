import Reveal from "../ui/Reveal";
import { toEmbedUrl } from "../../lib/videoEmbed";

/**
 * One or more embedded videos (YouTube/Vimeo), or a single image — the
 * `media_embed` CMS section type. `fields.video_url` (a single string) is
 * kept as a fallback for sections saved before multi-video support existed;
 * new/edited sections write the plural `fields.videos` array instead.
 */
export default function MediaEmbedSection({ fields }) {
  if (!fields) return null;

  const rawVideos = fields.videos?.length ? fields.videos : fields.video_url ? [{ url: fields.video_url }] : [];
  const videos = rawVideos
    .filter((v) => v?.url)
    .map((v) => ({ ...v, embedUrl: toEmbedUrl(v.url) }))
    .filter((v) => v.embedUrl);

  if (videos.length === 0 && !fields.image) return null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4 px-2 py-6 sm:px-4">
      {fields.heading && (
        <h3 className="text-xl font-medium text-[var(--color-ink)]">{fields.heading}</h3>
      )}
      {videos.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {videos.map((video, i) => (
            <Reveal key={i} animation={fields.animation} className="flex flex-col gap-2">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50">
                <iframe
                  src={video.embedUrl}
                  title={video.title || fields.heading || `Video ${i + 1}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {video.title && <p className="text-sm text-[var(--color-muted)]">{video.title}</p>}
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal animation={fields.animation} className="overflow-hidden rounded-2xl border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50">
          <div className={fields.image_shape === "vertical" ? "aspect-[3/4]" : fields.image_shape === "circle" ? "mx-auto aspect-square max-w-[320px]" : "aspect-video"}>
            <img src={fields.image} alt={fields.heading || ""} className="h-full w-full object-cover" />
          </div>
        </Reveal>
      )}
    </section>
  );
}
