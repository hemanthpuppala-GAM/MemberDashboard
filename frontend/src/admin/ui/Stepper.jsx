import { Check } from "lucide-react";

/** Horizontal step indicator for wizards. steps: [{ key, label }] */
export default function Stepper({ steps, activeIndex }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[12.5px] font-semibold transition-colors ${
                  done
                    ? "border-[var(--a-accent)] bg-[var(--a-accent)] text-white"
                    : active
                      ? "border-[var(--a-accent)] text-[var(--a-accent)]"
                      : "border-[var(--a-border)] text-[var(--a-text-faint)]"
                }`}
              >
                {done ? <Check size={15} /> : i + 1}
              </div>
              <span className={`text-[11.5px] font-medium whitespace-nowrap ${active ? "text-[var(--a-text-primary)]" : "text-[var(--a-text-muted)]"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${done ? "bg-[var(--a-accent)]" : "bg-[var(--a-border)]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
