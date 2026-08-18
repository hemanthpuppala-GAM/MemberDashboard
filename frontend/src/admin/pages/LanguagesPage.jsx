import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Modal from "../ui/Modal";
import ConfirmModal from "../ui/ConfirmModal";
import Field, { TextInput, Select } from "../ui/Field";
import Toggle from "../ui/Toggle";
import { api } from "../../lib/api";

const EMPTY = { code: "", name: "", native_name: "", direction: "ltr", is_enabled: true, is_default: false };

export default function LanguagesPage() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const loadLanguages = () => api.languages().then(setLanguages);

  useEffect(() => {
    loadLanguages()
      .catch((err) => toast.error(err.message ?? "Failed to load languages"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY); setModal("new"); };
  const openEdit = (lang) => { setForm({ code: lang.code, name: lang.name, native_name: lang.native_name, direction: lang.direction, is_enabled: lang.is_enabled, is_default: lang.is_default }); setModal(lang); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "new") { await api.createLanguage(form); toast.success(`${form.name} added`); }
      else { await api.updateLanguage(modal.id, form); toast.success("Language updated"); }
      setModal(null);
      await loadLanguages();
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (lang, v) => {
    setLanguages((prev) => prev.map((l) => (l.id === lang.id ? { ...l, is_enabled: v } : l)));
    try {
      await api.updateLanguage(lang.id, { code: lang.code, name: lang.name, native_name: lang.native_name, direction: lang.direction, is_enabled: v, is_default: lang.is_default });
    } catch (err) {
      toast.error(err.message ?? "Update failed");
      await loadLanguages();
    }
  };

  const setDefault = async (lang) => {
    try {
      await api.updateLanguage(lang.id, { code: lang.code, name: lang.name, native_name: lang.native_name, direction: lang.direction, is_enabled: lang.is_enabled, is_default: true });
      toast.success(`${lang.name} set as default`);
      await loadLanguages();
    } catch (err) {
      toast.error(err.message ?? "Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteLanguage(toDelete.id);
      toast.success("Language removed");
      await loadLanguages();
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
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Languages</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Enable languages to add tabs across every content editor.</p>
        </div>
        <Button as="button" icon={Plus} onClick={openCreate} disabled={loading}>Add language</Button>
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto p-5 sm:p-6">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--a-bg-surface-2)]">
                {["Language", "Code", "Direction", "Status", "Default", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[var(--a-text-muted)] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <tr key={lang.id} className="border-t border-[var(--a-border)]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-[var(--a-text-primary)]">{lang.name}</span>
                    <span className="ml-1.5 text-[12px] text-[var(--a-text-muted)]">{lang.native_name}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[var(--a-text-muted)] uppercase">{lang.code}</td>
                  <td className="px-4 py-3 text-[13px] text-[var(--a-text-muted)] uppercase">{lang.direction}</td>
                  <td className="px-4 py-3">
                    <Toggle checked={lang.is_enabled} onChange={(v) => toggleEnabled(lang, v)} />
                  </td>
                  <td className="px-4 py-3">
                    {lang.is_default ? (
                      <Star size={15} className="fill-[var(--a-warning)] text-[var(--a-warning)]" />
                    ) : (
                      <button onClick={() => setDefault(lang)} className="text-[12px] text-[var(--a-text-faint)] hover:text-[var(--a-accent)]">
                        Set default
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(lang)} />
                      <IconButton icon={Trash2} label="Delete" variant="danger" disabled={lang.is_default} onClick={() => !lang.is_default && setToDelete(lang)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "new" ? "Add language" : "Edit language"}
        footer={<Button as="button" onClick={handleSave} disabled={!form.name || !form.code || saving}>{modal === "new" ? "Add language" : "Save changes"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" required><TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Native name" required><TextInput value={form.native_name} onChange={(e) => setForm((f) => ({ ...f, native_name: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISO code" required><TextInput value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="fr" /></Field>
            <Field label="Direction">
              <Select value={form.direction} onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}>
                <option value="ltr">Left to right</option>
                <option value="rtl">Right to left</option>
              </Select>
            </Field>
          </div>
          <Toggle checked={form.is_enabled} onChange={(v) => setForm((f) => ({ ...f, is_enabled: v }))} label="Enabled" description="Shows this language as a tab in content editors" />
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.name}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
