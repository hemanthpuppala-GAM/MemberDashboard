import { Routes, Route } from "react-router-dom";
import UserLayout from "./UserLayout";
import OverviewPage from "./pages/OverviewPage";
import SitScribePage from "./pages/SitScribePage";
import JoinLivePage from "./pages/JoinLivePage";
import JournalPage from "./pages/JournalPage";
import ShareLightPage from "./pages/ShareLightPage";
import CirclesHelpPage from "./pages/CirclesHelpPage";
import ProfilePage from "./pages/ProfilePage";

export default function UserApp() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="sit-scribe" element={<SitScribePage />} />
        <Route path="join-live" element={<JoinLivePage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="share" element={<ShareLightPage />} />
        <Route path="circles" element={<CirclesHelpPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
