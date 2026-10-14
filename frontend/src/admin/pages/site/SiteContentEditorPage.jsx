import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ExternalLink, FileWarning, Braces, ChevronRight } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import ConfirmModal from "../../ui/ConfirmModal";
import EmptyState from "../../ui/EmptyState";
import MediaPickerModal from "../../ui/MediaPickerModal";
import { TextArea } from "../../ui/Field";
import { api } from "../../../lib/api";
import { usePermissions } from "../../usePermissions";
import { SITE_DEFAULTS } from "../../../site/useSiteContent";
import { SITE_CONTENT_SCHEMAS, SITE_CONTENT_PAGES, schemaKeys, COPY_PAGE_BY_SLUG, SLUG_BY_COPY_PAGE } from "./siteContentSchemas";
import { FieldGrid } from "./SiteContentFields";

/** Media Library folder each page's uploads/picker default to (see MEDIA_FOLDERS). */
const MEDIA_FOLDER = { home: "Home", about: "About", mission: "Mission", meditation: "Meditate", wisdom: "Wisdom", wellness: "Wellness", events: "Events" };

const clone = (v) => structuredClone(v ?? {});
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function splitExtras(doc, keys) {
  const extras = {};
  for (const [k, v] of Object.entries(doc)) if (!keys.has(k)) extras[k] = v;
  return extras;
}

function formatWhen(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function SiteContentEditorPage() {
  // Opened from CMS → Pages → {page} → "Page copy" (/admin/cms/pages/:slug/copy).
  const { page: pageParam, slug } = useParams();
  const page = pageParam ?? COPY_PAGE_BY_SLUG[slug] ?? slug;
  const schema = SITE_CONTENT_SCHEMAS[page];
  // Remount per page so every bit of editor state starts fresh when switching editors.
  return schema ? <Editor key={page} page={page} schema={schema} /> : <UnknownPage page={page} />;
}

function UnknownPage({ page }) {
  return (
    <Card>
      <EmptyState
        icon={FileWarning}
        title={`No editor for “${page}”`}
        description="Site content editors exist for Home, About, Mission, Meditation, Wisdom, Wellness and Events."
        action={<Button as={Link} to="/admin/cms/pages" variant="secondary">All pages</Button>}
      />
    </Card>
  );
}

/**
 * The designed page's content, embedded in CMS → Pages → {page}: every part of the page as a
 * collapsible row, with save/reset in a sticky bar. Same data and publishing as the full editor.
 */
export function SiteCopyEditor({ page }) {
  const schema = SITE_CONTENT_SCHEMAS[page];
  return schema ? <Editor key={page} page={page} schema={schema} embedded /> : null;
}

function Editor({ page, schema, embedded = false }) {
  const { can } = usePermissions();
  const canEdit = can("cms.edit");
  const canUpload = can("cms.create");
  const defaults = SITE_DEFAULTS[page];
  const keys = useMemo(() => schemaKeys(schema), [schema]);

  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(() => clone(defaults));
  const [baseline, setBaseline] = useState(() => clone(defaults));
  const [published, setPublished] = useState(false);
  const [meta, setMeta] = useState({ updated_at: null, editor: null });
  const [extrasText, setExtrasText] = useState("{}");
  const [extrasError, setExtrasError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [picker, setPicker] = useState(null); // { onSelect }

  /** Replace the whole working document (load / publish / reset / discard). */
  const adopt = (next, { isPublished, metaPatch } = {}) => {
    setDoc(clone(next));
    setBaseline(clone(next));
    setExtrasText(JSON.stringify(splitExtras(next, keys), null, 2));
    setExtrasError("");
    if (isPublished !== undefined) setPublished(isPublished);
    if (metaPatch) setMeta(metaPatch);
  };

  useEffect(() => {
    let alive = true;
    api
      .siteContent(page)
      .then((res) => {
        if (!alive) return;
        const data = res?.data && typeof res.data === "object" ? res.data : null;
        // The backend owns the defaults (resources/site-content); the bundled copy is only a fallback.
        const base = res?.defaults && Object.keys(res.defaults).length ? res.defaults : defaults;
        adopt({ ...base, ...(data || {}) }, { isPublished: !!data, metaPatch: { updated_at: res?.updated_at ?? null, editor: res?.editor ?? null } });
      })
      .catch((err) => {
        if (!alive) return;
        toast.error(err.message ?? "Failed to load published content");
        adopt(defaults, { isPublished: false });
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // adopt/defaults are stable for a mounted editor (remounted per page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const dirty = !same(doc, baseline) || !!extrasError;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onExtrasChange = (text) => {
    setExtrasText(text);
    let parsed;
    try {
      parsed = text.trim() ? JSON.parse(text) : {};
    } catch (err) {
      setExtrasError(`Not valid JSON: ${err.message}`);
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setExtrasError("Must be a JSON object, e.g. { \"key\": \"value\" }");
      return;
    }
    const clash = Object.keys(parsed).find((k) => keys.has(k));
    if (clash) {
      setExtrasError(`“${clash}” is edited in the form above — remove it here.`);
      return;
    }
    setExtrasError("");
    setDoc((d) => {
      const next = {};
      for (const [k, v] of Object.entries(d)) if (keys.has(k)) next[k] = v;
      return { ...next, ...parsed };
    });
  };

  const upload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", MEDIA_FOLDER[page] ?? "General");
      const media = await api.uploadMedia(fd);
      toast.success("Image uploaded to the Media Library");
      return media?.url ?? "";
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Upload failed"));
      return "";
    } finally {
      setUploading(false);
    }
  };

  const publish = async () => {
    if (extrasError) return;
    setSaving(true);
    try {
      const res = await api.saveSiteContent(page, doc);
      adopt(res?.data ?? doc, { isPublished: true, metaPatch: { updated_at: res?.updated_at ?? new Date().toISOString(), editor: null } });
      toast.success(`${schema.label} page published`);
    } catch (err) {
      toast.error(err.errors ? Object.values(err.errors).flat()[0] : (err.message ?? "Publish failed"));
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      const res = await api.resetSiteContent(page);
      adopt(res?.defaults && Object.keys(res.defaults).length ? res.defaults : defaults, { isPublished: false, metaPatch: { updated_at: null, editor: null } });
      toast.success(`${schema.label} page reset to the default copy`);
    } catch (err) {
      toast.error(err.message ?? "Reset failed");
    } finally {
      setSaving(false);
    }
  };

  const status = loading
    ? { tone: "neutral", text: "Loading…" }
    : dirty
      ? { tone: "warning", text: "Unsaved changes" }
      : published
        ? { tone: "success", text: "Published overrides active" }
        : { tone: "neutral", text: "Showing the default copy" };

  const ctx = { canUpload: canUpload && canEdit, uploading, upload, openPicker: (onSelect) => setPicker({ onSelect }) };
  const actions = (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex flex-col items-end gap-0.5">
        <Badge tone={status.tone} dot>{status.text}</Badge>
        {published && meta.updated_at && !dirty && (
          <span className="text-[11.5px] text-[var(--a-text-muted)]">
            Last published {formatWhen(meta.updated_at)}{meta.editor?.name ? ` by ${meta.editor.name}` : ""}
          </span>
        )}
      </div>
      {dirty && (
        <Button variant="ghost" onClick={() => adopt(baseline)} disabled={saving}>Discard</Button>
      )}
      <Button
        variant="secondary"
        onClick={() => setConfirmReset(true)}
        disabled={!canEdit || !published || saving || loading}
        title={canEdit ? (published ? "Delete the published overrides and go back to the default copy" : "Already showing the default copy") : "You don't have permission to edit site content"}
      >
        Reset to default
      </Button>
      <Button
        onClick={publish}
        disabled={!canEdit || !dirty || !!extrasError || saving || loading}
        title={canEdit ? undefined : "You don't have permission to edit site content"}
      >
        {saving ? "Publishing…" : "Save & publish"}
      </Button>
    </div>
  );
  const extrasCount = Object.keys(splitExtras(doc, keys)).length;

  return (
    <div className="flex flex-col gap-6">
      {embedded ? (
        <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] px-5 py-3.5 shadow-[var(--a-shadow-sm)]">
          <div className="min-w-0">
            <h2 className="text-[16px] font-bold text-[var(--a-text-primary)]">Page content</h2>
            <p className="text-[12.5px] text-[var(--a-text-muted)]">
              Every part of the {schema.label} page — open a part to edit it, then Save &amp; publish.{" "}
              <Link to={`${schema.publicPath}${schema.publicPath.includes("?") ? "&" : "?"}edit=1`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[var(--a-accent)] hover:underline">
                Open page <ExternalLink size={12} />
              </Link>
            </p>
          </div>
          {actions}
        </div>
      ) : (
      <div className="flex flex-col gap-4 border-b border-[var(--a-border)] pb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--a-accent)] uppercase">{schema.eyebrow}</p>
            <h1 className="mt-1 text-[24px] font-bold text-[var(--a-text-primary)]">{schema.title}</h1>
            <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
              {schema.intro}{" "}
              <Link to={`${schema.publicPath}${schema.publicPath.includes("?") ? "&" : "?"}edit=1`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[var(--a-accent)] hover:underline">
                Open the {schema.label} page <ExternalLink size={13} />
              </Link>
            </p>
          </div>
          {actions}
        </div>
        <nav aria-label="Site content editors" className="flex flex-wrap items-center gap-1.5">
          <Link to={`/admin/cms/pages/${SLUG_BY_COPY_PAGE[page] ?? page}`} className="mr-1 text-[12.5px] font-medium text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]">← {schema.label} page</Link>
          <ChevronRight size={13} className="text-[var(--a-text-faint)]" />
          {SITE_CONTENT_PAGES.map((p) => (
            <Link
              key={p}
              to={`/admin/cms/pages/${SLUG_BY_COPY_PAGE[p] ?? p}/copy`}
              aria-current={p === page ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${p === page ? "bg-[var(--a-accent-muted)] text-[var(--a-accent)]" : "text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] hover:text-[var(--a-text-primary)]"}`}
            >
              {SITE_CONTENT_SCHEMAS[p].label}
            </Link>
          ))}
        </nav>
      </div>
      )}

      {!canEdit && (
        <p className="rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface-2)] px-4 py-3 text-[13px] text-[var(--a-text-muted)]">
          You can view this page's content, but your role can't publish changes.
        </p>
      )}

      <fieldset disabled={loading || !canEdit} className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
        {schema.sections.map((section) =>
          embedded ? (
            <details key={section.title} className="group rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] shadow-[var(--a-shadow-sm)]">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 sm:px-6">
                <span className="rounded bg-[var(--a-accent-muted)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--a-accent)] uppercase">Designed</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[var(--a-text-primary)]">{section.title}</span>
                  {section.description && <span className="block truncate text-[12px] text-[var(--a-text-muted)]">{section.description}</span>}
                </span>
                <ChevronRight size={15} className="shrink-0 text-[var(--a-text-muted)] transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-[var(--a-border)] px-5 pt-4 pb-5 sm:px-6">
                <FieldGrid idPrefix={`${page}-${section.title}`} fields={section.fields} value={doc} onChange={setDoc} columns={section.columns} ctx={ctx} />
              </div>
            </details>
          ) : (
            <Card key={section.title} title={section.title} description={section.description}>
              <FieldGrid idPrefix={`${page}-${section.title}`} fields={section.fields} value={doc} onChange={setDoc} columns={section.columns} ctx={ctx} />
            </Card>
          ),
        )}

        <details className="group rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] shadow-[var(--a-shadow-sm)]">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-5 text-[14px] font-semibold text-[var(--a-text-primary)] sm:px-6">
            <Braces size={16} className="text-[var(--a-text-muted)]" />
            Other fields (raw JSON)
            <span className="rounded-full bg-[var(--a-bg-surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--a-text-muted)]">{extrasCount}</span>
            <ChevronRight size={15} className="ml-auto text-[var(--a-text-muted)] transition-transform group-open:rotate-90" />
          </summary>
          <div className="flex flex-col gap-2 px-5 pb-5 sm:px-6 sm:pb-6">
            <p className="text-[12.5px] text-[var(--a-text-muted)]">
              Keys in this page's content that the form above doesn't cover. They are kept as-is when you publish; edit them here as a JSON object.
            </p>
            <TextArea
              rows={Math.min(18, Math.max(4, extrasText.split("\n").length + 1))}
              value={extrasText}
              onChange={(e) => onExtrasChange(e.target.value)}
              spellCheck={false}
              aria-label="Other fields as JSON"
              aria-invalid={!!extrasError}
              className="font-mono text-[12.5px]"
            />
            {extrasError && <p className="text-[12px] font-medium text-[var(--a-danger)]">{extrasError}</p>}
          </div>
        </details>
      </fieldset>

      <MediaPickerModal
        open={!!picker}
        onClose={() => setPicker(null)}
        onSelect={(url) => picker?.onSelect(url)}
        initialFolder={MEDIA_FOLDER[page] ?? "All"}
      />

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={reset}
        title={`Reset the ${schema.label} page to the default copy?`}
        description="This deletes the published overrides; the public page goes back to the default copy stored on the server."
        confirmLabel="Reset to default"
      />
    </div>
  );
}
