import QRCode from "qrcode";
import logoUrl from "../assets/logo-coin-tight.png";

const INK = "#14241C";
const CREAM = "#FFFDF8";
const GOLD = "#B8923E";

let logoPromise = null;
function loadLogo() {
  logoPromise ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = logoUrl;
  });
  return logoPromise;
}

/**
 * Brand QR (design_handoff_ask_support → gaw-qr.js): level H, 3-module quiet zone, round dark
 * modules on cream, rounded finder eyes with a gold centre, medallion logo in the cleared middle 26%.
 * Draws onto `canvas` at size×size px.
 */
export async function drawBrandedQr(canvas, text, size) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const quiet = 3;
  const cell = size / (n + quiet * 2);

  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d");
  g.fillStyle = CREAM;
  g.fillRect(0, 0, size, size);

  const logoCells = Math.floor(n * 0.26);
  const lo = Math.floor((n - logoCells) / 2);
  const hi = lo + logoCells;
  const inLogo = (x, y) => x >= lo && x < hi && y >= lo && y < hi;
  const isEye = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

  g.fillStyle = INK;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!qr.modules.get(y, x) || inLogo(x, y) || isEye(x, y)) continue;
      g.beginPath();
      g.arc((x + quiet) * cell + cell / 2, (y + quiet) * cell + cell / 2, cell * 0.43, 0, Math.PI * 2);
      g.fill();
    }
  }

  const roundSquare = (x0, y0, w, r, fill) => {
    g.fillStyle = fill;
    g.beginPath();
    g.roundRect(x0, y0, w, w, r);
    g.fill();
  };
  const eye = (ex, ey) => {
    const px = (ex + quiet) * cell;
    const py = (ey + quiet) * cell;
    const s = cell * 7;
    const r = cell * 1.6;
    roundSquare(px, py, s, r, INK);
    roundSquare(px + cell, py + cell, s - 2 * cell, r * 0.7, CREAM);
    roundSquare(px + 2 * cell, py + 2 * cell, s - 4 * cell, r * 0.5, GOLD);
  };
  eye(0, 0);
  eye(n - 7, 0);
  eye(0, n - 7);

  const logo = await loadLogo();
  if (!logo) return;
  const ls = logoCells * cell;
  const lx = (lo + quiet) * cell;
  const c = lx + ls / 2;
  g.save();
  g.fillStyle = CREAM;
  g.beginPath();
  g.arc(c, c, ls / 2 + cell * 0.6, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = GOLD;
  g.lineWidth = Math.max(2, cell * 0.35);
  g.beginPath();
  g.arc(c, c, ls / 2 - cell * 0.1, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(c, c, ls / 2 - cell * 0.4, 0, Math.PI * 2);
  g.clip();
  g.drawImage(logo, lx + cell * 0.4, lx + cell * 0.4, ls - cell * 0.8, ls - cell * 0.8);
  g.restore();
}
