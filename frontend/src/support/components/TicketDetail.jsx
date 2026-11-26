import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { formatDateTime, sourceLabel, timeAgo } from "../format";
import { supportApi } from "../supportApi";
import { useTicket } from "../useDeskData";
import RequesterCard from "./RequesterCard";
import ReplyBox from "./ReplyBox";
import Thread from "./Thread";
import TicketControls from "./TicketControls";
import { Button, ErrorNote, Loading, StatusPill, UrgentBadge, cardClass } from "./ui";

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
            {ticket.confidential && !ticket.can_read ? (
              <MaskedGrievance ticket={ticket} onNudged={async () => { await reload(); onChanged(); }} />
            ) : (
              <>
                {ticket.confidential && (
                  <p className="rounded-2xl bg-[#14241C] px-4 py-3 text-[14px] leading-relaxed text-[#F3EAD3]">
                    🔒 <strong className="text-[#E8CF83]">Confidential grievance.</strong> Only you, as grievance chief, can see who sent it and what it says. The rest of the team sees “Anonymous”. Your replies are emailed to the sender, and they can write back to you directly.
                  </p>
                )}
                <TicketControls ticket={ticket} me={me} agents={agents} busy={busy} onUpdate={update} />
                <RequesterCard requester={ticket.requester} history={ticket.history} />

                <section aria-label="Conversation" className="flex flex-col gap-3">
                  <h3 className="text-[22px] text-[#14241C]">Conversation</h3>
                  <Thread comments={ticket.comments} />
                  <ReplyBox key={ticket.id} onSend={send} canEmail={!!ticket.requester?.email || !!ticket.requester?.member_id} />
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** What the support team sees on a grievance: that it exists, its age and status, and a way to push the chief. */
function MaskedGrievance({ ticket, onNudged }) {
  const [state, setState] = useState({ busy: false, note: "" });
  const done = ["resolved", "closed"].includes(ticket.status);
  const nudge = async () => {
    setState({ busy: true, note: "" });
    try {
      const res = await supportApi.nudgeChief(ticket.id);
      setState({ busy: false, note: res.message });
      await onNudged();
    } catch (err) {
      setState({ busy: false, note: err.message });
    }
  };
  return (
    <section className={`${cardClass} flex flex-col gap-3 p-4`}>
      <p className="text-[15px] leading-relaxed text-[#2E3A33]">
        🔒 This is a <strong>confidential grievance</strong>. Who sent it and what it says are encrypted. Only the grievance chief{ticket.assignee ? ` (${ticket.assignee.name})` : ""} can read and resolve it.
      </p>
      <p className="text-[13.5px] text-[#5A5546]">
        Your part: make sure it doesn&apos;t wait. {ticket.nudged_at ? `Last nudged ${timeAgo(ticket.nudged_at)}.` : "The chief hasn't been nudged yet."}
      </p>
      {!done && (
        <Button variant="primary" onClick={nudge} disabled={state.busy} className="self-start">
          {state.busy ? "Sending…" : "Nudge the chief"}
        </Button>
      )}
      {state.note && <p className="text-[13.5px] font-semibold text-[#7A5E22]">{state.note}</p>}
      {ticket.comments?.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1 text-[12.5px] text-[#5A5546]">
          {ticket.comments.map((c) => (
            <li key={c.id}>{formatDateTime(c.created_at)} · {c.body}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
