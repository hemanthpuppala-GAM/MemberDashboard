import { useEffect, useState } from "react";
import CoinLogo from "../ui/CoinLogo";
import { publicApi } from "../../lib/api";
import { CHANNEL_ICONS, channelHref } from "../../lib/contactChannels";
import { useLanguage } from "../../lib/LanguageContext";
import { useCustomPages } from "../../hooks/useCustomPages";

const FOOTER_LINK_CLASS =
  "relative w-fit text-left font-body text-[13px] text-[rgba(237,230,214,0.65)] transition-colors duration-300 hover:text-[var(--color-gold-light)] " +
  "after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[var(--color-gold)] " +
  "after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100";

const EXPLORE_LINKS = [
  { key: "nav.about", view: "about" },
  { key: "nav.wisdom", view: "wisdom" },
  { key: "nav.wellness", view: "wellness" },
  { key: "nav.meditation", view: "practice" },
  { key: "nav.events", view: "events" },
  { key: "nav.mission", view: "mission" },
  { key: "nav.volunteer", view: "volunteer" },
  { key: "nav.support", view: "donate" },
];

function BackButton({ onBack }) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onBack}
      title="Return to Home · Esc"
      className="fixed bottom-4 left-[clamp(12px,2vw,24px)] z-[60] flex cursor-pointer items-center gap-2.5 rounded-full border border-[rgba(201,162,74,0.45)] bg-[rgba(5,8,15,0.85)] py-1.5 pr-4 pl-1.5 font-body shadow-[0_8px_26px_rgba(0,0,0,0.4)] backdrop-blur-[10px] transition-colors hover:border-[var(--color-gold)]"
    >
      <span className="animate-breathe flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/60 bg-[radial-gradient(circle_at_38%_34%,#E8CF83,#8A6A22_70%)]">
        <svg viewBox="0 0 100 100" className="block h-[13px] w-[13px]">
          <polygon points="50,8 86,71 14,71" fill="none" stroke="#FFF8E6" strokeWidth="6" strokeLinejoin="round" />
          <polygon points="50,92 14,29 86,29" fill="none" stroke="#FFF8E6" strokeWidth="6" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="whitespace-nowrap text-[11px] tracking-[0.2em] text-[var(--color-cream)] uppercase">{t("footer.go_back")}</span>
    </button>
  );
}

/** Night footer — the coin appears once, large; sitemap, contact and social from CMS. */
function SiteFooter({ onNavigate, channels }) {
  const { t } = useLanguage();
  const customPages = useCustomPages();
  const infoChannels = channels.filter((c) => c.type !== "social");
  const socialChannels = channels.filter((c) => c.type === "social");
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-16 bg-[var(--color-night)] px-[clamp(20px,4vw,48px)] pt-16 pb-28 text-[rgba(237,230,214,0.65)]">
      <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="flex flex-col gap-5">
          <button type="button" onClick={() => onNavigate("hub")} className="flex w-fit items-center gap-5">
            <CoinLogo size={112} className="shadow-[0_0_50px_rgba(201,162,74,0.28)]" />
          </button>
          <div className="flex flex-col gap-2">
            <span className="font-display text-[15px] tracking-[0.2em] text-[var(--color-cream)]">GOLDEN AGE WISDOM</span>
            <span className="font-body text-[10px] tracking-[0.28em] text-[var(--color-gold)] uppercase">Wisdom · Wellness · Meditation</span>
            <p className="mt-1 max-w-[28ch] font-body text-[13px] leading-relaxed font-light">{t("footer.tagline")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="font-body text-[10px] font-semibold tracking-[0.22em] text-[var(--color-gold)] uppercase">{t("footer.explore_heading")}</span>
          {EXPLORE_LINKS.map((l) => (
            <button key={l.view} type="button" onClick={() => onNavigate(l.view)} className={FOOTER_LINK_CLASS}>
              {t(l.key)}
            </button>
          ))}
          {customPages.map((p) => (
            <button key={p.slug} type="button" onClick={() => onNavigate(p.slug)} className={FOOTER_LINK_CLASS}>
              {p.title}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="font-body text-[10px] font-semibold tracking-[0.22em] text-[var(--color-gold)] uppercase">{t("footer.contact_heading")}</span>
          {infoChannels.length === 0 ? (
            <button type="button" onClick={() => onNavigate("contact")} className={FOOTER_LINK_CLASS}>
              {t("footer.get_in_touch")}
            </button>
          ) : (
            infoChannels.map((c) => {
              const Icon = CHANNEL_ICONS[c.type] ?? CHANNEL_ICONS.website;
              const href = channelHref(c);
              const content = (
                <>
                  <Icon size={14} className="mt-0.5 shrink-0 text-[var(--color-gold)]" />
                  <span className="font-body text-[13px] break-words">{c.value}</span>
                </>
              );
              return href ? (
                <a key={c.id} href={href} className="flex w-fit items-start gap-2 transition-colors hover:text-[var(--color-gold-light)]">
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
          <span className="font-body text-[10px] font-semibold tracking-[0.22em] text-[var(--color-gold)] uppercase">{t("footer.connect_heading")}</span>
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
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(201,162,74,0.3)] text-[rgba(237,230,214,0.7)] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold-light)]"
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
            className="w-fit rounded-full px-5 py-2.5 font-body text-[11px] font-medium tracking-[0.12em] text-[var(--color-on-gold)] uppercase transition-all hover:shadow-[0_0_30px_rgba(201,162,74,0.45)]"
            style={{ background: "linear-gradient(135deg, #E8CF83, #C9A24A)" }}
          >
            {t("footer.support_mission")}
          </button>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-1 border-t border-[rgba(201,162,74,0.18)] pt-5 font-body text-[11px] tracking-[0.08em] text-[rgba(237,230,214,0.45)] sm:flex-row sm:items-center sm:justify-between">
        <span>{t("footer.copyright", { year })}</span>
        <span>Hyderabad · 17.38° N · 78.48° E</span>
      </div>
    </footer>
  );
}

/** Minimal footer for the hub (mandala) view. */
function HubFooter({ onNavigate }) {
  const { t } = useLanguage();
  return (
    <footer className="relative z-10 flex shrink-0 flex-col items-center gap-[7px] px-6 pt-2 pb-3 font-body text-xs font-light text-white/70 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
      <div className="m-caption text-[12px] tracking-[0.12em] text-white/70 max-[700px]:hidden">{t("hub.choose_path")}</div>
      <div className="flex flex-wrap items-center justify-center gap-[18px]">
        <button type="button" onClick={() => onNavigate("donate")} className="text-white/70 transition-colors hover:text-[var(--color-gold-light)]">
          {t("hub.support")}
        </button>
        <span>{t("hub.copyright", { year: new Date().getFullYear() })}</span>
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
