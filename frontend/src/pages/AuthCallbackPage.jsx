import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { memberAuthApi, setMemberToken } from "../lib/memberAuth";
import { useMemberAuth } from "../auth/MemberAuthContext";

/** Lands here after OAuth callback with ?token=… — stores session and opens the dashboard. */
export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const { applySession, user } = useMemberAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Missing sign-in token.");
      return;
    }

    setMemberToken(token);
    memberAuthApi
      .me()
      .then(({ user: u }) => {
        applySession(token, u);
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        setMemberToken(null);
        setError("Could not finish sign-in. Please try again.");
      });
  }, [params, applySession, navigate]);

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="max-w-sm text-center">
        {error ? (
          <>
            <p className="text-[15px] text-[var(--color-ink)]">{error}</p>
            <a href="/join" className="mt-4 inline-block text-[14px] text-[var(--color-blue-dark)] hover:underline">
              Back to sign-in
            </a>
          </>
        ) : (
          <p className="text-[15px] text-[var(--color-muted)]">Finishing sign-in…</p>
        )}
      </div>
    </div>
  );
}
