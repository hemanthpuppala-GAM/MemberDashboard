/** Member (public join) auth helpers — separate from admin Sanctum token. */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
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

export async function memberFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
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
  me: () => memberFetch("/auth/me"),
  logout: () => memberFetch("/auth/logout", { method: "POST" }),
};

export { API_ORIGIN };
