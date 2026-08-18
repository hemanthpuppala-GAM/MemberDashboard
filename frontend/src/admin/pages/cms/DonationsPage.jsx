import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Copy, Landmark } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import { StatusBadge } from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import ImageUploader from "../../ui/ImageUploader";
import { api } from "../../../lib/api";

const EMPTY = {
  label: "", account_holder: "", bank_name: "", account_number: "", ifsc: "",
  branch: "", swift: "", upi_id: "", payout_link: "", notes: "", is_active: true,
};

function CopyField({ label, value }) {
  if (!value) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy — copy manually");
    }
  };
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--a-bg-surface-2)] px-3 py-2">
      <div className="min-w-0">
        <div className="text-[10.5px] font-medium tracking-wide text-[var(--a-text-muted)] uppercase">{label}</div>
        <div className="truncate text-[13px] font-medium text-[var(--a-text-primary)]">{value}</div>
      </div>
      <button type="button" onClick={copy} className="shrink-0 rounded-md p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface)] hover:text-[var(--a-accent)]" title={`Copy ${label}`}>
        <Copy size={14} />
      </button>
    </div>
  );
}

function toFormData(form, qrImageFile) {
  const fd = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (key === "is_active") { fd.append(key, value ? "1" : "0"); return; }
    if (value !== null && value !== undefined && value !== "") fd.append(key, value);
  });
  if (qrImageFile) fd.append("qr_image", qrImageFile);
  return fd;
}

export default function DonationsPage() {
  const [donationMethods, setDonationMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [qrImagePreview, setQrImagePreview] = useState("");
  const [qrImageFile, setQrImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadMethods = () => api.donationMethods().then(setDonationMethods);

  useEffect(() => {
    loadMethods()
      .catch((err) => toast.error(err.message ?? "Failed to load donation methods"))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => { setForm(EMPTY); setQrImagePreview(""); setQrImageFile(null); setEditing({}); };
  const openEdit = (d) => {
    setForm({
      label: d.label, account_holder: d.account_holder ?? "", bank_name: d.bank_name ?? "",
      account_number: d.account_number ?? "", ifsc: d.ifsc ?? "", branch: d.branch ?? "",
      swift: d.swift ?? "", upi_id: d.upi_id ?? "", payout_link: d.payout_link ?? "",
      notes: d.notes ?? "", is_active: d.is_active,
    });
    setQrImagePreview(d.qr_image_path ?? "");
    setQrImageFile(null);
    setEditing(d);
  };
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    try {
      const formData = toFormData(form, qrImageFile);
      if (editing?.id) {
        await api.updateDonationMethod(editing.id, formData);
        toast.success("Donation method updated");
      } else {
        await api.createDonationMethod(formData);
        toast.success("Donation method added");
      }
      setEditing(null);
      await loadMethods();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteDonationMethod(toDelete.id);
      toast.success("Donation method deleted");
      await loadMethods();
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
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Donations</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Bank accounts, UPI, and payment links shown on the public donate page — each with its own QR code. Deactivate an old account instead of deleting it to keep its history.
          </p>
        </div>
        <Button as="button" icon={Plus} onClick={openNew} disabled={loading}>Add donation method</Button>
      </div>

      {!loading && donationMethods.length === 0 ? (
        <Card><EmptyState icon={Landmark} title="No donation methods yet" description="Add a bank account, UPI ID, or payment link for supporters to give." /></Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {[...donationMethods].sort((a, b) => a.sort_order - b.sort_order).map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[var(--a-text-primary)]">{d.label}</h2>
                    <StatusBadge status={d.is_active ? "active" : "inactive"} />
                  </div>
                  {d.account_holder && <p className="mt-0.5 text-[12.5px] text-[var(--a-text-muted)]">{d.account_holder}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={Pencil} label="Edit" variant="accent" onClick={() => openEdit(d)} />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(d)} />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-1 flex-col gap-2">
                  <CopyField label="Bank name" value={d.bank_name} />
                  <CopyField label="Account number" value={d.account_number} />
                  <div className="grid grid-cols-2 gap-2">
                    <CopyField label="IFSC" value={d.ifsc} />
                    <CopyField label="SWIFT" value={d.swift} />
                  </div>
                  <CopyField label="UPI ID" value={d.upi_id} />
                  <CopyField label="Payment link" value={d.payout_link} />
                  {d.notes && <p className="mt-1 text-[12px] text-[var(--a-text-muted)] italic">{d.notes}</p>}
                </div>
                {d.qr_image_path && (
                  <img src={d.qr_image_path} alt={`${d.label} QR code`} className="h-28 w-28 shrink-0 self-start rounded-lg border border-[var(--a-border)] object-cover" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit donation method" : "Add donation method"}
        size="lg"
        footer={<Button as="button" onClick={save} disabled={!form.label.trim() || saving}>{editing?.id ? "Save" : "Add"}</Button>}
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label" required hint='e.g. "Bank Transfer — India"'>
              <TextInput value={form.label} onChange={(e) => set({ label: e.target.value })} />
            </Field>
            <Field label="Account holder name">
              <TextInput value={form.account_holder} onChange={(e) => set({ account_holder: e.target.value })} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank name"><TextInput value={form.bank_name} onChange={(e) => set({ bank_name: e.target.value })} /></Field>
            <Field label="Account number"><TextInput value={form.account_number} onChange={(e) => set({ account_number: e.target.value })} /></Field>
            <Field label="IFSC / routing code"><TextInput value={form.ifsc} onChange={(e) => set({ ifsc: e.target.value })} /></Field>
            <Field label="Branch"><TextInput value={form.branch} onChange={(e) => set({ branch: e.target.value })} /></Field>
            <Field label="SWIFT code"><TextInput value={form.swift} onChange={(e) => set({ swift: e.target.value })} /></Field>
            <Field label="UPI ID"><TextInput value={form.upi_id} onChange={(e) => set({ upi_id: e.target.value })} /></Field>
          </div>

          <Field label="Payment link" hint="Optional — PayPal.me, Stripe link, etc.">
            <TextInput value={form.payout_link} onChange={(e) => set({ payout_link: e.target.value })} />
          </Field>

          <Field label="Notes" hint="Shown below the details, e.g. instructions for international donors">
            <TextArea rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>

          <Field label="QR code image">
            <ImageUploader url={qrImagePreview} onChange={setQrImagePreview} onFileSelect={setQrImageFile} label="QR code" size={128} />
          </Field>

          <Toggle checked={form.is_active} onChange={(v) => set({ is_active: v })} label="Active" description="Inactive methods are hidden from the public donate page" />
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.label}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
