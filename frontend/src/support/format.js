/** Plain-language labels and formatting for the support desk. */
import { formatDistanceToNowStrict } from "date-fns";

export const STATUS_LABELS = {
  open: "New",
  in_progress: "Being handled",
  waiting: "Waiting for member",
  resolved: "Resolved",
  closed: "Closed",
};

export const SOURCE_LABELS = {
  ask_web: "Ask page / QR",
  member_portal: "Member dashboard",
  website: "Website form",
  call: "Phone call",
  whatsapp: "WhatsApp",
  volunteer: "Volunteer sign-up",
  other: "Other",
};

export const KIND_LABELS = { core: "Core team", volunteer: "Volunteer" };

export const statusLabel = (s) => STATUS_LABELS[s] ?? s;
export const sourceLabel = (s) => SOURCE_LABELS[s] ?? s;

/** 35 → "35 min", 180 → "3 h", 2900 → "2 d". */
export function formatMinutes(min) {
  if (min === null || min === undefined) return "—";
  const m = Math.round(Number(min));
  if (m < 60) return `${m} min`;
  if (m < 60 * 24) return `${Math.round(m / 60)} h`;
  return `${Math.round(m / (60 * 24))} d`;
}

/** "3 h ago" style, short units. */
export function timeAgo(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  if (Date.now() - d.getTime() < 60_000) return "just now";
  return `${shortUnits(formatDistanceToNowStrict(d))} ago`;
}

/** "2 d" — age without "ago", for "oldest waiting 2 d". */
export function age(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return shortUnits(formatDistanceToNowStrict(d));
}

function shortUnits(s) {
  return s
    .replace(/ seconds?/, " s")
    .replace(/ minutes?/, " min")
    .replace(/ hours?/, " h")
    .replace(/ days?/, " d")
    .replace(/ months?/, " mo")
    .replace(/ years?/, " y");
}

const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });

export function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : dateTimeFmt.format(d);
}

export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : dateFmt.format(d);
}

/** Digits for wa.me links. Indian numbers typed without country code get 91. */
export function whatsappDigits(phone) {
  let digits = String(phone ?? "").replace(/\D+/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

export function telHref(phone) {
  return `tel:${String(phone ?? "").replace(/[^\d+]/g, "")}`;
}

export function formatRating(avg, count) {
  if (avg === null || avg === undefined || !count) return "No reviews yet";
  return `★ ${Number(avg).toFixed(1)} · ${count} review${count === 1 ? "" : "s"}`;
}
