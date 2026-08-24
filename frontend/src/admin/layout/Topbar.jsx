import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Sun, Moon, Monitor, LogOut, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../useAuth";
import { MOCK_AUTH } from "../authFlags";
import { useAdminTheme } from "../theme/useAdminTheme";
import { usePermissions } from "../usePermissions";
import Avatar from "../ui/Avatar";
import Drawer from "../ui/Drawer";
import { StatusBadge } from "../ui/Badge";
import { api, practitionerApi } from "../../lib/api";

const THEME_OPTIONS = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
];

function useOutsideClose(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setOpen]);
  return ref;
}

export default function Topbar({ crumbs, onMenuClick }) {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const { theme, setTheme } = useAdminTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [activity, setActivity] = useState([]);
  const menuRef = useOutsideClose(menuOpen, setMenuOpen);

  const canViewActivity = can("reports.view");

  // Announcements targeted at the current user — same endpoint the practitioner
  // "My Announcements" page uses; ownership is checked per-row on the backend,
  // so it works for any logged-in panel user, not just practitioners.
  useEffect(() => {
    practitionerApi.announcements().then(setAnnouncements).catch(() => {});
  }, []);

  useEffect(() => {
    if (!canViewActivity) return;
    api.reportsActivityLog({ per_page: 5 }).then((res) => setActivity(res.data ?? [])).catch(() => {});
  }, [canViewActivity]);

  const unread = announcements.filter((a) => !a.read).length;
  const roleLabel = user?.roles?.[0]?.replace(/_/g, " ");

  const openNotifications = () => {
    setNotifOpen(true);
    const unreadOnes = announcements.filter((a) => !a.read);
    if (unreadOnes.length === 0) return;
    unreadOnes.forEach((a) => practitionerApi.markAnnouncementRead(a.id).catch(() => {}));
    setAnnouncements((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[var(--a-border)] bg-[var(--a-bg-surface)] px-4 sm:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-1.5 text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] lg:hidden">
        <Menu size={20} />
      </button>

      <div className="hidden min-w-0 flex-1 items-center gap-2.5 text-[12.5px] font-medium text-[var(--a-text-muted)] sm:flex">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[var(--a-text-faint)]">/</span>}
            <span className={i === crumbs.length - 1 ? "text-[var(--a-text-primary)]" : ""}>{c}</span>
          </span>
        ))}
        {MOCK_AUTH && (
          <span className="rounded-full bg-[var(--a-warning-muted)] px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-[var(--a-warning)] uppercase">
            Dev preview — no backend
          </span>
        )}
      </div>

      <div className="relative ml-auto hidden max-w-xs flex-1 sm:block">
        <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--a-text-faint)]" />
        <input
          placeholder="Search…"
          className="w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-base)] py-2 pr-3 pl-9 text-[13px] text-[var(--a-text-primary)] placeholder:text-[var(--a-text-faint)] outline-none focus:border-[var(--a-focus)] focus:ring-2 focus:ring-[var(--a-focus-muted)]"
        />
      </div>

      <button
        type="button"
        onClick={openNotifications}
        className="relative ml-auto shrink-0 rounded-lg p-2 text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)] hover:text-[var(--a-text-primary)] sm:ml-0"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--a-danger)] px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      <div ref={menuRef} className="relative shrink-0">
        <button type="button" onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-lg py-1 pr-1 pl-1 hover:bg-[var(--a-bg-surface-2)]">
          <Avatar name={user?.name || user?.email || "Admin"} size={30} />
          <ChevronDown size={14} className="hidden text-[var(--a-text-muted)] sm:block" />
        </button>

        {menuOpen && (
          <div className="absolute top-full right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] shadow-[var(--a-shadow)]">
            <div className="border-b border-[var(--a-border)] px-4 py-3">
              <div className="truncate text-[13.5px] font-semibold text-[var(--a-text-primary)]">{user?.name || "Admin"}</div>
              <div className="truncate text-[12px] text-[var(--a-text-muted)]">{user?.email}</div>
              {roleLabel && (
                <span className="mt-1.5 inline-block rounded-full bg-[var(--a-accent-muted)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-[var(--a-accent)] capitalize">
                  {roleLabel}
                </span>
              )}
            </div>

            <div className="border-b border-[var(--a-border)] p-2">
              <div className="px-2 py-1 text-[10.5px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Appearance</div>
              <div className="flex gap-1 px-1">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setTheme(opt.key)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors ${
                      theme === opt.key ? "bg-[var(--a-accent-muted)] text-[var(--a-accent)]" : "text-[var(--a-text-muted)] hover:bg-[var(--a-bg-surface-2)]"
                    }`}
                  >
                    <opt.icon size={15} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-[13.5px] font-medium text-[var(--a-danger)] hover:bg-[var(--a-danger-muted)]">
              <LogOut size={15} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>

      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications">
        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-2 text-[11px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Announcements</div>
            {announcements.length === 0 ? (
              <p className="text-[12.5px] text-[var(--a-text-muted)]">No announcements — you're all caught up.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {announcements.map((a) => (
                  <div key={a.id} className="rounded-lg border border-[var(--a-border)] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[var(--a-text-primary)]">{a.title}</span>
                      <StatusBadge status={a.type} />
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--a-text-muted)]" dangerouslySetInnerHTML={{ __html: a.body }} />
                    {a.sent_at && <p className="mt-1.5 text-[11px] text-[var(--a-text-faint)]">{new Date(a.sent_at).toLocaleString()}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {canViewActivity && (
            <div>
              <div className="mb-2 text-[11px] font-semibold tracking-wide text-[var(--a-text-faint)] uppercase">Recent activity</div>
              {activity.length === 0 ? (
                <p className="text-[12.5px] text-[var(--a-text-muted)]">No recent activity.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {activity.map((entry) => (
                    <div key={entry.id} className="text-[12.5px] text-[var(--a-text-muted)]">
                      <span className="font-medium text-[var(--a-text-primary)]">{entry.user?.name ?? "System"}</span> {entry.action}
                      {entry.meta?.label && <> <span className="text-[var(--a-text-primary)]">{entry.meta.label}</span></>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
