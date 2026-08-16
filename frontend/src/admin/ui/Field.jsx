export default function Field({ label, htmlFor, required, error, hint, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-[var(--a-text-primary)]">
          {label} {required && <span className="text-[var(--a-danger)]">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-[12px] text-[var(--a-text-muted)]">{hint}</span>}
      {error && <span className="text-[12px] font-medium text-[var(--a-danger)]">{error}</span>}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-base)] px-3.5 py-2.5 text-[13.5px] text-[var(--a-text-primary)] placeholder:text-[var(--a-text-faint)] outline-none transition-colors focus:border-[var(--a-focus)] focus:ring-2 focus:ring-[var(--a-focus-muted)]";

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
