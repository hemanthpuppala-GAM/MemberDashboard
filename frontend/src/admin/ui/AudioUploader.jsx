import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FileAudio } from "lucide-react";
import Button from "./Button";

/** Drag-and-drop audio picker with a preview player; reports the file, a preview URL and its length. */
export default function AudioUploader({ fileUrl, fileName, onChange, maxMb }) {
  const fileInput = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const ingest = (files) => {
    const file = files?.[0];
    if (!file) return;
    if (maxMb && file.size > maxMb * 1024 * 1024) {
      toast.error(`That file is ${(file.size / 1048576).toFixed(0)} MB — this server accepts up to ${maxMb} MB. Export it at a lower bitrate (e.g. 96–128 kbps MP3) and try again.`);
      return;
    }
    onChange({ file, fileUrl: URL.createObjectURL(file), fileName: file.name, durationSec: 0 });
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) ingest(e.dataTransfer.files); }}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        dragOver ? "border-[var(--a-accent)] bg-[var(--a-accent-muted)]" : "border-[var(--a-border)]"
      }`}
    >
      <FileAudio size={22} className="text-[var(--a-accent)]" />
      {fileUrl ? (
        <div className="flex w-full flex-col items-center gap-2">
          <p className="truncate text-[13px] font-medium text-[var(--a-text-primary)]">{fileName || "Audio file attached"}</p>
          <audio
            controls
            src={fileUrl}
            className="h-8 w-full max-w-xs"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              if (Number.isFinite(d)) onChange({ durationSec: Math.round(d) });
            }}
          />
        </div>
      ) : (
        <p className="text-[13px] font-medium text-[var(--a-text-primary)]">Drag & drop an audio file</p>
      )}
      <p className="text-[12px] text-[var(--a-text-muted)]">or</p>
      <Button as="button" size="sm" variant="secondary" onClick={() => fileInput.current?.click()}>
        {fileUrl ? "Replace file" : "Browse files"}
      </Button>
      <p className="text-[11.5px] text-[var(--a-text-faint)]">MP3, M4A, WAV or OGG{maxMb ? ` · up to ${maxMb} MB` : ""}</p>
      <input ref={fileInput} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files.length && ingest(e.target.files)} />
    </div>
  );
}

