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

/**
 * Picture of the bottom of an iPhone keyboard with its 🎤 ringed in gold, so people who don't
 * know where "the keyboard mic" is can match it to what is on their screen.
 */
export function KeyboardMicPicture({ label }) {
  return (
    <svg viewBox="0 0 320 118" role="img" aria-label={label} className="block h-auto w-full max-w-[340px]">
      <rect x="0" y="0" width="320" height="118" rx="14" fill="#D3D5DB" />
      <rect x="8" y="10" width="44" height="34" rx="6" fill="#ABB0BA" />
      <text x="30" y="32" textAnchor="middle" fontSize="13" fontFamily="system-ui,sans-serif" fill="#111">123</text>
      <rect x="58" y="10" width="38" height="34" rx="6" fill="#ABB0BA" />
      <text x="77" y="33" textAnchor="middle" fontSize="16">🙂</text>
      <rect x="102" y="10" width="140" height="34" rx="6" fill="#FFFFFF" />
      <text x="172" y="32" textAnchor="middle" fontSize="13" fontFamily="system-ui,sans-serif" fill="#111">space</text>
      <rect x="248" y="10" width="64" height="34" rx="6" fill="#ABB0BA" />
      <text x="280" y="32" textAnchor="middle" fontSize="13" fontFamily="system-ui,sans-serif" fill="#111">return</text>
      <text x="26" y="88" textAnchor="middle" fontSize="20" fill="#5B5F66">🌐</text>
      <circle cx="292" cy="82" r="22" fill="none" stroke="#C9A24A" strokeWidth="4">
        <animate attributeName="r" values="19;24;19" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <g transform="translate(283 70)" fill="#3A3D42">
        <rect x="5" y="0" width="8" height="14" rx="4" />
        <path d="M1 10a8 8 0 0 0 16 0" fill="none" stroke="#3A3D42" strokeWidth="2" />
        <rect x="8" y="18" width="2" height="5" />
      </g>
      <path d="M210 92 H258" stroke="#14241C" strokeWidth="3" strokeLinecap="round" />
      <path d="M250 85 L262 92 L250 99" fill="none" stroke="#14241C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
