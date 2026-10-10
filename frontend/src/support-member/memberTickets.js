import { memberFetch } from "../lib/memberAuth";

/** Member-side support API (member token). Shapes: backend MemberTicketController + Ticket::toApi(…, forMember). */
export const memberTicketsApi = {
  list: () => memberFetch("/member/tickets"),
  get: (id) => memberFetch(`/member/tickets/${id}`),
  reply: (id, body) => memberFetch(`/member/tickets/${id}/comments`, { method: "POST", body: { body } }),
  rate: (id, rating, comment) =>
    memberFetch(`/member/tickets/${id}/rating`, { method: "POST", body: { rating, comment: comment || null } }),
};

/** Plain words for members (the desk says "Waiting for member"; here it's the member we're waiting on). */
export const MEMBER_STATUS = {
  open: { label: "New", hint: "We have your question and will look at it soon.", fg: "#7A5E22", bg: "rgba(201,162,74,.16)" },
  in_progress: { label: "Being handled", hint: "Someone from our team is working on it.", fg: "#1F5A7A", bg: "rgba(31,90,122,.1)" },
  waiting: { label: "Waiting for your reply", hint: "We have answered and need a reply from you.", fg: "#14241C", bg: "linear-gradient(90deg,#E8CF83,#C9A24A)" },
  resolved: { label: "Resolved", hint: "We think this is sorted. Reply if you still need help.", fg: "#2F6B45", bg: "rgba(47,107,69,.12)" },
  closed: { label: "Closed", hint: "This question is closed. Reply if you still need help.", fg: "#5A5546", bg: "rgba(90,85,70,.12)" },
};

export const statusOf = (s) => MEMBER_STATUS[s] ?? { label: s || "—", hint: "", fg: "#5A5546", bg: "rgba(90,85,70,.12)" };

export const isDone = (s) => s === "resolved" || s === "closed";

/** "5 minutes ago", "yesterday", "3 days ago"; older than a month → a date. */
export function timeAgo(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const sec = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(sec);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(sec / 86400), "day");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function fullDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** Subject, or the start of the question when the ticket has none. */
export function titleOf(t) {
  const s = (t.subject || "").trim();
  if (s) return s;
  const b = (t.body || "").trim().replace(/\s+/g, " ");
  return b.length > 80 ? `${b.slice(0, 77)}…` : b || "Your question";
}
