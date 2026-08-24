import { useAuth } from "./useAuth";
import { hasPermission, hasAnyPermission } from "./permissions";

/** The logged-in admin's real permissions (from their role), plus check helpers. */
export function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  return {
    permissions,
    can: (required) => hasPermission(permissions, required),
    canAny: (requiredList) => hasAnyPermission(permissions, requiredList),
  };
}
