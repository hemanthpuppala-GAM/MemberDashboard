import { useState } from "react";
import { PenLine } from "lucide-react";
import Card from "../ui/Card";
import Button from "../../components/ui/Button";

const ENTRIES = [
  { date: "Aug 17, 2026", note: "Deep stillness today, mind settled quickly after 5 minutes." },
  { date: "Aug 16, 2026", note: "Restless start, but the group energy helped me settle." },
];

export default function JournalPage() {
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Journal</h2>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">Reflect on today's sit.</p>
      </div>

      <Card accent title="New entry">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="What came up during your sit today?"
          className="w-full rounded-xl border border-[rgba(110,198,234,0.35)] bg-white/70 p-3 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] transition-colors focus:border-[var(--color-blue)] focus:shadow-[0_0_0_3px_rgba(110,198,234,0.18)] focus:outline-none"
        />
        <div className="mt-3 flex justify-end">
          <Button as="button" onClick={() => setDraft("")}>
            <PenLine size={15} />
            Save entry
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {ENTRIES.map((entry) => (
          <Card key={entry.date} className="border-l-[3px] border-l-[color:var(--color-gold)]">
            <div className="text-[12.5px] font-medium tracking-wide text-[var(--color-muted)] uppercase">
              {entry.date}
            </div>
            <p className="mt-1.5 text-[14px] text-[var(--color-ink)]">{entry.note}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
