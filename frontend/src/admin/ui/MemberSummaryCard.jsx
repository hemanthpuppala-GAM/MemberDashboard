import Card from "./Card";
import { TextArea } from "./Field";

/**
 * The running "about this member" record — a curated overview distinct from
 * the raw journey timeline, so anyone picking up this member gets up to
 * speed in one read instead of scrolling through every past note.
 */
export default function MemberSummaryCard({ value, onChange, onBlur, readOnly = false }) {
  return (
    <Card
      title="Summary"
      description="A living overview of who this person is and how their journey is going — update it as you learn more."
    >
      <TextArea
        rows={4}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
        placeholder='e.g. "Came in for kundalini activation support after an intense group session. Responds well to breathwork; still hesitant about long sits. Sleep has improved since week 2."'
        disabled={readOnly}
      />
    </Card>
  );
}
