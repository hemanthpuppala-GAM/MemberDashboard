import { useEffect, useState } from "react";
import logoMark from "../../assets/logo-golden-age.jpg";
import { publicApi } from "../../lib/api";
import { CHANNEL_ICONS, channelHref } from "../../lib/contactChannels";

const EXPLORE_LINKS = [
  { label: "About", view: "about" },
  { label: "Wisdom", view: "wisdom" },
  { label: "Wellness", view: "wellness" },
  { label: "Meditation", view: "practice" },
  { label: "Events", view: "events" },
  { label: "Mission", view: "mission" },
  { label: "Volunteer", view: "volunteer" },
  { label: "Support", view: "donate" },
];

function BackButton({ onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      title="Return to Home · Esc"
      className="fixed bottom-4 left-[clamp(12px,2vw,24px)] z-[60] flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(110,198,234,0.50)] bg-[rgba(255,255,255,0.90)] py-1 pr-[15px] pl-[5px] font-body shadow-[0_8px_26px_rgba(140,138,192,0.20)] backdrop-blur-[10px] transition-colors hover:border-[var(--color-gold)]/80"
    >
      <span className="animate-breathe flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/50 bg-[radial-gradient(circle_at_38%_34%,rgba(230,211,168,0.35),rgba(184,151,88,0.1))]">
        <svg viewBox="0 0 100 100" className="block h-[13px] w-[13px]">
          <polygon points="50,8 86,71 14,71" fill="none" stroke="#f7f1e3" strokeWidth="6" strokeLinejoin="round" />
          <polygon points="50,92 14,29 86,29" fill="none" stroke="#f7f1e3" strokeWidth="6" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="whitespace-nowrap text-[11px] tracking-[0.2em] text-[var(--color-ink)] uppercase">Go Back</span>
    </button>
  );
}

/** Rich site footer shown under every non-hub page — brand, sitemap, contact details, and social links, all tied to real CMS/contact-channel data. */
function SiteFooter({ onNavigate, channels }) {
  const infoChannels = channels.filter((c) => c.type !== "social");
  const socialChannels = channels.filter((c) => c.type === "social");
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-10 border-t border-[rgba(110,198,234,0.30)] bg-[var(--color-surface)]/40 px-[clamp(16px,4vw,48px)] pt-10 pb-24">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <button type="button" onClick={() => onNavigate("hub")} className="flex w-fit items-center gap-2.5">
            <img src={logoMark} alt="" width={36} height={36} className="h-9 w-9 rounded-full border border-[var(--color-gold)]/60 object-cover" />
            <span
              className="font-display text-[15px] tracking-[0.09em]"
              style={{
                background: "linear-gradient(115deg, #f6e7c1 10%, #d5b77c 48%, #b89758 90%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              GOLDEN AGE WISDOM
            </span>
          </button>
          <p className="max-w-[26ch] text-[13px] leading-relaxed text-[var(--color-muted)]">
            Free daily meditation and Upanishadic wisdom, offered without cost or obligation to anyone who seeks it.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">Explore</span>
          {EXPLORE_LINKS.map((l) => (
            <button
              key={l.view}
              type="button"
              onClick={() => onNavigate(l.view)}
              className="w-fit text-left text-[13.5px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-deep)]"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">Contact</span>
          {infoChannels.length === 0 ? (
            <button type="button" onClick={() => onNavigate("contact")} className="w-fit text-left text-[13.5px] text-[var(--color-muted)] hover:text-[var(--color-gold-deep)]">
              Get in touch →
            </button>
          ) : (
            infoChannels.map((c) => {
              const Icon = CHANNEL_ICONS[c.type] ?? CHANNEL_ICONS.website;
              const href = channelHref(c);
              const content = (
                <>
                  <Icon size={14} className="mt-0.5 shrink-0 text-[var(--color-gold-deep)]" />
                  <span className="text-[13.5px] break-words text-[var(--color-muted)]">{c.value}</span>
                </>
              );
              return href ? (
                <a key={c.id} href={href} className="flex w-fit items-start gap-2 transition-colors hover:text-[var(--color-gold-deep)]">
                  {content}
                </a>
              ) : (
                <span key={c.id} className="flex items-start gap-2">
                  {content}
                </span>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">Connect</span>
          {socialChannels.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {socialChannels.map((c) => {
                const Icon = CHANNEL_ICONS.social;
                const href = channelHref(c);
                return (
                  <a
                    key={c.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={c.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(110,198,234,0.35)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-gold)]/70 hover:text-[var(--color-gold-deep)]"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => onNavigate("donate")}
            className="w-fit rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] px-4 py-2 font-body text-[13px] font-semibold text-[var(--color-on-gold)] transition-all hover:shadow-[0_0_20px_rgba(243,216,154,0.45)]"
          >
            Support the mission
          </button>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-1 border-t border-[rgba(110,198,234,0.20)] pt-5 text-[12px] text-[var(--color-muted-soft)] sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} Golden Age Wisdom · A registered non-profit</span>
        <span>Funded entirely by voluntary support, never by ads</span>
      </div>
    </footer>
  );
}

/** Minimal footer for the hub (mandala) view — fixed viewport, no scroll, so it stays compact. */
function HubFooter({ onNavigate }) {
  return (
    <footer className="relative z-10 flex shrink-0 flex-col items-center gap-[7px] px-6 pt-2 pb-3 text-xs font-light text-white/75 [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
      <div className="m-caption text-[12.5px] tracking-[0.1em] text-white/80 max-[700px]:hidden">
        Choose a path · the center breathes with you
      </div>
      <div className="flex flex-wrap items-center justify-center gap-[18px]">
        <button type="button" onClick={() => onNavigate("donate")} className="text-white/75 transition-colors hover:text-[var(--color-gold)]">
          Support
        </button>
        <span>A registered non-profit · © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

export default function Footer({ view = "hub", onBack, onNavigate }) {
  const [channels, setChannels] = useState([]);
  const inSection = view !== "hub" && view !== "film";

  useEffect(() => {
    if (view === "hub" || view === "film") return;
    publicApi.contactChannels().then(setChannels).catch(() => {});
  }, [view]);

  return (
    <>
      {inSection && <BackButton onBack={onBack} />}
      {view === "hub" && <HubFooter onNavigate={onNavigate} />}
      {inSection && <SiteFooter onNavigate={onNavigate} channels={channels} />}
    </>
  );
}
