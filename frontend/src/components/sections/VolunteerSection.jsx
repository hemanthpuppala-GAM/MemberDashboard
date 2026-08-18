import { useEffect, useState } from "react";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import { colors } from "../../theme/colors";
import { publicApi } from "../../lib/api";

const inputClass =
  "w-full rounded-xl border border-[rgba(110,198,234,0.40)] bg-white/70 px-4 py-3 font-body text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none transition-colors focus:border-[var(--color-gold-deep)] focus:bg-white";

const EMPTY_FORM = { name: "", email: "", phone: "", category_id: "", notes: "" };

export default function VolunteerSection() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    publicApi
      .volunteerCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length) setForm((f) => ({ ...f, category_id: String(cats[0].id) }));
      })
      .catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await publicApi.submitVolunteerApplication({ ...form, category_id: Number(form.category_id) });
      setForm((f) => ({ ...EMPTY_FORM, category_id: f.category_id }));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="volunteer"
      className="mx-auto flex max-w-2xl flex-col gap-8 px-2 py-6 sm:px-4"
      style={{ borderTop: "1px solid rgba(110,198,234,0.35)" }}
    >
      <SectionHeading
        eyebrow="Volunteer"
        title="Become a volunteer"
        description="Give your time and talent to the community — tell us a bit about yourself and where you'd like to help."
        color={colors.gold}
      />

      {status === "sent" ? (
        <p className="rounded-xl border border-[rgba(93,184,117,0.45)] bg-[rgba(93,184,117,0.12)] px-5 py-4 text-[14px] text-[var(--color-ink)]">
          Thank you — your application has been received. We'll reach out soon.
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
          <input
            type="tel"
            required
            placeholder="Your phone / WhatsApp number"
            value={form.phone}
            onChange={set("phone")}
            className={inputClass}
          />
          <select
            required
            value={form.category_id}
            onChange={set("category_id")}
            disabled={!categories.length}
            className={`${inputClass} appearance-none`}
          >
            {categories.length === 0 && <option value="">No categories available yet</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <textarea
            rows={5}
            placeholder="Anything else you'd like us to know (skills, availability, etc.)"
            value={form.notes}
            onChange={set("notes")}
            className={`${inputClass} resize-y`}
          />

          {status === "error" && (
            <p className="text-[13px] font-medium text-[#c0554a]">
              Something went wrong — please try again in a moment.
            </p>
          )}

          <Button as="button" type="submit" variant="primary" className="w-fit" disabled={status === "sending" || !categories.length}>
            {status === "sending" ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      )}
    </section>
  );
}
