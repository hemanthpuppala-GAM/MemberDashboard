import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Shield } from "lucide-react";
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
  {
    id: "microsoft",
    label: "Continue with Microsoft",
    variant: "glass",
    icon: MicrosoftIcon,
  },
  {
    id: "facebook",
    label: "Continue with Facebook",
    variant: "glass",
    icon: FacebookIcon,
  },
  {
    id: "apple",
    label: "Continue with Apple",
    variant: "glass",
    icon: AppleIcon,
  },
];

/** Passwordless join screen — OAuth providers matching goldenagewisdom.org / Design.md §8. */
export default function JoinPage() {
  const { user, loading, loginDemo } = useMemberAuth();
  const navigate = useNavigate();
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

  const startDemo = async () => {
    setBusy("demo");
    setError("");
    try {
      await loginDemo();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.message || "Could not start demo session.");
      setBusy(null);
    }
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
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(20,12,36,0.45) 0%, rgba(10,8,24,0.82) 70%, rgba(6,4,16,0.94) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <Starfield />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logoMark} alt="" className="mb-4 h-16 w-16 rounded-full object-cover shadow-[0_8px_32px_rgba(0,0,0,0.45)]" />
          <p className="text-[12px] tracking-[0.18em] text-[var(--color-gold-light)] uppercase">41 days</p>
          <h1 className="mt-2 font-display text-[clamp(26px,5vw,34px)] leading-tight text-white">
            Give us 41 days — a 30-minute sit in silence.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-white/75">
            No kriyas, no breath techniques. Close your eyes and watch the breath — that&apos;s all.
          </p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-[rgba(12,10,28,0.55)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-[18px] sm:p-6">
          {lastMember ? (
            <>
              <h2 className="text-center font-display text-[22px] text-white">
                Welcome back, {lastMember.name?.split(" ")[0] || "friend"}
              </h2>
              <p className="mt-1 text-center text-[13px] text-white/65">
                Continue your journey with one tap. No passwords to remember.
              </p>
              <button
                type="button"
                onClick={continueAsLast}
                disabled={!!busy}
                className="mt-5 flex w-full items-center gap-3 rounded-full border border-[rgba(243,216,154,0.45)] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] px-4 py-3 text-left transition-opacity hover:opacity-95 disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(60,43,16,0.35)] font-display text-[18px] text-[var(--color-on-gold)]">
                  {initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-[var(--color-on-gold)]">
                    Continue as {lastMember.name}
                  </span>
                  <span className="block truncate text-[12px] text-[rgba(60,43,16,0.75)]">{lastMember.email}</span>
                </span>
              </button>
              <p className="my-4 text-center text-[12px] tracking-wide text-white/45 uppercase">or use another account</p>
            </>
          ) : (
            <h2 className="mb-4 text-center font-display text-[22px] text-white">Begin your journey — free</h2>
          )}

          <div className="flex flex-col gap-2.5">
            {PROVIDERS.map(({ id, label, variant, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => startOAuth(id)}
                disabled={!!busy}
                className={`flex w-full items-center justify-center gap-3 rounded-full px-4 py-3 text-[14.5px] font-medium transition-all disabled:opacity-60 ${
                  variant === "google"
                    ? "bg-white text-[#1f1f1f] shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-white/95"
                    : "border border-white/20 bg-white/8 text-[#f2e3bb] hover:bg-white/12"
                }`}
              >
                <Icon />
                <span>{busy === id ? "Connecting…" : label}</span>
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-[13px] text-red-200">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={startDemo}
            disabled={!!busy}
            className="mt-4 w-full rounded-full border border-dashed border-white/30 px-4 py-3 text-[13.5px] text-white/80 transition-colors hover:border-[var(--color-gold)]/50 hover:text-white disabled:opacity-60"
          >
            <span className="font-medium">{busy === "demo" ? "Opening demo…" : "Look around a demo account"}</span>
            <span className="mt-0.5 block text-[11.5px] text-white/45">demo@goldenagewisdom.org · nothing is saved</span>
          </button>

          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3">
            <Shield size={16} className="mt-0.5 shrink-0 text-[var(--color-gold-light)]" />
            <p className="text-[12px] leading-relaxed text-white/65">
              We never see, store or handle passwords. Sign-in happens entirely with Google, Microsoft,
              Facebook or Apple — we only receive your name and email.
            </p>
          </div>
        </div>

        <Link to="/" className="mt-6 text-center text-[13px] text-white/55 transition-colors hover:text-[var(--color-gold-light)]">
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

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M12 1h10v10H12z" />
      <path fill="#7fba00" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1877F2] text-[12px] font-bold text-white">
      f
    </span>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true">
      <path d="M13.3 9.4c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.3 2C1.7 9 2.5 12.4 3.8 14.2c.6.9 1.4 1.9 2.4 1.8 1-.04 1.3-.6 2.5-.6s1.5.6 2.5.6c1 0 1.7-.9 2.4-1.8.7-1.1 1-2.1 1-2.2-.02-.01-2-.8-2.3-3.6zM10.7 2.8c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.3-1.1z" />
    </svg>
  );
}
