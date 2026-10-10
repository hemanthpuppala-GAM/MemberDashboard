import { useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import logoMark from "../assets/logo-golden-age.jpg";
import hariPic from "../assets/hari_sir_stream.png";
import Starfield from "../components/layout/Starfield";
import { getLastMember, oauthRedirectUrl } from "../lib/memberAuth";
import { useMemberAuth } from "../auth/MemberAuthContext";

const PROVIDERS = [
  {
    id: "google",
    label: "Continue with Google",
    variant: "google",
    icon: GoogleIcon,
  },
];

/**
 * Join screen — Google (Gmail) sign-in only, matching goldenagewisdom.org / Design.md §8.
 * Returning members get a one-tap "Continue as …" first. No email/password form and no demo
 * account on the public page (owner decision, Oct 2026).
 */
export default function JoinPage() {
  const { user, loading } = useMemberAuth();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(params.get("error") || "");
  const lastMember = useMemo(() => getLastMember(), []);


  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const startOAuth = (provider) => {
    setBusy(provider);
    setError("");
    window.location.href = oauthRedirectUrl(provider);
  };

  const continueAsLast = () => {
    // Re-auth via the remembered provider when possible; otherwise send to Google.
    startOAuth(lastMember?.oauth_provider && lastMember.oauth_provider !== "demo" ? lastMember.oauth_provider : "google");
  };

  const initial = (lastMember?.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <img
        src={hariPic}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[72%_28%]"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(36,24,14,0.45) 0%, rgba(22,16,10,0.82) 70%, rgba(16,11,7,0.94) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <Starfield />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center overflow-y-auto px-5 py-5">
        {lastMember ? (
          <div className="mb-4 flex flex-col items-center text-center">
            <img src={logoMark} alt="" className="h-11 w-11 rounded-full object-cover shadow-[0_8px_32px_rgba(30,20,10,0.35)]" />
          </div>
        ) : (
          <div className="mb-4 flex flex-col items-center text-center">
            <img src={logoMark} alt="" className="mb-2.5 h-12 w-12 rounded-full object-cover shadow-[0_8px_32px_rgba(30,20,10,0.35)]" />
            <p className="text-[11px] tracking-[0.18em] text-[var(--color-gold-light)] uppercase">41 days</p>
            <h1 className="mt-1.5 font-display text-[clamp(20px,4vw,26px)] leading-[1.22] text-white">
              Give us 41 days — a 30-minute sit in silence.
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-white/75">
              No kriyas, no breath techniques. Close your eyes and watch the breath — that&apos;s all.
            </p>
          </div>
        )}

        <div className="rounded-3xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.96)] p-4 shadow-[0_20px_60px_rgba(80,65,40,0.18)] backdrop-blur-[18px] sm:p-5">
          {lastMember ? (
            <>
              <h2 className="text-center font-display text-[19px] text-[var(--color-ink)]">
                Welcome back, {lastMember.name?.split(" ")[0] || "friend"}
              </h2>
              <p className="mt-1 text-center text-[12.5px] text-[var(--color-muted)]">
                Continue your journey with one tap.
              </p>
              <button
                type="button"
                onClick={continueAsLast}
                disabled={!!busy}
                className="mt-3.5 flex w-full items-center gap-3 rounded-full border border-[rgba(198,161,91,0.45)] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] px-4 py-2.5 text-left transition-opacity hover:opacity-95 disabled:opacity-60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(58,42,18,0.35)] font-display text-[16px] text-[var(--color-on-gold)]">
                  {initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-[var(--color-on-gold)]">
                    Continue as {lastMember.name}
                  </span>
                  <span className="block truncate text-[12px] text-[rgba(58,42,18,0.75)]">{lastMember.email}</span>
                </span>
              </button>
              <p className="my-3 text-center text-[11px] tracking-wide text-[var(--color-muted)] uppercase">or use another account</p>
            </>
          ) : (
            <h2 className="mb-3 text-center font-display text-[19px] text-[var(--color-ink)]">Begin your journey — free</h2>
          )}

          <div className="flex flex-col gap-2.5">
            {PROVIDERS.map(({ id, label, variant, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => startOAuth(id)}
                disabled={!!busy}
                className={`flex w-full items-center justify-center gap-3 rounded-full px-4 py-2.5 text-[14.5px] font-medium transition-all disabled:opacity-60 ${
                  variant === "google"
                    ? "bg-white text-[#1f1f1f] shadow-[0_4px_20px_rgba(80,65,40,0.15)] hover:bg-white/95 border border-[var(--color-border)]"
                    : "border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-ink)] hover:bg-white"
                }`}
              >
                <Icon />
                <span>{busy === id ? "Connecting…" : label}</span>
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-[13px] text-red-700">
              {error}
            </p>
          )}

          <p className="mt-3 text-center text-[11.5px] leading-relaxed text-[var(--color-muted)]">
            Sign in with your Google (Gmail) account — no new password to remember.
          </p>
        </div>

        <Link to="/" className="mt-3.5 text-center text-[13px] text-white/55 transition-colors hover:text-[var(--color-gold-light)]">
          ← Back to Golden Age Wisdom
        </Link>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21 21-9.3 21-21c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.6 7.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.3 26.7 37.2 24 37.2c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 40.9 16.2 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.8 41.4 45 35.5 45 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  );
}
