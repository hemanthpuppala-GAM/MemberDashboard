import { X } from "lucide-react";

export default function Modal({ open, onClose, title, description, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md animate-[viewIn_0.25s_ease] overflow-hidden rounded-3xl border border-[rgba(110,198,234,0.30)] bg-[rgba(255,255,255,0.97)] p-6 shadow-[0_20px_60px_rgba(40,36,106,0.25)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-[var(--color-muted)] transition-colors hover:bg-[rgba(110,198,234,0.15)] hover:text-[var(--color-ink)]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {(title || description) && (
          <div className="mb-4 pr-8">
            {title && <h2 className="font-display text-[18px] text-[var(--color-ink)]">{title}</h2>}
            {description && <p className="mt-1 text-[13px] text-[var(--color-muted)]">{description}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
