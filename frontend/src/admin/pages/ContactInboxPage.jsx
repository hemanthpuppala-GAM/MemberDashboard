import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Card from "../components/ui/Card";
import Chip from "../../components/ui/Chip";

const STATUS_COLOR = {
  new: "#5DB875",
  read: "#6EC6EA",
  archived: "#8886C0",
};

const FILTERS = [
  ["", "All"],
  ["new", "New"],
  ["read", "Read"],
  ["archived", "Archived"],
];

export default function ContactInboxPage() {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState(null);
  const [version, setVersion] = useState(0);
  const loading = data === null;

  useEffect(() => {
    api.contactSubmissions(filter || undefined).then(setData);
  }, [filter, version]);

  const updateStatus = async (id, status) => {
    await api.updateContactSubmission(id, status);
    setVersion((v) => v + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[26px] text-[var(--color-ink)]">Contact inbox</h1>
        <p className="mt-1 text-[13.5px] text-[var(--color-muted)]">
          Messages submitted through the public contact form.
        </p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map(([value, label]) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
              filter === value
                ? "bg-[rgba(110,198,234,0.35)] text-[var(--color-ink)]"
                : "text-[var(--color-muted)] hover:bg-[rgba(110,198,234,0.15)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <p className="text-[13.5px] text-[var(--color-muted)]">Loading…</p>
        ) : !data?.data?.length ? (
          <p className="text-[13.5px] text-[var(--color-muted)]">No messages here.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[rgba(110,198,234,0.20)]">
            {data.data.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-body text-[14.5px] font-medium text-[var(--color-ink)]">{msg.name}</span>
                    <span className="ml-2 text-[12.5px] text-[var(--color-muted)]">{msg.email}</span>
                  </div>
                  <Chip color={STATUS_COLOR[msg.status]}>{msg.status}</Chip>
                </div>
                <p className="text-[13.5px] leading-relaxed text-[var(--color-ink-soft,#5854A0)]">{msg.message}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[11.5px] text-[var(--color-muted-soft)]">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                  <div className="ml-auto flex gap-2">
                    {msg.status !== "read" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(msg.id, "read")}
                        className="rounded-full border border-[rgba(110,198,234,0.45)] px-3 py-1 text-[12px] text-[var(--color-ink)] hover:bg-[rgba(110,198,234,0.15)]"
                      >
                        Mark read
                      </button>
                    )}
                    {msg.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(msg.id, "archived")}
                        className="rounded-full px-3 py-1 text-[12px] text-[var(--color-muted)] hover:bg-[rgba(136,134,192,0.15)]"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
