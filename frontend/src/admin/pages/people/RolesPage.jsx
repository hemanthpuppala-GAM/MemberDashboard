import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ShieldCheck, Lock, Check } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea } from "../../ui/Field";
import Badge from "../../ui/Badge";
import { useAdminData } from "../../store/useAdminData";
import { PERMISSION_GROUPS } from "../../mock/mockData";

function groupsGranted(role) {
  if (role.permissions === "all") return PERMISSION_GROUPS.map((g) => g.group);
  return [...new Set(role.permissions.map((p) => p.split(".")[0]))];
}

export default function RolesPage() {
  const { roles, addRole, updateRole, deleteRole } = useAdminData();
  const [modalRole, setModalRole] = useState(null);
  const [form, setForm] = useState({ displayName: "", description: "", permissions: [] });
  const [toDelete, setToDelete] = useState(null);

  const openCreate = () => { setForm({ displayName: "", description: "", permissions: [] }); setModalRole("new"); };
  const openEdit = (role) => { setForm({ displayName: role.displayName, description: role.description, permissions: role.permissions === "all" ? [] : role.permissions }); setModalRole(role); };

  const togglePermission = (perm) => {
    setForm((f) => ({ ...f, permissions: f.permissions.includes(perm) ? f.permissions.filter((p) => p !== perm) : [...f.permissions, perm] }));
  };

  const handleSave = () => {
    if (modalRole === "new") {
      addRole({ name: form.displayName.toLowerCase().replace(/\s+/g, "_"), displayName: form.displayName, description: form.description, permissions: form.permissions });
      toast.success(`Role "${form.displayName}" created`);
    } else {
      updateRole(modalRole.id, { displayName: form.displayName, description: form.description, permissions: form.permissions });
      toast.success("Role updated");
    }
    setModalRole(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Roles & permissions</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Built-in roles are protected. Create custom roles from any permission combination.</p>
        </div>
        <Button as="button" icon={Plus} onClick={openCreate}>New role</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]"><ShieldCheck size={17} /></div>
                <div>
                  <div className="flex items-center gap-1.5 text-[14.5px] font-semibold text-[var(--a-text-primary)]">
                    {role.displayName}
                    {role.isSystem && <Lock size={12} className="text-[var(--a-text-faint)]" />}
                  </div>
                  <p className="text-[12px] text-[var(--a-text-muted)]">{role.description}</p>
                </div>
              </div>
              {!role.isSystem && (
                <div className="flex shrink-0 gap-1">
                  <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(role)} />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(role)} />
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {role.permissions === "all" ? (
                <Badge tone="accent">All permissions</Badge>
              ) : groupsGranted(role).length === 0 ? (
                <span className="text-[12px] text-[var(--a-text-faint)]">No permissions assigned</span>
              ) : (
                groupsGranted(role).map((g) => <Badge key={g} tone="neutral">{PERMISSION_GROUPS.find((p) => p.group === g)?.label ?? g}</Badge>)
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!modalRole}
        onClose={() => setModalRole(null)}
        title={modalRole === "new" ? "New role" : `Edit ${modalRole?.displayName}`}
        size="lg"
        footer={<Button as="button" onClick={handleSave} disabled={!form.displayName}>{modalRole === "new" ? "Create role" : "Save changes"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role name" required><TextInput value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="e.g. Editor" /></Field>
          </div>
          <Field label="Description"><TextArea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>

          <div>
            <p className="mb-2 text-[13px] font-medium text-[var(--a-text-primary)]">Permissions</p>
            <div className="flex flex-col divide-y divide-[var(--a-border)] rounded-lg border border-[var(--a-border)]">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.group} className="flex flex-wrap items-center gap-2 px-3.5 py-2.5">
                  <span className="w-28 shrink-0 text-[13px] font-medium text-[var(--a-text-primary)]">{group.label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.permissions.map((action) => {
                      const perm = `${group.group}.${action}`;
                      const active = form.permissions.includes(perm);
                      return (
                        <button
                          key={perm}
                          type="button"
                          onClick={() => togglePermission(perm)}
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors ${
                            active ? "bg-[var(--a-accent)] text-white" : "bg-[var(--a-bg-surface-2)] text-[var(--a-text-muted)]"
                          }`}
                        >
                          {active && <Check size={11} />}
                          {action}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete role "${toDelete?.displayName}"?`}
        onConfirm={() => { deleteRole(toDelete.id); toast.success("Role deleted"); }}
      />
    </div>
  );
}
