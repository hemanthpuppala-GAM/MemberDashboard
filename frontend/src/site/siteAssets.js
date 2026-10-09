/**
 * Public-site static files live in frontend/public/site/ (copied from the
 * design handoff). Content JSON stores paths relative to the design folder
 * ("assets/hari-stream-forest.png"); resolve them against the app's base.
 */
const SITE_BASE = `${import.meta.env.BASE_URL}site/`;

export function siteAsset(path) {
  if (!path) return "";
  if (/^(https?:|data:|blob:|\/)/.test(path)) return path;
  return SITE_BASE + path.replace(/^\.?\//, "");
}

/** srcset for the responsive pillar sets: assets/pillars/{name}-{w}x{h}.{ext} */
const PILLAR_SIZES = [
  [320, 480],
  [360, 540],
  [600, 720],
  [1200, 560],
  [1600, 680],
  [2000, 780],
];

export function pillarSrcSet(name, ext = "webp") {
  return PILLAR_SIZES.map(([w, h]) => `${siteAsset(`assets/pillars/${name}-${w}x${h}.${ext}`)} ${w}w`).join(", ");
}

export function pillarSrc(name, ext = "jpg") {
  return siteAsset(`assets/pillars/${name}-1200x560.${ext}`);
}
