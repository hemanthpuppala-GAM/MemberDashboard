import { useEffect, useState } from "react";
import { publicApi } from "../lib/api";

/**
 * Support lines for the Ask flow. The backend (SUPPORT_PRIMARY / SUPPORT_WEB in .env) is the source
 * of truth, served via /settings; the build-time values below only cover first paint / offline.
 *   primary — published call/message line
 *   web     — receives every website/QR WhatsApp send
 */
const FALLBACK = {
  primary: import.meta.env.VITE_SUPPORT_PRIMARY ?? "917396112111",
  web: import.meta.env.VITE_SUPPORT_WEB ?? "917396119111",
};

/** Public URL the printed poster / Zoom slide QR codes point at. */
export const ASK_PUBLIC_URL = import.meta.env.VITE_ASK_URL ?? "https://goldenagewisdom.org/ask";

/** "917396112111" → "+91 7396 112 111" (Indian mobiles); other numbers just get a leading "+". */
export function displayNumber(digits) {
  const d = String(digits).replace(/\D/g, "");
  const m = d.match(/^91(\d{4})(\d{3})(\d{3})$/);
  return m ? `+91 ${m[1]} ${m[2]} ${m[3]}` : `+${d}`;
}

let cached = null;

export function useSupportNumbers() {
  const [numbers, setNumbers] = useState(cached ?? FALLBACK);

  useEffect(() => {
    if (cached) return;
    publicApi
      .settings()
      .then((s) => {
        cached = {
          primary: s?.["support.primary"] || FALLBACK.primary,
          web: s?.["support.web"] || FALLBACK.web,
        };
        setNumbers(cached);
      })
      .catch(() => {});
  }, []);

  return {
    ...numbers,
    primaryDisplay: displayNumber(numbers.primary),
    webDisplay: displayNumber(numbers.web),
  };
}

/** wa.me link to the web support line with the question pre-filled. */
export function whatsappUrl(webNumber, { question, via, name, memberId, email }) {
  const who = name ? `\nFrom: ${name}${memberId ? ` (${memberId})` : ""}${email ? `\nEmail: ${email}` : ""}` : "";
  const body = `Golden Age Wisdom — question (via ${via})${who}\n\n${question}`;
  return `https://wa.me/${String(webNumber).replace(/\D/g, "")}?text=${encodeURIComponent(body)}`;
}
