import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import JoinPage from "./pages/JoinPage";
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
    <BrowserRouter>
      <LanguageProvider>
        <MemberAuthProvider>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/dashboard/*"
              element={
                <MemberGate>
                  <UserApp />
                </MemberGate>
              }
            />
            <Route
              path="*"
              element={
                <MaintenanceGate>
                  <HomePage />
                </MaintenanceGate>
              }
            />
          </Routes>
        </MemberAuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
