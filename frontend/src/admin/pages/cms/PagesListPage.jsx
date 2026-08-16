import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff, Lock } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import DataTable from "../../ui/DataTable";
import { StatusBadge } from "../../ui/Badge";
import ConfirmModal from "../../ui/ConfirmModal";
import { useAdminData } from "../../store/useAdminData";
import { LANGUAGES } from "../../mock/mockData";

export default function PagesListPage() {
  const { pages, updatePage, deletePage } = useAdminData();
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState(null);

  const togglePublish = (page) => {
    const next = page.status === "published" ? "draft" : "published";
    updatePage(page.id, { status: next });
    toast.success(`"${page.title}" ${next === "published" ? "published" : "unpublished"}`);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Page",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--a-text-primary)]">{row.original.title}</span>
            {row.original.isBuiltin && <Lock size={12} className="text-[var(--a-text-faint)]" />}
          </div>
        ),
      },
      { accessorKey: "slug", header: "Slug", cell: ({ getValue }) => <span className="text-[var(--a-text-muted)]">/{getValue()}</span> },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
      { id: "sections", header: "Sections", accessorFn: (p) => p.sections.length, cell: ({ getValue }) => getValue() },
      {
        accessorKey: "lastEdited",
        header: "Last edited",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      },
      {
        id: "languages",
        header: "Languages",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            {LANGUAGES.filter((l) => l.enabled).map((l) => {
              const pct = row.original.langCoverage[l.code] ?? 0;
              return (
                <span
                  key={l.code}
                  title={`${l.name}: ${pct}%`}
                  className={`flex h-5 w-5 items-center justify-center rounded text-[11px] ${
                    pct === 0 ? "opacity-30" : pct < 100 ? "opacity-70" : ""
                  }`}
                >
                  {l.flag}
                </span>
              );
            })}
          </div>
        ),
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
                label={page.status === "published" ? "Unpublish" : "Publish"}
                onClick={() => togglePublish(page)}
              />
              <IconButton icon={Pencil} label="Edit" onClick={() => navigate(`/admin/cms/pages/${page.slug}`)} />
              <IconButton
                icon={Trash2}
                label="Delete"
                variant="danger"
                disabled={page.isBuiltin}
                onClick={() => !page.isBuiltin && setToDelete(page)}
                className={page.isBuiltin ? "cursor-not-allowed opacity-30" : ""}
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Pages</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Manage every page on the public site, built-in and custom.</p>
        </div>
        <Button as="button" icon={Plus} onClick={() => navigate("/admin/cms/pages/new")}>New page</Button>
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <DataTable
            columns={columns}
            data={pages}
            searchPlaceholder="Search pages..."
            onRowClick={(page) => navigate(`/admin/cms/pages/${page.slug}`)}
            emptyIcon={FileText}
            emptyTitle="No pages yet"
            emptyDescription="Create your first page to get started."
          />
        </div>
      </Card>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        description="The page and all of its sections will be removed."
        onConfirm={() => {
          deletePage(toDelete.id);
          toast.success("Page deleted");
        }}
      />
    </div>
  );
}
