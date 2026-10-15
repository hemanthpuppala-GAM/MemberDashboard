import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import home from "./content/home.json";
import about from "./content/about.json";
import mission from "./content/mission.json";
import meditation from "./content/meditation.json";
import wisdom from "./content/wisdom.json";
import wellness from "./content/wellness.json";
import events from "./content/events.json";
import volunteer from "./content/volunteer.json";
import donate from "./content/donate.json";

/**
 * Offline fallback copy per page. The backend owns the content (backend/resources/site-content
 * + Admin edits) and GET /site-content/{page} always returns the full page; these bundled files
 * only cover first paint and a backend outage. Keep them identical to the backend copies —
 * backend SiteContentTest fails if they drift.
 */
export const SITE_DEFAULTS = { home, about, mission, meditation, wisdom, wellness, events, volunteer, donate };

export function fetchPublishedContent(page) {
  return apiFetch(`/site-content/${page}`, { auth: false }).then((r) => r?.data ?? null);
}

/**
 * Page copy = the backend's full page (GET /site-content/{page}: defaults + admin edits),
 * over the bundled fallback while it loads.
 */
export function useSiteContent(page, fallbacks = {}) {
  const [published, setPublished] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchPublishedContent(page)
      .then((data) => alive && setPublished(data))
      .catch(() => {}); // offline / backend down → defaults
    return () => {
      alive = false;
    };
  }, [page]);

  return { ...fallbacks, ...SITE_DEFAULTS[page], ...(published || {}) };
}
