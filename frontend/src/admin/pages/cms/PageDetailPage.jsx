import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Pencil, Trash2, ArrowLeft, Lock } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Modal from "../../ui/Modal";
import ConfirmModal from "../../ui/ConfirmModal";
import { StatusBadge } from "../../ui/Badge";
import Field, { TextInput, Select } from "../../ui/Field";
import { api } from "../../../lib/api";
import { SECTION_TYPES } from "../../mock/mockData";
import { contentArrayToByLang } from "./sectionContentUtil";

function withDecodedContent(page) {
  return { ...page, sections: page.sections.map((s) => ({ ...s, contentByLang: contentArrayToByLang(s.content) })) };
}

function SortableRow({ section, pageSlug, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  const meta = SECTION_TYPES.find((t) => t.type === section.type);
  const heading = section.contentByLang?.en?.heading || section.contentByLang?.en?.eyebrow || meta?.label;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 border-b border-[var(--a-border)] py-3.5 last:border-0">
      <button {...attributes} {...listeners} className="cursor-grab text-[var(--a-text-faint)] hover:text-[var(--a-text-muted)] active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[var(--a-accent-muted)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--a-accent)] uppercase">{meta?.label}</span>
          <span className="truncate text-[13.5px] font-medium text-[var(--a-text-primary)]">{heading}</span>
        </div>
      </div>
      <Link to={`/admin/cms/pages/${pageSlug}/sections/${section.id}`} className="rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-accent-muted)] hover:text-[var(--a-accent)]">
        <Pencil size={16} />
      </Link>
      <IconButton icon={Trash2} label="Delete section" variant="danger" onClick={() => onDelete(section)} />
    </div>
  );
}

export default function PageDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [pickedType, setPickedType] = useState("content_block");
  const [toDelete, setToDelete] = useState(null);
  const [meta, setMeta] = useState({ title: "", status: "draft" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadPage = () =>
    api.page(slug).then((p) => {
      const decoded = withDecodedContent(p);
      setPage(decoded);
      setMeta({ title: decoded.title, status: decoded.status });
      return decoded;
    });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the spinner when navigating between pages via slug param
    setLoading(true);
    loadPage()
      .catch((err) => toast.error(err.message ?? "Failed to load page"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-[14px] text-[var(--a-text-muted)]">Page not found.</p>
        <Button as="button" variant="secondary" onClick={() => navigate("/admin/cms/pages")}>Back to pages</Button>
      </div>
    );
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = page.sections.map((s) => s.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const reordered = arrayMove(ids, oldIndex, newIndex);
    const bySection = new Map(page.sections.map((s) => [s.id, s]));
    setPage((p) => ({ ...p, sections: reordered.map((id) => bySection.get(id)) }));
    try {
      await api.reorderSections(slug, reordered);
    } catch (err) {
      toast.error(err.message ?? "Reorder failed");
      await loadPage();
    }
  };

  const saveMeta = async () => {
    try {
      await api.updatePage(slug, { slug: page.slug, title: meta.title, status: meta.status, sort_order: page.sort_order });
      toast.success("Page details saved");
      await loadPage();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    }
  };

  const handleAddSection = async () => {
    try {
      const created = await api.createSection(slug, { type: pickedType, status: "active", sort_order: page.sections.length + 1 });
      setAddOpen(false);
      toast.success("Section added");
      navigate(`/admin/cms/pages/${page.slug}/sections/${created.id}`);
    } catch (err) {
      toast.error(err.message ?? "Failed to add section");
    }
  };

  const handleDeleteSection = async () => {
    try {
      await api.deleteSection(slug, toDelete.id);
      toast.success("Section deleted");
      await loadPage();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/cms/pages" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">
        <ArrowLeft size={14} /> All pages
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">{page.title}</h1>
          {page.is_builtin && (
            <span title="Built-in page" className="inline-flex">
              <Lock size={15} className="text-[var(--a-text-faint)]" />
            </span>
          )}
          <StatusBadge status={page.status} />
        </div>
      </div>

      <Card title="Page details" description={page.is_builtin ? "Built-in pages can't be deleted, but content is fully editable." : undefined}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" required>
            <TextInput value={meta.title} onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))} />
          </Field>
          <Field label="Status">
            <Select value={meta.status} onChange={(e) => setMeta((m) => ({ ...m, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Button as="button" size="sm" onClick={saveMeta}>Save details</Button>
        </div>
      </Card>

      <Card
        title="Sections"
        description="Drag to reorder. Each section renders on the public page in this order."
        actions={<Button as="button" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>Add section</Button>}
      >
        {page.sections.length === 0 ? (
          <p className="py-8 text-center text-[13.5px] text-[var(--a-text-muted)]">No sections yet — add one to start building this page.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={page.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {page.sections.map((section) => (
                <SortableRow key={section.id} section={section} pageSlug={page.slug} onDelete={setToDelete} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add section"
        description="Pick a section type — you'll fill in the content next."
        footer={<Button as="button" onClick={handleAddSection}>Add section</Button>}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {SECTION_TYPES.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => setPickedType(t.type)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                pickedType === t.type ? "border-[var(--a-accent)] bg-[var(--a-accent-muted)]" : "border-[var(--a-border)] hover:border-[var(--a-accent)]"
              }`}
            >
              <div className="text-[13.5px] font-semibold text-[var(--a-text-primary)]">{t.label}</div>
              <div className="mt-0.5 text-[12px] text-[var(--a-text-muted)]">{t.description}</div>
            </button>
          ))}
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete this section?"
        onConfirm={handleDeleteSection}
      />
    </div>
  );
}
