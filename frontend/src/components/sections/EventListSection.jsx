import { useEffect, useState } from "react";
import { publicApi } from "../../lib/api";
import Button from "../ui/Button";

function formatEventDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Auto-renders published events — the `event_list` CMS section type. */
export default function EventListSection({ fields }) {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    publicApi
      .events()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  if (!events || events.length === 0) return null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4 px-2 py-6 sm:px-4">
      {fields?.heading && (
        <h3 className="text-xl font-medium text-[var(--color-ink)]">{fields.heading}</h3>
      )}
      <div className="flex w-full flex-col gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-col gap-1 rounded-2xl border border-[rgba(110,198,234,0.35)] bg-[var(--color-surface)]/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="font-body text-[15px] font-medium text-[var(--color-ink)]">{event.title}</div>
              <div className="mt-0.5 text-[13px] text-[var(--color-muted)]">
                {formatEventDate(event.starts_at)} · {event.location || "TBD"}
              </div>
            </div>
            {event.join_url && (
              <Button href={event.join_url} variant="secondary" className="w-fit shrink-0">
                Join
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
