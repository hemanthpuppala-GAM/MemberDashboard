import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Upload, Pencil, Trash2, Quote } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import Badge, { StatusBadge } from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const errorText = (err, fallback) => (err?.errors ? Object.values(err.errors).flat()[0] : err?.message ?? fallback);
const fmtDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

/** CMS → Quote of the day: the daily musings posters shown in the fourth card on the Home page. */
export default function DailyQuotesPage() {
  const { can } = usePermissions();
  const canCreate = can("cms.create");
  const canEdit = can("cms.edit");
  const canDelete = can("cms.delete");

  const [data, setData] = useState(null); // { today, current_id, quotes }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [upload, setUpload] = useState(null); // { files: File[], start_on, author, title, text }
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const picker = useRef(null);

  const load = () => api.dailyQuotes().then((d) => { setData(d); setError(""); }).catch((err) => setError(err.message ?? "Failed to load quotes"));

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  // The next free day after the last scheduled poster (or today), so a new batch continues the run.
  const nextFreeDay = () => {
    const today = data?.today ?? new Date().toISOString().slice(0, 10);
    const last = data?.quotes?.[0]?.show_on;
    if (!last || last < today) return today;
    const d = new Date(`${last}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const pick = (fileList) => {
    const files = [...(fileList || [])];
    if (picker.current) picker.current.value = "";
    if (!files.length) return;
    setUpload({ files, previews: files.map((f) => URL.createObjectURL(f)), start_on: nextFreeDay(), author: data?.quotes?.[0]?.author ?? "", title: "", text: "" });
  };

  const closeUpload = () => {
    upload?.previews.forEach((u) => URL.revokeObjectURL(u));
    setUpload(null);
  };

  const sendUpload = async () => {
    setBusy(true);
    try {
      const fd = new FormData();
      upload.files.forEach((f) => fd.append("images[]", f));
      fd.append("start_on", upload.start_on);
      if (upload.author.trim()) fd.append("author", upload.author.trim());
      if (upload.files.length === 1) {
        if (upload.title.trim()) fd.append("title", upload.title.trim());
        if (upload.text.trim()) fd.append("text", upload.text.trim());
      }
      const created = await api.createDailyQuotes(fd);
      toast.success(created.length === 1 ? "Quote added" : `${created.length} quotes scheduled, one a day`);
      closeUpload();
      await load();
    } catch (err) {
      toast.error(errorText(err, "Upload failed"));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    setBusy(true);
    try {
      await api.updateDailyQuote(editing.id, { title: editing.title || null, text: editing.text || null, author: editing.author || null, show_on: editing.show_on, status: editing.status });
      toast.success("Saved");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(errorText(err, "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api.deleteDailyQuote(toDelete.id);
      toast.success("Quote deleted");
      await load();
    } catch (err) {
      toast.error(errorText(err, "Delete failed"));
    } finally {
      setToDelete(null);
    }
  };

  const today = data?.today;
  const quotes = data?.quotes ?? [];
  const many = upload?.files.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Quote of the day</h1>
          <p className="mt-1 max-w-2xl text-[13.5px] text-[var(--a-text-muted)]">
            The Golden Age Daily Musings poster shown on the Home page, in the card beside the tree. Upload today’s, or a week’s worth at once — they go out one a day (India time). When there’s no quote, the card shows “Watch the intro”.
          </p>
        </div>
        <Button icon={Upload} onClick={() => picker.current?.click()} disabled={loading || !!error || !canCreate}>Upload posters</Button>
        <input ref={picker} type="file" accept="image/*" multiple className="hidden" onChange={(e) => pick(e.target.files)} />
      </div>

      {error && <p className="rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-surface-2)] px-4 py-3 text-[13.5px] text-[var(--a-text-primary)]">{error}</p>}

      <Card padded={false}>
        {!loading && !error && quotes.length === 0 ? (
          <EmptyState icon={Quote} title="No quotes yet" description="Upload a poster and it shows on the Home page today." />
        ) : (
          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-5">
            {quotes.map((q) => {
              const live = q.id === data.current_id;
              const upcoming = q.show_on > today;
              return (
                <div key={q.id} className={`flex flex-col overflow-hidden rounded-xl border ${live ? "border-[var(--a-accent)] ring-2 ring-[var(--a-accent-muted)]" : "border-[var(--a-border)]"}`}>
                  <img src={q.image_url} alt={q.title || "Quote poster"} loading="lazy" className="aspect-[9/16] w-full bg-[var(--a-bg-surface-2)] object-cover" />
                  <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {live ? <Badge tone="success">On Home now</Badge> : upcoming ? <Badge tone="info">Upcoming</Badge> : null}
                      {q.status !== "published" && <StatusBadge status={q.status} />}
                    </div>
                    <span className="text-[12.5px] font-semibold text-[var(--a-text-primary)]">{fmtDay(q.show_on)}</span>
                    {q.title && <span className="truncate text-[12px] text-[var(--a-text-muted)]">{q.title}</span>}
                    <div className="mt-auto flex justify-end gap-1">
                      <IconButton icon={Pencil} label="Edit" variant="accent" disabled={!canEdit} onClick={() => setEditing({ ...q, title: q.title ?? "", text: q.text ?? "", author: q.author ?? "" })} />
                      <IconButton icon={Trash2} label="Delete" variant="danger" disabled={!canDelete} onClick={() => setToDelete(q)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={!!upload}
        onClose={closeUpload}
        title={many ? `Schedule ${upload.files.length} posters` : "Add quote"}
        description={many ? "One poster a day, in the order shown, starting from the date below." : undefined}
        footer={<Button onClick={sendUpload} disabled={busy || !upload?.start_on}>{busy ? "Uploading…" : many ? "Schedule" : "Add"}</Button>}
      >
        {upload && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {upload.files.map((f, i) => (
                <figure key={i} className="w-20 shrink-0 text-center">
                  <img src={upload.previews[i]} alt="" className="aspect-[9/16] w-20 rounded-md object-cover" />
                  {many && <figcaption className="mt-1 text-[11px] text-[var(--a-text-muted)]">Day {i + 1}</figcaption>}
                </figure>
              ))}
            </div>
            <Field label={many ? "First day" : "Show on"} required>
              <TextInput type="date" value={upload.start_on} onChange={(e) => setUpload((u) => ({ ...u, start_on: e.target.value }))} />
            </Field>
            <Field label="Author" hint="Printed under the poster on the Home page">
              <TextInput value={upload.author} onChange={(e) => setUpload((u) => ({ ...u, author: e.target.value }))} placeholder="Sreedhar Saraswathi" />
            </Field>
            {!many && (
              <>
                <Field label="Title" hint="Optional — e.g. Jnanagni Dhagdha Karmanam">
                  <TextInput value={upload.title} onChange={(e) => setUpload((u) => ({ ...u, title: e.target.value }))} />
                </Field>
                <Field label="Words on the poster" hint="Optional — read out by screen readers and used when sharing">
                  <TextArea rows={4} value={upload.text} onChange={(e) => setUpload((u) => ({ ...u, text: e.target.value }))} />
                </Field>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit quote"
        footer={<Button onClick={saveEdit} disabled={busy || !editing?.show_on}>{busy ? "Saving…" : "Save"}</Button>}
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <Field label="Show on" required>
              <TextInput type="date" value={editing.show_on} onChange={(e) => setEditing((q) => ({ ...q, show_on: e.target.value }))} />
            </Field>
            <Field label="Title"><TextInput value={editing.title} onChange={(e) => setEditing((q) => ({ ...q, title: e.target.value }))} /></Field>
            <Field label="Author"><TextInput value={editing.author} onChange={(e) => setEditing((q) => ({ ...q, author: e.target.value }))} /></Field>
            <Field label="Words on the poster"><TextArea rows={4} value={editing.text} onChange={(e) => setEditing((q) => ({ ...q, text: e.target.value }))} /></Field>
            <Field label="Status">
              <Select value={editing.status} onChange={(e) => setEditing((q) => ({ ...q, status: e.target.value }))}>
                <option value="published">Published</option>
                <option value="draft">Draft (hidden)</option>
              </Select>
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmModal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this quote?" description="It disappears from the Home page and the previous days list." onConfirm={remove} />
    </div>
  );
}
