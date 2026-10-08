import logoUrl from "../assets/logo-coin-tight.png";
import { drawBrandedQr } from "./brandedQr";
import { QR_PROMO } from "./copy";

const W = 1920;
const H = 1080;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapLines(g, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Paints the 1920×1080 Zoom slide (QR Ask Zoom.dc.html) straight onto a canvas, so the PNG
 * export is pixel-exact without a DOM-to-image dependency. Returns a PNG data URL.
 */
export async function renderZoomSlidePng({ url, numbersLine }) {
  await Promise.all([
    document.fonts.load('700 104px "Cormorant Garamond"'),
    document.fonts.load('400 30px "Manrope"'),
    ...QR_PROMO.regional.map((line) => document.fonts.load('400 30px "Noto Sans Telugu", "Noto Sans Kannada"', line)),
  ]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");

  g.fillStyle = "#14241C";
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * 0.3, H * 0.5, 0, W * 0.3, H * 0.5, W * 0.6);
  glow.addColorStop(0, "rgba(201,162,74,0.12)");
  glow.addColorStop(1, "rgba(201,162,74,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);

  // Right column: 640px QR in a 32px-padded, 6px gold-bordered frame.
  const frame = 640 + 32 * 2 + 6 * 2;
  const fx = W - 120 - frame;
  const fy = (H - frame) / 2;
  g.save();
  g.shadowColor = "rgba(0,0,0,0.5)";
  g.shadowBlur = 70;
  g.shadowOffsetY = 30;
  g.fillStyle = "#FFFDF8";
  g.beginPath();
  g.roundRect(fx, fy, frame, frame, 48);
  g.fill();
  g.restore();
  g.strokeStyle = "rgba(232,207,131,0.1)";
  g.lineWidth = 18;
  g.beginPath();
  g.roundRect(fx - 9, fy - 9, frame + 18, frame + 18, 57);
  g.stroke();
  g.strokeStyle = "#B8923E";
  g.lineWidth = 6;
  g.beginPath();
  g.roundRect(fx + 3, fy + 3, frame - 6, frame - 6, 45);
  g.stroke();
  const qr = document.createElement("canvas");
  await drawBrandedQr(qr, url, 1280);
  g.save();
  g.beginPath();
  g.roundRect(fx + 38, fy + 38, 640, 640, 24);
  g.clip();
  g.drawImage(qr, fx + 38, fy + 38, 640, 640);
  g.restore();

  // Left column, vertically centred block.
  const left = 120;
  const colWidth = fx - 96 - left;
  g.font = '400 30px "Manrope", "Noto Sans Telugu", "Noto Sans Kannada", sans-serif';
  const bodyLines = wrapLines(g, QR_PROMO.zoomBody, Math.min(760, colWidth));
  const blockH = 112 + 34 + 208 + 34 + bodyLines.length * 45 + 34 + 2 * 39 + 6 + 34 + 2 * 29 + 4;
  let y = (H - blockH) / 2;

  const logo = await loadImage(logoUrl);
  g.save();
  g.beginPath();
  g.arc(left + 56, y + 56, 56, 0, Math.PI * 2);
  g.clip();
  g.drawImage(logo, left, y, 112, 112);
  g.restore();
  g.fillStyle = "#E8CF83";
  g.font = '400 20px "Manrope", "Noto Sans Telugu", "Noto Sans Kannada", sans-serif';
  g.letterSpacing = "6px";
  g.textBaseline = "middle";
  g.fillText(QR_PROMO.eyebrow.toUpperCase(), left + 134, y + 56);
  g.letterSpacing = "0px";
  g.textBaseline = "alphabetic";
  y += 112 + 34;

  g.fillStyle = "#FFFDF8";
  g.font = '700 104px "Cormorant Garamond", serif';
  g.fillText(QR_PROMO.titleLines[0], left, y + 84);
  g.fillText(QR_PROMO.titleLines[1], left, y + 188);
  y += 208 + 34;

  g.fillStyle = "#D8D2C4";
  g.font = '400 30px "Manrope", "Noto Sans Telugu", "Noto Sans Kannada", sans-serif';
  bodyLines.forEach((line, i) => g.fillText(line, left, y + 32 + i * 45));
  y += bodyLines.length * 45 + 34;

  g.fillStyle = "#E8CF83";
  QR_PROMO.regional.forEach((line, i) => g.fillText(line, left, y + 30 + i * 45));
  y += 2 * 39 + 6 + 34;

  g.fillStyle = "#D8D2C4";
  g.font = '400 24px "Manrope", "Noto Sans Telugu", "Noto Sans Kannada", sans-serif';
  g.fillText(url.replace(/^https?:\/\//, ""), left, y + 22);
  g.fillText(numbersLine, left, y + 22 + 33);

  return canvas.toDataURL("image/png");
}
