import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import home from "./content/home.json";
import about from "./content/about.json";
import mission from "./content/mission.json";
import meditation from "./content/meditation.json";
import wisdom from "./content/wisdom.json";
import wellness from "./content/wellness.json";
import events from "./content/events.json";

/** Default copy per page, straight from the design handoff (design/content/*.json). */
export const SITE_DEFAULTS = { home, about, mission, meditation, wisdom, wellness, events };

export function fetchPublishedContent(page) {
  return apiFetch(`/site-content/${page}`, { auth: false }).then((r) => r?.data ?? null);
}

/**
 * Page copy = bundled defaults (+ optional page-level fallbacks) overlaid with
 * whatever an admin published (GET /site-content/{page}). Renders the defaults
 * immediately; the published record swaps in when it arrives.
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
