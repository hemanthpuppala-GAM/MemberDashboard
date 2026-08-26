import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Upload, Download } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { TextInput, TextArea } from "../ui/Field";
import { api } from "../../lib/api";
import { FLAG_BY_CODE } from "./cms/sectionContentUtil";
import { usePermissions } from "../usePermissions";

/** Known key-prefix -> display label. Any other prefix (from a future key a developer adds) falls back to a title-cased version of the prefix itself, so new categories show up automatically. */
const CATEGORY_LABELS = { nav: "Navbar", footer: "Footer", hub: "Hub (home screen)" };

function categoryOf(key) {
  const id = key.split(".")[0];
  const label = CATEGORY_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
  return { id, label };
}

function humanizeKey(key) {
  const last = key.split(".").pop().replace(/[_-]+/g, " ");
  return last.charAt(0).toUpperCase() + last.slice(1);
}

/** Backend returns a flat array of { key, value, language: { code } } rows — group into { [langCode]: { [key]: value } }. */
function toByLang(rows) {
  const byLang = {};
  for (const row of rows ?? []) {
    const code = row.language?.code;
    if (!code) continue;
    if (!byLang[code]) byLang[code] = {};
    byLang[code][row.key] = row.value;
  }
  return byLang;
}

/**
 * Site-wide text (navbar, footer, buttons) that lives outside the CMS page/section
 * system — see UiTranslation. The key list and categories are derived entirely from
 * whatever keys exist under the default language, so a new key a developer adds to
 * the site shows up here automatically, in English, ready to translate.
 */
export default function TranslationsPage() {
  const { can } = usePermissions();
  const canEdit = can("translations.edit");

  const [languages, setLanguages] = useState([]);
  const [byLang, setByLang] = useState({});
  const [activeLang, setActiveLang] = useState("en");
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.languages(), api.uiStrings()])
      .then(([langs, rows]) => {
        const enabled = langs.filter((l) => l.is_enabled);
        setLanguages(enabled);
        setActiveLang(enabled.find((l) => l.is_default)?.code ?? enabled[0]?.code ?? "en");
        setByLang(toByLang(rows));
      })
      .catch((err) => toast.error(err.message ?? "Failed to load translations"))
      .finally(() => setLoading(false));
  }, []);

  const defaultLangCode = languages.find((l) => l.is_default)?.code;
  const allKeys = useMemo(() => Object.keys(byLang[defaultLangCode] ?? {}), [byLang, defaultLangCode]);

  const categories = useMemo(() => {
    const map = new Map();
    for (const key of allKeys) {
      const cat = categoryOf(key);
      if (!map.has(cat.id)) map.set(cat.id, { ...cat, keys: [] });
      map.get(cat.id).keys.push(key);
    }
    return [...map.values()];
  }, [allKeys]);

  const counts = useMemo(() => {
    const result = {};
    for (const lang of languages) {
      const values = byLang[lang.code] ?? {};
      result[lang.code] = allKeys.filter((k) => values[k]).length;
    }
    return result;
  }, [languages, byLang, allKeys]);

  const visibleKeys = useMemo(() => {
    let keys = activeCategory ? (categories.find((c) => c.id === activeCategory)?.keys ?? []) : allKeys;
    const q = search.trim().toLowerCase();
    if (q) {
      keys = keys.filter(
        (k) =>
          k.toLowerCase().includes(q) ||
          (byLang[defaultLangCode]?.[k] ?? "").toLowerCase().includes(q) ||
          (byLang[activeLang]?.[k] ?? "").toLowerCase().includes(q),
      );
    }
    return keys;
  }, [activeCategory, categories, allKeys, search, byLang, defaultLangCode, activeLang]);

  const set = (key) => (value) =>
    setByLang((prev) => ({ ...prev, [activeLang]: { ...prev[activeLang], [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateUiStrings(byLang);
      toast.success("Translations saved");
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-20 text-center text-[13.5px] text-[var(--a-text-muted)]">Loading…</p>;
  }

  const activeLanguage = languages.find((l) => l.code === activeLang);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Translations</h1>
          <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
            Site-wide text shown to every visitor (navbar, footer, buttons) — not tied to a specific page. Anything left blank here shows in English on the site.
          </p>
        </div>
        <Button
          as="button"
          onClick={handleSave}
          disabled={!canEdit || saving}
          title={canEdit ? undefined : "You don't have permission to edit translations"}
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-3">
        {languages.map((lang) => {
          const isActive = lang.code === activeLang;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLang(lang.code)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? "border-[var(--a-accent)] bg-[var(--a-accent)]/10 text-[var(--a-accent)]"
                  : "border-[var(--a-border)] text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]"
              }`}
            >
              <span>{FLAG_BY_CODE[lang.code] ?? "🌐"}</span>
              <span>{lang.name}</span>
              <span className="text-[11px] text-[var(--a-text-faint)]">
                {counts[lang.code] ?? 0}/{allKeys.length}
              </span>
              {lang.is_default && (
                <span className="rounded-full bg-[var(--a-warning)]/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--a-warning)] uppercase">
                  Default
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--a-text-faint)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keys or values…"
            className="w-full rounded-full border border-[var(--a-border)] bg-[var(--a-bg-surface)] py-2 pr-4 pl-9 text-[13px] text-[var(--a-text-primary)] outline-none focus:border-[var(--a-accent)]"
          />
        </div>
        <Button as="button" variant="secondary" icon={Upload} disabled title="Coming soon">
          Import
        </Button>
        <Button as="button" variant="secondary" icon={Download} disabled title="Coming soon">
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
        <Card padded={false} className="h-fit lg:sticky lg:top-4">
          <div className="flex flex-col gap-0.5 p-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                activeCategory === null
                  ? "bg-[var(--a-accent)]/10 text-[var(--a-accent)]"
                  : "text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)]"
              }`}
            >
              All keys <span className="text-[11px] text-[var(--a-text-faint)]">{allKeys.length}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[var(--a-accent)]/10 text-[var(--a-accent)]"
                    : "text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)]"
                }`}
              >
                {cat.label} <span className="text-[11px] text-[var(--a-text-faint)]">{cat.keys.length}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <div className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-[var(--a-border)] px-5 py-3 text-[11px] font-semibold tracking-wider text-[var(--a-text-muted)] uppercase">
            <span>Key</span>
            <span>{activeLanguage?.name ?? "Value"}</span>
          </div>
          <div className="divide-y divide-[var(--a-border)]">
            {visibleKeys.length === 0 && (
              <p className="px-5 py-8 text-center text-[13px] text-[var(--a-text-muted)]">No matching keys.</p>
            )}
            {visibleKeys.map((key) => {
              const cat = categoryOf(key);
              const englishValue = byLang[defaultLangCode]?.[key] ?? "";
              const value = byLang[activeLang]?.[key] ?? "";
              const multiline = englishValue.length > 60;
              return (
                <div key={key} className="grid grid-cols-[1fr_1.4fr] items-start gap-4 px-5 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10.5px] font-semibold tracking-wider text-[var(--a-text-faint)] uppercase">{cat.label}</span>
                    <span className="text-[13.5px] font-medium text-[var(--a-text-primary)]">{humanizeKey(key)}</span>
                    <span className="font-mono text-[11px] text-[var(--a-text-faint)]">{key}</span>
                  </div>
                  {multiline ? (
                    <TextArea rows={2} value={value} placeholder={englishValue} onChange={(e) => set(key)(e.target.value)} disabled={!canEdit} />
                  ) : (
                    <TextInput value={value} placeholder={englishValue} onChange={(e) => set(key)(e.target.value)} disabled={!canEdit} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
