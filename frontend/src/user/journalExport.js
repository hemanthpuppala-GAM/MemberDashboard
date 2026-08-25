// A4 in points, with generous book-style margins.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 72;
const MARGIN_TOP = 90;
const MARGIN_BOTTOM = 76;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const INK = [42, 38, 74]; // matches --color-ink
const MUTED = [122, 118, 150]; // matches --color-muted
const GOLD = [188, 150, 74]; // matches --color-gold-deep, for accents/rules

function loadImageAsDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.92), w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => reject(new Error("Could not load logo image"));
    img.src = url;
  });
}

function formatEntryDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatEntryTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function monthKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Adds the running footer (page number + brand mark) to the current page. */
function drawFooter(doc, pageNum) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Golden Age Wisdom", MARGIN_X, PAGE_H - 40);
  doc.text(String(pageNum), PAGE_W - MARGIN_X, PAGE_H - 40, { align: "right" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, PAGE_H - 52, PAGE_W - MARGIN_X, PAGE_H - 52);
}

/**
 * Renders a member's journal as a formatted "book" PDF and triggers a download —
 * title page (logo + name + movement branding), entries grouped into monthly
 * chapters, running page numbers/footer. Pure client-side (no backend involved).
 */
export async function exportJournalAsPdf({ memberName, entries, logoUrl }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // ---- Title page ----
  let logo = null;
  try {
    logo = await loadImageAsDataUrl(logoUrl);
  } catch {
    /* proceed without the logo rather than failing the whole export */
  }

  if (logo) {
    const logoSize = 84;
    doc.addImage(logo.dataUrl, "JPEG", (PAGE_W - logoSize) / 2, 170, logoSize, logoSize, undefined, "FAST");
  }

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...GOLD);
  doc.text("GOLDEN AGE WISDOM", PAGE_W / 2, 290, { align: "center" });
  doc.text("SPIRITUAL MOVEMENT", PAGE_W / 2, 306, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(`${memberName}'s`, CONTENT_W);
  let ty = 380;
  titleLines.forEach((line) => {
    doc.text(line, PAGE_W / 2, ty, { align: "center" });
    ty += 36;
  });
  doc.text("Spiritual Journey", PAGE_W / 2, ty, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(...MUTED);
  doc.text("A practice journal", PAGE_W / 2, ty + 40, { align: "center" });

  const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  if (sorted.length > 0) {
    const range =
      sorted.length === 1
        ? formatEntryDate(sorted[0].created_at)
        : `${formatEntryDate(sorted[0].created_at)} — ${formatEntryDate(sorted[sorted.length - 1].created_at)}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(range, PAGE_W / 2, ty + 66, { align: "center" });
  }

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(PAGE_W / 2 - 60, ty + 90, PAGE_W / 2 + 60, ty + 90);

  // ---- Chapters (one per month), entries in chronological order ----
  let pageNum = 1;
  let y = MARGIN_TOP;
  let currentChapter = null;

  const newPage = () => {
    drawFooter(doc, pageNum);
    doc.addPage();
    pageNum += 1;
    y = MARGIN_TOP;
  };

  const ensureSpace = (needed) => {
    if (y + needed > PAGE_H - MARGIN_BOTTOM) newPage();
  };

  if (sorted.length === 0) {
    newPage();
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(...MUTED);
    doc.text("No journal entries yet — your reflections will appear here.", PAGE_W / 2, y + 40, { align: "center" });
  }

  sorted.forEach((entry) => {
    const chapter = monthKey(entry.created_at);
    if (chapter !== currentChapter) {
      currentChapter = chapter;
      newPage();
      doc.setFont("times", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...INK);
      doc.text(monthLabel(entry.created_at), MARGIN_X, y);
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(1);
      doc.line(MARGIN_X, y + 10, PAGE_W - MARGIN_X, y + 10);
      y += 42;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    const bodyLines = doc.splitTextToSize(entry.content, CONTENT_W);
    const entryHeight = 30 + bodyLines.length * 17 + 20;

    ensureSpace(entryHeight);

    doc.setFont("times", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(...INK);
    doc.text(formatEntryDate(entry.created_at), MARGIN_X, y);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(formatEntryTime(entry.created_at), PAGE_W - MARGIN_X, y, { align: "right" });
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11.5);
    doc.setTextColor(...INK);
    bodyLines.forEach((line) => {
      doc.text(line, MARGIN_X, y);
      y += 17;
    });

    y += 14;
    doc.setDrawColor(230, 226, 240);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 26;
  });

  drawFooter(doc, pageNum);

  const safeName = (memberName || "member").trim().replace(/[^a-z0-9]+/gi, "_");
  doc.save(`${safeName}_Spiritual_Journey.pdf`);
}
