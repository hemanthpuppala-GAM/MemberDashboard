import { publicApi } from "../lib/api";
import { memberAuthApi } from "../lib/memberAuth";

/**
 * Logs the question to /contact so it shows in admin Queries. Members are identified by their
 * token (source = member_portal) and the backend emails them an acknowledgement; everyone else
 * is an anonymous qr_web submission. Resolves to `{ ack_sent }`.
 */
export function submitQuestion({ member, question, category = "general", topicLabel, lang = "en" }) {
  const message = topicLabel ? `[${topicLabel}] ${question}` : question;
  return member
    ? memberAuthApi.contact({ category, message, lang })
    : publicApi.submitContact({ category, message, lang, source: "qr_web" });
}
