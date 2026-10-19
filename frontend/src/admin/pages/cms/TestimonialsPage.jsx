import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Star, Quote, MessageSquareQuote, PlayCircle, X, Clapperboard, Check, FolderDown } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import { StatusBadge } from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import Avatar from "../../ui/Avatar";
import ImageUploader from "../../ui/ImageUploader";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";
import useUploadLimit from "../../ui/useUploadLimit";

const EMPTY = { name: "", role: "", place: "", quote: "", video_url: "", rating: 5, status: "draft", is_featured: false };

const isYouTube = (url) => /(?:youtube\.com|youtu\.be)\//i.test(url || "");

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
        >
          <Star size={readOnly ? 13 : 20} className={n <= value ? "fill-[var(--a-warning)] text-[var(--a-warning)]" : "text-[var(--a-border)]"} />
        </button>
      ))}
    </div>
  );
}

function toFormData(form, photoFile, video) {
  const fd = new FormData();
  fd.append("name", form.name);
  if (form.role) fd.append("role", form.role);
  fd.append("place", form.place || "");
  fd.append("quote", form.quote);
  // Video: a new upload, a pasted YouTube/Shorts link, or "remove".
  if (video.file) fd.append("video", video.file);
  else if (form.video_url.trim()) fd.append("video_url", form.video_url.trim());
  else fd.append("remove_video", "1");
  fd.append("rating", form.rating);
  fd.append("status", form.status);
  fd.append("is_featured", form.is_featured ? "1" : "0");
  if (photoFile) fd.append("photo", photoFile);
  return fd;
}

export default function TestimonialsPage() {
  const { can } = usePermissions();
  const canCreate = can("testimonials.create");
  const canEdit = can("testimonials.edit");
  const canDelete = can("testimonials.delete");

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [shorts, setShorts] = useState(null); // null = picker closed; { loading } | { items, channel } | { error }

  const openShorts = () => {
    setShorts({ loading: true });
    api.youtubeShorts().then((r) => setShorts(r)).catch((err) => setShorts({ error: err.message ?? "Could not read the YouTube channel" }));
  };
  // Picking a Short opens a new testimonial with the link filled in; the title starts as the caption.
  const pickShort = (v) => {
    setShorts(null);
    setForm({ ...EMPTY, status: "published", video_url: v.url, quote: v.title });
    setPhotoPreview("");
    setPhotoFile(null);
    setVideoFile(null);
    setEditing({});
  };
  const maxMb = useUploadLimit();
  const [checkingDrive, setCheckingDrive] = useState(false);

  // Copies new videos from the team's Google Drive folder as drafts (a few per click; the rest daily).
  const checkDrive = async () => {
    setCheckingDrive(true);
    try {
      const r = await api.driveImport();
      const n = r.imported.length;
      if (n) toast.success(`${n} new video${n === 1 ? "" : "s"} from Drive added as drafts — add the details and publish.`, { duration: 6000 });
      else toast(r.skipped.length ? "Nothing new to add." : "No new videos in the Drive folder.");
      if (r.skipped.length) toast(`Skipped: ${r.skipped.join("; ")}`, { duration: 8000 });
      if (r.remaining) toast(`${r.remaining} more waiting — click again, or they come in with the daily check.`, { duration: 6000 });
      if (n) await loadTestimonials();
    } catch (err) {
      toast.error(err.message ?? "Could not read the Google Drive folder", { duration: 8000 });
    } finally {
      setCheckingDrive(false);
    }
  };

  const loadTestimonials = () => api.testimonials().then(setTestimonials);

  useEffect(() => {
    loadTestimonials()
      .catch((err) => toast.error(err.message ?? "Failed to load testimonials"))
      .finally(() => setLoading(false));
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const openNew = () => { setForm(EMPTY); setPhotoPreview(""); setPhotoFile(null); setVideoFile(null); setEditing({}); };
  const openEdit = (t) => {
    setForm({ name: t.name, role: t.role ?? "", place: t.place ?? "", quote: t.quote ?? "", video_url: t.video_url ?? "", rating: t.rating, status: t.status, is_featured: t.is_featured });
    setVideoFile(null);
    setPhotoPreview(t.photo_path ?? "");
    setPhotoFile(null);
    setEditing(t);
  };

  const save = async () => {
    if (!canSave) return;
    if (videoFile && maxMb && videoFile.size > maxMb * 1048576) {
      toast.error(`That video is larger than the server accepts (${maxMb} MB). Put it on YouTube and paste the link instead.`);
      return;
    }
    setSaving(true);
    try {
      const formData = toFormData(form, photoFile, { file: videoFile });
      if (editing?.id) {
        await api.updateTestimonial(editing.id, formData);
        toast.success("Testimonial updated");
      } else {
        await api.createTestimonial(formData);
        toast.success("Testimonial added");
      }
      setEditing(null);
      await loadTestimonials();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteTestimonial(toDelete.id);
      toast.success("Testimonial deleted");
      await loadTestimonials();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  // Newest first — the same order as the Home page stories (Drive videos by their Drive upload time).
  const sorted = [...testimonials].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id);
  const hasVideo = !!videoFile || !!form.video_url.trim();
  const canSave = !!form.name.trim() && (!!form.quote.trim() || hasVideo);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Testimonials</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Stories from members and practitioners shown on the public site. Feature the strongest ones to highlight them on the homepage. Add a video (a YouTube / Shorts link or an upload) and it also plays as a <strong>Seeker story</strong> on the Home page. Videos dropped into the team&apos;s Google Drive folder come in here as drafts every morning.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button as="button" variant="secondary" icon={FolderDown} onClick={checkDrive} disabled={loading || !canCreate || checkingDrive} title="New videos in the team's Google Drive folder come in as drafts (also checked every morning)">{checkingDrive ? "Copying from Drive…" : "Check Drive now"}</Button>
          <Button as="button" variant="secondary" icon={Clapperboard} onClick={openShorts} disabled={loading || !canCreate}>Import from YouTube</Button>
          <Button as="button" icon={Plus} onClick={openNew} disabled={loading || !canCreate} title={canCreate ? undefined : "You don't have permission to add testimonials"}>Add testimonial</Button>
        </div>
      </div>

      {!loading && sorted.length === 0 ? (
        <Card><EmptyState icon={MessageSquareQuote} title="No testimonials yet" description="Add a quote from a member or practitioner to build social proof." /></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((t) => (
            <Card key={t.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {t.photo_path ? (
                    <img src={t.photo_path} alt={t.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <Avatar name={t.name} size={40} />
                  )}
                  <div>
                    <p className="text-[13.5px] font-semibold text-[var(--a-text-primary)]">{t.name}</p>
                    <p className="text-[12px] text-[var(--a-text-muted)]">{[t.role, t.place].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={Pencil} label={canEdit ? "Edit" : "You don't have permission to edit testimonials"} variant="accent" disabled={!canEdit} onClick={() => openEdit(t)} />
                  <IconButton icon={Trash2} label={canDelete ? "Delete" : "You don't have permission to delete testimonials"} variant="danger" disabled={!canDelete} onClick={() => setToDelete(t)} />
                </div>
              </div>

              <StarRating value={t.rating} readOnly />

              {t.quote ? (
                <p className="relative text-[13px] leading-relaxed text-[var(--a-text-muted)]">
                  <Quote size={14} className="mb-1 text-[var(--a-accent)]" />
                  {t.quote}
                </p>
              ) : t.from_drive && t.status === "draft" ? (
                <p className="text-[12.5px] leading-relaxed text-[var(--a-text-muted)]">From the Drive folder. Check the name and town, add a short caption if you like, then set it to Published to show it on the Home page.</p>
              ) : null}

              <div className="mt-auto flex items-center gap-2 pt-1">
                <StatusBadge status={t.status} />
                {t.video_url && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--a-accent-muted)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-[var(--a-accent)] uppercase"><PlayCircle size={11} /> Video story</span>}
                {t.from_drive && t.status === "draft" && <span className="rounded-full bg-[var(--a-warning-muted)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-[var(--a-warning)] uppercase">New from Drive</span>}
                {t.is_featured && <span className="rounded-full bg-[var(--a-accent-muted)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-[var(--a-accent)] uppercase">Featured</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit testimonial" : "Add testimonial"}
        size="lg"
        footer={<Button as="button" onClick={save} disabled={!canSave || saving}>{saving ? (videoFile ? "Uploading video…" : "Saving…") : editing?.id ? "Save" : "Add"}</Button>}
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required><TextInput value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Role / description" hint='e.g. "Practitioner, 2 years"'>
              <TextInput value={form.role} onChange={(e) => set({ role: e.target.value })} />
            </Field>
          </div>

          <Field label="Town / city" hint='Shown under the name in the story, e.g. "Vizag"'>
            <TextInput value={form.place} onChange={(e) => set({ place: e.target.value })} />
          </Field>

          <Field label="Quote" required={!hasVideo} hint={hasVideo ? "Optional for a video — shown as a short caption under it" : undefined}>
            <TextArea rows={4} value={form.quote} onChange={(e) => set({ quote: e.target.value })} />
          </Field>

          <Field label="Video (optional)" hint={`Best: put it on YouTube (a Short works well) and paste the link. Or upload an MP4 up to ${maxMb || 50} MB. Upright (9:16) phone videos look best.`}>
            {videoFile ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--a-border)] px-3 py-2 text-[13px]">
                <span className="inline-flex min-w-0 items-center gap-2"><PlayCircle size={16} className="shrink-0 text-[var(--a-accent)]" /><span className="truncate">{videoFile.name}</span> <span className="text-[var(--a-text-faint)]">{(videoFile.size / 1048576).toFixed(1)} MB</span></span>
                <IconButton icon={X} label="Remove" onClick={() => setVideoFile(null)} />
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <TextInput placeholder="https://youtube.com/shorts/…" value={form.video_url} onChange={(e) => set({ video_url: e.target.value })} className="flex-1" />
                <span className="text-center text-[12px] text-[var(--a-text-faint)]">or</span>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--a-border)] px-3 py-2 text-[13px] font-medium text-[var(--a-text-primary)] hover:bg-[var(--a-bg-surface-2)]">
                  Upload a video
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setVideoFile(f); set({ video_url: "" }); } e.target.value = ""; }} />
                </label>
              </div>
            )}
            {!videoFile && form.video_url && !isYouTube(form.video_url) && !/\.(mp4|webm|mov)(\?|$)/i.test(form.video_url) && (
              <p className="mt-1.5 text-[12px] text-[var(--a-warning)]">Paste a YouTube link (youtube.com/… or youtu.be/…), or upload the file.</p>
            )}
          </Field>

          <Field label="Photo" hint="Optional — falls back to initials">
            <ImageUploader url={photoPreview} onChange={setPhotoPreview} onFileSelect={setPhotoFile} label="photo" size={96} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rating">
              <StarRating value={form.rating} onChange={(n) => set({ rating: n })} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set({ status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </div>

          <Toggle checked={form.is_featured} onChange={(v) => set({ is_featured: v })} label="Featured" description="Highlighted on the homepage instead of just the testimonials page" />
        </div>
      </Modal>

      <Modal
        open={!!shorts}
        onClose={() => setShorts(null)}
        title="Import a Short from YouTube"
        description={shorts?.channel ? `Latest Shorts from ${shorts.channel}. Pick the ones that are member testimonials — each becomes a Seeker story on the Home page.` : undefined}
        size="lg"
      >
        {shorts?.loading ? (
          <p className="py-10 text-center text-[13.5px] text-[var(--a-text-muted)]">Reading the channel…</p>
        ) : shorts?.error ? (
          <p className="py-6 text-center text-[13.5px] text-[var(--a-text-muted)]">{shorts.error}</p>
        ) : shorts?.items?.length === 0 ? (
          <p className="py-6 text-center text-[13.5px] text-[var(--a-text-muted)]">No Shorts found on the channel.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(shorts?.items ?? []).map((v) => (
              <div key={v.id} className="flex flex-col overflow-hidden rounded-xl border border-[var(--a-border)]">
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-[9/12] bg-black">
                  <img src={v.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <PlayCircle size={30} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 drop-shadow" />
                </a>
                <div className="flex flex-1 flex-col gap-2 p-2.5">
                  <p className="line-clamp-2 text-[12.5px] font-medium text-[var(--a-text-primary)]">{v.title}</p>
                  {v.added ? (
                    <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--a-success)]"><Check size={14} /> Already added</span>
                  ) : (
                    <Button as="button" size="sm" className="mt-auto" onClick={() => pickShort(v)}>Add as story</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete testimonial from "${toDelete?.name}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
