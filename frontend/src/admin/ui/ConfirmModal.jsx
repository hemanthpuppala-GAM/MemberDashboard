import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({ open, onClose, onConfirm, title = "Are you sure?", description, confirmLabel = "Delete", danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] text-[var(--a-text-muted)]">This action can't be undone.</p>
    </Modal>
  );
}
