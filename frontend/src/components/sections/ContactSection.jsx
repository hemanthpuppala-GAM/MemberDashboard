import { useEffect, useState } from "react";
import CmsPageHeading from "./CmsPageHeading";
import Button from "../ui/Button";
import { colors } from "../../theme/colors";
import { publicApi } from "../../lib/api";
import { CHANNEL_ICONS, channelHref } from "../../lib/contactChannels";
import { FORM_PANEL_CLASS, INPUT_CLASS, SECTION_CLASS, SELECT_CLASS } from "../ui/sectionStyles";

const inputClass = INPUT_CLASS;

const CATEGORY_OPTIONS = [
  { value: "meditation", label: "Meditation doubts" },
  { value: "kundalini", label: "Kundalini activation" },
  { value: "health", label: "Health" },
  { value: "general", label: "Other problem" },
];

function ContactChannelsList({ channels }) {
  if (!channels.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {channels.map((c) => {
        const Icon = CHANNEL_ICONS[c.type] ?? CHANNEL_ICONS.website;
        const href = channelHref(c);
        const body = (
          <>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(198,161,91,0.14)", color: colors.goldDeep }}
            >
              <Icon size={17} />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">{c.label}</span>
              <span className="block break-words font-body text-[14.5px] font-medium text-[var(--color-ink)]">{c.value}</span>
            </span>
          </>
        );
        return href ? (
          <a
            key={c.id}
            href={href}
            target={c.type === "website" || c.type === "social" ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 rounded-xl px-3 py-2 transition-colors hover:bg-[var(--color-bg-soft)]"
          >
            {body}
          </a>
        ) : (
          <div key={c.id} className="flex items-center gap-3.5 px-3 py-2">
            {body}
          </div>
        );
      })}
    </div>
  );
}

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", category: "meditation", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    publicApi.contactChannels().then(setChannels).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await publicApi.submitContact(form);
      setForm({ name: "", email: "", phone: "", category: "meditation", message: "" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className={`flex flex-col gap-9 ${SECTION_CLASS}`}
    >
      <CmsPageHeading
        slug="contact"
        color={colors.goldDeep}
        fallbackEyebrow="Contact"
        fallbackTitle="Send us a question"
        fallbackDescription="Whether it's about a session, a retreat, or getting involved — we read every message."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,290px)_1fr]">
        {channels.length > 0 && (
          <div className="flex flex-col gap-1 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 sm:p-5">
            <ContactChannelsList channels={channels} />
          </div>
        )}

        <div className="max-w-2xl">
          {status === "sent" ? (
            <p className="rounded-xl border border-[rgba(122,155,110,0.40)] bg-[rgba(122,155,110,0.10)] px-5 py-4 text-[14.5px] leading-relaxed text-[var(--color-ink)]">
              Thank you — your message has been sent. We'll get back to you soon.
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
              <select
                required
                value={form.category}
                onChange={set("category")}
                className={SELECT_CLASS}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <textarea
                required
                rows={5}
                placeholder="Tell us more — your notes help us guide you better"
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
        </div>
      </div>
    </section>
  );
}
