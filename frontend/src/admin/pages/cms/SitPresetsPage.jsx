import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Timer, Music2, MicVocal } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const EMPTY = { title: "", duration_minutes: 20, music_track_id: "", status: "draft" };

export default function SitPresetsPage() {
  const { can } = usePermissions();
  const canCreate = can("music.create");
  const canEdit = can("music.edit");
  const canDelete = can("music.delete");

  const [presets, setPresets] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const publishedTracks = useMemo(() => tracks.filter((t) => t.status === "published"), [tracks]);
  const sorted = useMemo(() => [...presets].sort((a, b) => a.sort_order - b.sort_order), [presets]);

  const load = () => Promise.all([api.sitPresets(), api.music()]).then(([p, m]) => {
    setPresets(p);
    setTracks(m);
  });

  useEffect(() => {
    load()
      .catch((err) => toast.error(err.message ?? "Failed to load sit presets"))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (p) => {
    setForm({
      title: p.title,
      duration_minutes: p.duration_minutes,
      music_track_id: p.music_track_id ?? "",
      status: p.status,
    });
    setEditing(p);
  };

  const save = async () => {
    if (!form.title.trim() || !form.duration_minutes) return;
    const payload = { ...form, music_track_id: form.music_track_id || null };
    try {
      if (editing?.id) {
        await api.updateSitPreset(editing.id, payload);
        toast.success("Preset updated");
      } else {
        await api.createSitPreset(payload);
        toast.success("Preset added");
      }
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    }
  };

  const move = async (id, direction) => {
    const idx = sorted.findIndex((p) => p.id === id);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return;
    const ids = sorted.map((p) => p.id);
    [ids[idx], ids[swapWith]] = [ids[swapWith], ids[idx]];
    try {
      const updated = await api.reorderSitPresets(ids);
      setPresets(updated);
    } catch (err) {
      toast.error(err.message ?? "Reorder failed");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteSitPreset(toDelete.id);
      toast.success("Preset deleted");
      await load();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Meditation presets</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            The session options members choose from on "Sit & Scribe" — some silent, some paired with a track from the Music library.
          </p>
        </div>
        <Button as="button" icon={Plus} onClick={openNew} disabled={loading || !canCreate} title={canCreate ? undefined : "You don't have permission to add presets"}>
          Add preset
        </Button>
      </div>

      <Card padded={false}>
        {!loading && sorted.length === 0 ? (
          <EmptyState icon={Timer} title="No presets yet" description="Add at least one preset so members have a session to start on Sit & Scribe." />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--a-border)]">
            {sorted.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]">
                  {p.music_track_id ? <MicVocal size={16} /> : <Timer size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-[var(--a-text-primary)]">{p.title}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="truncate text-[12.5px] text-[var(--a-text-muted)]">
                    {p.duration_minutes} min · {p.track ? (
                      <span className="inline-flex items-center gap-1"><Music2 size={11} />{p.track.title}</span>
                    ) : "Silent"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={ChevronUp} label="Move up" onClick={() => move(p.id, "up")} disabled={!canEdit || i === 0} />
                  <IconButton icon={ChevronDown} label="Move down" onClick={() => move(p.id, "down")} disabled={!canEdit || i === sorted.length - 1} />
                  <IconButton icon={Pencil} label={canEdit ? "Edit" : "You don't have permission to edit presets"} variant="accent" disabled={!canEdit} onClick={() => openEdit(p)} />
                  <IconButton icon={Trash2} label={canDelete ? "Delete" : "You don't have permission to delete presets"} variant="danger" disabled={!canDelete} onClick={() => setToDelete(p)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit preset" : "Add preset"}
        footer={<Button as="button" onClick={save} disabled={!form.title.trim() || !form.duration_minutes}>{editing?.id ? "Save" : "Add"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required hint='e.g. "Silent Sit — 20 min" or "Chanting — 20 min"'>
            <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="Duration (minutes)" required>
            <TextInput type="number" min={1} max={180} value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))} />
          </Field>
          <Field label="Music track" hint="Leave as 'No music' for a silent sit">
            <Select value={form.music_track_id} onChange={(e) => setForm((f) => ({ ...f, music_track_id: e.target.value }))}>
              <option value="">No music (silent)</option>
              {publishedTracks.map((t) => <option key={t.id} value={t.id}>{t.title} — {t.category}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
