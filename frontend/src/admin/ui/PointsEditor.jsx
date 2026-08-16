import { Plus, X } from "lucide-react";
import { TextInput } from "./Field";

/** Editable list of bullet-point strings. */
export default function PointsEditor({ points, onChange }) {
  const update = (i, value) => {
    const next = [...points];
    next[i] = value;
    onChange(next);
  };
  const remove = (i) => onChange(points.filter((_, idx) => idx !== i));
  const add = () => onChange([...points, ""]);

  return (
    <div className="flex flex-col gap-2">
      {points.map((point, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--a-accent)]" aria-hidden="true" />
          <TextInput value={point} onChange={(e) => update(i, e.target.value)} />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove point"
            className="shrink-0 rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-danger-muted)] hover:text-[var(--a-danger)]"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex w-fit items-center gap-1 rounded-full border border-dashed border-[var(--a-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--a-accent)] hover:bg-[var(--a-accent-muted)]"
      >
        <Plus size={13} /> Add point
      </button>
    </div>
  );
}
