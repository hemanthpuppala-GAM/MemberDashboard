import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Download, UsersRound, Trash2 } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { TextInput, Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import { useAdminData } from "../../store/useAdminData";
import { CATEGORIES, CATEGORY_LABELS } from "../../mock/mockData";

const EMPTY = { name: "", email: "", phone: "", category: "general", assignedPractitioner: "" };

function exportCsv(members, users) {
  const header = ["Name", "Email", "Phone", "Practitioner", "Category", "Join date", "Status"];
  const rows = members.map((m) => [
    m.name, m.email, m.phone, users.find((u) => u.id === m.assignedPractitioner)?.name ?? "", m.category, m.joinDate, m.status,
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "members.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function MembersListPage() {
  const { members, users, addMember, deleteMember } = useAdminData();
  const navigate = useNavigate();
  const practitioners = users.filter((u) => u.role === "practitioner");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone", cell: ({ getValue }) => getValue() || "—" },
      { id: "practitioner", header: "Practitioner", accessorFn: (m) => users.find((u) => u.id === m.assignedPractitioner)?.name ?? "Unassigned", cell: ({ getValue }) => getValue() },
      { accessorKey: "category", header: "Category", cell: ({ getValue }) => CATEGORY_LABELS[getValue()] ?? getValue() },
      { accessorKey: "joinDate", header: "Joined", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      {
        id: "actions", header: "", enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <IconButton icon={Trash2} label="Remove" variant="danger" onClick={() => setToDelete(row.original)} />
          </div>
        ),
      },
    ],
    [users, setToDelete]
  );

  const handleCreate = () => {
    if (!form.name || !form.email) return;
    addMember({ ...form, assignedPractitioner: form.assignedPractitioner ? Number(form.assignedPractitioner) : null });
    toast.success(`${form.name} added`);
    setForm(EMPTY);
    setCreateOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Members</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">People converted from queries and actively guided by a practitioner.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button as="button" variant="secondary" icon={Download} onClick={() => exportCsv(members, users)}>Export CSV</Button>
          <Button as="button" icon={Plus} onClick={() => setCreateOpen(true)}>New member</Button>
        </div>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable
            columns={columns}
            data={members}
            searchPlaceholder="Search members..."
            onRowClick={(m) => navigate(`/admin/members/${m.id}`)}
            emptyIcon={UsersRound}
            emptyTitle="No members yet"
          />
        </div>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New member"
        footer={<Button as="button" onClick={handleCreate} disabled={!form.name || !form.email}>Add member</Button>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required><TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
          <Field label="Email" required><TextInput type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
          <Field label="Phone"><TextInput value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </Select>
            </Field>
            <Field label="Practitioner">
              <Select value={form.assignedPractitioner} onChange={(e) => setForm((f) => ({ ...f, assignedPractitioner: e.target.value }))}>
                <option value="">Unassigned</option>
                {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Remove "${toDelete?.name}"?`}
        description="This soft-deletes the member — their history is preserved."
        onConfirm={() => { deleteMember(toDelete.id); toast.success("Member removed"); }}
      />
    </div>
  );
}
