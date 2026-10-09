import { useMemberAuth } from "../auth/MemberAuthContext";

/** Signed-in member (from auth, not localStorage) → first name + initial. */
export function useMemberBadge() {
  const { user } = useMemberAuth();
  const name = user?.name || user?.email || "";
  const first = name.split(/[\s@]/)[0] || "Member";
  return { isMember: !!user, first, initial: (first[0] || "M").toUpperCase() };
}
