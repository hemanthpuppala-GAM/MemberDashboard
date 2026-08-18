import { NavLink, Link } from "react-router-dom";
import logoMark from "../../assets/logo-128.webp";
import { NAV, ADMIN_LINK } from "./navConfig";

// No member auth wired up yet — set to "admin" or "super_admin" once login exists to reveal Admin panel.
const CURRENT_ROLE = null;

export default function Sidebar({ onNavigate }) {
  const showAdmin = CURRENT_ROLE === "admin" || CURRENT_ROLE === "super_admin";

  return (
    <aside className="relative flex h-full w-[260px] shrink-0 flex-col gap-1 border-r border-[rgba(110,198,234,0.25)] bg-[rgba(255,255,255,0.90)] p-4 backdrop-blur-[16px]">
      <Link to="/" className="mb-4 flex items-center gap-2.5 px-1.5">
        <img
          src={logoMark}
          alt="Golden Age Wisdom"
          width={34}
          height={34}
          className="h-[34px] w-[34px] rounded-full border border-[var(--color-gold)]/60 object-cover shadow-[0_0_14px_rgba(110,198,234,0.35)]"
        />
        <div>
          <div
            className="font-display text-[14.5px] leading-tight tracking-[0.02em]"
            style={{
              background: "linear-gradient(115deg, #f6e7c1 10%, #d5b77c 48%, #b89758 90%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            GOLDEN AGE
          </div>
          <div className="text-[10px] font-medium tracking-[0.18em] text-[var(--color-muted)] uppercase">
            My practice
          </div>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1" onClick={onNavigate}>
        {NAV.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[rgba(110,198,234,0.30)] to-[rgba(243,216,154,0.28)] text-[var(--color-ink)] shadow-[0_2px_14px_rgba(110,198,234,0.30)]"
                  : "text-[var(--color-muted)] hover:translate-x-0.5 hover:bg-[rgba(110,198,234,0.14)] hover:text-[var(--color-ink)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isActive
                      ? "bg-white/70 text-[var(--color-blue-dark)] shadow-[0_0_10px_rgba(110,198,234,0.35)]"
                      : "bg-[rgba(110,198,234,0.12)] text-[var(--color-muted)] group-hover:text-[var(--color-blue-dark)]"
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {showAdmin && (
        <NavLink
          to={ADMIN_LINK.to}
          className="flex items-center gap-2.5 rounded-full border border-[var(--color-gold)]/50 bg-[rgba(243,216,154,0.12)] px-3.5 py-2.5 text-[13.5px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[rgba(243,216,154,0.28)]"
        >
          <ADMIN_LINK.icon size={17} strokeWidth={2} />
          {ADMIN_LINK.label}
        </NavLink>
      )}
    </aside>
  );
}
