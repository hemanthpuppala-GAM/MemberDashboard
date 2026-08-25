import { ChevronLeft, ChevronRight } from "lucide-react";
import { toLocalDateKey } from "../dateKey";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Month-grid calendar — only days with an entry (in `markedDates`) are clickable, keeping the journal's "pick a day" view from ever needing to render a long unbroken list. */
export default function MonthCalendar({ month, onMonthChange, markedDates, selectedDate, onSelectDate }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayKey = toLocalDateKey(new Date());

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
          className="rounded-full p-1.5 text-[var(--color-muted)] transition-colors hover:bg-[rgba(110,198,234,0.15)]"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[13.5px] font-semibold text-[var(--color-ink)]">{monthLabel}</span>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
          className="rounded-full p-1.5 text-[var(--color-muted)] transition-colors hover:bg-[rgba(110,198,234,0.15)]"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="py-1 text-[11px] font-medium tracking-wide text-[var(--color-muted-soft)] uppercase">
            {w}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const key = toLocalDateKey(date);
          const hasEntry = markedDates.has(key);
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          return (
            <div key={i} className="flex items-center justify-center">
              <button
                type="button"
                disabled={!hasEntry}
                onClick={() => onSelectDate(key)}
                title={hasEntry ? `${key} · has entries` : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[12.5px] transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] font-semibold text-[var(--color-on-gold)] shadow-[0_0_10px_rgba(243,216,154,0.5)]"
                    : hasEntry
                      ? "bg-[rgba(110,198,234,0.18)] font-medium text-[var(--color-ink)] hover:bg-[rgba(110,198,234,0.32)]"
                      : "text-[var(--color-muted-soft)]"
                } ${isToday && !isSelected ? "ring-1 ring-[var(--color-blue)]" : ""}`}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
