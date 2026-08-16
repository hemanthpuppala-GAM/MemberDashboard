import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Music2, ChevronUp, ChevronDown, FileAudio } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import ImageUploader from "../../ui/ImageUploader";
import { useAdminData } from "../../store/useAdminData";
import { MUSIC_CATEGORIES } from "../../mock/mockData";

const EMPTY = { title: "", artist: "", category: "meditation", description: "", coverUrl: "", fileUrl: "", fileName: "", durationSec: 0, status: "draft" };

function formatDuration(sec) {
  if (!sec) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function AudioUploader({ fileUrl, fileName, onChange }) {
  const fileInput = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const ingest = (files) => {
    const file = files?.[0];
    if (!file) return;
    onChange({ fileUrl: URL.createObjectURL(file), fileName: file.name, durationSec: 0 });
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
      <input ref={fileInput} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files.length && ingest(e.target.files)} />
    </div>
  );
}

export default function MusicLibraryPage() {
  const { musicTracks, addMusicTrack, updateMusicTrack, deleteMusicTrack, reorderMusicTrack } = useAdminData();
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const sorted = [...musicTracks].sort((a, b) => a.order - b.order);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (t) => { setForm({ ...EMPTY, ...t }); setEditing(t); };

  const save = () => {
    if (!form.title.trim() || !form.fileUrl) return;
    if (editing?.id) {
      updateMusicTrack(editing.id, form);
      toast.success("Track updated");
    } else {
      addMusicTrack(form);
      toast.success("Track uploaded");
    }
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Music library</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Meditation and chanting tracks played on the public site. Draft tracks stay hidden until published.
          </p>
        </div>
        <Button as="button" icon={Plus} onClick={openNew}>Upload track</Button>
      </div>

      <Card padded={false}>
        {sorted.length === 0 ? (
          <EmptyState icon={Music2} title="No tracks yet" description="Upload an audio file to build the meditation music library." />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--a-border)]">
            {sorted.map((t, i) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:px-6">
                {t.coverUrl ? (
                  <img src={t.coverUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]">
                    <Music2 size={18} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-[var(--a-text-primary)]">{t.title}</span>
                    <span className="shrink-0 rounded-full bg-[var(--a-bg-surface-2)] px-2 py-0.5 text-[10.5px] font-medium tracking-wide text-[var(--a-text-muted)] uppercase">{t.category}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="truncate text-[12.5px] text-[var(--a-text-muted)]">{t.artist || "Golden Age Wisdom"} · {formatDuration(t.durationSec)}</p>
                </div>

                {t.fileUrl && <audio controls src={t.fileUrl} className="h-8 w-full max-w-[220px]" />}

                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={ChevronUp} label="Move up" onClick={() => reorderMusicTrack(t.id, "up")} disabled={i === 0} />
                  <IconButton icon={ChevronDown} label="Move down" onClick={() => reorderMusicTrack(t.id, "down")} disabled={i === sorted.length - 1} />
                  <IconButton icon={Pencil} label="Edit" variant="accent" onClick={() => openEdit(t)} />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(t)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit track" : "Upload track"}
        size="lg"
        footer={<Button as="button" onClick={save} disabled={!form.title.trim() || !form.fileUrl}>{editing?.id ? "Save" : "Upload"}</Button>}
      >
        <div className="flex flex-col gap-5">
          <Field label="Audio file" required>
            <AudioUploader fileUrl={form.fileUrl} fileName={form.fileName} onChange={set} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required><TextInput value={form.title} onChange={(e) => set({ title: e.target.value })} /></Field>
            <Field label="Artist / instructor"><TextInput value={form.artist} onChange={(e) => set({ artist: e.target.value })} placeholder="Golden Age Wisdom" /></Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => set({ category: e.target.value })}>
                {MUSIC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set({ status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </div>

          <Field label="Description" hint="Optional — shown under the track title on the public player">
            <TextArea rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>

          <Field label="Cover art" hint="Optional — falls back to a default music icon">
            <ImageUploader url={form.coverUrl} onChange={(url) => set({ coverUrl: url })} label="cover" size={112} />
          </Field>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        onConfirm={() => { deleteMusicTrack(toDelete.id); toast.success("Track deleted"); }}
      />
    </div>
  );
}
