import { useEffect, useMemo, useState } from "react";
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
import { api, downloadAuthed } from "../../../lib/api";
import { CATEGORIES, CATEGORY_LABELS } from "../../mock/mockData";
import { usePermissions } from "../../usePermissions";

const EMPTY = { name: "", email: "", phone: "", category: "general", status: "new", assigned_practitioner_id: "" };

export default function MembersListPage() {
  const { can } = usePermissions();
  const canEdit = can("members.edit");
  const canDelete = can("members.delete");
  const canViewUsers = can("users.view");

  const [members, setMembers] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const practitioners = users.filter((u) => u.primary_role?.name === "practitioner");

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const loadMembers = () =>
    api
      .members({ page: pagination.pageIndex + 1, per_page: pagination.pageSize, ...(search ? { search } : {}) })
      .then((res) => {
        setMembers(res.data);
        setLastPage(res.last_page ?? 1);
      });

  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  useEffect(() => {
    // Practitioner names are a nice-to-have here (column + assignment dropdown), not
    // this page's core data — a role without users.view still gets a working members
    // list, just without practitioner names, instead of a scary permission toast.
    if (!canViewUsers) return;
    api.users().then(setUsers).catch(() => {});
  }, [canViewUsers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the spinner when page/search change
    setLoading(true);
    loadMembers()
      .catch((err) => toast.error(err.message ?? "Failed to load members"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, search]);

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone", cell: ({ getValue }) => getValue() || "—" },
      { id: "practitioner", header: "Practitioner", accessorFn: (m) => m.practitioner?.name ?? "Unassigned", cell: ({ getValue }) => getValue() },
      { accessorKey: "category", header: "Category", cell: ({ getValue }) => CATEGORY_LABELS[getValue()] ?? getValue() },
      { accessorKey: "join_date", header: "Joined", cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleDateString() : "—") },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      {
        id: "actions", header: "", enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <IconButton icon={Trash2} label={canDelete ? "Remove" : "You don't have permission to remove members"} variant="danger" disabled={!canDelete} onClick={() => setToDelete(row.original)} />
          </div>
        ),
      },
    ],
    [canDelete, setToDelete]
  );

  const handleCreate = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      await api.createMember({
        ...form,
        assigned_practitioner_id: form.assigned_practitioner_id ? Number(form.assigned_practitioner_id) : null,
      });
      toast.success(`${form.name} added`);
      setForm(EMPTY);
      setCreateOpen(false);
      await loadMembers();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteMember(toDelete.id);
      toast.success("Member removed");
      await loadMembers();
    } catch (err) {
      toast.error(err.message ?? "Remove failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Members</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">People converted from queries and actively guided by a practitioner.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button as="button" variant="secondary" icon={Download} onClick={() => downloadAuthed("/admin/members/export", "members.csv").catch((err) => toast.error(err.message ?? "Export failed"))}>
            Export CSV
          </Button>
          <Button as="button" icon={Plus} onClick={() => setCreateOpen(true)} disabled={loading || !canEdit} title={canEdit ? undefined : "You don't have permission to add members"}>New member</Button>
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
            emptyTitle={loading ? "Loading members…" : "No members yet"}
            manual
            enableSorting={false}
            pageCount={lastPage}
            pagination={pagination}
            onPaginationChange={setPagination}
            globalFilter={search}
            onGlobalFilterChange={handleSearchChange}
          />
        </div>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New member"
        footer={<Button as="button" onClick={handleCreate} disabled={!form.name || !form.email || saving}>Add member</Button>}
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
              <Select value={form.assigned_practitioner_id} onChange={(e) => setForm((f) => ({ ...f, assigned_practitioner_id: e.target.value }))}>
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
        onConfirm={handleDelete}
      />
    </div>
  );
}
