const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "gaw_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Thin fetch wrapper: JSON in/out, bearer auth, throws ApiError with parsed validation messages. */
export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = {
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
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
    throw new ApiError(data?.message ?? `Request failed (${res.status})`, res.status, data?.errors);
  }

  return data;
}

export const api = {
  login: (email, password) => apiFetch("/admin/login", { method: "POST", body: { email, password }, auth: false }),
  logout: () => apiFetch("/admin/logout", { method: "POST" }),
  me: () => apiFetch("/admin/me"),

  dashboard: () => apiFetch("/admin/dashboard"),

  content: () => apiFetch("/admin/content"),
  updateContent: (slug, payload) => apiFetch(`/admin/content/${slug}`, { method: "PUT", body: payload }),

  events: () => apiFetch("/admin/events"),
  createEvent: (payload) => apiFetch("/admin/events", { method: "POST", body: payload }),
  updateEvent: (id, payload) => apiFetch(`/admin/events/${id}`, { method: "PUT", body: payload }),
  deleteEvent: (id) => apiFetch(`/admin/events/${id}`, { method: "DELETE" }),

  settings: () => apiFetch("/admin/settings"),
  updateSettings: (settings) => apiFetch("/admin/settings", { method: "PUT", body: { settings } }),

  contactSubmissions: (status) =>
    apiFetch(`/admin/contact-submissions${status ? `?status=${status}` : ""}`),
  updateContactSubmission: (id, status) =>
    apiFetch(`/admin/contact-submissions/${id}`, { method: "PATCH", body: { status } }),
};

export const publicApi = {
  content: () => apiFetch("/content", { auth: false }),
  contentBySlug: (slug) => apiFetch(`/content/${slug}`, { auth: false }),
  events: () => apiFetch("/events", { auth: false }),
  settings: () => apiFetch("/settings", { auth: false }),
  submitContact: (payload) => apiFetch("/contact", { method: "POST", body: payload, auth: false }),
};
