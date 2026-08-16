import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, description, size = "md", footer, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] shadow-[var(--a-shadow)] ${widths[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--a-border)] px-6 py-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--a-text-primary)]">{title}</h2>
            {description && <p className="mt-0.5 text-[12.5px] text-[var(--a-text-muted)]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] hover:text-[var(--a-text-primary)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-[var(--a-border)] px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
