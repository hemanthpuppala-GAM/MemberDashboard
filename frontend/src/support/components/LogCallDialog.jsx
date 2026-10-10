import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { supportApi } from "../supportApi";
import { Button, Segmented, Toggle, inputClass } from "./ui";

const SOURCES = [
  { value: "call", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
];
const fieldLabel = "flex flex-col gap-1.5 text-[13px] font-semibold text-[#1B3328]";

/** First-line staff log a phone call or WhatsApp chat as a ticket. */
export default function LogCallDialog({ onClose, onCreated }) {
  const [form, setForm] = useState({ source: "call", name: "", phone: "", email: "", body: "", urgent: false, mine: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const firstField = useRef(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.body.trim()) {
      setError("Write down what they asked.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const ticket = await supportApi.createTicket({
        source: form.source,
        requester_name: form.name.trim() || undefined,
        requester_phone: form.phone.trim() || undefined,
        requester_email: form.email.trim() || undefined,
        body: form.body.trim(),
        priority: form.urgent ? "urgent" : "normal",
        assign_to_me: form.mine,
        status: form.mine ? "in_progress" : "open",
      });
      onCreated(ticket);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(14,26,20,0.55)] sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logcall-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-3xl bg-[#F3EAD3] shadow-2xl sm:max-w-[560px] sm:rounded-3xl"
      >
        <div className="flex items-center gap-2 px-5 pb-1 pt-[calc(14px+env(safe-area-inset-top))] sm:pt-5">
          <h2 id="logcall-title" className="flex-1 text-[28px] leading-tight text-[#14241C]">
            Log a call / WhatsApp
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[#1B3328] hover:bg-[rgba(201,162,74,0.14)]"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3.5 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2" noValidate>
          <Segmented label="How they reached us" value={form.source} options={SOURCES} onChange={set("source")} />
          <label className={fieldLabel}>
            Their name
            <input ref={firstField} className={inputClass} autoComplete="off" value={form.name} onChange={(e) => set("name")(e.target.value)} />
          </label>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className={fieldLabel}>
              Phone number
              <input className={inputClass} type="tel" inputMode="tel" autoComplete="off" value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
            </label>
            <label className={fieldLabel}>
              <span>
                Email <span className="font-normal text-[#5A5546]">(optional)</span>
              </span>
              <input className={inputClass} type="email" inputMode="email" autoComplete="off" value={form.email} onChange={(e) => set("email")(e.target.value)} />
            </label>
          </div>
          <label className={fieldLabel}>
            What they asked
            <textarea
              rows={5}
              className={`${inputClass} resize-y leading-relaxed`}
              placeholder="In their words, as best you can…"
              value={form.body}
              onChange={(e) => set("body")(e.target.value)}
            />
          </label>
          <div className="flex flex-col">
            <Toggle checked={form.urgent} onChange={set("urgent")}>
              Urgent
            </Toggle>
            <Toggle checked={form.mine} onChange={set("mine")}>
              I'll handle it
            </Toggle>
          </div>
          {error && <p role="alert" className="text-[14px] text-[#7E2C20]">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="dark" busy={busy} className="sm:px-6">
              Save ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
