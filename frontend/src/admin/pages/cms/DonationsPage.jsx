import { useState } from "react";
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
import { useAdminData } from "../../store/useAdminData";

const EMPTY = {
  label: "", accountHolder: "", bankName: "", accountNumber: "", ifsc: "",
  branch: "", swift: "", upiId: "", payoutLink: "", qrImageUrl: "", notes: "", isActive: true,
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

export default function DonationsPage() {
  const { donationMethods, addDonationMethod, updateDonationMethod, deleteDonationMethod } = useAdminData();
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (d) => { setForm(d); setEditing(d); };
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    if (!form.label.trim()) return;
    if (editing?.id) {
      updateDonationMethod(editing.id, form);
      toast.success("Donation method updated");
    } else {
      addDonationMethod(form);
      toast.success("Donation method added");
    }
    setEditing(null);
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
        <Button as="button" icon={Plus} onClick={openNew}>Add donation method</Button>
      </div>

      {donationMethods.length === 0 ? (
        <Card><EmptyState icon={Landmark} title="No donation methods yet" description="Add a bank account, UPI ID, or payment link for supporters to give." /></Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {[...donationMethods].sort((a, b) => a.order - b.order).map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[var(--a-text-primary)]">{d.label}</h2>
                    <StatusBadge status={d.isActive ? "active" : "inactive"} />
                  </div>
                  {d.accountHolder && <p className="mt-0.5 text-[12.5px] text-[var(--a-text-muted)]">{d.accountHolder}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={Pencil} label="Edit" variant="accent" onClick={() => openEdit(d)} />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(d)} />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-1 flex-col gap-2">
                  <CopyField label="Bank name" value={d.bankName} />
                  <CopyField label="Account number" value={d.accountNumber} />
                  <div className="grid grid-cols-2 gap-2">
                    <CopyField label="IFSC" value={d.ifsc} />
                    <CopyField label="SWIFT" value={d.swift} />
                  </div>
                  <CopyField label="UPI ID" value={d.upiId} />
                  <CopyField label="Payment link" value={d.payoutLink} />
                  {d.notes && <p className="mt-1 text-[12px] text-[var(--a-text-muted)] italic">{d.notes}</p>}
                </div>
                {d.qrImageUrl && (
                  <img src={d.qrImageUrl} alt={`${d.label} QR code`} className="h-28 w-28 shrink-0 self-start rounded-lg border border-[var(--a-border)] object-cover" />
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
        footer={<Button as="button" onClick={save} disabled={!form.label.trim()}>{editing?.id ? "Save" : "Add"}</Button>}
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label" required hint='e.g. "Bank Transfer — India"'>
              <TextInput value={form.label} onChange={(e) => set({ label: e.target.value })} />
            </Field>
            <Field label="Account holder name">
              <TextInput value={form.accountHolder} onChange={(e) => set({ accountHolder: e.target.value })} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank name"><TextInput value={form.bankName} onChange={(e) => set({ bankName: e.target.value })} /></Field>
            <Field label="Account number"><TextInput value={form.accountNumber} onChange={(e) => set({ accountNumber: e.target.value })} /></Field>
            <Field label="IFSC / routing code"><TextInput value={form.ifsc} onChange={(e) => set({ ifsc: e.target.value })} /></Field>
            <Field label="Branch"><TextInput value={form.branch} onChange={(e) => set({ branch: e.target.value })} /></Field>
            <Field label="SWIFT code"><TextInput value={form.swift} onChange={(e) => set({ swift: e.target.value })} /></Field>
            <Field label="UPI ID"><TextInput value={form.upiId} onChange={(e) => set({ upiId: e.target.value })} /></Field>
          </div>

          <Field label="Payment link" hint="Optional — PayPal.me, Stripe link, etc.">
            <TextInput value={form.payoutLink} onChange={(e) => set({ payoutLink: e.target.value })} />
          </Field>

          <Field label="Notes" hint="Shown below the details, e.g. instructions for international donors">
            <TextArea rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>

          <Field label="QR code image">
            <ImageUploader url={form.qrImageUrl} onChange={(url) => set({ qrImageUrl: url })} label="QR code" size={128} />
          </Field>

          <Toggle checked={form.isActive} onChange={(v) => set({ isActive: v })} label="Active" description="Inactive methods are hidden from the public donate page" />
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.label}"?`}
        onConfirm={() => { deleteDonationMethod(toDelete.id); toast.success("Donation method deleted"); }}
      />
    </div>
  );
}
