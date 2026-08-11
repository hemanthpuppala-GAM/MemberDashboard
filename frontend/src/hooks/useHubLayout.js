/**
 * Chin-anchored hub layout — keeps the face clear of copy and seats
 * About Me just below the chin on every viewport.
 *
 * Image anchors in hero-hari-day.png (2560×1525):
 *   crown ≈ y 275 · chin ≈ y 646 · midline x 1280
 * object-fit: cover + object-position: 50% 36%.
 */

const IMG_W = 2560;
const IMG_H = 1525;
const CHIN_Y = 646;
const CROWN_Y = 275;
const MID_X = 1280;
/** Extra gap from chin down to the top of the About Me node. */
const NUDGE_Y = 96;
const NUDGE_X = 12;
const FLOAT = 8;
/** Extra downward bias so the face sits clearly in the open band. */
const FACE_PUSH = 36;
/** Vertical bias used by object-position 50% 36%. */
const OBJECT_POS_Y = 0.36;

export const DEFAULT_HUB_LAYOUT = {
  bgLift: 48,
  hubTx: 0,
  hubTy: 80,
  orbitR: "clamp(72px, min(calc(40dvh - 120px), calc(46vw - 64px)), 148px)",
};

function changed(prev, next) {
  return (
    Math.abs(next.bgLift - prev.bgLift) > 2 ||
    next.orbitR !== prev.orbitR ||
    Math.abs(next.hubTy - prev.hubTy) > 2 ||
    Math.abs(next.hubTx - prev.hubTx) > 2
  );
}

export function computeHubLayout(prev) {
  const vw = window.innerWidth;
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const main = document.querySelector("main");
  const footer = document.querySelector("footer");
  if (!main) return prev;

  const mb = main.getBoundingClientRect();
  if (mb.height < 40) return prev;

  const ring2 = document.querySelector(".m-ring2");
  const ringEl = document.querySelector(".m-node-ring");
  const measuredR = ring2 ? ring2.offsetWidth / 2.24 : 0;
  const r =
    measuredR > 20
      ? measuredR
      : Math.max(90, Math.min(vh / 2 - 160, vw / 2 - 80, 148));
  const node =
    ringEl && ringEl.offsetWidth > 20
      ? ringEl.offsetWidth
      : Math.max(48, Math.min(r * 0.4, 58));

  const scale = Math.max(vw / IMG_W, vh / IMG_H);
  const cropTop = Math.max(0, (IMG_H * scale - vh) * OBJECT_POS_Y);
  const cropLeft = Math.max(0, (IMG_W * scale - vw) * 0.5);

  const bg = document.querySelector(".m-bg");
  let zoom = 0.98;
  let bgShiftY = 0;
  if (bg) {
    try {
      const m = new DOMMatrixReadOnly(getComputedStyle(bg).transform);
      if (m.d > 0.1) {
        zoom = m.d;
        bgShiftY = m.f;
      }
    } catch {
      /* ignore */
    }
  }

  const bgLift = prev.bgLift ?? 0;
  const pointY = (imgY) =>
    vh - (vh - (imgY * scale - cropTop)) * zoom + bgShiftY + bgLift;

  const chinY = pointY(CHIN_Y);
  const midX = vw / 2 + ((MID_X * scale - cropLeft) - vw / 2) * zoom;

  const orbEl = document.querySelector(".m-orb");
  const nodeEls = document.querySelectorAll(".m-node");
  let radial = 0.93 * r;
  if (orbEl && nodeEls.length) {
    const orr = orbEl.getBoundingClientRect();
    const ocy0 = orr.top + orr.height / 2;
    let d = 0;
    nodeEls.forEach((el) => {
      const b = el.getBoundingClientRect();
      const dd = Math.abs(b.top + b.height / 2 - ocy0);
      if (dd > d) d = dd;
    });
    if (d > 20) radial = d;
  }

  const oc = orbEl ? orbEl.getBoundingClientRect() : null;
  const ocy = oc ? oc.top + oc.height / 2 : 0;
  let topExtent = radial + node / 2 + FLOAT + 6;
  let bottomExtent = radial + node / 2 + FLOAT + 28;
  if (oc) {
    let topGap = 0;
    let maxBot = 0;
    nodeEls.forEach((el) => {
      const b = el.getBoundingClientRect();
      const t = ocy - b.top;
      if (t > topGap) topGap = t;
      const bb = b.bottom - ocy;
      if (bb > maxBot) maxBot = bb;
    });
    if (topGap > 20) topExtent = topGap + FLOAT + 6;
    if (maxBot > 20) bottomExtent = maxBot + FLOAT + 6;
  }

  const footerTop = footer ? footer.getBoundingClientRect().top : vh - 52;
  const vpEl = document.querySelector(".m-vp");
  const actEl = document.querySelector(".m-action");
  const actR = actEl ? actEl.getBoundingClientRect() : null;
  const actIsFloor = !!actR && actR.top > vh * 0.5;
  const vpBottom = Math.max(
    vpEl ? vpEl.getBoundingClientRect().bottom : mb.top,
    actR && !actIsFloor ? actR.bottom : 0,
  );
  const lowerTop = actIsFloor ? actR.top : footerTop;

  const veiledAspect = vw / vh <= 0.95 || vh <= 620;
  const nudgeSpend = Math.max(0, Math.min(NUDGE_Y, 10));

  const aT = radial / Math.max(r, 1);
  const bT = Math.max(0, topExtent - radial);
  const aB = radial / Math.max(r, 1);
  const bB = Math.max(0, bottomExtent - radial);
  const floorY = Math.min(lowerTop - 8 + nudgeSpend, footerTop - 6, vh - 8);

  const crown0 =
    vh - (vh - (CROWN_Y * scale - cropTop)) * zoom + bgShiftY;
  const chin0 = vh - (vh - (CHIN_Y * scale - cropTop)) * zoom + bgShiftY;
  // Push face clearly below the copy (+ FACE_PUSH bias downward).
  const wantLift = vpBottom - 20 - crown0 + FACE_PUSH;

  const room =
    floorY - Math.max(chin0 + wantLift, vpBottom + 10) - NUDGE_Y - bT - bB;
  const R_MIN = vw <= 480 ? 78 : 72;
  const R_MAX = 148;
  const rFit = room / Math.max(aT + aB, 0.01);
  const roomFree = floorY - (vpBottom + 10) - NUDGE_Y - bT - bB;
  const rFree = roomFree / Math.max(aT + aB, 0.01);

  const chinBinds = rFit >= R_MIN - 8 || !veiledAspect;
  const upperY =
    (chinBinds ? Math.max(chinY, vpBottom + 10) : vpBottom + 10) + NUDGE_Y;
  const minCenter = upperY + topExtent;
  const maxCenter = floorY - bottomExtent;
  const cy = maxCenter >= minCenter ? minCenter : maxCenter;
  const halfW = radial + node / 2 + 10;
  const cx = Math.min(
    Math.max(midX - 12 + NUDGE_X, halfW + 8),
    vw - halfW - 8,
  );

  const hubEl = document.querySelector(".m-hub");
  let hubTy;
  let hubTx;
  if (oc && hubEl) {
    try {
      const hm = new DOMMatrixReadOnly(getComputedStyle(hubEl).transform);
      hubTy = Math.round(cy - (oc.top + oc.height / 2 - hm.f));
      hubTx = Math.round(cx - (oc.left + oc.width / 2 - hm.e));
    } catch {
      hubTy = Math.round(cy - (mb.top + mb.height / 2));
      hubTx = Math.round(cx - vw / 2);
    }
  } else {
    hubTy = Math.round(cy - (mb.top + mb.height / 2));
    hubTx = Math.round(cx - vw / 2);
  }

  const lift = Math.round(
    Math.max(-vh * 0.2, Math.min(vh * 0.42, wantLift)),
  );

  let orbitR = prev.orbitR;
  if (r > 20 && Number.isFinite(rFit)) {
    const rWidth = (vw / 2 - 20 - node / 2) / Math.max(aT, 0.01);
    const rVert = rFit >= R_MIN - 8 || !veiledAspect ? rFit : rFree;
    const target = Math.max(R_MIN, Math.min(R_MAX, rVert, rWidth));
    if (Math.abs(target - r) > 1.5) orbitR = `${target.toFixed(1)}px`;
  }

  return {
    bgLift: lift,
    orbitR,
    hubTx,
    hubTy,
  };
}

export { changed as hubLayoutChanged };
