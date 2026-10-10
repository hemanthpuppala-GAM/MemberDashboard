import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, ExternalLink } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { api } from "../../../lib/api";
import { SITE_CONTENT_SCHEMAS, SITE_CONTENT_PAGES } from "./siteContentSchemas";

function formatWhen(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

/** /admin/content — one card per public page, with whether published overrides are live. */
export default function SiteContentIndexPage() {
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .siteContentList()
      .then((res) => setRecords(res && typeof res === "object" && !Array.isArray(res) ? res : {}))
      .catch((err) => toast.error(err.message ?? "Failed to load site content"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Site content</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">
          Copy, photos, timings and testimonials on the public pages. Each page shows its bundled defaults until you publish changes here.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_CONTENT_PAGES.map((page) => {
          const schema = SITE_CONTENT_SCHEMAS[page];
          const rec = records[page];
          return (
            <Card key={page} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15.5px] font-semibold text-[var(--a-text-primary)]">{schema.label}</p>
                  <p className="mt-0.5 text-[12.5px] text-[var(--a-text-muted)]">{schema.title}</p>
                </div>
                {loading ? (
                  <Badge>…</Badge>
                ) : rec ? (
                  <Badge tone="success" dot>Published</Badge>
                ) : (
                  <Badge dot>File defaults</Badge>
                )}
              </div>
              <p className="text-[12px] text-[var(--a-text-muted)]">
                {rec
                  ? `Last published ${formatWhen(rec.updated_at)}${rec.editor?.name ? ` by ${rec.editor.name}` : ""}`
                  : "No published changes yet"}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                <Button as={Link} to={`/admin/content/${page}`} size="sm" icon={Pencil}>Edit</Button>
                <Button as={Link} to={`${schema.publicPath}${schema.publicPath.includes("?") ? "&" : "?"}edit=1`} target="_blank" rel="noopener noreferrer" size="sm" variant="ghost" icon={ExternalLink}>
                  View page
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
