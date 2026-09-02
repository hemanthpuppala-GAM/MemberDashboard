import { useEffect, useState } from "react";
import { publicApi } from "../lib/api";
import logoMark from "../assets/logo-golden-age.jpg";

/**
 * Gates the public site behind the admin-configured maintenance toggle
 * (Settings > Maintenance). Fails open on error/timeout — a broken settings
 * fetch should never lock visitors out of an otherwise-working site.
 */
export default function MaintenanceGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | open | maintenance
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    publicApi
      .settings()
      .then((s) => {
        if (cancelled) return;
        const enabled = s?.["maintenance.enabled"] === "true" || s?.["maintenance.enabled"] === true;
        const bypass = s?.["maintenance.bypass"] === true;
        if (enabled && !bypass) {
          setMessage(s?.["maintenance.message"] || "We'll be back shortly — thank you for your patience.");
          setStatus("maintenance");
        } else {
          setStatus("open");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("open");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") return null;
  if (status === "maintenance") return <MaintenanceScreen message={message} />;
  return children;
}

function MaintenanceScreen({ message }) {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-5 bg-[var(--color-bg)] px-6 text-center">
      <img
        src={logoMark}
        alt="Golden Age Wisdom"
        width={64}
        height={64}
        className="h-16 w-16 rounded-full border border-[var(--color-gold)]/60 object-cover shadow-[0_0_24px_rgba(198,161,91,0.35)]"
      />
      <h1 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">We'll be right back</h1>
      <p className="max-w-md text-base leading-relaxed text-[var(--color-muted)]">{message}</p>
    </div>
  );
}
