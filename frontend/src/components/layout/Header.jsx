import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoMark from "../../assets/logo-golden-age.jpg";
import Button from "../ui/Button";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../../lib/LanguageContext";
import { useCustomPages } from "../../hooks/useCustomPages";

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

function navLinkClass(active) {
  return `rounded-full px-3.5 py-1.5 font-display text-[15px] tracking-[0.01em] transition-all duration-200 ${
    active
      ? "bg-[rgba(168,185,160,0.35)] text-[var(--color-ink)] shadow-[0_0_14px_rgba(168,185,160,0.30)]"
      : "text-[var(--color-muted)] hover:bg-[var(--color-gold)] hover:text-[var(--color-on-gold)]"
  }`;
}

/** Full-height slide-in nav for narrow screens — mirrors the built-in + custom links shown in the desktop bar. */
function MobileNavDrawer({ open, onClose, links, activeView, onNavigate }) {
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden">
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="fixed top-0 right-0 z-[61] flex h-dvh w-[min(320px,85vw)] flex-col gap-1 overflow-y-auto bg-[var(--color-bg)] p-5 pt-6 shadow-[-10px_0_40px_rgba(0,0,0,0.20)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full text-[var(--color-muted)] hover:bg-[var(--color-gold)] hover:text-[var(--color-on-gold)]"
        >
          <X size={18} />
        </button>
        {links.map(({ key, label, view }) => {
          const active = activeView === view;
          return (
            <button
              key={view}
              type="button"
              onClick={() => {
                onNavigate?.(view);
                onClose();
              }}
              className={`group relative w-full overflow-hidden rounded-full text-left font-display text-[15px] tracking-[0.01em] ${
                active ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-0 origin-left bg-[var(--color-gold)] transition-transform duration-300 ease-out group-hover:scale-x-100 group-active:scale-x-100 ${
                  active ? "scale-x-100 bg-[rgba(168,185,160,0.35)]" : "scale-x-0"
                }`}
              />
              <span className="relative z-10 block px-4 py-2.5 transition-colors duration-300 group-hover:text-[var(--color-on-gold)] group-active:text-[var(--color-on-gold)]">
                {label ?? key}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Top bar — logo · section nav · language switcher · Join free. Same light bar on every view, including the hub. */
export default function Header({ onLogoClick, onNavigate, activeView = "hub" }) {
  const { t } = useLanguage();
  const customPages = useCustomPages();
  const [menuOpen, setMenuOpen] = useState(false);

  const drawerLinks = [
    ...NAV_LINKS.map(({ key, view }) => ({ view, label: t(key) })),
    ...customPages.map(({ slug, title }) => ({ view: slug, label: title })),
  ];

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
          <button key={view} type="button" onClick={() => onNavigate?.(view)} className={navLinkClass(activeView === view)}>
            {t(key)}
          </button>
        ))}
        {customPages.map(({ slug, title }) => (
          <button key={slug} type="button" onClick={() => onNavigate?.(slug)} className={navLinkClass(activeView === slug)}>
            {title}
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
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-gold)] hover:text-[var(--color-on-gold)] lg:hidden"
        >
          <Menu size={19} />
        </button>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={drawerLinks}
        activeView={activeView}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
