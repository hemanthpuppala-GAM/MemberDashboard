import { useRef } from "react";
import { UploadCloud, ImageOff } from "lucide-react";
import Button from "./Button";

/** Drag-drop or browse image uploader with a live preview. Used anywhere admin needs a single image: QR codes, cover art, photos. */
export default function ImageUploader({ url, onChange, label = "image", size = 128 }) {
  const fileInput = useRef(null);

  const ingest = (files) => {
    const file = files?.[0];
    if (!file) return;
    onChange(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col gap-2">
      {url ? (
        <div className="relative w-fit">
          <img src={url} alt={label} style={{ width: size, height: size }} className="rounded-lg border border-[var(--a-border)] object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 rounded-full bg-[var(--a-danger)] p-1 text-white shadow"
            title={`Remove ${label}`}
          >
            <ImageOff size={12} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); ingest(e.dataTransfer.files); }}
          style={{ width: size, height: size }}
          className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[var(--a-border)] text-center"
        >
          <UploadCloud size={18} className="text-[var(--a-text-faint)]" />
          <span className="text-[10.5px] text-[var(--a-text-muted)]">Drop {label}</span>
        </div>
      )}
      <Button as="button" size="sm" variant="secondary" onClick={() => fileInput.current?.click()} className="w-fit">
        {url ? `Replace ${label}` : `Upload ${label}`}
      </Button>
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => ingest(e.target.files)} />
    </div>
  );
}
