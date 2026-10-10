import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SiteHomePage from "./site/pages/HomePage";
import AboutPage from "./site/pages/AboutPage";
import MissionPage from "./site/pages/MissionPage";
import MeditationPage from "./site/pages/MeditationPage";
import WisdomPage from "./site/pages/WisdomPage";
import WellnessPage from "./site/pages/WellnessPage";
import EventsPage from "./site/pages/EventsPage";
import VolunteerPage from "./site/pages/VolunteerPage";
import PrivacyPage from "./site/pages/PrivacyPage";
import DonatePage from "./site/pages/DonatePage";
import JoinPage from "./pages/JoinPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AdminApp from "./admin/AdminApp";
import UserApp from "./user/UserApp";
import AskPage from "./pages/AskPage";
import AskPosterPage from "./pages/AskPosterPage";
import AskZoomPage from "./pages/AskZoomPage";
import SupportDeskPage from "./support/SupportDeskPage";
import MyQuestionsPage from "./support-member/MyQuestionsPage";
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

            {/* Ask a question — QR target, no login. Poster / Zoom slide carry the QR. */}
            <Route path="/ask" element={<AskPage />} />
            <Route path="/ask/poster" element={<AskPosterPage />} />
            <Route path="/ask/zoom" element={<AskZoomPage />} />

            {/* Member follows their support questions (ticket emails link to /support/my?ticket=ID). */}
            <Route path="/support/my" element={<MyQuestionsPage />} />

            {/* Staff support desk (core: phone + PIN; volunteers: Google). Exact paths so /support/my stays separate. */}
            <Route path="/support" element={<SupportDeskPage />} />
            <Route path="/support/ticket/:id" element={<SupportDeskPage />} />

            <Route
              path="/dashboard/*"
              element={
                <MemberGate>
                  <UserApp />
                </MemberGate>
              }
            />

            {/* Public site (design_handoff_home_bodhi_tree): Bodhi Tree home + sub-pages. */}
            {[
              ["/", SiteHomePage],
              ["/about", AboutPage],
              ["/mission", MissionPage],
              ["/meditation", MeditationPage],
              ["/wisdom", WisdomPage],
              ["/wellness", WellnessPage],
              ["/events", EventsPage],
              ["/volunteer", VolunteerPage],
              ["/privacy", PrivacyPage],
              ["/donate", DonatePage],
            ].map(([path, Page]) => (
              <Route
                key={path}
                path={path}
                element={
                  <MaintenanceGate>
                    <Page />
                  </MaintenanceGate>
                }
              />
            ))}
            {/* Older sections (/contact) and CMS pages keep the previous public layout. */}
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
