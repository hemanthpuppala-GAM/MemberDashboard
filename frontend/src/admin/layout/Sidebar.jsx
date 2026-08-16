import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NAV } from "./navConfig";
import logoMark from "../../assets/logo-128.webp";

function isGroupActive(group, pathname) {
  return group.items.some((item) => pathname.startsWith(item.to));
}

function NavItem({ to, end, icon: Icon, label, nested }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
          nested ? "ml-4" : ""
        } ${
          isActive
            ? "bg-[var(--a-accent-muted)] text-[var(--a-accent)]"
            : "text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] hover:text-[var(--a-text-primary)]"
        }`
      }
    >
      {Icon && <Icon size={16} strokeWidth={2} />}
      {label}
    </NavLink>
  );
}

export default function Sidebar({ onNavigate }) {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState(() => new Set(["cms", "people", "engage"]));

  const toggleGroup = (key) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col gap-1 border-r border-[var(--a-border)] bg-[var(--a-bg-surface)] p-4">
      <div className="mb-3 flex items-center gap-2.5 px-1.5">
        <img src={logoMark} alt="" width={30} height={30} className="h-[30px] w-[30px] rounded-full border border-[var(--a-accent)]/50 object-cover" />
        <div>
          <div className="text-[13.5px] font-bold text-[var(--a-text-primary)]">Golden Age</div>
          <div className="text-[10.5px] font-medium tracking-wide text-[var(--a-text-muted)] uppercase">Admin panel</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" onClick={onNavigate}>
        {NAV.map((entry) => {
          if (entry.type === "link") {
            return <NavItem key={entry.to} to={entry.to} end={entry.end} icon={entry.icon} label={entry.label} />;
          }

          const open = openGroups.has(entry.key);
          const active = isGroupActive(entry, pathname);
          return (
            <div key={entry.key}>
              <button
                type="button"
                onClick={() => toggleGroup(entry.key)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
                  active ? "text-[var(--a-text-primary)]" : "text-[var(--a-text-muted)] hover:text-[var(--a-text-primary)]"
                }`}
              >
                <entry.icon size={16} strokeWidth={2} />
                <span className="flex-1 text-left">{entry.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {entry.items.map((item) => (
                    <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} nested />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
