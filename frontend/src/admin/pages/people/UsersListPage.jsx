import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, UserCog, Dices } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import Toggle from "../../ui/Toggle";
import { StatusBadge } from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import { useAdminData } from "../../store/useAdminData";

const EMPTY = { name: "", email: "", password: "", role: "practitioner", status: "active", specialty: "", bio: "", capacity: 15 };

function generatePassword() {
  return Math.random().toString(36).slice(-10);
}

export default function UsersListPage() {
  const { users, roles, addUser, updateUser, deleteUser } = useAdminData();
  const [modalUser, setModalUser] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const openCreate = () => { setForm(EMPTY); setModalUser("new"); };
  const openEdit = (u) => { setForm({ ...EMPTY, ...u, password: "" }); setModalUser(u); };

  const handleSave = () => {
    if (modalUser === "new") {
      addUser({ ...form });
      toast.success(`${form.name} added`);
    } else {
      updateUser(modalUser.id, form);
      toast.success("User updated");
    }
    setModalUser(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name", header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={row.original.name} size={28} />
            <span className="font-semibold text-[var(--a-text-primary)]">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email" },
      { id: "role", header: "Role", accessorFn: (u) => roles.find((r) => r.name === u.role)?.displayName ?? u.role, cell: ({ getValue }) => getValue() },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      { accessorKey: "membersAssigned", header: "Members" },
      { accessorKey: "lastLogin", header: "Last login", cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleDateString() : "Never") },
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
    [roles]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Users & practitioners</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Admins, content managers, and practitioners with panel access.</p>
        </div>
        <Button as="button" icon={Plus} onClick={openCreate}>New user</Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable columns={columns} data={users} searchPlaceholder="Search users..." emptyIcon={UserCog} emptyTitle="No users yet" />
        </div>
      </Card>

      <Modal
        open={!!modalUser}
        onClose={() => setModalUser(null)}
        title={modalUser === "new" ? "New user" : "Edit user"}
        size="lg"
        footer={<Button as="button" onClick={handleSave} disabled={!form.name || !form.email}>{modalUser === "new" ? "Create user" : "Save changes"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required><TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Email" required><TextInput type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
          </div>
          <Field label="Password" hint={modalUser === "new" ? "Leave blank to auto-generate on save" : "Leave blank to keep current password"}>
            <div className="flex gap-2">
              <TextInput value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              <Button as="button" type="button" variant="secondary" size="md" icon={Dices} onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}>Generate</Button>
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role">
              <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.displayName}</option>)}
              </Select>
            </Field>
            <div className="flex items-end pb-2.5">
              <Toggle checked={form.status === "active"} onChange={(v) => setForm((f) => ({ ...f, status: v ? "active" : "inactive" }))} label="Active" />
            </div>
          </div>

          {form.role === "practitioner" && (
            <div className="flex flex-col gap-4 rounded-lg border border-[var(--a-border)] p-4">
              <p className="text-[11.5px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Practitioner details</p>
              <Field label="Specialty"><TextInput value={form.specialty ?? ""} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} /></Field>
              <Field label="Bio"><TextArea rows={2} value={form.bio ?? ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} /></Field>
              <Field label="Max member capacity"><TextInput type="number" value={form.capacity ?? 15} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} /></Field>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.name}"?`}
        onConfirm={() => { deleteUser(toDelete.id); toast.success("User deleted"); }}
      />
    </div>
  );
}
