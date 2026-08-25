import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import Field, { TextInput } from "../ui/Field";
import Button from "../ui/Button";
import ScaledShell from "../theme/ScaledShell";
import logoMark from "../../assets/logo-golden-age.jpg";
import logoFull from "../../assets/goldenage_logo_optimized.jpg";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScaledShell className="relative flex items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(48% 40% at 22% 20%, var(--a-accent-muted) 0%, transparent 70%), radial-gradient(42% 36% at 82% 78%, var(--a-focus-muted) 0%, transparent 70%)",
        }}
      />
      <img
        src={logoFull}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 w-[min(1100px,140vw)] -translate-x-1/2 -translate-y-1/2 opacity-[0.07] mix-blend-luminosity select-none"
      />
      <form onSubmit={handleSubmit} className="relative flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-8 shadow-[var(--a-shadow)]">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <img src={logoMark} alt="" width={44} height={44} className="h-11 w-11 rounded-full border border-[var(--a-accent)]/60 object-cover" />
          <h1 className="text-[19px] font-bold text-[var(--a-text-primary)]">Admin sign in</h1>
          <p className="text-[13px] text-[var(--a-text-muted)]">Golden Age Wisdom control panel</p>
        </div>

        <Field label="Email" htmlFor="email">
          <TextInput id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Field label="Password" htmlFor="password">
          <TextInput id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>

        {error && <p className="text-[13px] font-medium text-[var(--a-danger)]">{error}</p>}

        <Button as="button" type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </ScaledShell>
  );
}
