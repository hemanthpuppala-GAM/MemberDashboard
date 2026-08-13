import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "./AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ContentEditPage from "./pages/ContentEditPage";
import EventsPage from "./pages/EventsPage";
import SettingsPage from "./pages/SettingsPage";
import ContactInboxPage from "./pages/ContactInboxPage";

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="content/:slug" element={<ContentEditPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="contact" element={<ContactInboxPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
