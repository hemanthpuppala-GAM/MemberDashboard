import { useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import { publicApi } from "../../lib/api";

const inputClass =
  "w-full rounded-xl border border-[rgba(110,198,234,0.40)] bg-white/70 px-4 py-3 font-body text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none transition-colors focus:border-[var(--color-gold-deep)] focus:bg-white";

const ALL_CATEGORIES = [
  { value: "meditation", label: "Meditation doubts" },
  { value: "kundalini", label: "Kundalini activation" },
  { value: "health", label: "Health" },
  { value: "general", label: "Other problem" },
];

const DEFAULT_COLOR = "#6EC6EA";

/** Embeddable contact/query form — the `contact_form` CMS section type, usable on any page. */
export default function ContactFormSection({ fields, color = DEFAULT_COLOR }) {
  const categoryOptions = fields?.categories?.length
    ? ALL_CATEGORIES.filter((c) => fields.categories.includes(c.value))
    : ALL_CATEGORIES;

  const [form, setForm] = useState({ name: "", email: "", phone: "", category: categoryOptions[0]?.value ?? "general", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  if (!fields) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await publicApi.submitContact(form);
      setForm((f) => ({ ...f, name: "", email: "", phone: "", message: "" }));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-8 px-2 py-6 sm:px-4">
      <SectionHeading eyebrow={fields.eyebrow} title={fields.heading} description={fields.description} color={color} />

      {status === "sent" ? (
        <p className="rounded-xl border border-[rgba(93,184,117,0.45)] bg-[rgba(93,184,117,0.12)] px-5 py-4 text-[14px] text-[var(--color-ink)]">
          Thank you — your message has been sent. We'll get back to you soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" required placeholder="Your name" value={form.name} onChange={set("name")} className={inputClass} />
          <input type="email" required placeholder="Your email" value={form.email} onChange={set("email")} className={inputClass} />
          <input type="tel" required placeholder="Your phone / WhatsApp number" value={form.phone} onChange={set("phone")} className={inputClass} />
          <select required value={form.category} onChange={set("category")} className={`${inputClass} appearance-none`}>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <textarea required rows={5} placeholder="Tell us more — your notes help us guide you better" value={form.message} onChange={set("message")} className={`${inputClass} resize-y`} />

          {status === "error" && (
            <p className="text-[13px] font-medium text-[#c0554a]">Something went wrong — please try again in a moment.</p>
          )}

          <Button as="button" type="submit" variant="primary" className="w-fit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send message"}
          </Button>
        </form>
      )}
    </section>
  );
}
