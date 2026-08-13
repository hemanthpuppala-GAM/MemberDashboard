import { TextInput } from "./Field";

/** Editable list of bullet-point strings — add/remove/reorder-by-retyping. */
export default function PointsEditor({ points, onChange }) {
  const update = (i, value) => {
    const next = [...points];
    next[i] = value;
    onChange(next);
  };

  const remove = (i) => onChange(points.filter((_, idx) => idx !== i));
  const add = () => onChange([...points, ""]);

  return (
    <div className="flex flex-col gap-2.5">
      {points.map((point, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold-deep)]"
            aria-hidden="true"
          />
          <TextInput value={point} onChange={(e) => update(i, e.target.value)} />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove point"
            className="shrink-0 rounded-full px-2.5 py-1 text-[13px] text-[var(--color-muted)] transition-colors hover:bg-[rgba(224,138,138,0.15)] hover:text-[#c0554a]"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-fit rounded-full border border-dashed border-[rgba(110,198,234,0.50)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--color-blue-dark)] transition-colors hover:bg-[rgba(110,198,234,0.12)]"
      >
        + Add point
      </button>
    </div>
  );
}
