import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[var(--color-bg)] font-body text-[var(--color-muted)]">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
