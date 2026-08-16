import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Modal from "../ui/Modal";
import ConfirmModal from "../ui/ConfirmModal";
import Field, { TextInput, Select } from "../ui/Field";
import Toggle from "../ui/Toggle";
import { PillTabs } from "../ui/Tabs";
import { useAdminData } from "../store/useAdminData";
import { UI_TRANSLATIONS } from "../mock/mockData";

const EMPTY = { code: "", name: "", nativeName: "", direction: "ltr", enabled: true, isDefault: false };

function Completeness({ pct }) {
  const tone = pct >= 80 ? "var(--a-success)" : pct >= 40 ? "var(--a-warning)" : "var(--a-danger)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--a-bg-surface-2)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
      </div>
      <span className="text-[12px] text-[var(--a-text-muted)]">{pct}%</span>
    </div>
  );
}

export default function LanguagesPage() {
  const { languages, addLanguage, updateLanguage, deleteLanguage } = useAdminData();
  const [tab, setTab] = useState("languages");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const openCreate = () => { setForm(EMPTY); setModal("new"); };
  const openEdit = (lang) => { setForm(lang); setModal(lang); };

  const handleSave = () => {
    if (modal === "new") { addLanguage(form); toast.success(`${form.name} added`); }
    else { updateLanguage(modal.code, form); toast.success("Language updated"); }
    setModal(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Languages</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Enable languages to add tabs across every content editor.</p>
        </div>
        {tab === "languages" && <Button as="button" icon={Plus} onClick={openCreate}>Add language</Button>}
      </div>

      <PillTabs tabs={[{ key: "languages", label: "Languages" }, { key: "labels", label: "UI label translations" }]} active={tab} onChange={setTab} />

      {tab === "languages" ? (
        <Card padded={false}>
          <div className="overflow-x-auto p-5 sm:p-6">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <thead>
                <tr className="bg-[var(--a-bg-surface-2)]">
                  {["Language", "Code", "Direction", "Status", "Default", "Completeness", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[var(--a-text-muted)] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {languages.map((lang) => (
                  <tr key={lang.code} className="border-t border-[var(--a-border)]">
                    <td className="px-4 py-3">
                      <span className="mr-1.5">{lang.flag}</span>
                      <span className="font-medium text-[var(--a-text-primary)]">{lang.name}</span>
                      <span className="ml-1.5 text-[12px] text-[var(--a-text-muted)]">{lang.nativeName}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--a-text-muted)] uppercase">{lang.code}</td>
                    <td className="px-4 py-3 text-[13px] text-[var(--a-text-muted)] uppercase">{lang.direction}</td>
                    <td className="px-4 py-3">
                      <Toggle checked={lang.enabled} onChange={(v) => updateLanguage(lang.code, { enabled: v })} />
                    </td>
                    <td className="px-4 py-3">
                      {lang.isDefault ? (
                        <Star size={15} className="fill-[var(--a-warning)] text-[var(--a-warning)]" />
                      ) : (
                        <button onClick={() => { languages.forEach((l) => updateLanguage(l.code, { isDefault: l.code === lang.code })); toast.success(`${lang.name} set as default`); }} className="text-[12px] text-[var(--a-text-faint)] hover:text-[var(--a-accent)]">
                          Set default
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3"><Completeness pct={lang.completeness} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconButton icon={Pencil} label="Edit" onClick={() => openEdit(lang)} />
                        <IconButton icon={Trash2} label="Delete" variant="danger" disabled={lang.isDefault} onClick={() => !lang.isDefault && setToDelete(lang)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto p-5 sm:p-6">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <thead>
                <tr className="bg-[var(--a-bg-surface-2)]">
                  <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[var(--a-text-muted)] uppercase">Key</th>
                  {languages.filter((l) => l.enabled).map((l) => (
                    <th key={l.code} className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[var(--a-text-muted)] uppercase">{l.flag} {l.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UI_TRANSLATIONS.map((row) => (
                  <tr key={row.key} className="border-t border-[var(--a-border)]">
                    <td className="px-4 py-3 font-mono text-[12.5px] text-[var(--a-text-muted)]">{row.key}</td>
                    {languages.filter((l) => l.enabled).map((l) => (
                      <td key={l.code} className="px-4 py-3">
                        <TextInput defaultValue={row[l.code] ?? ""} placeholder="—" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "new" ? "Add language" : "Edit language"}
        footer={<Button as="button" onClick={handleSave} disabled={!form.name || !form.code}>{modal === "new" ? "Add language" : "Save changes"}</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" required><TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Native name"><TextInput value={form.nativeName} onChange={(e) => setForm((f) => ({ ...f, nativeName: e.target.value }))} /></Field>
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
          <Toggle checked={form.enabled} onChange={(v) => setForm((f) => ({ ...f, enabled: v }))} label="Enabled" description="Shows this language as a tab in content editors" />
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={`Delete "${toDelete?.name}"?`}
        onConfirm={() => { deleteLanguage(toDelete.code); toast.success("Language removed"); }}
      />
    </div>
  );
}
