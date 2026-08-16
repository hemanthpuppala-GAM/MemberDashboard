import { useState } from "react";
import { StickyNote, RefreshCcw, CheckCircle2, MessageSquare, HelpCircle, Send } from "lucide-react";
import Button from "./Button";
import { TextArea } from "./Field";
import { PillTabs } from "./Tabs";

const ENTRY_ICON = { note: StickyNote, status_change: RefreshCcw, session_completed: CheckCircle2, message_sent: MessageSquare, qa: HelpCircle };
const ENTRY_LABEL = { note: "Note", status_change: "Status change", session_completed: "Session completed", message_sent: "Message sent", qa: "Question & answer" };

/**
 * Shared journal UI for a member's journey: quick free-text notes, or a
 * structured Q&A record of what they asked and how they were guided.
 * Used by both the admin MemberProfilePage and the practitioner's own dashboard.
 */
export default function JourneyPanel({ entries, onAddNote, onAddQa }) {
  const [mode, setMode] = useState("note");
  const [note, setNote] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  const submitNote = () => {
    if (!note.trim()) return;
    onAddNote(note.trim());
    setNote("");
  };

  const submitQa = () => {
    if (!question.trim() || !answer.trim()) return;
    onAddQa(question.trim(), answer.trim());
    setQuestion("");
    setAnswer("");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <PillTabs
          tabs={[{ key: "note", label: "Quick note" }, { key: "qa", label: "Question & answer" }]}
          active={mode}
          onChange={setMode}
        />
        {mode === "note" ? (
          <div className="flex items-start gap-2">
            <TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about this member's journey..." />
            <Button as="button" icon={Send} onClick={submitNote}>Add</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-[var(--a-border)] p-3">
            <TextArea rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What did they ask? e.g. &quot;Is it normal to feel dizzy during pranayama?&quot;" />
            <TextArea rows={2} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer / guidance..." />
            <Button as="button" icon={Send} onClick={submitQa} className="w-fit">Save Q&A</Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 border-l border-[var(--a-border)] pl-5">
        {sorted.length === 0 && <p className="text-[13.5px] text-[var(--a-text-muted)]">No journey entries yet.</p>}
        {sorted.map((entry) => {
          const Icon = ENTRY_ICON[entry.type] || StickyNote;
          return (
            <div key={entry.id} className="relative">
              <div className="absolute top-0.5 -left-[27px] flex h-5 w-5 items-center justify-center rounded-full bg-[var(--a-accent-muted)] text-[var(--a-accent)]">
                <Icon size={11} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-semibold text-[var(--a-text-primary)]">{ENTRY_LABEL[entry.type] ?? entry.type}</span>
                <span className="text-[11.5px] text-[var(--a-text-faint)]">{new Date(entry.date).toLocaleString()}</span>
              </div>
              {entry.type === "qa" ? (
                <div className="mt-1.5 flex flex-col gap-1.5 rounded-lg bg-[var(--a-bg-surface-2)] p-3">
                  <p className="text-[13.5px] text-[var(--a-text-primary)]"><span className="font-semibold">Q —</span> {entry.question}</p>
                  <p className="text-[13.5px] text-[var(--a-text-muted)]"><span className="font-semibold text-[var(--a-text-primary)]">A —</span> {entry.answer}</p>
                </div>
              ) : (
                <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">{entry.content}</p>
              )}
              {entry.addedBy && <p className="mt-1 text-[11.5px] text-[var(--a-text-faint)]">— {entry.addedBy}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
