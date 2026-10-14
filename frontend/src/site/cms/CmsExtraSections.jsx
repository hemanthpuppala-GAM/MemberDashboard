import { useEffect, useState } from "react";
import { publicApi } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";
import SiteCmsSection from "./SiteCmsSection";

const cache = new Map(); // `${lang}:${slug}` -> sections[]

/**
 * Sections added in Admin → CMS → Pages under a hand-built page (About, Wisdom, …). Renders
 * nothing until they load, when there are none, or if the backend is down — the page above
 * never waits on or breaks because of it. The page's own hero stays; a CMS "hero" is skipped.
 */
export default function CmsExtraSections({ slug }) {
  const { language } = useLanguage();
  const key = `${language}:${slug}`;
  const [, setLoaded] = useState(0); // bumped when a fetch lands; the list itself lives in `cache`
  const sections = cache.get(key) || [];

  useEffect(() => {
    if (cache.has(key)) return undefined;
    let live = true;
    publicApi
      .siteSections(slug, language)
      .then((page) => cache.set(key, (page?.sections || []).filter((s) => s.type !== "hero")))
      .catch(() => cache.set(key, []))
      .finally(() => live && setLoaded((n) => n + 1));
    return () => {
      live = false;
    };
  }, [key, slug, language]);

  if (!sections.length) return null;
  return (
    <div className="cms-extra" style={{ display: "flex", flexDirection: "column" }}>
      {sections.map((s) => (
        <div key={s.id} id={`cms-section-${s.id}`}>
          <SiteCmsSection section={s} />
        </div>
      ))}
    </div>
  );
}
