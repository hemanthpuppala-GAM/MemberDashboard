import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { AdminThemeProvider } from "./theme/AdminThemeProvider";
import { RolePreviewProvider } from "./roles/RolePreviewProvider";
import { AdminDataProvider } from "./store/AdminDataProvider";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "./AdminLayout";
import PractitionerLayout from "./PractitionerLayout";
import AdminToaster from "./ui/AdminToaster";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import LanguagesPage from "./pages/LanguagesPage";
import SettingsPage from "./pages/SettingsPage";

import PagesListPage from "./pages/cms/PagesListPage";
import NewPageWizard from "./pages/cms/NewPageWizard";
import PageDetailPage from "./pages/cms/PageDetailPage";
import SectionEditorPage from "./pages/cms/SectionEditorPage";
import MediaLibraryPage from "./pages/cms/MediaLibraryPage";
import ContactInfoPage from "./pages/cms/ContactInfoPage";
import DonationsPage from "./pages/cms/DonationsPage";
import MusicLibraryPage from "./pages/cms/MusicLibraryPage";
import TestimonialsPage from "./pages/cms/TestimonialsPage";

import QueryInboxPage from "./pages/people/QueryInboxPage";
import MembersListPage from "./pages/people/MembersListPage";
import MemberProfilePage from "./pages/people/MemberProfilePage";
import MemberJourneyPage from "./pages/people/MemberJourneyPage";
import UsersListPage from "./pages/people/UsersListPage";
import RolesPage from "./pages/people/RolesPage";

import AnnouncementsPage from "./pages/engage/AnnouncementsPage";
import BroadcastsPage from "./pages/engage/BroadcastsPage";
import QrCodesPage from "./pages/engage/QrCodesPage";

import PractitionerDashboardPage from "./pages/practitioner/PractitionerDashboardPage";
import MyMembersPage from "./pages/practitioner/MyMembersPage";
import MyAnnouncementsPage from "./pages/practitioner/MyAnnouncementsPage";

export default function AdminApp() {
  return (
    <AdminThemeProvider>
      <RolePreviewProvider>
        <AdminDataProvider>
          <AuthProvider>
            <AdminToaster />
            <Routes>
              <Route path="login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />

                  <Route path="cms/pages" element={<PagesListPage />} />
                  <Route path="cms/pages/new" element={<NewPageWizard />} />
                  <Route path="cms/pages/:slug" element={<PageDetailPage />} />
                  <Route path="cms/pages/:slug/sections/:id" element={<SectionEditorPage />} />
                  <Route path="cms/media" element={<MediaLibraryPage />} />
                  <Route path="cms/contact" element={<ContactInfoPage />} />
                  <Route path="cms/donations" element={<DonationsPage />} />
                  <Route path="cms/music" element={<MusicLibraryPage />} />
                  <Route path="cms/testimonials" element={<TestimonialsPage />} />

                  <Route path="queries" element={<QueryInboxPage />} />
                  <Route path="members" element={<MembersListPage />} />
                  <Route path="members/:id" element={<MemberProfilePage />} />
                  <Route path="members/:id/journey" element={<MemberJourneyPage />} />
                  <Route path="users" element={<UsersListPage />} />
                  <Route path="roles" element={<RolesPage />} />

                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="broadcasts" element={<BroadcastsPage />} />
                  <Route path="qr-codes" element={<QrCodesPage />} />

                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="languages" element={<LanguagesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route element={<PractitionerLayout />}>
                  <Route path="my-dashboard" element={<PractitionerDashboardPage />} />
                  <Route path="my-dashboard/members" element={<MyMembersPage />} />
                  <Route path="my-dashboard/members/:id" element={<MyMembersPage />} />
                  <Route path="my-dashboard/announcements" element={<MyAnnouncementsPage />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </AdminDataProvider>
      </RolePreviewProvider>
    </AdminThemeProvider>
  );
}
