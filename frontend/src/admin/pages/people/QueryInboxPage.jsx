import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Inbox, ArchiveIcon, UserCheck } from "lucide-react";
import Card from "../../ui/Card";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Field, { Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import { api } from "../../../lib/api";
import { CATEGORIES, CATEGORY_LABELS } from "../../mock/mockData";
import { usePermissions } from "../../usePermissions";

const STATUSES = ["new", "assigned", "in_progress", "resolved", "archived"];

export default function QueryInboxPage() {
  const { can } = usePermissions();
  const canEdit = can("members.edit");
  const canAssign = can("members.assign");
  const canViewUsers = can("users.view");

  const [queries, setQueries] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const practitioners = users.filter((u) => u.primary_role?.name === "practitioner");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [active, setActive] = useState(null);

  const loadQueries = () =>
    api
      .queries({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        ...(search ? { search } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(assignedFilter ? { assigned_to: assignedFilter } : {}),
      })
      .then((res) => {
        setQueries(res.data);
        setLastPage(res.last_page ?? 1);
      });

  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  useEffect(() => {
    // Practitioner names/assignment options — not this page's core data, so a
    // role without users.view still gets a working inbox instead of a toast.
    if (!canViewUsers) return;
    api.users().then(setUsers).catch(() => {});
  }, [canViewUsers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the spinner when page/search/filters change
    setLoading(true);
    loadQueries()
      .catch((err) => toast.error(err.message ?? "Failed to load queries"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, search, categoryFilter, statusFilter, assignedFilter]);

  const practitionerName = (id) => practitioners.find((p) => p.id === id)?.name;

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-[var(--a-text-muted)]">{getValue()}</span> },
      { accessorKey: "phone", header: "Mobile", cell: ({ getValue }) => getValue() || "—" },
      { accessorKey: "category", header: "Category", cell: ({ getValue }) => CATEGORY_LABELS[getValue()] ?? getValue() },
      { accessorKey: "message", header: "Message", enableSorting: false, cell: ({ getValue }) => <span className="line-clamp-1 max-w-[220px] text-[var(--a-text-muted)]">{getValue()}</span> },
      { accessorKey: "created_at", header: "Submitted", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      { id: "assigned", header: "Assigned to", accessorFn: (q) => practitionerName(q.assigned_to) || "—", cell: ({ getValue }) => getValue() },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [practitioners]
  );

  const toolbar = (
    <>
      <Select value={categoryFilter} onChange={(e) => handleFilterChange(setCategoryFilter)(e.target.value)} className="w-auto!">
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
      </Select>
      <Select value={statusFilter} onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)} className="w-auto!">
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
      </Select>
      <Select value={assignedFilter} onChange={(e) => handleFilterChange(setAssignedFilter)(e.target.value)} className="w-auto!">
        <option value="">Any practitioner</option>
        {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Select>
    </>
  );

  const assign = async (value) => {
    const practitionerId = value ? Number(value) : null;
    try {
      const updated = await api.assignQuery(active.id, practitionerId);
      setActive(updated);
      setQueries((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      toast.success(practitionerId ? "Assigned" : "Unassigned");
    } catch (err) {
      toast.error(err.message ?? "Assign failed");
    }
  };

  const setStatus = async (status) => {
    try {
      const updated = await api.updateQueryStatus(active.id, status);
      setActive(updated);
      setQueries((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    } catch (err) {
      toast.error(err.message ?? "Update failed");
    }
  };

  const convertToMember = async () => {
    try {
      await api.convertQueryToMember(active.id);
      toast.success(`${active.name} converted to a member`);
      setActive(null);
      await loadQueries();
    } catch (err) {
      toast.error(err.message ?? "Conversion failed");
    }
  };

  const archive = async () => {
    try {
      const updated = await api.updateQueryStatus(active.id, "archived");
      setQueries((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      toast.success("Archived");
      setActive(null);
    } catch (err) {
      toast.error(err.message ?? "Archive failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Query inbox</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Every contact-form submission from the website.</p>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable
            columns={columns}
            data={queries}
            searchPlaceholder="Search queries..."
            toolbar={toolbar}
            onRowClick={setActive}
            emptyIcon={Inbox}
            emptyTitle={loading ? "Loading…" : "Inbox is empty"}
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

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name} description={active ? `${active.email} · ${active.phone || "no phone"}` : ""} size="lg">
        {active && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={active.status} />
              <span className="text-[12px] text-[var(--a-text-muted)]">{CATEGORY_LABELS[active.category] ?? active.category}</span>
              <span className="text-[12px] text-[var(--a-text-faint)]">· {new Date(active.created_at).toLocaleString()}</span>
            </div>

            <p className="rounded-lg bg-[var(--a-bg-surface-2)] p-3.5 text-[13.5px] leading-relaxed text-[var(--a-text-primary)]">{active.message}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Assign to">
                <Select value={active.assigned_to ?? ""} onChange={(e) => assign(e.target.value)} disabled={!canAssign}>
                  <option value="">Unassigned</option>
                  {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={active.status} onChange={(e) => setStatus(e.target.value)} disabled={!canEdit}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </Select>
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--a-border)] pt-4">
              <Button
                as="button"
                size="sm"
                icon={UserCheck}
                disabled={!canEdit || !!active.converted_to_member_id}
                title={canEdit ? undefined : "You don't have permission to convert queries"}
                onClick={convertToMember}
              >
                {active.converted_to_member_id ? "Already converted" : "Convert to member"}
              </Button>
              <Button
                as="button"
                size="sm"
                variant="secondary"
                icon={ArchiveIcon}
                disabled={!canEdit}
                title={canEdit ? undefined : "You don't have permission to archive queries"}
                onClick={archive}
              >
                Archive
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
