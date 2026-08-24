import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { Plus, QrCode as QrIcon, Trash2, Download, Copy } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, Select } from "../../ui/Field";
import ColorField from "../../ui/ColorField";
import ImageField from "../../ui/ImageField";
import MediaPickerModal from "../../ui/MediaPickerModal";
import { api, downloadAuthed, storageUrl } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const TYPES = [
  { value: "url", label: "URL", fields: [["url", "URL"]] },
  { value: "text", label: "Text", fields: [["text", "Text"]] },
  { value: "email", label: "Email", fields: [["address", "Address"], ["subject", "Subject"], ["body", "Body"]] },
  { value: "phone", label: "Phone", fields: [["phone", "Phone number"]] },
  { value: "sms", label: "SMS", fields: [["phone", "Phone number"], ["message", "Message"]] },
  { value: "vcard", label: "vCard", fields: [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["address", "Address"], ["website", "Website"]] },
  { value: "wifi", label: "WiFi", fields: [["ssid", "Network name (SSID)"], ["password", "Password"], ["encryption", "Encryption (WPA/WEP/nopass)"]] },
  { value: "location", label: "Location", fields: [["lat", "Latitude"], ["lng", "Longitude"]] },
];

function buildPreviewValue(type, d = {}) {
  switch (type) {
    case "url": return d.url || "https://";
    case "text": return d.text || "";
    case "email": return `mailto:${d.address || ""}?subject=${encodeURIComponent(d.subject || "")}&body=${encodeURIComponent(d.body || "")}`;
    case "phone": return `tel:${d.phone || ""}`;
    case "sms": return `sms:${d.phone || ""}?body=${encodeURIComponent(d.message || "")}`;
    case "vcard": return `BEGIN:VCARD\nVERSION:3.0\nFN:${d.name || ""}\nEMAIL:${d.email || ""}\nTEL:${d.phone || ""}\nADR:${d.address || ""}\nURL:${d.website || ""}\nEND:VCARD`;
    case "wifi": return `WIFI:S:${d.ssid || ""};T:${d.encryption || "WPA"};P:${d.password || ""};;`;
    case "location": return `geo:${d.lat || "0"},${d.lng || "0"}`;
    default: return "";
  }
}

const EMPTY = { title: "", type: "url", inputData: {}, fg: "#111827", bg: "#FFFFFF", size: 300, ecLevel: "M", logoUrl: "" };

export default function QrCodesPage() {
  const { can } = usePermissions();
  const canGenerate = can("qrcode.generate");
  const canDelete = can("qrcode.delete");

  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadQrCodes = () => api.qrCodes().then(setQrCodes);

  useEffect(() => {
    loadQrCodes()
      .catch((err) => toast.error(err.message ?? "Failed to load QR codes"))
      .finally(() => setLoading(false));
  }, []);

  const typeDef = TYPES.find((t) => t.value === form.type);
  const previewValue = useMemo(() => buildPreviewValue(form.type, form.inputData), [form.type, form.inputData]);

  const setField = (key) => (v) => setForm((f) => ({ ...f, inputData: { ...f.inputData, [key]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.generateQrCode({
        title: form.title, type: form.type, input_data: form.inputData,
        options: { size: form.size, fg: form.fg, bg: form.bg, errorCorrection: form.ecLevel, logo: form.logoUrl || null },
      });
      toast.success("QR code generated");
      setModalOpen(false);
      setForm(EMPTY);
      await loadQrCodes();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Generation failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (qr) => {
    try {
      await downloadAuthed(api.qrCodeDownloadPath(qr.id), `${qr.title || "qr-code"}.png`);
      setQrCodes((prev) => prev.map((q) => (q.id === qr.id ? { ...q, download_count: q.download_count + 1 } : q)));
    } catch (err) {
      toast.error(err.message ?? "Download failed");
    }
  };

  const copyValue = async (qr) => {
    try { await navigator.clipboard.writeText(buildPreviewValue(qr.type, qr.input_data)); toast.success("Value copied"); } catch { toast.error("Couldn't copy"); }
  };

  const handleDelete = async () => {
    try {
      await api.deleteQrCode(toDelete.id);
      toast.success("QR code deleted");
      await loadQrCodes();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "preview", header: "", enableSorting: false,
        cell: ({ row }) => <img src={storageUrl(row.original.file_path)} alt="" className="h-9 w-9 rounded border border-[var(--a-border)] object-contain" />,
      },
      { accessorKey: "title", header: "Title", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { id: "type", header: "Type", accessorFn: (q) => TYPES.find((t) => t.value === q.type)?.label ?? q.type },
      { accessorKey: "created_at", header: "Created", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      { accessorKey: "download_count", header: "Downloads" },
      {
        id: "actions", header: "", enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <IconButton icon={Copy} label="Copy value" onClick={() => copyValue(row.original)} />
            <IconButton icon={Download} label="Download" onClick={() => handleDownload(row.original)} />
            <IconButton icon={Trash2} label={canDelete ? "Delete" : "You don't have permission to delete QR codes"} variant="danger" disabled={!canDelete} onClick={() => setToDelete(row.original)} />
          </div>
        ),
      },
    ],
    [canDelete]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">QR codes</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Generate, customize, and download QR codes for print or digital use.</p>
        </div>
        <Button as="button" icon={Plus} onClick={() => { setForm(EMPTY); setModalOpen(true); }} disabled={loading || !canGenerate} title={canGenerate ? undefined : "You don't have permission to generate QR codes"}>New QR code</Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable columns={columns} data={qrCodes} searchPlaceholder="Search QR codes..." emptyIcon={QrIcon} emptyTitle={loading ? "Loading…" : "No QR codes yet"} />
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New QR code"
        size="xl"
        footer={<Button as="button" onClick={handleSave} disabled={!form.title || saving}>{saving ? "Generating…" : "Generate QR code"}</Button>}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Field label="Title" required><TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, inputData: {} }))}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </Field>
            {typeDef.fields.map(([key, label]) => (
              <Field key={key} label={label}><TextInput value={form.inputData[key] ?? ""} onChange={(e) => setField(key)(e.target.value)} /></Field>
            ))}

            <p className="mt-2 text-[11px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Customization</p>
            <div className="grid grid-cols-2 gap-4">
              <ColorField label="Foreground" value={form.fg} onChange={(v) => setForm((f) => ({ ...f, fg: v }))} />
              <ColorField label="Background" value={form.bg} onChange={(v) => setForm((f) => ({ ...f, bg: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Size (px)"><TextInput type="number" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: Number(e.target.value) }))} /></Field>
              <Field label="Error correction" hint={form.logoUrl ? "Q or H recommended with a center logo" : undefined}>
                <Select value={form.ecLevel} onChange={(e) => setForm((f) => ({ ...f, ecLevel: e.target.value }))}>
                  {["L", "M", "Q", "H"].map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>
            </div>
            <ImageField
              label="Center logo (optional)"
              value={form.logoUrl}
              onChange={(v) => setForm((f) => ({ ...f, logoUrl: v }))}
              onPick={() => setPickerOpen(true)}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="self-start text-[11px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Live preview</p>
            <p className="self-start text-[11.5px] text-[var(--a-text-muted)]">Rendered client-side for preview — the real file is generated server-side on save.</p>
            <div className="flex items-center justify-center rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-6">
              <QRCodeSVG
                value={previewValue}
                size={Math.min(form.size, 260)}
                fgColor={form.fg}
                bgColor={form.bg}
                level={form.ecLevel}
                imageSettings={
                  form.logoUrl
                    ? { src: form.logoUrl, height: Math.round(Math.min(form.size, 260) / 5), width: Math.round(Math.min(form.size, 260) / 5), excavate: true }
                    : undefined
                }
              />
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

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
      />
    </div>
  );
}
