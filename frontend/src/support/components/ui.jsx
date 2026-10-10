/** Small shared pieces of the support desk UI. */
import { Loader2 } from "lucide-react";
import { statusLabel } from "../format";

export const inputClass =
  "min-h-[44px] w-full rounded-xl border border-[rgba(138,111,52,0.28)] bg-[#FFFDF8] px-3.5 py-2.5 text-[15px] text-[#1B3328] outline-none placeholder:text-[#5A5546]/70 focus:border-[rgba(201,162,74,0.75)] focus:shadow-[0_0_0_3px_rgba(201,162,74,0.18)]";

export const cardClass = "rounded-2xl border border-[rgba(138,111,52,0.18)] bg-[#FFFDF8] shadow-[0_1px_2px_rgba(20,36,28,0.05)]";

const BUTTON = {
  primary:
    "border-transparent bg-[linear-gradient(135deg,#E8CF83,#C9A24A_55%,#A8853A)] text-[#14241C] hover:brightness-105",
  dark: "border-transparent bg-[#14241C] text-[#F6F1E6] hover:bg-[#1B3328]",
  outline: "border-[rgba(138,111,52,0.35)] bg-[#FFFDF8] text-[#1B3328] hover:border-[#C9A24A]",
  ghost: "border-transparent bg-transparent text-[#1B3328] hover:bg-[rgba(201,162,74,0.12)]",
  green: "border-transparent bg-[#2F6B45] text-white hover:bg-[#285c3b]",
};

export function Button({ variant = "outline", busy = false, className = "", children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || busy}
      className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON[variant]} ${className}`}
    >
      {busy && <Loader2 size={16} className="desk-spin" aria-hidden />}
      {children}
    </button>
  );
}

const STATUS_STYLES = {
  open: "bg-[rgba(201,162,74,0.2)] text-[#7A5E22] border-[rgba(201,162,74,0.45)]",
  in_progress: "bg-[rgba(47,107,69,0.1)] text-[#2F6B45] border-[rgba(47,107,69,0.3)]",
  waiting: "bg-[rgba(90,85,70,0.08)] text-[#5A5546] border-[rgba(90,85,70,0.25)]",
  resolved: "bg-[#2F6B45] text-white border-[#2F6B45]",
  closed: "bg-[rgba(20,36,28,0.08)] text-[#5A5546] border-transparent",
};

export function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.closed}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function UrgentBadge() {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#A33A2A] px-2.5 py-0.5 text-[12px] font-semibold text-white">
      Urgent
    </span>
  );
}

export function Loading({ label = "Loading…", className = "" }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 py-10 text-[14px] text-[#5A5546] ${className}`}>
      <Loader2 size={18} className="desk-spin" aria-hidden />
      {label}
    </div>
  );
}

export function ErrorNote({ children, onRetry, className = "" }) {
  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-[rgba(163,58,42,0.3)] bg-[rgba(163,58,42,0.06)] px-4 py-3 text-[14px] text-[#7E2C20] ${className}`}
    >
      <span className="flex-1">{children}</span>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-['Cormorant_Garamond'] text-[22px] font-semibold text-[#1B3328]">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-[14px] leading-relaxed text-[#5A5546]">{children}</p>}
    </div>
  );
}

export function SectionTitle({ children, aside }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-[24px] leading-tight text-[#14241C]">{children}</h2>
      {aside}
    </div>
  );
}

/** Two-option switch, e.g. "Reply to member" / "Internal note". */
export function Segmented({ value, options, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-[rgba(138,111,52,0.3)] bg-[#FBF6EA] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-[40px] cursor-pointer rounded-full px-3.5 text-[13.5px] font-semibold transition ${
            value === o.value ? "bg-[#14241C] text-[#F6F1E6]" : "text-[#5A5546] hover:text-[#14241C]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, children }) {
  return (
    <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-3 text-[14px] text-[#1B3328]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-[rgba(90,85,70,0.3)] transition peer-checked:bg-[#2F6B45] peer-focus-visible:outline-2 peer-focus-visible:outline-[#C9A24A] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
      />
      {children}
    </label>
  );
}

export function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
