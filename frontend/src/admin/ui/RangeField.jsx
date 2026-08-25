import Field from "./Field";

/** Labeled slider with a live numeric readout — used for pixel/percent-style layout controls. */
export default function RangeField({ label, hint, value, onChange, min = 0, max = 100, step = 1, unit = "%" }) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[var(--a-accent)]"
        />
        <span className="w-12 shrink-0 text-right text-[12.5px] font-medium text-[var(--a-text-muted)]">
          {value}{unit}
        </span>
      </div>
    </Field>
  );
}
