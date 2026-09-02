import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./layout/Sidebar";
import { NAV } from "./layout/navConfig";
import { ActiveSitProvider } from "./ActiveSitContext";

export default function UserLayout() {
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const current = NAV.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));

  return (
    <ActiveSitProvider>
      {/* Plain white working surface — a dashboard is read and scanned, not set as atmosphere;
          the warm-ivory/textured canvas belongs to the marketing site, not here. */}
      <div className="relative flex h-dvh overflow-hidden bg-[var(--color-surface)]">
        <div className="relative z-10 hidden h-full lg:block">
          <Sidebar />
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
            <div className="relative h-full">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:px-7">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-full p-2 text-[var(--color-ink)] hover:bg-[var(--color-bg-soft)] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display text-[18px] text-[var(--color-ink)]">{current?.label ?? "Dashboard"}</h1>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
            <div key={pathname} className="mx-auto w-full max-w-5xl animate-[viewIn_0.4s_ease]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ActiveSitProvider>
  );
}
