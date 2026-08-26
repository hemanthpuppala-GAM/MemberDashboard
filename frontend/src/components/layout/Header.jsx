import { Link } from "react-router-dom";
import logoMark from "../../assets/logo-golden-age.jpg";
import Button from "../ui/Button";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../../lib/LanguageContext";

const NAV_LINKS = [
  { key: "nav.about", view: "about" },
  { key: "nav.wisdom", view: "wisdom" },
  { key: "nav.meditation", view: "practice" },
  { key: "nav.events", view: "events" },
  { key: "nav.mission", view: "mission" },
  { key: "nav.volunteer", view: "volunteer" },
  { key: "nav.support", view: "donate" },
  { key: "nav.contact", view: "contact" },
];

/** Top bar — logo · section nav · language switcher · Join free. Transparent on hub so the hero photo shows through. */
export default function Header({ onLogoClick, onNavigate, activeView = "hub" }) {
  const { t } = useLanguage();
  const isHub = activeView === "hub";

  return (
    <nav
      className={`relative z-50 mx-auto mt-3 flex w-[min(1180px,calc(100%-32px))] shrink-0 items-center justify-between gap-4 px-2 py-1.5 sm:gap-5 sm:px-3 ${
        isHub ? "rounded-none border-0 bg-transparent shadow-none" : "rounded-full border border-[rgba(110,198,234,0.35)] bg-[rgba(245,250,253,0.92)] backdrop-blur-[16px]"
      }`}
      aria-label="Primary"
      style={
        isHub
          ? undefined
          : { boxShadow: "0 4px 24px rgba(110,198,234,0.12)" }
      }
    >
      <button
        type="button"
        onClick={onLogoClick}
        className="flex min-w-0 shrink-0 cursor-pointer items-center justify-start border-0 bg-transparent p-0 text-left"
        aria-label="Golden Age Wisdom — Home"
      >
        <img
          src={logoMark}
          alt="Golden Age Wisdom"
          width={72}
          height={72}
          className={`shrink-0 rounded-full object-cover ${
            isHub
              ? "h-14 w-14 shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:h-16 sm:w-16"
              : "h-11 w-11 border border-[var(--color-gold)]/50 shadow-[0_0_18px_rgba(110,198,234,0.25)] sm:h-12 sm:w-12"
          }`}
        />
      </button>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
        {NAV_LINKS.map(({ key, view }) => (
          <button
            key={view}
            type="button"
            onClick={() => onNavigate?.(view)}
            className={`rounded-full px-3.5 py-1.5 font-body text-[13px] tracking-wide transition-all duration-200 ${
              isHub
                ? activeView === view
                  ? "bg-white/15 text-white shadow-[0_0_14px_rgba(243,216,154,0.25)]"
                  : "text-white/85 hover:bg-white/10 hover:text-white"
                : activeView === view
                  ? "bg-[rgba(110,198,234,0.35)] text-[var(--color-ink)] shadow-[0_0_14px_rgba(110,198,234,0.30)]"
                  : "text-[var(--color-muted)] hover:bg-[rgba(110,198,234,0.18)] hover:text-[var(--color-ink)]"
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 shrink-0 items-center justify-end gap-2.5">
        <LanguageSwitcher light={isHub} />
        <Button
          as={Link}
          to="/join"
          className="px-4 py-1.5 text-[13.5px] shadow-[0_0_20px_rgba(213,183,124,0.25)]"
        >
          {t("nav.join_free")}
        </Button>
      </div>
    </nav>
  );
}
