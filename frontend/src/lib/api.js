const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const STORAGE_BASE = API_URL.replace(/\/api\/v1\/?$/, "");
const TOKEN_KEY = "gaw_admin_token";

/** Resolves a disk-relative storage path (as returned by e.g. QR code generation) to a browsable URL. Already-absolute URLs pass through unchanged. */
export function storageUrl(path) {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${STORAGE_BASE}/storage/${path}`;
}

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

/** Multipart upload: always transported as POST; `method: "PUT"` appends Laravel's `_method` spoof field so file uploads can hit PUT-validated update endpoints (PHP doesn't parse multipart bodies on real PUT requests). */
export async function apiUpload(path, formData, { method = "POST" } = {}) {
  if (method !== "POST") formData.append("_method", method);

  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body: formData });

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
  permissions: () => apiFetch("/admin/permissions"),

  users: () => apiFetch("/admin/users"),
  createUser: (payload) => apiFetch("/admin/users", { method: "POST", body: payload }),
  updateUser: (id, payload) => apiFetch(`/admin/users/${id}`, { method: "PUT", body: payload }),
  deleteUser: (id) => apiFetch(`/admin/users/${id}`, { method: "DELETE" }),

  roles: () => apiFetch("/admin/roles"),
  role: (id) => apiFetch(`/admin/roles/${id}`),
  createRole: (payload) => apiFetch("/admin/roles", { method: "POST", body: payload }),
  updateRole: (id, payload) => apiFetch(`/admin/roles/${id}`, { method: "PUT", body: payload }),
  deleteRole: (id) => apiFetch(`/admin/roles/${id}`, { method: "DELETE" }),

  content: () => apiFetch("/admin/content"),
  updateContent: (slug, payload) => apiFetch(`/admin/content/${slug}`, { method: "PUT", body: payload }),

  pages: () => apiFetch("/admin/pages"),
  page: (slug) => apiFetch(`/admin/pages/${slug}`),
  createPage: (payload) => apiFetch("/admin/pages", { method: "POST", body: payload }),
  updatePage: (slug, payload) => apiFetch(`/admin/pages/${slug}`, { method: "PUT", body: payload }),
  updatePageStatus: (slug, status) => apiFetch(`/admin/pages/${slug}/status`, { method: "PATCH", body: { status } }),
  deletePage: (slug) => apiFetch(`/admin/pages/${slug}`, { method: "DELETE" }),

  sections: (slug) => apiFetch(`/admin/pages/${slug}/sections`),
  createSection: (slug, payload) => apiFetch(`/admin/pages/${slug}/sections`, { method: "POST", body: payload }),
  updateSection: (slug, id, payload) => apiFetch(`/admin/pages/${slug}/sections/${id}`, { method: "PUT", body: payload }),
  deleteSection: (slug, id) => apiFetch(`/admin/pages/${slug}/sections/${id}`, { method: "DELETE" }),
  reorderSections: (slug, sectionIds) =>
    apiFetch(`/admin/pages/${slug}/sections/reorder`, { method: "PUT", body: { section_ids: sectionIds } }),

  sectionContent: (sectionId) => apiFetch(`/admin/sections/${sectionId}/content`),
  updateSectionContent: (sectionId, payload) => apiFetch(`/admin/sections/${sectionId}/content`, { method: "PUT", body: payload }),

  media: () => apiFetch("/admin/media"),
  uploadMedia: (formData) => apiUpload("/admin/media", formData),
  updateMedia: (id, payload) => apiFetch(`/admin/media/${id}`, { method: "PUT", body: payload }),
  deleteMedia: (id) => apiFetch(`/admin/media/${id}`, { method: "DELETE" }),

  music: () => apiFetch("/admin/music"),
  createMusic: (formData) => apiUpload("/admin/music", formData),
  updateMusic: (id, formData) => apiUpload(`/admin/music/${id}`, formData, { method: "PUT" }),
  deleteMusic: (id) => apiFetch(`/admin/music/${id}`, { method: "DELETE" }),
  reorderMusic: (trackIds) => apiFetch("/admin/music/reorder", { method: "PUT", body: { track_ids: trackIds } }),

  sitPresets: () => apiFetch("/admin/sit-presets"),
  createSitPreset: (payload) => apiFetch("/admin/sit-presets", { method: "POST", body: payload }),
  updateSitPreset: (id, payload) => apiFetch(`/admin/sit-presets/${id}`, { method: "PUT", body: payload }),
  deleteSitPreset: (id) => apiFetch(`/admin/sit-presets/${id}`, { method: "DELETE" }),
  reorderSitPresets: (presetIds) => apiFetch("/admin/sit-presets/reorder", { method: "PUT", body: { preset_ids: presetIds } }),

  testimonials: () => apiFetch("/admin/testimonials"),
  createTestimonial: (formData) => apiUpload("/admin/testimonials", formData),
  updateTestimonial: (id, formData) => apiUpload(`/admin/testimonials/${id}`, formData, { method: "PUT" }),
  deleteTestimonial: (id) => apiFetch(`/admin/testimonials/${id}`, { method: "DELETE" }),

  volunteerCategories: () => apiFetch("/admin/volunteer-categories"),
  createVolunteerCategory: (payload) => apiFetch("/admin/volunteer-categories", { method: "POST", body: payload }),
  updateVolunteerCategory: (id, payload) => apiFetch(`/admin/volunteer-categories/${id}`, { method: "PUT", body: payload }),
  deleteVolunteerCategory: (id) => apiFetch(`/admin/volunteer-categories/${id}`, { method: "DELETE" }),
  reorderVolunteerCategories: (categoryIds) =>
    apiFetch("/admin/volunteer-categories/reorder", { method: "PUT", body: { category_ids: categoryIds } }),

  volunteerApplications: (params = {}) => apiFetch(`/admin/volunteer-applications?${new URLSearchParams({ per_page: 20, ...params })}`),
  updateVolunteerApplicationStatus: (id, status) =>
    apiFetch(`/admin/volunteer-applications/${id}/status`, { method: "PATCH", body: { status } }),
  deleteVolunteerApplication: (id) => apiFetch(`/admin/volunteer-applications/${id}`, { method: "DELETE" }),

  contactChannels: () => apiFetch("/admin/contact-channels"),
  createContactChannel: (payload) => apiFetch("/admin/contact-channels", { method: "POST", body: payload }),
  updateContactChannel: (id, payload) => apiFetch(`/admin/contact-channels/${id}`, { method: "PUT", body: payload }),
  deleteContactChannel: (id) => apiFetch(`/admin/contact-channels/${id}`, { method: "DELETE" }),
  reorderContactChannels: (channelIds) =>
    apiFetch("/admin/contact-channels/reorder", { method: "PUT", body: { channel_ids: channelIds } }),

  donationMethods: () => apiFetch("/admin/donation-methods"),
  createDonationMethod: (formData) => apiUpload("/admin/donation-methods", formData),
  updateDonationMethod: (id, formData) => apiUpload(`/admin/donation-methods/${id}`, formData, { method: "PUT" }),
  deleteDonationMethod: (id) => apiFetch(`/admin/donation-methods/${id}`, { method: "DELETE" }),

  languages: () => apiFetch("/admin/languages"),
  createLanguage: (payload) => apiFetch("/admin/languages", { method: "POST", body: payload }),
  updateLanguage: (id, payload) => apiFetch(`/admin/languages/${id}`, { method: "PUT", body: payload }),
  deleteLanguage: (id) => apiFetch(`/admin/languages/${id}`, { method: "DELETE" }),

  uiStrings: () => apiFetch("/admin/ui-strings"),
  updateUiStrings: (payload) => apiFetch("/admin/ui-strings", { method: "PUT", body: payload }),

  events: () => apiFetch("/admin/events"),
  createEvent: (payload) => apiFetch("/admin/events", { method: "POST", body: payload }),
  updateEvent: (id, payload) => apiFetch(`/admin/events/${id}`, { method: "PUT", body: payload }),
  deleteEvent: (id) => apiFetch(`/admin/events/${id}`, { method: "DELETE" }),

  settings: () => apiFetch("/admin/settings"),
  updateSettings: (settings) => apiFetch("/admin/settings", { method: "PUT", body: { settings } }),
  testEmail: () => apiFetch("/admin/settings/test-email", { method: "POST" }),
  clearCache: () => apiFetch("/admin/settings/clear-cache", { method: "POST" }),

  contactSubmissions: (status) =>
    apiFetch(`/admin/contact-submissions${status ? `?status=${status}` : ""}`),
  updateContactSubmission: (id, status) =>
    apiFetch(`/admin/contact-submissions/${id}`, { method: "PATCH", body: { status } }),

  members: (params = {}) => apiFetch(`/admin/members?${new URLSearchParams({ per_page: 20, ...params })}`),
  member: (id) => apiFetch(`/admin/members/${id}`),
  createMember: (payload) => apiFetch("/admin/members", { method: "POST", body: payload }),
  updateMember: (id, payload) => apiFetch(`/admin/members/${id}`, { method: "PUT", body: payload }),
  deleteMember: (id) => apiFetch(`/admin/members/${id}`, { method: "DELETE" }),
  assignMember: (id, practitionerId) =>
    apiFetch(`/admin/members/${id}/assign`, { method: "POST", body: { assigned_practitioner_id: practitionerId } }),
  memberJourney: (id) => apiFetch(`/admin/members/${id}/journey`),
  addMemberJourneyEntry: (id, payload) => apiFetch(`/admin/members/${id}/journey`, { method: "POST", body: payload }),

  queries: (params = {}) => apiFetch(`/admin/queries?${new URLSearchParams({ per_page: 20, ...params })}`),
  query: (id) => apiFetch(`/admin/queries/${id}`),
  updateQueryStatus: (id, status) => apiFetch(`/admin/queries/${id}/status`, { method: "PATCH", body: { status } }),
  assignQuery: (id, userId) => apiFetch(`/admin/queries/${id}/assign`, { method: "PATCH", body: { assigned_to: userId } }),
  convertQueryToMember: (id) => apiFetch(`/admin/queries/${id}/convert-to-member`, { method: "POST" }),

  announcements: () => apiFetch("/admin/announcements"),
  createAnnouncement: (payload) => apiFetch("/admin/announcements", { method: "POST", body: payload }),
  updateAnnouncement: (id, payload) => apiFetch(`/admin/announcements/${id}`, { method: "PUT", body: payload }),
  sendAnnouncement: (id) => apiFetch(`/admin/announcements/${id}/send`, { method: "POST" }),
  deleteAnnouncement: (id) => apiFetch(`/admin/announcements/${id}`, { method: "DELETE" }),

  broadcasts: () => apiFetch("/admin/broadcasts"),
  createBroadcast: (payload) => apiFetch("/admin/broadcasts", { method: "POST", body: payload }),
  updateBroadcast: (id, payload) => apiFetch(`/admin/broadcasts/${id}`, { method: "PUT", body: payload }),
  updateBroadcastStatus: (id, status) => apiFetch(`/admin/broadcasts/${id}/status`, { method: "PATCH", body: { status } }),
  deleteBroadcast: (id) => apiFetch(`/admin/broadcasts/${id}`, { method: "DELETE" }),

  qrCodes: () => apiFetch("/admin/qr-codes"),
  generateQrCode: (payload) => apiFetch("/admin/qr-codes/generate", { method: "POST", body: payload }),
  deleteQrCode: (id) => apiFetch(`/admin/qr-codes/${id}`, { method: "DELETE" }),
  qrCodeDownloadPath: (id) => `/admin/qr-codes/${id}/download`,

  reportsOverview: () => apiFetch("/admin/reports/overview"),
  reportsMembers: () => apiFetch("/admin/reports/members"),
  reportsPractitioners: () => apiFetch("/admin/reports/practitioners"),
  reportsQueries: () => apiFetch("/admin/reports/queries"),
  reportsActivityLog: (params = {}) => apiFetch(`/admin/reports/activity-log?${new URLSearchParams({ per_page: 25, ...params })}`),
};

/** Downloads a file from an authenticated admin endpoint (CSV/PNG exports) by fetching it as a blob and triggering a save. */
export async function downloadAuthed(path, filename) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) throw new ApiError(`Download failed (${res.status})`, res.status);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const practitionerApi = {
  dashboardStats: () => apiFetch("/practitioner/dashboard-stats"),
  members: () => apiFetch("/practitioner/members"),
  member: (id) => apiFetch(`/practitioner/members/${id}`),
  journey: (id) => apiFetch(`/practitioner/members/${id}/journey`),
  addJourneyEntry: (id, payload) => apiFetch(`/practitioner/members/${id}/journey`, { method: "POST", body: payload }),
  updateSummary: (id, summary) => apiFetch(`/practitioner/members/${id}/summary`, { method: "PUT", body: { summary } }),
  announcements: () => apiFetch("/practitioner/announcements"),
  markAnnouncementRead: (id) => apiFetch(`/practitioner/announcements/${id}/read`, { method: "PATCH" }),
};

export const publicApi = {
  content: () => apiFetch("/content", { auth: false }),
  contentBySlug: (slug) => apiFetch(`/content/${slug}`, { auth: false }),
  page: (slug, lang) => apiFetch(`/pages/${slug}${lang ? `?lang=${encodeURIComponent(lang)}` : ""}`, { auth: false }),
  languages: () => apiFetch("/languages/enabled", { auth: false }),
  uiStrings: (lang) => apiFetch(`/ui-strings${lang ? `?lang=${encodeURIComponent(lang)}` : ""}`, { auth: false }),
  events: () => apiFetch("/events", { auth: false }),
  music: () => apiFetch("/music", { auth: false }),
  sitPresets: () => apiFetch("/sit-presets", { auth: false }),
  testimonials: () => apiFetch("/testimonials", { auth: false }),
  settings: () => apiFetch("/settings", { auth: false }),
  submitContact: (payload) => apiFetch("/contact", { method: "POST", body: payload, auth: false }),
  volunteerCategories: () => apiFetch("/volunteer-categories", { auth: false }),
  submitVolunteerApplication: (payload) => apiFetch("/volunteer-applications", { method: "POST", body: payload, auth: false }),
  contactChannels: () => apiFetch("/contact-channels", { auth: false }),
  donationMethods: () => apiFetch("/donation-methods", { auth: false }),
  broadcasts: (page) => apiFetch(`/broadcasts/active${page ? `?page=${encodeURIComponent(page)}` : ""}`, { auth: false }),
};
