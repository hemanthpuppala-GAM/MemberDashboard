import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PractitionerSidebar from "./layout/PractitionerSidebar";
import Topbar from "./layout/Topbar";
import { getBreadcrumb } from "./layout/navConfig";
import ScaledShell from "./theme/ScaledShell";

export default function PractitionerLayout() {
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const crumbs = getBreadcrumb(pathname);

  return (
    <ScaledShell className="flex overflow-hidden">
      <div className="hidden h-full lg:block">
        <PractitionerSidebar />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="relative h-full">
            <PractitionerSidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar crumbs={crumbs} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--a-bg-base)] p-5 sm:p-7">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </ScaledShell>
  );
}
