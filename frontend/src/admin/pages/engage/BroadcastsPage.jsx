import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Radio, Trash2, Pencil, Megaphone } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import { api } from "../../../lib/api";

const TYPES = [
  { value: "text_banner", label: "Text banner" },
  { value: "popup_card", label: "Popup card" },
  { value: "media_popup", label: "Media popup" },
  { value: "news_ticker", label: "News ticker" },
];
const FREQUENCIES = ["every_visit", "once_per_session", "once_per_day", "once_ever"];
const AUDIENCES = ["all", "new_visitors", "returning"];
const EMPTY = {
  title: "", type: "popup_card", content_text: "", cta_label: "", cta_url: "", target_pages: [],
  audience: "all", active_from: "", active_until: "", show_after_seconds: 0, frequency: "once_per_session", status: "draft",
};

function Preview({ form }) {
  if (form.type === "text_banner") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--a-accent)] px-4 py-2.5 text-white">
        <span className="text-[12.5px] font-medium">{form.content_text || "Banner text goes here"}</span>
        {form.cta_label && <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">{form.cta_label}</span>}
      </div>
    );
  }
  if (form.type === "news_ticker") {
    return (
      <div className="overflow-hidden rounded-lg bg-[var(--a-bg-surface-2)] px-4 py-2">
        <span className="text-[12.5px] font-medium whitespace-nowrap text-[var(--a-text-primary)]">{form.content_text || "Ticker text scrolls here"} · {form.content_text || "Ticker text scrolls here"}</span>
      </div>
    );
  }
  return (
    <div className="mx-auto w-64 rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-4 shadow-[var(--a-shadow)]">
      {form.type === "media_popup" && <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-[var(--a-bg-surface-2)] text-[var(--a-text-faint)]"><Megaphone size={22} /></div>}
      <p className="text-[13.5px] font-semibold text-[var(--a-text-primary)]">{form.title || "Popup title"}</p>
      <p className="mt-1 text-[12px] text-[var(--a-text-muted)]">{form.content_text || "Popup body text"}</p>
      {form.cta_label && <div className="mt-3 w-fit rounded-lg bg-[var(--a-accent)] px-3 py-1.5 text-[11.5px] font-semibold text-white">{form.cta_label}</div>}
    </div>
  );
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const loadBroadcasts = () => api.broadcasts().then(setBroadcasts);

  useEffect(() => {
    Promise.all([loadBroadcasts(), api.pages().then(setPages)])
      .catch((err) => toast.error(err.message ?? "Failed to load broadcasts"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY); setModal("new"); };
  const openEdit = (b) => {
    setForm({
      title: b.title, type: b.type, content_text: b.content_text ?? "", cta_label: b.cta_label ?? "", cta_url: b.cta_url ?? "",
      target_pages: b.target_pages ?? [], audience: b.audience, active_from: b.active_from ?? "", active_until: b.active_until ?? "",
      show_after_seconds: b.show_after_seconds ?? 0, frequency: b.frequency, status: b.status,
    });
    setModal(b);
  };

  const togglePage = (slug) => setForm((f) => ({ ...f, target_pages: f.target_pages.includes(slug) ? f.target_pages.filter((s) => s !== slug) : [...f.target_pages, slug] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, active_from: form.active_from || null, active_until: form.active_until || null };
      if (modal === "new") { await api.createBroadcast(payload); toast.success("Broadcast created"); }
      else { await api.updateBroadcast(modal.id, payload); toast.success("Broadcast updated"); }
      setModal(null);
      await loadBroadcasts();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteBroadcast(toDelete.id);
      toast.success("Broadcast deleted");
      await loadBroadcasts();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "title", header: "Title", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { id: "type", header: "Type", accessorFn: (b) => TYPES.find((t) => t.value === b.type)?.label ?? b.type },
      { accessorKey: "audience", header: "Audience", cell: ({ getValue }) => <span className="capitalize">{String(getValue()).replace("_", " ")}</span> },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      { accessorKey: "active_until", header: "Runs until", cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleDateString() : "—") },
      {
        id: "actions", header: "", enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(row.original)} />
            <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Broadcasts</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Pop-ups and banners shown to website visitors.</p>
        </div>
        <Button as="button" icon={Plus} onClick={openCreate} disabled={loading}>New broadcast</Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable columns={columns} data={broadcasts} searchPlaceholder="Search broadcasts..." emptyIcon={Radio} emptyTitle={loading ? "Loading…" : "No broadcasts yet"} />
        </div>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "new" ? "New broadcast" : "Edit broadcast"}
        size="xl"
        footer={<Button as="button" onClick={handleSave} disabled={!form.title || saving}>{modal === "new" ? "Create broadcast" : "Save changes"}</Button>}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Field label="Title" required><TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </Field>
            <Field label="Content"><TextArea rows={3} value={form.content_text} onChange={(e) => setForm((f) => ({ ...f, content_text: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="CTA label" hint="Optional"><TextInput value={form.cta_label} onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))} /></Field>
              <Field label="CTA URL" hint="Optional"><TextInput value={form.cta_url} onChange={(e) => setForm((f) => ({ ...f, cta_url: e.target.value }))} /></Field>
            </div>
            <Field label="Target pages">
              <div className="flex flex-wrap gap-1.5">
                {pages.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => togglePage(p.slug)}
                    className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                      form.target_pages.includes(p.slug) ? "bg-[var(--a-accent)] text-white" : "bg-[var(--a-bg-surface-2)] text-[var(--a-text-muted)]"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Audience">
                <Select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}>
                  {AUDIENCES.map((a) => <option key={a} value={a}>{a.replace("_", " ")}</option>)}
                </Select>
              </Field>
              <Field label="Delay (s)"><TextInput type="number" value={form.show_after_seconds} onChange={(e) => setForm((f) => ({ ...f, show_after_seconds: Number(e.target.value) }))} /></Field>
              <Field label="Frequency">
                <Select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}>
                  {FREQUENCIES.map((fr) => <option key={fr} value={fr}>{fr.replace(/_/g, " ")}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="From"><TextInput type="date" value={form.active_from ?? ""} onChange={(e) => setForm((f) => ({ ...f, active_from: e.target.value }))} /></Field>
              <Field label="Until"><TextInput type="date" value={form.active_until ?? ""} onChange={(e) => setForm((f) => ({ ...f, active_until: e.target.value }))} /></Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </Select>
              </Field>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Live preview</p>
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--a-border)] bg-[var(--a-bg-base)] p-6">
              <Preview form={form} />
            </div>
          </div>
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
