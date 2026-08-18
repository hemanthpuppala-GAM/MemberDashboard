import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ShieldCheck, Lock, Check } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea } from "../../ui/Field";
import Badge from "../../ui/Badge";
import { api } from "../../../lib/api";

const GROUP_LABELS = {
  cms: "CMS", languages: "Languages", users: "Users", roles: "Roles", members: "Members",
  reports: "Reports", announcements: "Announcements", broadcast: "Broadcast", qrcode: "QR Codes",
  settings: "Settings", music: "Music", testimonials: "Testimonials",
  contact_channels: "Contact channels", donations: "Donations",
};

function groupsGranted(role) {
  return [...new Set(role.permissions.map((p) => p.group))];
}

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalRole, setModalRole] = useState(null);
  const [form, setForm] = useState({ displayName: "", description: "", permissions: [] });
  const [toDelete, setToDelete] = useState(null);

  const loadData = () =>
    Promise.all([api.roles(), api.permissions()]).then(([rolesRes, permsRes]) => {
      setRoles(rolesRes);
      setPermissionGroups(permsRes);
    });

  useEffect(() => {
    loadData()
      .catch((err) => toast.error(err.message ?? "Failed to load roles"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm({ displayName: "", description: "", permissions: [] }); setModalRole("new"); };
  const openEdit = (role) => { setForm({ displayName: role.display_name, description: role.description ?? "", permissions: role.permissions.map((p) => p.id) }); setModalRole(role); };

  const togglePermission = (permId) => {
    setForm((f) => ({ ...f, permissions: f.permissions.includes(permId) ? f.permissions.filter((p) => p !== permId) : [...f.permissions, permId] }));
  };

  const handleSave = async () => {
    const payload = {
      name: modalRole === "new" ? form.displayName.toLowerCase().replace(/\s+/g, "_") : modalRole.name,
      display_name: form.displayName,
      description: form.description || null,
      permissions: form.permissions,
    };

    setSaving(true);
    try {
      if (modalRole === "new") {
        await api.createRole(payload);
        toast.success(`Role "${form.displayName}" created`);
      } else {
        await api.updateRole(modalRole.id, payload);
        toast.success("Role updated");
      }
      await loadData();
      setModalRole(null);
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteRole(toDelete.id);
      toast.success("Role deleted");
      await loadData();
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
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Roles & permissions</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Built-in roles are protected. Create custom roles from any permission combination.</p>
        </div>
        <Button as="button" icon={Plus} onClick={openCreate} disabled={loading}>New role</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loading && <p className="text-[13px] text-[var(--a-text-muted)]">Loading roles…</p>}
        {!loading && roles.length === 0 && <p className="text-[13px] text-[var(--a-text-muted)]">No roles yet.</p>}
        {roles.map((role) => (
          <Card key={role.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]"><ShieldCheck size={17} /></div>
                <div>
                  <div className="flex items-center gap-1.5 text-[14.5px] font-semibold text-[var(--a-text-primary)]">
                    {role.display_name}
                    {role.is_system && <Lock size={12} className="text-[var(--a-text-faint)]" />}
                  </div>
                  <p className="text-[12px] text-[var(--a-text-muted)]">{role.description}</p>
                  <p className="text-[11.5px] text-[var(--a-text-faint)]">{role.users_count} user{role.users_count === 1 ? "" : "s"}</p>
                </div>
              </div>
              {!role.is_system && (
                <div className="flex shrink-0 gap-1">
                  <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(role)} />
                  <IconButton icon={Trash2} label="Delete" variant="danger" onClick={() => setToDelete(role)} />
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {groupsGranted(role).length === 0 ? (
                <span className="text-[12px] text-[var(--a-text-faint)]">No permissions assigned</span>
              ) : (
                groupsGranted(role).map((g) => <Badge key={g} tone="neutral">{GROUP_LABELS[g] ?? g}</Badge>)
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!modalRole}
        onClose={() => setModalRole(null)}
        title={modalRole === "new" ? "New role" : `Edit ${modalRole?.display_name}`}
        size="lg"
        footer={<Button as="button" onClick={handleSave} disabled={!form.displayName || saving}>{modalRole === "new" ? "Create role" : "Save changes"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role name" required><TextInput value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="e.g. Editor" /></Field>
          </div>
          <Field label="Description"><TextArea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>

          <div>
            <p className="mb-2 text-[13px] font-medium text-[var(--a-text-primary)]">Permissions</p>
            <div className="flex flex-col divide-y divide-[var(--a-border)] rounded-lg border border-[var(--a-border)]">
              {Object.entries(permissionGroups).map(([group, perms]) => (
                <div key={group} className="flex flex-wrap items-center gap-2 px-3.5 py-2.5">
                  <span className="w-28 shrink-0 text-[13px] font-medium text-[var(--a-text-primary)]">{GROUP_LABELS[group] ?? group}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((perm) => {
                      const active = form.permissions.includes(perm.id);
                      const action = perm.name.split(".")[1] ?? perm.name;
                      return (
                        <button
                          key={perm.id}
                          type="button"
                          onClick={() => togglePermission(perm.id)}
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
        title={`Delete role "${toDelete?.display_name}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
