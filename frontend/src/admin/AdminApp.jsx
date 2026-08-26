import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { AdminThemeProvider } from "./theme/AdminThemeProvider";
import { AdminDataProvider } from "./store/AdminDataProvider";
import ProtectedRoute from "./ProtectedRoute";
import PermissionRoute from "./PermissionRoute";
import AdminLayout from "./AdminLayout";
import PractitionerLayout from "./PractitionerLayout";
import AdminToaster from "./ui/AdminToaster";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import LanguagesPage from "./pages/LanguagesPage";
import TranslationsPage from "./pages/TranslationsPage";
import SettingsPage from "./pages/SettingsPage";

import PagesListPage from "./pages/cms/PagesListPage";
import NewPageWizard from "./pages/cms/NewPageWizard";
import PageDetailPage from "./pages/cms/PageDetailPage";
import SectionEditorPage from "./pages/cms/SectionEditorPage";
import MediaLibraryPage from "./pages/cms/MediaLibraryPage";
import ContactInfoPage from "./pages/cms/ContactInfoPage";
import DonationsPage from "./pages/cms/DonationsPage";
import MusicLibraryPage from "./pages/cms/MusicLibraryPage";
import SitPresetsPage from "./pages/cms/SitPresetsPage";
import EventsPage from "./pages/cms/EventsPage";
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

import VolunteerApplicationsPage from "./pages/volunteers/VolunteerApplicationsPage";
import VolunteerCategoriesPage from "./pages/volunteers/VolunteerCategoriesPage";

import PractitionerDashboardPage from "./pages/practitioner/PractitionerDashboardPage";
import MyMembersPage from "./pages/practitioner/MyMembersPage";
import MyAnnouncementsPage from "./pages/practitioner/MyAnnouncementsPage";

/** Wraps a page element with the permission that gates its nav link (see navConfig.js) — a defensive redirect for direct/typed URLs, not the primary UX (that's the sidebar simply not showing the link). */
function guarded(permission, element) {
  return <PermissionRoute permission={permission}>{element}</PermissionRoute>;
}

export default function AdminApp() {
  return (
    <AdminThemeProvider>
      <AdminDataProvider>
        <AuthProvider>
          <AdminToaster />
          <Routes>
            <Route path="login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />

                <Route path="cms/pages" element={guarded("cms.view", <PagesListPage />)} />
                <Route path="cms/pages/new" element={guarded("cms.create", <NewPageWizard />)} />
                <Route path="cms/pages/:slug" element={guarded("cms.view", <PageDetailPage />)} />
                <Route path="cms/pages/:slug/sections/:id" element={guarded("cms.view", <SectionEditorPage />)} />
                <Route path="cms/media" element={guarded("cms.view", <MediaLibraryPage />)} />
                <Route path="cms/contact" element={guarded("contact_channels.view", <ContactInfoPage />)} />
                <Route path="cms/donations" element={guarded("donations.view", <DonationsPage />)} />
                <Route path="cms/music" element={guarded("music.view", <MusicLibraryPage />)} />
                <Route path="cms/sit-presets" element={guarded("music.view", <SitPresetsPage />)} />
                <Route path="cms/events" element={guarded("cms.view", <EventsPage />)} />
                <Route path="cms/testimonials" element={guarded("testimonials.view", <TestimonialsPage />)} />

                <Route path="queries" element={guarded("members.view", <QueryInboxPage />)} />
                <Route path="members" element={guarded("members.view", <MembersListPage />)} />
                <Route path="members/:id" element={guarded("members.view", <MemberProfilePage />)} />
                <Route path="members/:id/journey" element={guarded("members.view", <MemberJourneyPage />)} />
                <Route path="users" element={guarded("users.view", <UsersListPage />)} />
                <Route path="roles" element={guarded("roles.view", <RolesPage />)} />

                <Route path="announcements" element={guarded("announcements.view", <AnnouncementsPage />)} />
                <Route path="broadcasts" element={guarded("broadcast.view", <BroadcastsPage />)} />
                <Route path="qr-codes" element={guarded("qrcode.view", <QrCodesPage />)} />

                <Route path="volunteers" element={guarded("volunteers.view", <VolunteerApplicationsPage />)} />
                <Route path="volunteers/categories" element={guarded("volunteers.view", <VolunteerCategoriesPage />)} />

                <Route path="reports" element={guarded("reports.view", <ReportsPage />)} />
                <Route path="languages" element={guarded("languages.view", <LanguagesPage />)} />
                <Route path="translations" element={guarded("translations.view", <TranslationsPage />)} />
                <Route path="settings" element={guarded("settings.view", <SettingsPage />)} />
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
    </AdminThemeProvider>
  );
}
