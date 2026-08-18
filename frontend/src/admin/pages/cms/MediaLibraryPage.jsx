import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { UploadCloud, Copy, Pencil, Trash2, Image as ImageIcon, Film } from "lucide-react";
import Card from "../../ui/Card";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Button from "../../ui/Button";
import Field, { TextInput, Select } from "../../ui/Field";
import { PillTabs } from "../../ui/Tabs";
import EmptyState from "../../ui/EmptyState";
import { api } from "../../../lib/api";
import { MEDIA_FOLDERS } from "../../mock/mockData";

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("All");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ filename: "", alt_text: "", folder: "General" });
  const [toDelete, setToDelete] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  const loadMedia = () => api.media().then(setMedia);

  useEffect(() => {
    loadMedia()
      .catch((err) => toast.error(err.message ?? "Failed to load media"))
      .finally(() => setLoading(false));
  }, []);

  const items = folder === "All" ? media : media.filter((m) => m.folder === folder);

  const ingestFiles = async (files) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder === "All" ? "General" : folder);
        await api.uploadMedia(formData);
      }
      toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
      await loadMedia();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Couldn't copy — copy manually");
    }
  };

  const openEdit = (item) => {
    setEditForm({ filename: item.filename, alt_text: item.alt_text ?? "", folder: item.folder });
    setEditing(item);
  };

  const saveEdit = async () => {
    try {
      await api.updateMedia(editing.id, editForm);
      toast.success("Media updated");
      setEditing(null);
      await loadMedia();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteMedia(toDelete.id);
      toast.success("Media deleted");
      await loadMedia();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Media Library</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Upload and organize images used across the site.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) ingestFiles(e.dataTransfer.files); }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-[var(--a-accent)] bg-[var(--a-accent-muted)]" : "border-[var(--a-border)] bg-[var(--a-bg-surface)]"
        }`}
      >
        <UploadCloud size={26} className="text-[var(--a-accent)]" />
        <p className="text-[13.5px] font-medium text-[var(--a-text-primary)]">{uploading ? "Uploading…" : "Drag & drop files here"}</p>
        <p className="text-[12.5px] text-[var(--a-text-muted)]">or</p>
        <Button as="button" size="sm" variant="secondary" disabled={uploading} onClick={() => fileInput.current?.click()}>Browse files</Button>
        <input ref={fileInput} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files.length && ingestFiles(e.target.files)} />
      </div>

      <PillTabs tabs={MEDIA_FOLDERS.map((f) => ({ key: f, label: f }))} active={folder} onChange={setFolder} />

      {!loading && items.length === 0 ? (
        <Card><EmptyState icon={ImageIcon} title="No media in this folder" description="Upload a file or switch folders." /></Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)]">
              <div className="aspect-video w-full overflow-hidden bg-[var(--a-bg-surface-2)]">
                {item.mime_type?.startsWith("video") ? (
                  <div className="flex h-full w-full items-center justify-center text-[var(--a-text-faint)]"><Film size={22} /></div>
                ) : (
                  <img src={item.url} alt={item.alt_text ?? ""} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-[12.5px] font-medium text-[var(--a-text-primary)]">{item.filename}</p>
                <p className="text-[11px] text-[var(--a-text-muted)]">{formatSize(item.size_bytes)} · {item.folder}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => copyUrl(item.url)} title="Copy URL" className="rounded-lg bg-[var(--a-bg-surface)]/90 p-1.5 text-[var(--a-text-muted)] shadow-[var(--a-shadow-sm)] hover:text-[var(--a-accent)]"><Copy size={13} /></button>
                <button onClick={() => openEdit(item)} title="Edit" className="rounded-lg bg-[var(--a-bg-surface)]/90 p-1.5 text-[var(--a-text-muted)] shadow-[var(--a-shadow-sm)] hover:text-[var(--a-accent)]"><Pencil size={13} /></button>
                <button onClick={() => setToDelete(item)} title="Delete" className="rounded-lg bg-[var(--a-bg-surface)]/90 p-1.5 text-[var(--a-text-muted)] shadow-[var(--a-shadow-sm)] hover:text-[var(--a-danger)]"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit media"
        footer={<Button as="button" onClick={saveEdit}>Save</Button>}
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <Field label="Filename"><TextInput value={editForm.filename} onChange={(e) => setEditForm((f) => ({ ...f, filename: e.target.value }))} /></Field>
            <Field label="Alt text"><TextInput value={editForm.alt_text} onChange={(e) => setEditForm((f) => ({ ...f, alt_text: e.target.value }))} /></Field>
            <Field label="Folder">
              <Select value={editForm.folder} onChange={(e) => setEditForm((f) => ({ ...f, folder: e.target.value }))}>
                {MEDIA_FOLDERS.filter((f) => f !== "All").map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.filename}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
