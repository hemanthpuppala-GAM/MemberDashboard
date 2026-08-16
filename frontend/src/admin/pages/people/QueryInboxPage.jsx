import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Inbox, ArchiveIcon, UserCheck } from "lucide-react";
import Card from "../../ui/Card";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Field, { Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import { useAdminData } from "../../store/useAdminData";
import { CATEGORIES, CATEGORY_LABELS } from "../../mock/mockData";

const STATUSES = ["new", "assigned", "in_progress", "resolved", "archived"];

export default function QueryInboxPage() {
  const { queries, users, updateQuery, convertToMember } = useAdminData();
  const practitioners = users.filter((u) => u.role === "practitioner");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [active, setActive] = useState(null);

  const filtered = useMemo(
    () =>
      queries.filter(
        (q) =>
          (!categoryFilter || q.category === categoryFilter) &&
          (!statusFilter || q.status === statusFilter) &&
          (!assignedFilter || String(q.assignedTo) === assignedFilter)
      ),
    [queries, categoryFilter, statusFilter, assignedFilter]
  );

  const practitionerName = (id) => practitioners.find((p) => p.id === id)?.name;

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-[var(--a-text-muted)]">{getValue()}</span> },
      { accessorKey: "phone", header: "Mobile", cell: ({ getValue }) => getValue() || "—" },
      { accessorKey: "category", header: "Category", cell: ({ getValue }) => CATEGORY_LABELS[getValue()] ?? getValue() },
      { accessorKey: "message", header: "Message", enableSorting: false, cell: ({ getValue }) => <span className="line-clamp-1 max-w-[220px] text-[var(--a-text-muted)]">{getValue()}</span> },
      { accessorKey: "submittedAt", header: "Submitted", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      { id: "assigned", header: "Assigned to", accessorFn: (q) => practitionerName(q.assignedTo) || "—", cell: ({ getValue }) => getValue() },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [practitioners]
  );

  const toolbar = (
    <>
      <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-auto!">
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
      </Select>
      <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto!">
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
      </Select>
      <Select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)} className="w-auto!">
        <option value="">Any practitioner</option>
        {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Select>
    </>
  );

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
            data={filtered}
            searchPlaceholder="Search queries..."
            toolbar={toolbar}
            onRowClick={setActive}
            emptyIcon={Inbox}
            emptyTitle="Inbox is empty"
          />
        </div>
      </Card>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name} description={active ? `${active.email} · ${active.phone || "no phone"}` : ""} size="lg">
        {active && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={active.status} />
              <span className="text-[12px] text-[var(--a-text-muted)]">{CATEGORY_LABELS[active.category] ?? active.category}</span>
              <span className="text-[12px] text-[var(--a-text-faint)]">· {new Date(active.submittedAt).toLocaleString()}</span>
            </div>

            <p className="rounded-lg bg-[var(--a-bg-surface-2)] p-3.5 text-[13.5px] leading-relaxed text-[var(--a-text-primary)]">{active.message}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Assign to">
                <Select
                  value={active.assignedTo ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    updateQuery(active.id, { assignedTo: val, status: val ? "assigned" : "new" });
                    setActive((a) => ({ ...a, assignedTo: val, status: val ? "assigned" : "new" }));
                    toast.success(val ? "Assigned" : "Unassigned");
                  }}
                >
                  <option value="">Unassigned</option>
                  {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={active.status}
                  onChange={(e) => {
                    updateQuery(active.id, { status: e.target.value });
                    setActive((a) => ({ ...a, status: e.target.value }));
                  }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </Select>
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--a-border)] pt-4">
              <Button
                as="button"
                size="sm"
                icon={UserCheck}
                onClick={() => {
                  convertToMember(active.id);
                  toast.success(`${active.name} converted to a member`);
                  setActive(null);
                }}
              >
                Convert to member
              </Button>
              <Button
                as="button"
                size="sm"
                variant="secondary"
                icon={ArchiveIcon}
                onClick={() => { updateQuery(active.id, { status: "archived" }); toast.success("Archived"); setActive(null); }}
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
