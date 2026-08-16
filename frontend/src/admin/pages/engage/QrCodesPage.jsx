import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Plus, QrCode as QrIcon, Trash2, Download, Copy, UploadCloud } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, Select } from "../../ui/Field";
import ColorField from "../../ui/ColorField";
import { useAdminData } from "../../store/useAdminData";

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

function buildValue(type, d = {}) {
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

const EMPTY = { title: "", type: "url", inputData: {}, fg: "#111827", bg: "#FFFFFF", size: 220, ecLevel: "M", logo: "" };

export default function QrCodesPage() {
  const { qrCodes, addQrCode, deleteQrCode, bumpQrDownload } = useAdminData();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const canvasRef = useRef(null);
  const logoInput = useRef(null);

  const typeDef = TYPES.find((t) => t.value === form.type);
  const value = useMemo(() => buildValue(form.type, form.inputData), [form.type, form.inputData]);

  const setField = (key) => (v) => setForm((f) => ({ ...f, inputData: { ...f.inputData, [key]: v } }));

  const handleSave = () => {
    addQrCode({ title: form.title, type: form.type, inputData: form.inputData, fg: form.fg, bg: form.bg });
    toast.success("QR code saved");
    setModalOpen(false);
    setForm(EMPTY);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${form.title || "qr-code"}.png`;
    a.click();
  };

  const downloadSvg = () => {
    const svg = canvasRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title || "qr-code"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyValue = async () => {
    try { await navigator.clipboard.writeText(value); toast.success("Value copied"); } catch { toast.error("Couldn't copy"); }
  };

  const columns = useMemo(
    () => [
      {
        id: "preview", header: "", enableSorting: false,
        cell: ({ row }) => <QRCodeCanvas value={buildValue(row.original.type, row.original.inputData)} size={36} fgColor={row.original.fg} bgColor={row.original.bg} />,
      },
      { accessorKey: "title", header: "Title", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { id: "type", header: "Type", accessorFn: (q) => TYPES.find((t) => t.value === q.type)?.label ?? q.type },
      { accessorKey: "createdAt", header: "Created", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      { accessorKey: "downloads", header: "Downloads" },
      {
        id: "actions", header: "", enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <IconButton icon={Download} label="Download" onClick={() => { bumpQrDownload(row.original.id); toast.success("Download counted (demo)"); }} />
            <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(row.original)} />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">QR codes</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Generate, customize, and download QR codes for print or digital use.</p>
        </div>
        <Button as="button" icon={Plus} onClick={() => { setForm(EMPTY); setModalOpen(true); }}>New QR code</Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable columns={columns} data={qrCodes} searchPlaceholder="Search QR codes..." emptyIcon={QrIcon} emptyTitle="No QR codes yet" />
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New QR code"
        size="xl"
        footer={<Button as="button" onClick={handleSave} disabled={!form.title}>Save QR code</Button>}
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
              <Field label="Error correction">
                <Select value={form.ecLevel} onChange={(e) => setForm((f) => ({ ...f, ecLevel: e.target.value }))}>
                  {["L", "M", "Q", "H"].map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Center logo" hint="Optional">
              <div className="flex items-center gap-2">
                <Button as="button" type="button" variant="secondary" size="sm" icon={UploadCloud} onClick={() => logoInput.current?.click()}>Upload logo</Button>
                {form.logo && <span className="text-[12px] text-[var(--a-text-muted)]">Logo attached</span>}
                <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && setForm((f) => ({ ...f, logo: URL.createObjectURL(e.target.files[0]) }))} />
              </div>
            </Field>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="self-start text-[11px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Live preview</p>
            <div ref={canvasRef} className="flex items-center justify-center rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-6">
              <div className="relative">
                <QRCodeCanvas value={value} size={form.size} fgColor={form.fg} bgColor={form.bg} level={form.ecLevel} className="hidden" />
                <QRCodeSVG value={value} size={form.size} fgColor={form.fg} bgColor={form.bg} level={form.ecLevel} imageSettings={form.logo ? { src: form.logo, height: form.size * 0.2, width: form.size * 0.2, excavate: true } : undefined} />
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button as="button" type="button" variant="secondary" size="sm" icon={Download} onClick={downloadPng}>PNG</Button>
              <Button as="button" type="button" variant="secondary" size="sm" icon={Download} onClick={downloadSvg}>SVG</Button>
              <Button as="button" type="button" variant="secondary" size="sm" icon={Copy} onClick={copyValue}>Copy value</Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        onConfirm={() => { deleteQrCode(toDelete.id); toast.success("QR code deleted"); }}
      />
    </div>
  );
}
