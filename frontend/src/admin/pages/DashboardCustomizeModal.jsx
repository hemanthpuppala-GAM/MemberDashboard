import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import { usePermissions } from "../usePermissions";
import { DASHBOARD_WIDGETS } from "../dashboardWidgets";

function SortableWidgetRow({ widget, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-surface)] px-3 py-2.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-[var(--a-text-faint)] hover:text-[var(--a-text-muted)] active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>
      <Icon size={16} className="shrink-0 text-[var(--a-accent)]" />
      <span className="flex-1 text-[13.5px] font-medium text-[var(--a-text-primary)]">{widget.label}</span>
      <IconButton icon={X} label="Remove" variant="danger" size={15} onClick={() => onRemove(widget.id)} />
    </div>
  );
}

export default function DashboardCustomizeModal({ open, onClose, selected, onSave }) {
  const { can } = usePermissions();
  const [localSelected, setLocalSelected] = useState(selected);
  // Re-seed local edits from the saved layout each time the modal opens
  // (it stays mounted while closed, so its state would otherwise go stale).
  const [wasOpen, setWasOpen] = useState(open);
  if (open && !wasOpen) {
    setWasOpen(true);
    setLocalSelected(selected);
  } else if (open !== wasOpen) {
    setWasOpen(open);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const visibleWidgets = DASHBOARD_WIDGETS.filter((w) => can(w.permission));
  const selectedWidgets = localSelected.map((id) => visibleWidgets.find((w) => w.id === id)).filter(Boolean);
  const availableWidgets = visibleWidgets.filter((w) => !localSelected.includes(w.id));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localSelected.indexOf(active.id);
    const newIndex = localSelected.indexOf(over.id);
    setLocalSelected(arrayMove(localSelected, oldIndex, newIndex));
  }

  function handleSave() {
    onSave(localSelected);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Customize dashboard"
      description="Choose which stats to show, and drag to reorder them."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="mb-2.5 text-[12.5px] font-semibold tracking-wide text-[var(--a-text-muted)] uppercase">On your dashboard</h3>
          {selectedWidgets.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--a-border)] px-3 py-4 text-center text-[13px] text-[var(--a-text-muted)]">
              No widgets selected — add some below.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedWidgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {selectedWidgets.map((widget) => (
                    <SortableWidgetRow
                      key={widget.id}
                      widget={widget}
                      onRemove={(id) => setLocalSelected(localSelected.filter((w) => w !== id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div>
          <h3 className="mb-2.5 text-[12.5px] font-semibold tracking-wide text-[var(--a-text-muted)] uppercase">Add a widget</h3>
          {availableWidgets.length === 0 ? (
            <p className="text-[13px] text-[var(--a-text-muted)]">Every available widget is already on your dashboard.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableWidgets.map((widget) => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.id}
                    type="button"
                    onClick={() => setLocalSelected([...localSelected, widget.id])}
                    className="flex items-center gap-2.5 rounded-lg border border-dashed border-[var(--a-border)] px-3 py-2.5 text-left text-[13px] text-[var(--a-text-primary)] transition-colors hover:border-[var(--a-accent)] hover:bg-[var(--a-accent-muted)]"
                  >
                    <Icon size={15} className="shrink-0 text-[var(--a-text-muted)]" />
                    <span className="flex-1">{widget.label}</span>
                    <Plus size={14} className="shrink-0 text-[var(--a-accent)]" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
