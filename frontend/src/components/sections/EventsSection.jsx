import { useEffect, useState } from "react";
import ChakraContentSection from "./ChakraContentSection";
import { chakras } from "../../data/chakras";
import { useContent } from "../../hooks/useContent";
import { publicApi } from "../../lib/api";
import Button from "../ui/Button";

const chakra = chakras.find((c) => c.id === "events");

const FALLBACK = {
  eyebrow: "Events",
  title: "Gather, in person and online",
  description: "From weekly online circles to seasonal in-person retreats — ways\n        to practice alongside others, at whatever distance feels right.",
  points: [
    "Weekly online circles, open to newcomers",
    "Seasonal in-person retreats and gatherings",
    "Local practice groups, searchable by city",
  ],
};

function formatEventDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function EventList() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    publicApi
      .events()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  if (!events || events.length === 0) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-2 pb-6 sm:px-4">
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
  );
}

export default function EventsSection() {
  const content = useContent("events", FALLBACK);

  return (
    <>
      <ChakraContentSection chakraId="events" chakra={chakra} {...content} />
      <EventList />
    </>
  );
}
