import { useEffect, useState } from "react";
import CmsPageHeading from "./CmsPageHeading";
import Button from "../ui/Button";
import { colors } from "../../theme/colors";
import { publicApi } from "../../lib/api";
import { CHANNEL_ICONS, channelHref } from "../../lib/contactChannels";

const inputClass =
  "w-full rounded-xl border border-[rgba(110,198,234,0.40)] bg-white/70 px-4 py-3 font-body text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none transition-colors focus:border-[var(--color-gold-deep)] focus:bg-white";

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
              style={{ background: "rgba(110,198,234,0.16)", color: colors.blueDark }}
            >
              <Icon size={17} />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-medium tracking-[0.08em] text-[var(--color-muted-soft)] uppercase">{c.label}</span>
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
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[rgba(110,198,234,0.10)]"
          >
            {body}
          </a>
        ) : (
          <div key={c.id} className="flex items-center gap-3 px-2 py-1.5">
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
      className="mx-auto flex max-w-5xl flex-col gap-8 px-2 py-6 sm:px-4"
      style={{ borderTop: "1px solid rgba(110,198,234,0.35)" }}
    >
      <CmsPageHeading
        slug="contact"
        color={colors.blue}
        fallbackEyebrow="Contact"
        fallbackTitle="Send us a question"
        fallbackDescription="Whether it's about a session, a retreat, or getting involved — we read every message."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,260px)_1fr]">
        {channels.length > 0 && (
          <div className="flex flex-col gap-1 lg:border-r lg:border-[rgba(110,198,234,0.25)] lg:pr-8">
            <ContactChannelsList channels={channels} />
          </div>
        )}

        <div className="max-w-2xl">
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
                className={`${inputClass} appearance-none`}
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
