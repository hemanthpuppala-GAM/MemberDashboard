import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff, Lock } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import { StatusBadge } from "../../ui/Badge";
import ConfirmModal from "../../ui/ConfirmModal";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";

export default function PagesListPage() {
  const { can } = usePermissions();
  const canCreate = can("cms.create");
  const canEdit = can("cms.edit");
  const canDelete = can("cms.delete");

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState(null);

  const loadPages = () => api.pages().then(setPages);

  useEffect(() => {
    loadPages()
      .catch((err) => toast.error(err.message ?? "Failed to load pages"))
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (page) => {
    const next = page.status === "published" ? "draft" : "published";
    try {
      const updated = await api.updatePageStatus(page.slug, next);
      setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, status: updated.status } : p)));
      toast.success(`"${page.title}" ${next === "published" ? "published" : "unpublished"}`);
    } catch (err) {
      toast.error(err.message ?? "Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deletePage(toDelete.slug);
      toast.success("Page deleted");
      await loadPages();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Page",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--a-text-primary)]">{row.original.title}</span>
            {row.original.is_builtin && <Lock size={12} className="text-[var(--a-text-faint)]" />}
          </div>
        ),
      },
      { accessorKey: "slug", header: "Slug", cell: ({ getValue }) => <span className="text-[var(--a-text-muted)]">/{getValue()}</span> },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      { accessorKey: "sections_count", header: "Sections" },
      {
        accessorKey: "updated_at",
        header: "Last edited",
        cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const page = row.original;
          return (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <IconButton
                icon={page.status === "published" ? EyeOff : Eye}
                label={canEdit ? (page.status === "published" ? "Unpublish" : "Publish") : "You don't have permission to publish pages"}
                disabled={!canEdit}
                onClick={() => togglePublish(page)}
              />
              <IconButton icon={Pencil} label="Edit" onClick={() => navigate(`/admin/cms/pages/${page.slug}`)} />
              <IconButton
                icon={Trash2}
                label={!canDelete ? "You don't have permission to delete pages" : page.is_builtin ? "Built-in pages can't be deleted" : "Delete"}
                variant="danger"
                disabled={!canDelete || page.is_builtin}
                onClick={() => setToDelete(page)}
              />
            </div>
          );
        },
      },
    ],
    [canEdit, canDelete, navigate]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Pages</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Manage every page on the public site, built-in and custom.</p>
        </div>
        <Button as="button" icon={Plus} onClick={() => navigate("/admin/cms/pages/new")} disabled={!canCreate} title={canCreate ? undefined : "You don't have permission to create pages"}>New page</Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable
            columns={columns}
            data={pages}
            searchPlaceholder="Search pages..."
            onRowClick={(page) => navigate(`/admin/cms/pages/${page.slug}`)}
            emptyIcon={FileText}
            emptyTitle={loading ? "Loading pages…" : "No pages yet"}
            emptyDescription={loading ? undefined : "Create your first page to get started."}
          />
        </div>
      </Card>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        description="The page and all of its sections will be removed."
        onConfirm={handleDelete}
      />
    </div>
  );
}
