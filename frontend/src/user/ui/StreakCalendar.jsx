/** Dot-grid streak calendar — lit gold dots for days practiced, dim for days missed, echoing the homepage/join-screen star-field lit/dim motif. */
export default function StreakCalendar({ days }) {
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-[repeat(21,minmax(0,1fr))]">
      {days.map((d) => {
        const isToday = d.date === todayStr;
        return (
          <div
            key={d.date}
            title={`${d.date}${d.completed ? " · practiced" : ""}`}
            className={`aspect-square rounded-full transition-colors ${
              d.completed
                ? "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] shadow-[0_0_6px_rgba(198,161,91,0.55)]"
                : "bg-[rgba(168,185,160,0.15)]"
            } ${isToday ? "ring-2 ring-[var(--color-blue)] ring-offset-1" : ""}`}
          />
        );
      })}
    </div>
  );
}
