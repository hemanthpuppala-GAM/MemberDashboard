import { Navigate } from "react-router-dom";
import { usePermissions } from "./usePermissions";

/**
 * Defensive backstop for direct/typed navigation: the sidebar (see Sidebar.jsx
 * + navConfig.js) already hides links a user can't use, but nothing stops
 * them from hitting the URL directly, which would otherwise render the page
 * shell and then fail its data fetch with a raw 403. Redirect to the
 * dashboard instead.
 */
export default function PermissionRoute({ permission, children }) {
  const { can } = usePermissions();
  if (permission && !can(permission)) return <Navigate to="/admin" replace />;
  return children;
}
