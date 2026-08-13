import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { TextInput } from "../components/ui/Field";
import Button from "../../components/ui/Button";
import logoMark from "../../assets/logo-128.webp";

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
    <div className="flex h-dvh items-center justify-center bg-[var(--color-bg)] px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-[rgba(110,198,234,0.35)] bg-white/75 p-8 shadow-[0_20px_60px_-20px_rgba(88,84,160,0.45)] backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={logoMark} alt="" width={44} height={44} className="h-11 w-11 rounded-full border border-[var(--color-gold)]/60 object-cover" />
          <h1 className="font-display text-[22px] text-[var(--color-ink)]">Admin sign in</h1>
          <p className="text-[13px] text-[var(--color-muted)]">Golden Age Wisdom control panel</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-body text-[13px] font-semibold text-[var(--color-ink)]">
            Email
          </label>
          <TextInput
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-body text-[13px] font-semibold text-[var(--color-ink)]">
            Password
          </label>
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-[13px] font-medium text-[#c0554a]">{error}</p>}

        <Button as="button" type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
