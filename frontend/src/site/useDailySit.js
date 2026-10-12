import homeContent from "./content/home.json";
import { useSiteSettings } from "./usePublicData";

/** The daily sit's Zoom room: admin Settings → Support & Zoom, else the bundled link. */
export function useDailySitUrl() {
  const s = useSiteSettings();
  return (s?.["zoom.url"] || "").trim() || homeContent.zoom?.url || "/events";
}
