import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import CoinLogo from "../ui/CoinLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../../lib/LanguageContext";
import { useCustomPages } from "../../hooks/useCustomPages";

const NAV_LINKS = [
  { key: "nav.about", view: "about" },
  { key: "nav.wisdom", view: "wisdom" },
  { key: "nav.wellness", view: "wellness" },
  { key: "nav.meditation", view: "practice" },
  { key: "nav.events", view: "events" },
  { key: "nav.mission", view: "mission" },
];

/**
 * Secondary links (right of the section nav, before Join). `privacy` has no
 * dedicated section — it resolves to the CMS custom page with slug "privacy"
 * (publicRoutes.viewForSlug falls through to PageSections), so admins own the copy.
 */
const UTILITY_LINKS = [
  { key: "nav.support", view: "donate" },
  { key: "nav.volunteer", view: "volunteer" },
  { key: "nav.privacy", view: "privacy", fallback: "Privacy" },
];

function navLinkClass(active) {
  return `whitespace-nowrap border-b pb-[3px] font-body text-[11px] tracking-[0.1em] uppercase transition-colors duration-200 ${
    active
      ? "border-[var(--color-gold-light)] text-[var(--color-gold-light)]"
      : "border-transparent text-[rgba(237,230,214,0.7)] hover:text-[var(--color-cream)]"
  }`;
}

/** Full-height slide-in nav for narrow screens. */
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
      <div className="fixed inset-0 z-[60] bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="fixed top-0 right-0 z-[61] flex h-dvh w-[min(320px,85vw)] flex-col gap-1 overflow-y-auto bg-[var(--color-night)] p-5 pt-6 shadow-[-10px_0_40px_rgba(0,0,0,0.5)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full text-[var(--color-cream)] hover:bg-[rgba(201,162,74,0.15)]"
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
              className={`w-full rounded-lg px-4 py-3 text-left font-body text-[13px] tracking-[0.1em] uppercase transition-colors ${
                active ? "bg-[rgba(201,162,74,0.15)] text-[var(--color-gold-light)]" : "text-[rgba(237,230,214,0.75)] hover:bg-[rgba(201,162,74,0.1)] hover:text-[var(--color-cream)]"
              }`}
            >
              {label ?? key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Night header — coin · wordmark · section nav · language · Join. Full-width bar, same on every view. */
export default function Header({ onLogoClick, onNavigate, activeView = "hub" }) {
  const { t } = useLanguage();
  const customPages = useCustomPages();
  const [menuOpen, setMenuOpen] = useState(false);

  const drawerLinks = [
    ...NAV_LINKS.map(({ key, view }) => ({ view, label: t(key) })),
    ...customPages.map(({ slug, title }) => ({ view: slug, label: title })),
    ...UTILITY_LINKS.map(({ key, view, fallback }) => ({ view, label: t(key) === key ? fallback : t(key) })),
  ];

  return (
    <nav
      className="relative z-50 flex w-full shrink-0 items-center justify-between gap-6 border-b border-[rgba(201,162,74,0.22)] bg-[rgba(5,8,15,0.82)] px-5 py-3 backdrop-blur-[14px] sm:px-8 lg:px-12"
      aria-label="Primary"
    >
      <button
        type="button"
        onClick={onLogoClick}
        className="flex min-w-0 shrink-0 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left whitespace-nowrap"
        aria-label="Golden Age Wisdom — Home"
      >
        <CoinLogo size={44} />
        <span className="hidden font-display text-[14px] tracking-[0.18em] text-[var(--color-cream)] sm:inline">
          GOLDEN AGE <span className="ml-1.5 text-[10px] tracking-[0.3em] text-[var(--color-gold)]">WISDOM</span>
        </span>
      </button>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-[clamp(12px,1.8vw,28px)] lg:flex">
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

      <div className="flex min-w-0 shrink-0 items-center justify-end gap-3 whitespace-nowrap">
        <div className="hidden items-center gap-[clamp(10px,1.4vw,20px)] border-r border-[rgba(201,162,74,0.22)] pr-4 xl:flex">
          {UTILITY_LINKS.map(({ key, view, fallback }) => (
            <button key={view} type="button" onClick={() => onNavigate?.(view)} className={navLinkClass(activeView === view)}>
              {t(key) === key ? fallback : t(key)}
            </button>
          ))}
        </div>
        <LanguageSwitcher />
        <Link
          to="/join"
          className="rounded-full px-5 py-2.5 font-body text-[11px] font-medium tracking-[0.12em] text-[var(--color-on-gold)] uppercase shadow-[0_0_30px_rgba(201,162,74,0.35)] transition-shadow hover:shadow-[0_0_40px_rgba(201,162,74,0.55)]"
          style={{ background: "linear-gradient(135deg, #E8CF83, #C9A24A)" }}
        >
          {t("nav.join_free")}
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-cream)] hover:bg-[rgba(201,162,74,0.15)] lg:hidden"
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
