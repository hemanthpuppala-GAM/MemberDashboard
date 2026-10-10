import { useState } from "react";
import { Send } from "lucide-react";
import { Button, Segmented, inputClass } from "./ui";

const MODES = [
  { value: "reply", label: "Reply to member" },
  { value: "note", label: "Internal note" },
];

/** Write a public reply (emailed to the member) or an internal note for the team. */
export default function ReplyBox({ onSend, canEmail }) {
  const [mode, setMode] = useState("reply");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const note = mode === "note";

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onSend(body.trim(), note);
      setBody("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl border p-3 sm:p-4 ${note ? "border-[rgba(201,150,40,0.55)] bg-[#FFF3D1]" : "border-[rgba(138,111,52,0.2)] bg-[#FFFDF8]"}`}
    >
      <Segmented label="Message type" value={mode} options={MODES} onChange={setMode} />
      <p className="mt-2 text-[12.5px] leading-relaxed text-[#5A5546]">
        {note
          ? "Only the support team sees internal notes."
          : canEmail
            ? "The member gets this by email and sees it in “My questions”."
            : "This person gave no email — they'll see it only if they sign in. Call or WhatsApp them too."}
      </p>
      <label className="mt-2 block">
        <span className="sr-only">{note ? "Internal note" : "Reply to member"}</span>
        <textarea
          rows={4}
          className={`${inputClass} resize-y leading-relaxed`}
          placeholder={note ? "Note for the team…" : "Write your reply…"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      {error && <p role="alert" className="mt-2 text-[14px] text-[#7E2C20]">{error}</p>}
      <div className="mt-2 flex justify-end">
        <Button type="submit" variant={note ? "outline" : "dark"} busy={busy} disabled={!body.trim()} className="w-full sm:w-auto sm:px-6">
          {!busy && <Send size={15} aria-hidden />}
          {note ? "Save note" : "Send reply"}
        </Button>
      </div>
    </form>
  );
}
