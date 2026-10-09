/** Small shared pieces of the Ask design (design_handoff_ask_support). */

/** Pill chip: page language, voice language, topic. */
export function Chip({ selected, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-[44px] cursor-pointer rounded-full border px-4 py-2.5 text-[14px] transition-colors ${
        selected
          ? "border-[rgba(201,162,74,0.75)] bg-[rgba(201,162,74,0.16)] font-semibold text-[#7A5E22]"
          : "border-[rgba(138,111,52,0.25)] bg-[#FFFDF8] font-normal text-[#2E3A33] hover:border-[rgba(201,162,74,0.6)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function StepLabel({ children }) {
  return <span className="text-[12px] font-semibold text-[#7A5E22]">{children}</span>;
}

/**
 * Green status box shown after Send. `ack` is null (guest), or
 * { state: "sending" | "sent" | "failed", email } for members.
 */
export function SentStatus({ note, ack, t, className = "" }) {
  return (
    <div
      role="status"
      className={`flex flex-col gap-2 rounded-[14px] border border-[rgba(47,107,69,0.3)] bg-[rgba(47,107,69,0.07)] px-4 py-3.5 ${className}`}
    >
      <span className="text-[14px] font-semibold text-[#2F6B45]">{note}</span>
      {ack && ack.state !== "failed" && (
        <span className="text-[13px] leading-[1.6] text-[#2E3A33]">
          {ack.state === "sent" ? t.ackSent : t.ackSending} <strong>{ack.email}</strong>
        </span>
      )}
    </div>
  );
}
