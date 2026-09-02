import { Video as VideoIcon } from "lucide-react";
import Field, { TextInput } from "./Field";

/** Paste-a-URL-or-pick-from-library video field, paired with a MediaPickerModal (accept="video") via `onPick`. */
export default function VideoField({ value, onChange, onPick, label = "Video", hint = "Paste a URL or choose from the Media Library" }) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-surface-2)]">
          {value ? <video src={value} muted className="h-full w-full object-cover" /> : <VideoIcon size={18} className="text-[var(--a-text-faint)]" />}
        </div>
        <TextInput value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
        <button type="button" onClick={onPick} className="shrink-0 text-[12.5px] font-semibold whitespace-nowrap text-[var(--a-accent)] hover:underline">
          Choose
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="shrink-0 text-[12.5px] font-medium whitespace-nowrap text-[var(--a-text-muted)] hover:text-[var(--a-danger)]">
            Remove
          </button>
        )}
      </div>
    </Field>
  );
}
