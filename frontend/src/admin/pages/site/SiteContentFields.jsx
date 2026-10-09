import { useRef, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, UploadCloud, FolderOpen, RotateCcw } from "lucide-react";
import Field, { TextInput, TextArea, Select } from "../../ui/Field";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import { siteAsset } from "../../../site/siteAssets";

/**
 * Schema-driven inputs for the site content editor. `ctx` carries editor-wide
 * helpers: { canUpload, uploading, openPicker(onSelect), upload(file) → Promise<url> }.
 */

const resolve = (v, item) => (typeof v === "function" ? v(item ?? {}) : v);

/* ---------- text-ish fields whose stored shape differs from what's typed ---------- */

const CODECS = {
  csv: {
    format: (v) => (Array.isArray(v) ? v.join(", ") : ""),
    parse: (t) => t.split(",").map((x) => x.trim()).filter(Boolean),
  },
  lines: {
    format: (v) => (Array.isArray(v) ? v.join("\n") : ""),
    parse: (t) => t.split("\n").map((x) => x.trim()).filter(Boolean),
  },
};

function pairsCodec([a, b]) {
  return {
    format: (v) => (Array.isArray(v) ? v.map((p) => `${p?.[a] ?? ""} | ${p?.[b] ?? ""}`).join("\n") : ""),
    parse: (t) =>
      t
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [left, ...rest] = l.split("|");
          return { [a]: left.trim(), [b]: rest.join("|").trim() || "#" };
        }),
  };
}

/** Keeps what the admin typed (trailing commas, blank lines) while committing the parsed value. */
function DraftField({ id, value, onChange, codec, multiline, rows }) {
  const formatted = codec.format(value);
  const [draft, setDraft] = useState(formatted);
  const [seen, setSeen] = useState(formatted);
  if (formatted !== seen) {
    setSeen(formatted);
    if (codec.format(codec.parse(draft)) !== formatted) setDraft(formatted);
  }
  const handle = (e) => {
    setDraft(e.target.value);
    onChange(codec.parse(e.target.value));
  };
  return multiline ? (
    <TextArea id={id} rows={rows ?? 4} value={draft} onChange={handle} />
  ) : (
    <TextInput id={id} value={draft} onChange={handle} />
  );
}

/* ---------- image slot ---------- */

export function ImageSlot({ id, field, value, item, onChange, ctx }) {
  const fileRef = useRef(null);
  const fallback = resolve(field.fallback, item);
  const current = typeof value === "string" ? value.trim() : "";
  const preview = siteAsset(current || fallback || "");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await ctx.upload(file);
    if (url) onChange(url);
  };

  return (
    <Field label={field.label} htmlFor={id} hint={field.hint ?? "Pick from the Media Library, upload a new image, or type a path like assets/x.png. Leave empty to keep the default artwork."}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface-2)] ${field.portrait ? "aspect-[3/4] w-full sm:w-40" : "aspect-[5/6] w-full sm:w-32"}`}
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" style={{ objectPosition: "50% 18%" }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--a-text-faint)]"><ImageIcon size={20} /></div>
          )}
          {!current && fallback && (
            <span className="absolute inset-x-2 bottom-2 rounded-md bg-black/55 px-2 py-0.5 text-center text-[10.5px] font-semibold tracking-wide text-white uppercase">Default artwork</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TextInput id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={fallback || "https://… or assets/x.png"} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={FolderOpen} onClick={() => ctx.openPicker(onChange)}>Choose</Button>
            <Button
              size="sm"
              variant="secondary"
              icon={UploadCloud}
              disabled={!ctx.canUpload || ctx.uploading}
              title={ctx.canUpload ? undefined : "You don't have permission to upload media"}
              onClick={() => fileRef.current?.click()}
            >
              {ctx.uploading ? "Uploading…" : "Upload"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            {current && (
              <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => onChange("")}>Default</Button>
            )}
          </div>
        </div>
      </div>
    </Field>
  );
}

/* ---------- list editor ---------- */

function itemTitle(field, item, i) {
  const l = resolve(field.itemLabel, item);
  return l ? (typeof field.itemLabel === "function" ? l : `${l} ${i + 1}`) : `#${i + 1}`;
}

function ListEditor({ id, field, value, onChange, ctx }) {
  const items = Array.isArray(value) ? value : [];
  const setItem = (i, next) => onChange(items.map((it, j) => (j === i ? next : it)));
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  const move = (i, d) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const add = () => onChange([...items, structuredClone(field.newItem ?? {})]);
  const rowCols = field.fields.map((f) => (f.narrow ? "76px" : `minmax(0,${f.grow ?? 1}fr)`)).join(" ") + (field.addable ? " auto" : "");

  return (
    <div className="flex flex-col gap-3">
      {(field.label || field.addable) && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-semibold tracking-wider text-[var(--a-text-muted)] uppercase">
            {field.label ?? ""} {field.label && <span className="ml-1 rounded-full bg-[var(--a-bg-surface-2)] px-2 py-0.5 text-[11px]">{items.length}</span>}
          </p>
          {field.addable && (
            <Button size="sm" variant="secondary" icon={Plus} onClick={add}>{field.addLabel ?? "Add"}</Button>
          )}
        </div>
      )}
      {field.hint && <p className="-mt-1 text-[12px] text-[var(--a-text-muted)]">{field.hint}</p>}
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-[var(--a-border)] px-4 py-6 text-center text-[12.5px] text-[var(--a-text-muted)]">
          Nothing here yet{field.addable ? " — use Add to create one." : "."}
        </p>
      )}
      <div className={field.layout === "cards" ? "grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]" : "flex flex-col gap-2.5"}>
        {items.map((item, i) => {
          const actions = field.addable && (
            <div className={`flex items-center gap-0.5 ${field.layout === "cards" ? "" : "self-end pb-1"}`}>
              <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => move(i, -1)} size={15} />
              <IconButton icon={ArrowDown} label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)} size={15} />
              <IconButton icon={Trash2} label={`Remove ${(resolve(field.itemLabel, item) || "item").toString().toLowerCase()}`} variant="danger" onClick={() => remove(i)} size={15} />
            </div>
          );
          const inputs = field.fields.map((f) => (
            <SchemaField
              key={f.key}
              id={`${id}-${i}-${f.key}`}
              field={f}
              item={item}
              value={item?.[f.key]}
              onChange={(v) => setItem(i, { ...item, [f.key]: v })}
              ctx={ctx}
              compact
            />
          ));
          if (field.layout === "cards") {
            const glyphAndTitle = field.fields[0]?.narrow && field.fields[1];
            return (
              <div key={i} className="flex flex-col gap-3 rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-base)] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] font-semibold text-[var(--a-text-muted)]">{itemTitle(field, item, i)}</p>
                  {actions}
                </div>
                {glyphAndTitle ? (
                  <>
                    <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2">{inputs.slice(0, 2)}</div>
                    {inputs.slice(2)}
                  </>
                ) : (
                  inputs
                )}
              </div>
            );
          }
          return (
            <div
              key={i}
              style={{ "--cols": rowCols }}
              className="grid grid-cols-1 gap-2.5 rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-base)] p-3 md:[grid-template-columns:var(--cols)] md:items-start"
            >
              {inputs}
              {actions}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- dispatcher ---------- */

function isFullWidth(field) {
  return field.wide || ["list", "heading", "object", "image", "pairs"].includes(field.type);
}

export function FieldGrid({ fields, value, onChange, columns = 1, ctx, idPrefix }) {
  const colClass = columns === 3 ? "md:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : "";
  return (
    <div className={`grid grid-cols-1 gap-4 ${colClass}`}>
      {fields.map((f, i) => {
        if (f.type === "spacer") return <div key={`sp-${i}`} className="hidden md:block" aria-hidden="true" />;
        return (
          <div key={f.key ?? `h-${i}`} className={isFullWidth(f) ? "md:col-span-full" : ""}>
            <SchemaField
              id={`${idPrefix}-${f.key ?? i}`}
              field={f}
              value={f.key ? value?.[f.key] : undefined}
              onChange={(v) => onChange({ ...value, [f.key]: v })}
              ctx={ctx}
            />
          </div>
        );
      })}
    </div>
  );
}

export function SchemaField({ id, field, value, item, onChange, ctx, compact = false }) {
  switch (field.type) {
    case "heading":
      return (
        <div className={compact ? "" : "border-t border-[var(--a-border)] pt-4"}>
          {field.label && <p className="text-[13px] font-semibold text-[var(--a-text-primary)]">{field.label}</p>}
          {field.hint && <p className="mt-0.5 text-[12px] text-[var(--a-text-muted)]">{field.hint}</p>}
        </div>
      );
    case "image":
      return <ImageSlot id={id} field={field} value={value} item={item} onChange={onChange} ctx={ctx} />;
    case "list":
      return <ListEditor id={id} field={field} value={value} onChange={onChange} ctx={ctx} />;
    case "object":
      return (
        <FieldGrid
          idPrefix={id}
          fields={field.fields}
          value={value && typeof value === "object" ? value : {}}
          onChange={onChange}
          columns={field.columns}
          ctx={ctx}
        />
      );
    case "csv":
    case "lines":
    case "pairs": {
      const codec = field.type === "pairs" ? pairsCodec(field.pairKeys) : CODECS[field.type];
      return (
        <Field label={field.label} htmlFor={id} hint={field.hint}>
          <DraftField id={id} value={value} onChange={onChange} codec={codec} multiline={field.type !== "csv"} rows={field.rows} />
        </Field>
      );
    }
    case "textarea":
      return (
        <Field label={field.label} htmlFor={id} hint={field.hint}>
          <TextArea id={id} rows={field.rows ?? 3} value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case "select": {
      const opts = field.options.includes(value) || value == null || value === "" ? field.options : [value, ...field.options];
      return (
        <Field label={field.label} htmlFor={id} hint={field.hint}>
          <Select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {opts.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Select>
        </Field>
      );
    }
    default:
      return (
        <Field label={field.label} htmlFor={id} hint={field.hint}>
          <TextInput
            id={id}
            type={field.type === "time" ? "time" : field.type === "url" ? "url" : "text"}
            value={value ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
}
