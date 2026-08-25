/** Local (not UTC) YYYY-MM-DD key — used to group entries/sessions by the calendar day the user actually saw them on. */
export function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
