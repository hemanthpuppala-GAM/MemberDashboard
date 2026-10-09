import { getToken } from "../lib/api";

/** Shows "Edit this page" links. Convenience only — the API re-checks permissions. */
export function useIsSiteAdmin() {
  try {
    return !!getToken();
  } catch {
    return false;
  }
}
