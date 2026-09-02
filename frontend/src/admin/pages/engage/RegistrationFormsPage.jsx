import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ClipboardList, Copy, Users } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import ConfirmModal from "../../ui/ConfirmModal";
import EmptyState from "../../ui/EmptyState";
import { StatusBadge } from "../../ui/Badge";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";
import { registrationFormPublicUrl } from "./registrationFormUtils";

export default function RegistrationFormsPage() {
  const { can } = usePermissions();
  const canCreate = can("registration_forms.create");
  const canEdit = can("registration_forms.edit");
  const canDelete = can("registration_forms.delete");
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = () =>
    api
      .registrationForms()
      .then(setForms)
      .catch((err) => toast.error(err.message ?? "Failed to load registration forms"));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const copyLink = (slug) => {
    navigator.clipboard?.writeText(registrationFormPublicUrl(slug));
    toast.success("Registration link copied");
  };

  const handleDelete = async () => {
    try {
      await api.deleteRegistrationForm(toDelete.id);
      toast.success("Form deleted");
      await load();
    } catch (err) {
      toast.error(err.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Registration forms</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Build a form for a program (e.g. "21 Days Guided Meditation with Hari Sir"), share the link, then pull the
            registrant list to add people to WhatsApp.
          </p>
        </div>
        <Button
          as="button"
          icon={Plus}
          onClick={() => navigate("new")}
          disabled={loading || !canCreate}
          title={canCreate ? undefined : "You don't have permission to create forms"}
        >
          New form
        </Button>
      </div>

      <Card padded={false}>
        {!loading && forms.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No registration forms yet"
            description="Create one to start collecting sign-ups for a program or event."
          />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--a-border)]">
            {forms.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--a-accent-muted)] text-[var(--a-accent)]">
                  <ClipboardList size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`${f.id}`} className="truncate text-[13.5px] font-semibold text-[var(--a-text-primary)] hover:underline">
                    {f.title}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--a-text-muted)]">
                    <StatusBadge status={f.status} />
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} /> {f.submissions_count ?? 0} registered
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton icon={Copy} label="Copy registration link" onClick={() => copyLink(f.slug)} />
                  <IconButton icon={Users} label="View registrations" onClick={() => navigate(`${f.id}/submissions`)} />
                  <IconButton
                    icon={Pencil}
                    label={canEdit ? "Edit" : "You don't have permission to edit forms"}
                    variant="accent"
                    disabled={!canEdit}
                    onClick={() => navigate(`${f.id}`)}
                  />
                  <IconButton
                    icon={Trash2}
                    label={canDelete ? "Delete" : "You don't have permission to delete forms"}
                    variant="danger"
                    disabled={!canDelete}
                    onClick={() => setToDelete(f)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        description="This also deletes every registration submitted through this form. This can't be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
