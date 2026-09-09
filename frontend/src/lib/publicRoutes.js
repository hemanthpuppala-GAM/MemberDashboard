/**
 * View key (used by Header / mandala / Footer) <-> public URL path.
 * One place to change if a slug is renamed. "hub" is the homepage.
 */
export const VIEW_TO_PATH = {
  hub: "/",
  about: "/about",
  wisdom: "/wisdom",
  wellness: "/wellness",
  practice: "/meditation",
  events: "/events",
  mission: "/mission",
  contact: "/contact",
  volunteer: "/volunteer",
  donate: "/donate",
};

export const PATH_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([view, path]) => [path.slice(1) || "hub", view]),
);

export function pathForView(view) {
  return VIEW_TO_PATH[view] ?? `/${view}`;
}

export function viewForSlug(slug) {
  if (!slug) return "hub";
  return PATH_TO_VIEW[slug] ?? slug; // unknown slug -> CMS custom page
}
