import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./layout/Sidebar";
import { NAV } from "./layout/navConfig";
import Starfield from "../components/layout/Starfield";

export default function UserLayout() {
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const current = NAV.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));

  return (
    <div className="relative flex h-dvh overflow-hidden bg-[var(--color-bg)]">
      {/* Ambient glow + stars — same cosmic backdrop as the public site */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 15% 0%, rgba(110,198,234,0.16) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(243,216,154,0.16) 0%, transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60">
        <Starfield />
      </div>

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
        <header className="flex shrink-0 items-center gap-3 border-b border-[rgba(110,198,234,0.25)] bg-[rgba(255,255,255,0.78)] px-4 py-3 backdrop-blur-[14px] lg:px-7">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-full p-2 text-[var(--color-ink)] hover:bg-[rgba(110,198,234,0.18)] lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-display text-[17px] text-[var(--color-ink)]">{current?.label ?? "Dashboard"}</h1>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
          <div key={pathname} className="mx-auto w-full max-w-5xl animate-[viewIn_0.4s_ease]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
