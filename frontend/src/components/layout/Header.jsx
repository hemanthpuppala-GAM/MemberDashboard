import { Link } from "react-router-dom";
import logoMark from "../../assets/logo-128.webp";
import Button from "../ui/Button";

const NAV_LINKS = [
  { label: "About", view: "about" },
  { label: "Wisdom", view: "wisdom" },
  { label: "Meditation", view: "practice" },
  { label: "Events", view: "events" },
  { label: "Mission", view: "mission" },
  { label: "Volunteer", view: "volunteer" },
  { label: "Contact", view: "contact" },
];

/** Pill top-bar — logo · inline chakra nav · Join free */
export default function Header({ onLogoClick, onNavigate, activeView = "hub" }) {
  return (
    <nav
      className="relative z-50 mx-auto mt-3 flex w-[min(1180px,calc(100%-32px))] shrink-0 items-center justify-between gap-4 rounded-full border border-[rgba(110,198,234,0.50)] bg-[rgba(255,255,255,0.88)] px-4 py-2 backdrop-blur-[20px] sm:gap-5"
      aria-label="Primary"
      style={{ boxShadow: "0 4px 24px rgba(140,138,192,0.14), 0 0 0 1px rgba(110,198,234,0.20) inset" }}
    >
      <button
        type="button"
        onClick={onLogoClick}
        className="flex min-w-0 shrink-0 cursor-pointer items-center justify-start gap-2.5 border-0 bg-transparent p-0 text-left"
      >
        <img
          src={logoMark}
          alt="Golden Age Wisdom"
          width={44}
          height={44}
          className="h-8 w-8 shrink-0 rounded-full border border-[var(--color-gold)]/60 object-cover shadow-[0_0_18px_rgba(110,198,234,0.35)] sm:h-11 sm:w-11"
        />
        <span
          className="font-display hidden whitespace-nowrap text-[15px] leading-none tracking-[0.09em] sm:inline sm:text-[18px] lg:text-[21px]"
          style={{
            background:
              "linear-gradient(115deg, #f6e7c1 10%, #d5b77c 48%, #b89758 90%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 14px rgba(213,183,124,0.35))",
          }}
        >
          GOLDEN AGE WISDOM
        </span>
      </button>

      {/* Chakra section nav — desktop only */}
      <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
        {NAV_LINKS.map(({ label, view }) => (
          <button
            key={view}
            type="button"
            onClick={() => onNavigate?.(view)}
            className={`rounded-full px-3.5 py-1.5 font-body text-[13px] tracking-wide transition-all duration-200 ${
              activeView === view
                ? "bg-[rgba(110,198,234,0.35)] text-[var(--color-ink)] shadow-[0_0_14px_rgba(110,198,234,0.30)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[rgba(110,198,234,0.18)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 shrink-0 items-center justify-end">
        <Button
          as={Link}
          to="/dashboard"
          className="px-4 py-1.5 text-[13.5px] shadow-[0_0_20px_rgba(213,183,124,0.25)]"
        >
          Join free
        </Button>
      </div>
    </nav>
  );
}
