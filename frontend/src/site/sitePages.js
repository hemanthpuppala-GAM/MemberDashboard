/** Header page links, identical on Home and every sub-page (design: content.subPages). */
export const SITE_PAGES = [
  { key: "about", label: "About", to: "/about" },
  { key: "mission", label: "Mission", to: "/mission" },
  { key: "teachings", label: "Teachings", to: "/#teachings" },
  { key: "meditation", label: "Meditation", to: "/meditation" },
  { key: "wisdom", label: "Wisdom", to: "/wisdom" },
  { key: "wellness", label: "Wellness", to: "/wellness" },
  { key: "events", label: "Events", to: "/events" },
];

/** Utility row above the header (≥900px) / inside the hamburger menu (<900px). */
export const UTILITY_LINKS = [
  { label: "Member support", to: "/ask" },
  { label: "Volunteer", to: "/volunteer" },
  { label: "Privacy", to: "/privacy" },
];

/** Pages whose copy is editable at /admin/content/{page}. */
export const EDITABLE_PAGES = ["home", "about", "mission", "meditation", "wisdom", "wellness", "events"];

export const OFFICIAL_EMAIL = "goldenageguruteachings@gmail.com";
export const YOUTUBE_URL = "https://www.youtube.com/@GoldenAgeGurus";
