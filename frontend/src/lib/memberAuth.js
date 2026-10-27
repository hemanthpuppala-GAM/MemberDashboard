/** Member (public join) auth helpers — separate from admin Sanctum token. */
const API_URL = import.meta.env.VITE_API_URL ?? "https://goldenagewisdom.org/staging/backend/api/v1";
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");
const MEMBER_TOKEN_KEY = "gaw_member_token";
const LAST_MEMBER_KEY = "gaw_last_member";

export function getMemberToken() {
  return localStorage.getItem(MEMBER_TOKEN_KEY);
}

export function setMemberToken(token) {
  if (token) localStorage.setItem(MEMBER_TOKEN_KEY, token);
  else localStorage.removeItem(MEMBER_TOKEN_KEY);
}

export function getLastMember() {
  try {
    return JSON.parse(localStorage.getItem(LAST_MEMBER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setLastMember(user) {
  if (user) {
    localStorage.setItem(
      LAST_MEMBER_KEY,
      JSON.stringify({
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        oauth_provider: user.oauth_provider,
      }),
    );
  } else localStorage.removeItem(LAST_MEMBER_KEY);
}

export function oauthRedirectUrl(provider) {
  return `${API_URL}/auth/${provider}/redirect`;
}

/** The member's own time zone, so the server counts streak and challenge days on their calendar. */
function timeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

export async function memberFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  const zone = timeZone();
  if (zone) headers["X-Timezone"] = zone;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getMemberToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }
  return data;
}

export const memberAuthApi = {
  demo: () => memberFetch("/auth/demo", { method: "POST", auth: false }),
  register: (payload) => memberFetch("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => memberFetch("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => memberFetch("/auth/me"),
  logout: () => memberFetch("/auth/logout", { method: "POST" }),

  overview: () => memberFetch("/member/overview"),
  practiceSessions: () => memberFetch("/member/practice-sessions"),
  /** `completedOn` (YYYY-MM-DD, member's calendar): "Add a missed sit" for today or the two days before. */
  logPracticeSession: (duration_minutes, sit_preset_id, via, completedOn) =>
    memberFetch("/member/practice-sessions", {
      method: "POST",
      body: { duration_minutes, sit_preset_id, ...(via ? { via } : {}), ...(completedOn ? { completed_on: completedOn } : {}) },
    }),
  journal: () => memberFetch("/member/journal"),
  addJournalEntry: (content) => memberFetch("/member/journal", { method: "POST", body: { content } }),
  updateJournalEntry: (id, content) => memberFetch(`/member/journal/${id}`, { method: "PUT", body: { content } }),
  deleteJournalEntry: (id) => memberFetch(`/member/journal/${id}`, { method: "DELETE" }),
  liveSessions: () => memberFetch("/member/live-sessions"),
  referral: () => memberFetch("/member/referral"),
  updateProfile: (payload) => memberFetch("/member/profile", { method: "PUT", body: payload }),
  updatePassword: (payload) => memberFetch("/member/password", { method: "PUT", body: payload }),
  contact: (payload) => memberFetch("/contact", { method: "POST", body: payload }),
};

export { API_ORIGIN };
