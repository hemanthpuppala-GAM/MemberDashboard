import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Headset, Check, ExternalLink } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import Badge from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const EMPTY = { kind: "core", name: "", phone: "", email: "", pin: "", is_active: true };
const KIND_LABEL = { core: "Core support", volunteer: "Volunteer" };
const DESK_URL = `${window.location.origin}${import.meta.env.BASE_URL}support`;

const errorText = (err, fallback) => (err?.errors ? Object.values(err.errors).flat()[0] : err?.message ?? fallback);

function formatLogin(value) {
  if (!value) return "Never";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/** People → Support team: who may sign in to the support desk at /support. */
export default function SupportTeamPage() {
  const { can } = usePermissions();
  const canEdit = can("members.edit");
  const noEdit = "You don't have permission to change the support team";

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // "new" | agent
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [toDeactivate, setToDeactivate] = useState(null);

  const load = () =>
    api
      .supportAgents()
      .then((rows) => setAgents(Array.isArray(rows) ? rows : []))
      .catch((err) => toast.error(err.message ?? "Failed to load the support team"));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isNew = editing === "new";
  const isCore = form.kind === "core";

  const openCreate = () => {
    setForm(EMPTY);
    setEditing("new");
  };
  const openEdit = (a) => {
    setForm({ kind: a.kind, name: a.name ?? "", phone: a.phone ?? "", email: a.email ?? "", pin: "", is_active: !!a.is_active });
    setEditing(a);
  };

  const pinOk = !form.pin || /^\d{4,8}$/.test(form.pin);
  const valid =
    form.name.trim() &&
    pinOk &&
    (isCore ? form.phone.trim() && (!isNew || form.pin) : /\S+@\S+\.\S+/.test(form.email.trim()));

  const handleSave = async () => {
    const payload = { kind: form.kind, name: form.name.trim(), is_active: form.is_active };
    if (isCore) {
      payload.phone = form.phone.trim();
      if (form.pin) payload.pin = form.pin;
    } else {
      payload.email = form.email.trim();
    }
    setSaving(true);
    try {
      if (isNew) {
        await api.createSupportAgent(payload);
        toast.success(`${payload.name} added to the support team`);
      } else {
        await api.updateSupportAgent(editing.id, payload);
        toast.success(form.pin ? "Saved — new PIN set, they've been signed out" : "Saved");
      }
      await load();
      setEditing(null);
    } catch (err) {
      toast.error(errorText(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (agent, active) => {
    setAgents((rows) => rows.map((r) => (r.id === agent.id ? { ...r, is_active: active } : r)));
    try {
      await api.updateSupportAgent(agent.id, { is_active: active });
      toast.success(active ? `${agent.name} can sign in again` : `${agent.name} deactivated and signed out`);
    } catch (err) {
      setAgents((rows) => rows.map((r) => (r.id === agent.id ? { ...r, is_active: !active } : r)));
      toast.error(errorText(err, "Could not update"));
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteSupportAgent(toDelete.id);
      toast.success(`${toDelete.name} removed`);
      await load();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={row.original.name} size={28} />
            <span className="font-semibold text-[var(--a-text-primary)]">{row.original.name}</span>
          </div>
        ),
      },
      {
        id: "kind",
        header: "Role",
        accessorFn: (a) => KIND_LABEL[a.kind] ?? a.kind,
        cell: ({ row, getValue }) => <Badge tone={row.original.kind === "core" ? "accent" : "info"}>{getValue()}</Badge>,
      },
      {
        id: "contact",
        header: "Sign-in",
        accessorFn: (a) => (a.kind === "core" ? a.phone : a.email) ?? "",
        cell: ({ getValue }) => <span className="break-all">{getValue() || "—"}</span>,
      },
      {
        accessorKey: "is_active",
        header: "Active",
        cell: ({ row }) => (
          <Toggle
            checked={!!row.original.is_active}
            disabled={!canEdit}
            label={row.original.is_active ? "Active" : "Off"}
            onChange={(v) => (v ? setActive(row.original, true) : setToDeactivate(row.original))}
          />
        ),
      },
      {
        accessorKey: "has_pin",
        header: "PIN set",
        cell: ({ row }) =>
          row.original.kind !== "core" ? (
            <span className="text-[var(--a-text-faint)]">Google</span>
          ) : row.original.has_pin ? (
            <Check size={16} className="text-[var(--a-success)]" aria-label="PIN set" />
          ) : (
            <span className="text-[var(--a-danger)]">No PIN</span>
          ),
      },
      { accessorKey: "last_login_at", header: "Last login", cell: ({ getValue }) => formatLogin(getValue()) },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <IconButton icon={Pencil} label={canEdit ? "Edit" : noEdit} disabled={!canEdit} onClick={() => openEdit(row.original)} />
            <IconButton icon={Trash2} label={canEdit ? "Remove" : noEdit} variant="danger" disabled={!canEdit} onClick={() => setToDelete(row.original)} />
          </div>
        ),
      },
    ],
    [canEdit],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Support team</h1>
          <p className="mt-1 max-w-[640px] text-[13.5px] text-[var(--a-text-muted)]">
            Core support sign in at /support with their phone number and PIN. Volunteers sign in with their Google account (the email listed here).
          </p>
          <a
            href={DESK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--a-accent)] hover:underline"
          >
            {DESK_URL} <ExternalLink size={13} />
          </a>
        </div>
        <Button as="button" icon={Plus} onClick={openCreate} disabled={loading || !canEdit} title={canEdit ? undefined : noEdit}>
          Add person
        </Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable
            columns={columns}
            data={agents}
            searchPlaceholder="Search the team..."
            emptyIcon={Headset}
            emptyTitle={loading ? "Loading support team…" : "No one on the support team yet"}
          />
        </div>
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={isNew ? "Add to support team" : `Edit ${editing?.name ?? ""}`}
        footer={
          <Button as="button" onClick={handleSave} disabled={!valid || saving}>
            {saving ? "Saving…" : isNew ? "Add person" : "Save changes"}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Role">
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Role">
              {[
                ["core", "Core support", "Phone number + PIN"],
                ["volunteer", "Volunteer", "Signs in with Google"],
              ].map(([k, label, sub]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={form.kind === k}
                  onClick={() => set({ kind: k })}
                  className={`flex min-h-[52px] flex-col items-start rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                    form.kind === k
                      ? "border-[var(--a-accent)] bg-[var(--a-accent-muted)]"
                      : "border-[var(--a-border)] hover:bg-[var(--a-bg-surface-2)]"
                  }`}
                >
                  <span className="text-[13.5px] font-semibold text-[var(--a-text-primary)]">{label}</span>
                  <span className="text-[12px] text-[var(--a-text-muted)]">{sub}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Name" required>
            <TextInput value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Full name" />
          </Field>

          {isCore ? (
            <>
              <Field label="Support phone" required hint="The number they type to sign in, e.g. 98480 12345 or +91 98480 12345.">
                <TextInput type="tel" inputMode="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+91 …" />
              </Field>
              <Field
                label={isNew ? "PIN" : "Reset PIN (optional)"}
                required={isNew}
                error={!pinOk ? "Use 4 to 8 digits." : undefined}
                hint={isNew ? "4–8 digits. Share it with them privately." : "Leave blank to keep their PIN. Resetting signs them out."}
              >
                <TextInput
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  value={form.pin}
                  onChange={(e) => set({ pin: e.target.value.replace(/\D/g, "") })}
                  placeholder={isNew ? "e.g. 4821" : "New PIN"}
                />
              </Field>
            </>
          ) : (
            <Field label="Member Gmail" required hint="The Google account they use to sign in as a member.">
              <TextInput type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@gmail.com" />
            </Field>
          )}

          <Toggle checked={form.is_active} onChange={(v) => set({ is_active: v })} label="Active" description="Inactive people can't sign in to the desk." />
        </div>
      </Modal>

      <Modal
        open={!!toDeactivate}
        onClose={() => setToDeactivate(null)}
        title={`Deactivate ${toDeactivate?.name ?? ""}?`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDeactivate(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setActive(toDeactivate, false);
                setToDeactivate(null);
              }}
            >
              Deactivate
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-[var(--a-text-muted)]">They'll be signed out of the support desk and can't sign in until you turn them back on. Their tickets stay as they are.</p>
      </Modal>

      <ConfirmModal open={!!toDelete} onClose={() => setToDelete(null)} title={`Remove ${toDelete?.name ?? ""} from the support team?`} confirmLabel="Remove" onConfirm={handleDelete} />
    </div>
  );
}
