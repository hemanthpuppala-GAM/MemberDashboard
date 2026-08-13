import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import logoMark from "../assets/logo-128.webp";

const CONTENT_LINKS = [
  { slug: "about", label: "About Me" },
  { slug: "meditate", label: "Meditation" },
  { slug: "wellness", label: "Wellness" },
  { slug: "events", label: "Events (intro)" },
  { slug: "mission", label: "Our Mission" },
];

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-full px-4 py-2 font-body text-[13.5px] transition-colors ${
          isActive
            ? "bg-[rgba(110,198,234,0.35)] text-[var(--color-ink)] shadow-[0_0_14px_rgba(110,198,234,0.25)]"
            : "text-[var(--color-muted)] hover:bg-[rgba(110,198,234,0.15)] hover:text-[var(--color-ink)]"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex h-dvh flex-col bg-[var(--color-bg)] font-body text-[var(--color-ink)] md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-[rgba(110,198,234,0.30)] bg-[var(--color-bg-soft)] p-5 md:h-dvh md:w-[240px] md:border-r md:border-b-0 md:overflow-y-auto">
        <div className="flex items-center gap-2.5">
          <img src={logoMark} alt="" width={32} height={32} className="h-8 w-8 rounded-full border border-[var(--color-gold)]/60 object-cover" />
          <div>
            <div className="font-display text-[14px] leading-tight text-[var(--color-ink)]">Golden Age</div>
            <div className="text-[10.5px] tracking-[0.15em] text-[var(--color-muted)] uppercase">Admin panel</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem to="/admin" end>Dashboard</NavItem>

          <div className="mt-3 mb-1 px-4 text-[10.5px] font-semibold tracking-[0.15em] text-[var(--color-muted-soft)] uppercase">
            Page content
          </div>
          {CONTENT_LINKS.map(({ slug, label }) => (
            <NavItem key={slug} to={`/admin/content/${slug}`}>{label}</NavItem>
          ))}

          <div className="mt-3 mb-1 px-4 text-[10.5px] font-semibold tracking-[0.15em] text-[var(--color-muted-soft)] uppercase">
            Manage
          </div>
          <NavItem to="/admin/events">Events</NavItem>
          <NavItem to="/admin/contact">Contact inbox</NavItem>
          <NavItem to="/admin/settings">Settings</NavItem>
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-[rgba(110,198,234,0.25)] pt-4">
          <div className="truncate text-[12px] text-[var(--color-muted)]">{user?.email}</div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-fit rounded-full border border-[rgba(110,198,234,0.50)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-gold)]/70 hover:bg-[rgba(110,198,234,0.15)]"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
        <div className="mx-auto w-full max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
