import { NavLink, useNavigate } from "react-router-dom";
import logoMark from "../../assets/logo-golden-age.jpg";
import { NAV } from "./navConfig";
import { useMemberAuth } from "../../auth/MemberAuthContext";
import { useActiveSit } from "../ActiveSitContext";

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useMemberAuth();
  const { hasActiveSit, requestNavigation } = useActiveSit();
  const navigate = useNavigate();

  const goTo = (to) => {
    requestNavigation(() => {
      navigate(to);
      onNavigate?.();
    });
  };

  const handleLogout = () => {
    requestNavigation(async () => {
      await logout();
      navigate("/join", { replace: true });
      onNavigate?.();
    });
  };

  return (
    <aside className="relative flex h-full w-[260px] shrink-0 flex-col gap-1 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <button
        type="button"
        onClick={() => goTo("/")}
        className="mb-4 flex items-center gap-2.5 px-1.5 text-left"
      >
        <img
          src={logoMark}
          alt="Golden Age Wisdom"
          width={34}
          height={34}
          className="h-[34px] w-[34px] rounded-full border border-[var(--color-gold)]/60 object-cover shadow-[0_0_14px_rgba(168,185,160,0.35)]"
        />
        <div>
          <div
            className="font-display text-[14.5px] leading-tight tracking-[0.02em]"
            style={{
              background: "linear-gradient(115deg, #DCC58A 10%, #C6A15B 48%, #8A6A32 90%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            GOLDEN AGE
          </div>
          <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--color-ink-soft)] uppercase">
            My practice
          </div>
        </div>
      </button>

      {user && (
        <div className="mb-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5">
          <div className="truncate text-[13.5px] font-semibold text-[var(--color-ink)]">{user.name}</div>
          <div className="truncate text-[12px] text-[var(--color-ink-soft)]">{user.email}</div>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1" onClick={() => !hasActiveSit && onNavigate?.()}>
        {NAV.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={(e) => {
              if (!hasActiveSit) return;
              e.preventDefault();
              goTo(to);
            }}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 overflow-hidden rounded-full px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[rgba(198,161,91,0.14)] text-[var(--color-ink)]"
                  : "text-[var(--color-ink-soft)] hover:translate-x-0.5 hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-full bg-[var(--color-gold)]"
                  />
                )}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isActive
                      ? "bg-[var(--color-gold)]/22 text-[var(--color-gold-deep)]"
                      : "bg-[var(--color-bg-soft)] text-[var(--color-ink-soft)] group-hover:text-[var(--color-gold-deep)]"
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

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full px-3.5 py-2 text-left text-[12.5px] font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]"
      >
        Sign out
      </button>
    </aside>
  );
}
