import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HeartHandshake, Trash2 } from "lucide-react";
import Card from "../../ui/Card";
import DataTable from "../../ui/DataTable";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import ConfirmModal from "../../ui/ConfirmModal";
import Field, { Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import { api } from "../../../lib/api";

const STATUSES = ["new", "reviewing", "contacted", "approved", "archived"];

export default function VolunteerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [active, setActive] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const loadApplications = () => api.volunteerApplications().then((res) => setApplications(res.data));

  useEffect(() => {
    Promise.all([loadApplications(), api.volunteerCategories().then(setCategories)])
      .catch((err) => toast.error(err.message ?? "Failed to load volunteer applications"))
      .finally(() => setLoading(false));
  }, []);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name;

  const filtered = useMemo(
    () =>
      applications.filter(
        (a) =>
          (!categoryFilter || String(a.category_id) === categoryFilter) &&
          (!statusFilter || a.status === statusFilter)
      ),
    [applications, categoryFilter, statusFilter]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-semibold text-[var(--a-text-primary)]">{getValue()}</span> },
      { accessorKey: "email", header: "Email", cell: ({ getValue }) => <span className="text-[var(--a-text-muted)]">{getValue()}</span> },
      { accessorKey: "phone", header: "Mobile", cell: ({ getValue }) => getValue() || "—" },
      { id: "category", header: "Category", accessorFn: (a) => a.category?.name ?? categoryName(a.category_id) ?? "—", cell: ({ getValue }) => getValue() },
      { accessorKey: "notes", header: "Notes", enableSorting: false, cell: ({ getValue }) => <span className="line-clamp-1 max-w-[220px] text-[var(--a-text-muted)]">{getValue() || "—"}</span> },
      { accessorKey: "created_at", header: "Submitted", cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories]
  );

  const toolbar = (
    <>
      <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-auto!">
        <option value="">All categories</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto!">
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
      </Select>
    </>
  );

  const setStatus = async (status) => {
    try {
      const updated = await api.updateVolunteerApplicationStatus(active.id, status);
      setActive(updated);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      toast.error(err.message ?? "Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteVolunteerApplication(toDelete.id);
      toast.success("Application deleted");
      setActive(null);
      await loadApplications();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Volunteer applications</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Every submission from the public volunteer form.</p>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable
            columns={columns}
            data={filtered}
            searchPlaceholder="Search applications..."
            toolbar={toolbar}
            onRowClick={setActive}
            emptyIcon={HeartHandshake}
            emptyTitle={loading ? "Loading…" : "No applications yet"}
          />
        </div>
      </Card>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name} description={active ? `${active.email} · ${active.phone || "no phone"}` : ""} size="lg">
        {active && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={active.status} />
              <span className="text-[12px] text-[var(--a-text-muted)]">{active.category?.name ?? categoryName(active.category_id) ?? "—"}</span>
              <span className="text-[12px] text-[var(--a-text-faint)]">· {new Date(active.created_at).toLocaleString()}</span>
            </div>

            <p className="rounded-lg bg-[var(--a-bg-surface-2)] p-3.5 text-[13.5px] leading-relaxed text-[var(--a-text-primary)]">
              {active.notes || "No additional notes."}
            </p>

            <Field label="Status">
              <Select value={active.status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </Select>
            </Field>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--a-border)] pt-4">
              <Button as="button" size="sm" variant="danger-ghost" icon={Trash2} onClick={() => setToDelete(active)}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete application from "${toDelete?.name}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
