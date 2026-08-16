import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import "react-day-picker/style.css";

/** Popover date picker. value/onChange use plain Date objects (or undefined). */
export default function DateField({ label, value, onChange, placeholder = "Select date" }) {
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-base)] px-3.5 py-2.5 text-left text-[13.5px] text-[var(--a-text-primary)] outline-none focus:border-[var(--a-focus)]"
      >
        <CalendarDays size={15} className="text-[var(--a-text-faint)]" />
        {value ? value.toLocaleDateString() : <span className="text-[var(--a-text-faint)]">{placeholder}</span>}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-2 rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-2 shadow-[var(--a-shadow)]">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(d) => {
              onChange(d);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
