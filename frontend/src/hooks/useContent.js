import { useEffect, useState } from "react";
import { publicApi } from "../lib/api";

/**
 * Loads an editable content block from the admin API, falling back to the
 * given static copy if the API is unreachable or the slug isn't seeded yet
 * — the public site must never go blank because the backend is down.
 */
export function useContent(slug, fallback) {
  const [content, setContent] = useState(fallback);

  useEffect(() => {
    let cancelled = false;

    publicApi
      .contentBySlug(slug)
      .then((data) => {
        if (cancelled || !data) return;
        setContent({
          eyebrow: data.eyebrow,
          title: data.title,
          description: data.description,
          points: data.points?.length ? data.points : fallback.points,
          cta:
            data.cta_label && data.cta_href
              ? { label: data.cta_label, href: data.cta_href, variant: data.cta_variant ?? undefined }
              : fallback.cta,
          reverse: data.reverse ?? fallback.reverse ?? false,
        });
      })
      .catch(() => {
        // API unreachable — keep showing the fallback copy.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return content;
}
