import Reveal from "../ui/Reveal";
import { SECTION_CLASS, SUBHEADING_CLASS } from "../ui/sectionStyles";
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
    <section className={`flex flex-col gap-6 ${SECTION_CLASS}`}>
      {fields.heading && <h3 className={SUBHEADING_CLASS}>{fields.heading}</h3>}
      {videos.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {videos.map((video, i) => (
            <Reveal key={i} animation={fields.animation} className="flex flex-col gap-2">
              <div className="zoom-frame aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(80,65,40,0.05),0_12px_28px_-10px_rgba(80,65,40,0.16)] transition-all duration-300 hover:border-[rgba(198,161,91,0.5)] hover:shadow-[0_2px_4px_rgba(80,65,40,0.06),0_24px_44px_-12px_rgba(80,65,40,0.22)]">
                <iframe
                  src={video.embedUrl}
                  title={video.title || fields.heading || `Video ${i + 1}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {video.title && <p className="text-[13.5px] leading-relaxed text-[var(--color-ink-soft)]">{video.title}</p>}
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal animation={fields.animation} className="zoom-frame overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(80,65,40,0.05),0_12px_28px_-10px_rgba(80,65,40,0.16)] transition-all duration-300 hover:border-[rgba(198,161,91,0.5)]">
          <div className={fields.image_shape === "vertical" ? "aspect-[3/4]" : fields.image_shape === "circle" ? "mx-auto aspect-square max-w-[320px]" : "aspect-video"}>
            <img src={fields.image} alt={fields.heading || ""} className="h-full w-full object-cover" />
          </div>
        </Reveal>
      )}
    </section>
  );
}
