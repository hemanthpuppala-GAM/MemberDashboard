import { CheckCircle2, Hand } from "lucide-react";
import { STATUS_LABELS } from "../format";
import { Button, Toggle, cardClass, inputClass } from "./ui";

const fieldLabel = "flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A5546]";

/** Quick buttons + status / assignee / urgent controls for one ticket. */
export default function TicketControls({ ticket, me, agents, busy, onUpdate }) {
  const mine = ticket.assignee?.id === me?.id;
  const done = ticket.status === "resolved" || ticket.status === "closed";
  const others = agents.filter((a) => a.id !== me?.id);

  return (
    <section className={`${cardClass} flex flex-col gap-3 p-4`} aria-label="Ticket controls">
      <div className="flex flex-wrap gap-2">
        {(!mine || ticket.status === "open") && !done && (
          <Button variant="primary" busy={busy === "take"} onClick={() => onUpdate({ assigned_agent_id: me.id, status: "in_progress" }, "take")} className="flex-1 sm:flex-none">
            {busy !== "take" && <Hand size={16} aria-hidden />} Take it
          </Button>
        )}
        {!done ? (
          <Button variant="green" busy={busy === "resolve"} onClick={() => onUpdate({ status: "resolved" }, "resolve")} className="flex-1 sm:flex-none">
            {busy !== "resolve" && <CheckCircle2 size={16} aria-hidden />} Mark resolved
          </Button>
        ) : (
          <Button variant="outline" busy={busy === "reopen"} onClick={() => onUpdate({ status: "in_progress" }, "reopen")} className="flex-1 sm:flex-none">
            Reopen
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={fieldLabel}>
          Status
          <select
            className={`${inputClass} cursor-pointer`}
            value={ticket.status}
            disabled={!!busy}
            onChange={(e) => onUpdate({ status: e.target.value }, "status")}
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldLabel}>
          Who is handling it
          <select
            className={`${inputClass} cursor-pointer`}
            value={ticket.assignee?.id ?? ""}
            disabled={!!busy}
            onChange={(e) => onUpdate({ assigned_agent_id: e.target.value ? Number(e.target.value) : null }, "assign")}
          >
            <option value="">Nobody yet (unassigned)</option>
            {me && <option value={me.id}>Me ({me.name})</option>}
            {others.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.kind === "volunteer" ? " · volunteer" : ""}
              </option>
            ))}
            {ticket.assignee && ticket.assignee.id !== me?.id && !others.some((a) => a.id === ticket.assignee.id) && (
              <option value={ticket.assignee.id}>{ticket.assignee.name}</option>
            )}
          </select>
        </label>
      </div>

      <Toggle checked={ticket.priority === "urgent"} onChange={(on) => onUpdate({ priority: on ? "urgent" : "normal" }, "priority")}>
        <span>
          <strong className="font-semibold">Urgent</strong>
          <span className="block text-[12.5px] text-[#5A5546]">Shows at the top of everyone's list</span>
        </span>
      </Toggle>
    </section>
  );
}
