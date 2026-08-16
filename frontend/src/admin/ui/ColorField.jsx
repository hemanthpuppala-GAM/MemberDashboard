import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

/** Swatch + hex input that opens a react-colorful popover. */
export default function ColorField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      {label && <span className="text-[13px] font-medium text-[var(--a-text-primary)]">{label}</span>}
      <div className="flex items-center gap-2 rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-base)] px-2.5 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-6 w-6 shrink-0 rounded-md border border-[var(--a-border)]"
          style={{ background: value }}
          aria-label="Pick color"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[13px] text-[var(--a-text-primary)] outline-none"
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-2 rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-3 shadow-[var(--a-shadow)]">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
