import { useEffect, useState } from "react";
import CmsPageHeading from "./CmsPageHeading";
import Button from "../ui/Button";
import { colors } from "../../theme/colors";
import { publicApi } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";
import { FORM_PANEL_CLASS, INPUT_CLASS, SECTION_CLASS } from "../ui/sectionStyles";

const inputClass = INPUT_CLASS;

const EMPTY_FORM = { name: "", email: "", phone: "", occupation: "", city: "", teams: [], availability: "", notes: "" };

// Same choices as the live site's volunteer form (VolunteerApplication::AVAILABILITY).
const AVAILABILITY = ["An hour or two a week", "A few hours a week", "Events only", "Whenever I am needed"];

const pillClass = (on) =>
  `cursor-pointer rounded-full border px-4 py-2 text-[13.5px] transition-colors ${
    on
      ? "border-[var(--color-gold-deep)] bg-[rgba(201,162,74,0.16)] font-semibold text-[var(--color-ink)]"
      : "border-[var(--color-border-strong)]/40 bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-gold)]"
  }`;

export default function VolunteerSection() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    publicApi
      .volunteerCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleTeam = (slug) =>
    setForm((f) => ({ ...f, teams: f.teams.includes(slug) ? f.teams.filter((t) => t !== slug) : [...f.teams, slug] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await publicApi.submitVolunteerApplication({ ...form, availability: form.availability || null, lang: language });
      setForm(EMPTY_FORM);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="volunteer"
      className={`flex max-w-2xl flex-col gap-9 ${SECTION_CLASS}`}
    >
      <CmsPageHeading
        slug="volunteer"
        color={colors.gold}
        fallbackEyebrow="Volunteer"
        fallbackTitle="Become a volunteer"
        fallbackDescription="Give your time and talent to the community — tell us a bit about yourself and where you'd like to help."
      />

      {status === "sent" ? (
        <p className="rounded-xl border border-[rgba(122,155,110,0.40)] bg-[rgba(122,155,110,0.10)] px-5 py-4 text-[14.5px] leading-relaxed text-[var(--color-ink)]">
          Thank you — your application has been received. We'll reach out soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className={`flex flex-col gap-4 ${FORM_PANEL_CLASS}`}>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Occupation" value={form.occupation} onChange={set("occupation")} className={inputClass} />
            <input type="text" placeholder="City" autoComplete="address-level2" value={form.city} onChange={set("city")} className={inputClass} />
          </div>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-1 text-[13.5px] font-semibold text-[var(--color-ink)]">Where would you like to help? Pick one or more.</legend>
            {categories.length === 0 && <p className="text-[13px] text-[var(--color-ink-soft)]">No teams available yet.</p>}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {categories.map((c) => {
                const on = form.teams.includes(c.slug);
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTeam(c.slug)}
                    className={`rounded-2xl border p-3.5 text-left transition-colors ${
                      on
                        ? "border-[var(--color-gold-deep)] bg-[rgba(201,162,74,0.12)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-gold)]"
                    }`}
                  >
                    <span className="block text-[14px] font-semibold text-[var(--color-ink)]">{c.name}</span>
                    {c.description && <span className="mt-1 block text-[12.5px] leading-snug text-[var(--color-ink-soft)]">{c.description}</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-1 text-[13.5px] font-semibold text-[var(--color-ink)]">How much time can you give?</legend>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-pressed={form.availability === a}
                  onClick={() => setForm((f) => ({ ...f, availability: f.availability === a ? "" : a }))}
                  className={pillClass(form.availability === a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </fieldset>
          <textarea
            rows={5}
            placeholder="Anything else you'd like us to know"
            value={form.notes}
            onChange={set("notes")}
            className={`${inputClass} resize-y`}
          />

          {status === "error" && (
            <p className="text-[13px] font-medium text-[#c0554a]">
              Something went wrong — please try again in a moment.
            </p>
          )}

          <Button as="button" type="submit" variant="primary" className="w-fit" disabled={status === "sending" || !form.teams.length}>
            {status === "sending" ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      )}
    </section>
  );
}
