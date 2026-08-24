/**
 * Permission checks against the logged-in user's `permissions` array (from
 * GET /admin/me — see AuthController::present, which already expands
 * Super Admin to every permission name, so no special-casing is needed here).
 * "*" is a wildcard used only by the dev mock-auth user (see authFlags.js).
 */
export function hasPermission(permissions, required) {
  if (!required) return true;
  if (!permissions?.length) return false;
  return permissions.includes("*") || permissions.includes(required);
}

export function hasAnyPermission(permissions, requiredList) {
  if (!requiredList?.length) return true;
  return requiredList.some((p) => hasPermission(permissions, p));
}
