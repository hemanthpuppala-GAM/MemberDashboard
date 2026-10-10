/**
 * Support desk API client. Core support signs in with phone + PIN and gets its own token
 * ("gaw_support_token"); admin-panel staff reuse their admin token ("gaw_admin_token", needs
 * members.view on the backend); volunteers reuse their member (Google) token.
 * Priority: support → admin → member.
 */
import { getMemberToken, setMemberToken } from "../lib/memberAuth";
import { getToken as getAdminToken } from "../lib/api";

const API_URL = import.meta.env.VITE_API_URL ?? "https://goldenagewisdom.org/staging/backend/api/v1";
const SUPPORT_TOKEN_KEY = "gaw_support_token";
const RETURN_KEY = "gaw_after_signin";

export function getSupportToken() {
  try {
    return localStorage.getItem(SUPPORT_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSupportToken(token) {
  try {
    if (token) localStorage.setItem(SUPPORT_TOKEN_KEY, token);
    else localStorage.removeItem(SUPPORT_TOKEN_KEY);
  } catch {
    /* storage blocked: the session just won't survive a reload */
  }
}

/**
 * The desk never deletes the admin token (it belongs to the admin panel). When the backend turns
 * it away (401/403), it is skipped for this page load instead. Keyed by value, so signing in to
 * the admin panel again with a different account brings it back.
 */
let skippedAdminToken = null;

/** A usable admin token, or null (none stored, or turned away by the desk already). */
function usableAdminToken() {
  try {
    const token = getAdminToken();
    return token && token !== skippedAdminToken ? token : null;
  } catch {
    return null; // storage blocked
  }
}

export function hasAdminToken() {
  return !!usableAdminToken();
}

/** An admin token is stored but the desk turned it away (no Queries access, or expired). */
export function adminTokenRefused() {
  try {
    const token = getAdminToken();
    return !!token && token === skippedAdminToken;
  } catch {
    return false;
  }
}

/** Which token the desk is using right now: "support" (core), "admin" (staff), "member" (volunteer) or null. */
export function currentTokenKind() {
  if (getSupportToken()) return "support";
  if (usableAdminToken()) return "admin";
  if (getMemberToken()) return "member";
  return null;
}

/**
 * Remember that Google sign-in was started from the desk. The shared OAuth callback
 * (pages/AuthCallbackPage) reads this and returns to /support instead of /dashboard.
 */
export function rememberReturnToDesk() {
  try {
    sessionStorage.setItem(RETURN_KEY, "/support");
  } catch {
    /* ignore */
  }
}

export class SupportApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let onUnauthorized = null;
/** The auth context registers a handler so any 401/403 mid-session drops back to the login screen. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function supportFetch(path, { method = "GET", body, auth = true, token } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const kind = auth ? (token ? "explicit" : currentTokenKind()) : null;
  const bearer =
    token ?? (kind === "support" ? getSupportToken() : kind === "admin" ? usableAdminToken() : kind === "member" ? getMemberToken() : null);
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new SupportApiError("Can't reach the server. Check your internet connection and try again.", 0);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    if (auth && res.status === 401) {
      // Token expired or revoked: forget it so the login screen shows.
      if (kind === "support") setSupportToken(null);
      else if (kind === "member") setMemberToken(null);
    }
    // Admin token: never cleared here (the admin panel owns it) — just stop using it on the desk.
    if (auth && kind === "admin" && (res.status === 401 || res.status === 403)) skippedAdminToken = bearer;
    const err = new SupportApiError(firstMessage(data) ?? `Something went wrong (${res.status}).`, res.status, data?.errors);
    err.tokenKind = kind;
    if (auth && (res.status === 401 || res.status === 403) && onUnauthorized) onUnauthorized(err);
    throw err;
  }
  return data;
}

function firstMessage(data) {
  if (!data) return null;
  const errs = data.errors && Object.values(data.errors).flat();
  return errs?.[0] ?? data.message ?? null;
}

const qs = (params) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  return new URLSearchParams(clean).toString();
};

export const supportApi = {
  login: (phone, pin) => supportFetch("/support/login", { method: "POST", body: { phone, pin }, auth: false }),
  logout: () => supportFetch("/support/logout", { method: "POST" }),
  me: () => supportFetch("/support/me"),
  dashboard: () => supportFetch("/support/dashboard"),
  agents: () => supportFetch("/support/agents"),
  tickets: (params = {}) => supportFetch(`/support/tickets?${qs({ per_page: 25, ...params })}`),
  ticket: (id) => supportFetch(`/support/tickets/${id}`),
  createTicket: (payload) => supportFetch("/support/tickets", { method: "POST", body: payload }),
  updateTicket: (id, payload) => supportFetch(`/support/tickets/${id}`, { method: "PATCH", body: payload }),
  addComment: (id, body, internal) =>
    supportFetch(`/support/tickets/${id}/comments`, { method: "POST", body: { body, internal } }),
};
