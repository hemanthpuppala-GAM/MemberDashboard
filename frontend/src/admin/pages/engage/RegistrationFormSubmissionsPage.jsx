import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Users, Download, Trash2 } from "lucide-react";
import Card from "../../ui/Card";
import DataTable from "../../ui/DataTable";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import ConfirmModal from "../../ui/ConfirmModal";
import { Select } from "../../ui/Field";
import { StatusBadge } from "../../ui/Badge";
import { api, downloadAuthed } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

const STATUSES = ["new", "contacted"];

export default function RegistrationFormSubmissionsPage() {
  const { can } = usePermissions();
  const canEdit = can("registration_forms.edit");
  const canDelete = can("registration_forms.delete");
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    api.registrationForm(id).then(setForm).catch((err) => toast.error(err.message ?? "Failed to load form"));
  }, [id]);

  const load = () =>
    api
      .registrationSubmissions(id, {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search ? { search } : {}),
      })
      .then((res) => {
        setSubmissions(res.data);
        setLastPage(res.last_page ?? 1);
      });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the spinner when page/filter changes
    setLoading(true);
    load()
      .catch((err) => toast.error(err.message ?? "Failed to load registrations"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pagination.pageIndex, pagination.pageSize, statusFilter, search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const setStatus = async (submission, status) => {
    try {
      const updated = await api.updateRegistrationSubmissionStatus(id, submission.id, status);
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      toast.error(err.message ?? "Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteRegistrationSubmission(id, toDelete.id);
      toast.success("Registration deleted");
      await load();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const exportCsv = () =>
    downloadAuthed(api.registrationSubmissionsExportPath(id), `${form?.slug ?? "registrations"}.csv`).catch((err) =>
      toast.error(err.message ?? "Export failed"),
    );

  const columns = useMemo(() => {
    if (!form) return [];
    const fieldColumns = form.fields.map((f) => ({
      id: `field_${f.field_key}`,
      header: f.label,
      accessorFn: (row) => {
        const v = row.data?.[f.field_key];
        if (f.type === "checkbox") return v ? "Yes" : "No";
        return v ?? "—";
      },
      cell: ({ getValue }) => <span className="text-[var(--a-text-primary)]">{getValue()}</span>,
    }));
    return [
      ...fieldColumns,
      { accessorKey: "created_at", header: "Registered", cell: ({ getValue }) => new Date(getValue()).toLocaleString() },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          canEdit ? (
            <Select
              value={row.original.status}
              onChange={(e) => setStatus(row.original, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-auto! py-1! text-[12.5px]!"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          ) : (
            <StatusBadge status={row.original.status} />
          ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <IconButton
            icon={Trash2}
            label={canDelete ? "Delete registration" : "You don't have permission to delete registrations"}
            variant="danger"
            disabled={!canDelete}
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(row.original);
            }}
          />
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, canEdit, canDelete]);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/registration-forms" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> Registration forms
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">{form?.title ?? "Registrations"}</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Everyone who registered through this form's link. Mark people "contacted" once you've added them to WhatsApp.
          </p>
        </div>
        <Button as="button" variant="secondary" icon={Download} onClick={exportCsv} disabled={!form}>
          Export CSV
        </Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable
            columns={columns}
            data={submissions}
            searchPlaceholder="Search registrations..."
            toolbar={
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }} className="w-auto!">
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            }
            emptyIcon={Users}
            emptyTitle={loading ? "Loading…" : "No registrations yet"}
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

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this registration?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
