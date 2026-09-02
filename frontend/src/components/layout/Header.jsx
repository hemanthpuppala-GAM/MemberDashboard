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

/** Top bar — logo · section nav · language switcher · Join free. Same light bar on every view, including the hub. */
export default function Header({ onLogoClick, onNavigate, activeView = "hub" }) {
  const { t } = useLanguage();

  return (
    <nav
      className="relative z-50 mx-auto mt-3 flex w-[min(1180px,calc(100%-32px))] shrink-0 items-center justify-between gap-4 rounded-full border border-[rgba(168,185,160,0.35)] bg-[rgba(252,250,245,0.92)] px-2 py-1.5 backdrop-blur-[16px] sm:gap-5 sm:px-3"
      aria-label="Primary"
      style={{ boxShadow: "0 4px 24px rgba(168,185,160,0.12)" }}
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
          className="h-11 w-11 shrink-0 rounded-full border border-[var(--color-gold)]/50 object-cover shadow-[0_0_18px_rgba(168,185,160,0.25)] sm:h-12 sm:w-12"
        />
      </button>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
        {NAV_LINKS.map(({ key, view }) => (
          <button
            key={view}
            type="button"
            onClick={() => onNavigate?.(view)}
            className={`rounded-full px-3.5 py-1.5 font-display text-[15px] tracking-[0.01em] transition-all duration-200 ${
              activeView === view
                ? "bg-[rgba(168,185,160,0.35)] text-[var(--color-ink)] shadow-[0_0_14px_rgba(168,185,160,0.30)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-gold)] hover:text-[var(--color-on-gold)]"
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 shrink-0 items-center justify-end gap-2.5">
        <LanguageSwitcher />
        <Button
          as={Link}
          to="/join"
          className="px-4 py-1.5 text-[13.5px] shadow-[0_0_20px_rgba(198,161,91,0.25)]"
        >
          {t("nav.join_free")}
        </Button>
      </div>
    </nav>
  );
}
