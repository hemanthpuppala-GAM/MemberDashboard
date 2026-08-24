import { usePermissions } from "../usePermissions";

/**
 * Gates children behind the logged-in admin's real permissions — nothing is
 * rendered (not even disabled) when the permission is missing, so a role
 * without e.g. `roles.delete` never sees a delete button in the first place.
 * Pass a single `permission`, or `any={[...]}` to allow if any one matches.
 */
export default function Can({ permission, any, children }) {
  const { can, canAny } = usePermissions();
  const allowed = any ? canAny(any) : can(permission);
  return allowed ? children : null;
}
