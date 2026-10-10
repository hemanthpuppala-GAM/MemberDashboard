import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone, UserRound } from "lucide-react";
import { formatDate, telHref, whatsappDigits } from "../format";
import { StatusPill, cardClass } from "./ui";

const linkBtn =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition";

/** Who asked: tap-to-call, WhatsApp, email, and their earlier tickets. */
export default function RequesterCard({ requester = {}, history = [] }) {
  const { name, phone, email, member_id: memberId } = requester;
  const wa = phone ? whatsappDigits(phone) : "";

  return (
    <section className={`${cardClass} p-4`} aria-label="Who asked">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(201,162,74,0.16)] text-[#7A5E22]">
          <UserRound size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-[#14241C]">{name || "Name not given"}</p>
          <p className="text-[12.5px] text-[#5A5546]">{memberId ? "Has a member account" : "No member account"}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-[14px] text-[#2E3A33]">
        {phone && <p className="m-0">{phone}</p>}
        {email && <p className="m-0 break-all">{email}</p>}
        {!phone && !email && <p className="m-0 text-[#5A5546]">No phone or email was given.</p>}
      </div>

      {(phone || email) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {phone && (
            <a href={telHref(phone)} className={`${linkBtn} border-transparent bg-[#14241C] text-[#F6F1E6]! hover:bg-[#1B3328]`}>
              <Phone size={16} aria-hidden /> Call
            </a>
          )}
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className={`${linkBtn} border-transparent bg-[#2F6B45] text-white! hover:bg-[#285c3b]`}
            >
              <MessageCircle size={16} aria-hidden /> WhatsApp
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className={`${linkBtn} border-[rgba(138,111,52,0.35)] bg-[#FFFDF8] text-[#1B3328]!`}>
              <Mail size={16} aria-hidden /> Email
            </a>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 border-t border-[rgba(138,111,52,0.14)] pt-3">
          <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7A5E22]">Earlier questions</p>
          <ul className="m-0 flex list-none flex-col p-0">
            {history.map((h) => (
              <li key={h.id}>
                <Link
                  to={`/support/ticket/${h.id}`}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg px-1 text-[14px] hover:bg-[#FBF6EA]"
                  style={{ color: "inherit" }}
                >
                  <span className="shrink-0 font-semibold text-[#7A5E22]">{h.ref}</span>
                  <span className="min-w-0 flex-1 truncate">{h.subject}</span>
                  <span className="hidden shrink-0 text-[12px] text-[#5A5546] sm:inline">{formatDate(h.created_at)}</span>
                  <StatusPill status={h.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
