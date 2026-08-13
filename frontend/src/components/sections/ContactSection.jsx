import { useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import { colors } from "../../theme/colors";
import { publicApi } from "../../lib/api";

const inputClass =
  "w-full rounded-xl border border-[rgba(110,198,234,0.40)] bg-white/70 px-4 py-3 font-body text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none transition-colors focus:border-[var(--color-gold-deep)] focus:bg-white";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await publicApi.submitContact(form);
      setForm({ name: "", email: "", message: "" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="mx-auto flex max-w-2xl flex-col gap-8 px-2 py-6 sm:px-4"
      style={{ borderTop: "1px solid rgba(110,198,234,0.35)" }}
    >
      <SectionHeading
        eyebrow="Contact"
        title="Send us a question"
        description="Whether it's about a session, a retreat, or getting involved — we read every message."
        color={colors.blue}
      />

      {status === "sent" ? (
        <p className="rounded-xl border border-[rgba(93,184,117,0.45)] bg-[rgba(93,184,117,0.12)] px-5 py-4 text-[14px] text-[var(--color-ink)]">
          Thank you — your message has been sent. We'll get back to you soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="Your name"
            value={form.name}
            onChange={set("name")}
            className={inputClass}
          />
          <input
            type="email"
            required
            placeholder="Your email"
            value={form.email}
            onChange={set("email")}
            className={inputClass}
          />
          <textarea
            required
            rows={5}
            placeholder="How can we help?"
            value={form.message}
            onChange={set("message")}
            className={`${inputClass} resize-y`}
          />

          {status === "error" && (
            <p className="text-[13px] font-medium text-[#c0554a]">
              Something went wrong — please try again in a moment.
            </p>
          )}

          <Button as="button" type="submit" variant="primary" className="w-fit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send message"}
          </Button>
        </form>
      )}
    </section>
  );
}
