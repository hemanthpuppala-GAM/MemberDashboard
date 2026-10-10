import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { formatDateTime, sourceLabel, timeAgo } from "../format";
import { supportApi } from "../supportApi";
import { useTicket } from "../useDeskData";
import RequesterCard from "./RequesterCard";
import ReplyBox from "./ReplyBox";
import Thread from "./Thread";
import TicketControls from "./TicketControls";
import { ErrorNote, Loading, StatusPill, UrgentBadge, cardClass } from "./ui";

/** One ticket: what they asked, who they are, controls, the thread and the reply box. */
export default function TicketDetail({ id, me, agents, onClose, onChanged }) {
  const { ticket, error, loading, reload } = useTicket(id);
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState("");

  const update = async (payload, key) => {
    setBusy(key);
    setActionError("");
    try {
      await supportApi.updateTicket(id, payload);
      await reload();
      onChanged();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const send = async (body, internal) => {
    await supportApi.addComment(id, body, internal);
    await reload();
    onChanged();
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[rgba(138,111,52,0.16)] bg-[#F3EAD3]/95 px-2 py-1.5 backdrop-blur pt-[calc(6px+env(safe-area-inset-top))] lg:rounded-t-2xl lg:pt-1.5">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-[#1B3328] hover:bg-[rgba(201,162,74,0.14)]"
        >
          <ArrowLeft size={18} className="lg:hidden" aria-hidden />
          <span className="lg:hidden">All tickets</span>
          <X size={18} className="hidden lg:block" aria-hidden />
          <span className="sr-only lg:not-sr-only">Close</span>
        </button>
        {ticket && <span className="ml-auto pr-2 text-[14px] font-semibold text-[#7A5E22]">{ticket.ref}</span>}
      </div>

      <div className="flex flex-col gap-4 p-4">
        {loading && <Loading label="Opening ticket…" />}
        {!loading && error && !ticket && <ErrorNote onRetry={reload}>{error}</ErrorNote>}
        {ticket && (
          <>
            <section className={`${cardClass} p-4`}>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={ticket.status} />
                {ticket.priority === "urgent" && <UrgentBadge />}
                <span className="text-[12.5px] text-[#5A5546]">
                  {sourceLabel(ticket.source)} · {formatDateTime(ticket.created_at)} ({timeAgo(ticket.created_at)})
                </span>
              </div>
              <h2 className="mt-2 text-[26px] leading-tight text-[#14241C]">{ticket.subject}</h2>
              <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[#2E3A33]">{ticket.body}</p>
              {ticket.created_by && (
                <p className="mt-2 text-[12.5px] text-[#5A5546]">Logged by {ticket.created_by.name}</p>
              )}
              {ticket.rating && (
                <p className="mt-3 rounded-xl bg-[#FBF6EA] px-3 py-2 text-[14px] text-[#2E3A33]">
                  <span className="font-semibold text-[#7A5E22]">{"★".repeat(ticket.rating)}{"☆".repeat(5 - ticket.rating)}</span>{" "}
                  {ticket.rating_comment ? `“${ticket.rating_comment}”` : "Rated by the member"}
                </p>
              )}
            </section>

            {actionError && <ErrorNote>{actionError}</ErrorNote>}
            <TicketControls ticket={ticket} me={me} agents={agents} busy={busy} onUpdate={update} />
            <RequesterCard requester={ticket.requester} history={ticket.history} />

            <section aria-label="Conversation" className="flex flex-col gap-3">
              <h3 className="text-[22px] text-[#14241C]">Conversation</h3>
              <Thread comments={ticket.comments} />
              <ReplyBox key={ticket.id} onSend={send} canEmail={!!ticket.requester?.email || !!ticket.requester?.member_id} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
