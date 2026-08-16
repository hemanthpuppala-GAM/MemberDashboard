import { useCallback, useState } from "react";
import { RolePreviewContext } from "./rolePreviewContextInstance";

const STORAGE_KEY = "gaw_admin_preview_role";

/**
 * The backend only has one seeded role ("admin") so far — this lets the demo
 * frontend preview what the sidebar/dashboards look like for every planned
 * role without needing real RBAC yet. Purely client-side, never sent to the API.
 */
export function RolePreviewProvider({ children }) {
  const [previewRole, setPreviewRoleState] = useState(() => localStorage.getItem(STORAGE_KEY) || "super_admin");

  const setPreviewRole = useCallback((role) => {
    setPreviewRoleState(role);
    localStorage.setItem(STORAGE_KEY, role);
  }, []);

  return (
    <RolePreviewContext.Provider value={{ previewRole, setPreviewRole }}>
      {children}
    </RolePreviewContext.Provider>
  );
}
