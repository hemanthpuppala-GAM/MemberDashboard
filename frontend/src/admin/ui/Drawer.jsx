import { X } from "lucide-react";

export default function Drawer({ open, onClose, title, children, width = "380px" }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 z-50 flex h-dvh flex-col border-l border-[var(--a-border)] bg-[var(--a-bg-surface)] shadow-[var(--a-shadow)] transition-transform duration-200"
        style={{ width, transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--a-border)] px-5 py-4">
          <h2 className="text-[15px] font-semibold text-[var(--a-text-primary)]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)]">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  );
}
