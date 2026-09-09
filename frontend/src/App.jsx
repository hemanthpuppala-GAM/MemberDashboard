import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import JoinPage from "./pages/JoinPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AdminApp from "./admin/AdminApp";
import UserApp from "./user/UserApp";
import MaintenanceGate from "./components/MaintenanceGate";
import { MemberAuthProvider, useMemberAuth } from "./auth/MemberAuthContext";
import { LanguageProvider } from "./lib/LanguageContext";

function MemberGate({ children }) {
  const { user, loading } = useMemberAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] text-[var(--color-muted)]">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/join" replace />;

  return children;
}

function App() {
  return (
    // basename follows vite.config's `base` — one setting drives assets and routing
    // ('/staging/goldenage/' on team staging, '/staging/preview/' on preview, '/' in production).
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LanguageProvider>
        <MemberAuthProvider>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />

            <Route path="/join" element={<JoinPage />} />
            <Route path="/register/:slug" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            <Route
              path="/dashboard/*"
              element={
                <MemberGate>
                  <UserApp />
                </MemberGate>
              }
            />

            {/* Public site: "/" is the hub, "/:slug" a section (/wisdom, /meditation, …) or a CMS page */}
            <Route
              path="/"
              element={
                <MaintenanceGate>
                  <HomePage />
                </MaintenanceGate>
              }
            />
            <Route
              path="/:slug"
              element={
                <MaintenanceGate>
                  <HomePage />
                </MaintenanceGate>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MemberAuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
