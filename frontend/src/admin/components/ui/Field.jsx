/** Labeled form field wrapper — consistent spacing + error display for admin forms. */
export default function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-body text-[13px] font-semibold tracking-wide text-[var(--color-ink)]"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <span className="text-[12px] text-[var(--color-muted)]">{hint}</span>
      )}
      {error && <span className="text-[12px] font-medium text-[#c0554a]">{error}</span>}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-[rgba(110,198,234,0.40)] bg-white/70 px-3.5 py-2.5 font-body text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none transition-colors focus:border-[var(--color-gold-deep)] focus:bg-white";

export function TextInput(props) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${inputBase} resize-y ${props.className ?? ""}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${inputBase} ${props.className ?? ""}`}>
      {children}
    </select>
  );
}
