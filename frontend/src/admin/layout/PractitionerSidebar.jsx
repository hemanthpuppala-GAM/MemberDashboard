import { NavLink } from "react-router-dom";
import { LayoutDashboard, UsersRound, Megaphone } from "lucide-react";
import logoMark from "../../assets/logo-golden-age.jpg";

const LINKS = [
  { to: "/admin/my-dashboard", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/my-dashboard/members", icon: UsersRound, label: "My Members" },
  { to: "/admin/my-dashboard/announcements", icon: Megaphone, label: "Announcements" },
];

export default function PractitionerSidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col gap-1 border-r border-[var(--a-border)] bg-[var(--a-bg-surface)] p-4">
      <div className="mb-3 flex items-center gap-2.5 px-1.5">
        <img src={logoMark} alt="" width={30} height={30} className="h-[30px] w-[30px] rounded-full border border-[var(--a-accent)]/50 object-cover" />
        <div>
          <div className="text-[13.5px] font-bold text-[var(--a-text-primary)]">Golden Age</div>
          <div className="text-[10.5px] font-medium tracking-wide text-[var(--a-text-muted)] uppercase">Practitioner</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1" onClick={onNavigate}>
        {LINKS.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
                isActive ? "bg-[var(--a-accent-muted)] text-[var(--a-accent)]" : "text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] hover:text-[var(--a-text-primary)]"
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
