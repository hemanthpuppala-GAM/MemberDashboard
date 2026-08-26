import { useEffect, useState } from "react";
import { publicApi } from "../lib/api";
import { useLanguage } from "../lib/LanguageContext";

/**
 * Session-lived cache + in-flight dedup, keyed by slug. A page like Meditate
 * renders 5+ independent CMS section components, each calling usePage(slug)
 * for the same data — without this, that's 5+ duplicate GET /pages/{slug}
 * requests (10+ once React StrictMode's double-invoke is in the mix), which
 * a single-worker dev server serializes into several seconds of skeleton
 * state. Cleared only by a full page reload; admin edits are picked up on
 * the visitor's next visit, which is an acceptable tradeoff for public copy.
 */
const pageCache = new Map();
const pendingFetches = new Map();

function fetchPage(slug, lang) {
  const cacheKey = `${lang}:${slug}`;
  if (pageCache.has(cacheKey)) return Promise.resolve(pageCache.get(cacheKey));
  if (pendingFetches.has(cacheKey)) return pendingFetches.get(cacheKey);

  const request = publicApi
    .page(slug, lang)
    .then((data) => {
      pageCache.set(cacheKey, data);
      return data;
    })
    .finally(() => {
      pendingFetches.delete(cacheKey);
    });

  pendingFetches.set(cacheKey, request);
  return request;
}

/**
 * Loads a CMS page (admin-editable via /admin/cms/pages) by slug, in the
 * visitor's currently selected language. No hardcoded fallback content —
 * callers render a loading/empty state instead, so the admin panel is the
 * single source of truth for copy.
 */
export function usePage(slug) {
  const { language } = useLanguage();
  const cacheKey = `${language}:${slug}`;
  const [page, setPage] = useState(() => pageCache.get(cacheKey) ?? null);
  const [loading, setLoading] = useState(!pageCache.has(cacheKey));

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the spinner when the slug/language changes; a no-op when already loading (initial mount) or already cached (settles next tick)
    setLoading(!pageCache.has(cacheKey));

    fetchPage(slug, language)
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch(() => {
        if (!cancelled) setPage(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, language, cacheKey]);

  return { page, loading };
}

/** Convenience: the fields of a page's first section of the given type. */
export function useSectionFields(slug, type) {
  const { page, loading } = usePage(slug);
  const section = page?.sections?.find((s) => s.type === type);
  return { fields: section?.fields ?? null, loading };
}
