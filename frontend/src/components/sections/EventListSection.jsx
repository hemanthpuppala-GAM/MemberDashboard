import { useEffect, useState } from "react";
import { publicApi } from "../../lib/api";
import Button from "../ui/Button";
import { CardEdge } from "../ui/CardAccent";
import { CARD_CLASS, SECTION_CLASS, SUBHEADING_CLASS } from "../ui/sectionStyles";

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
    <section className={`flex flex-col gap-6 ${SECTION_CLASS}`}>
      {fields?.heading && <h3 className={SUBHEADING_CLASS}>{fields.heading}</h3>}
      <div className="flex w-full flex-col gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={`flex flex-col gap-3 overflow-hidden sm:flex-row sm:items-center sm:justify-between ${CARD_CLASS}`}
          >
            <CardEdge />
            <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover/card:translate-x-0">
              <div className="font-body text-[16px] font-semibold tracking-[-0.005em] text-[var(--color-ink)]">{event.title}</div>
              <div className="mt-1 text-[13.5px] text-[var(--color-muted)]">
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
