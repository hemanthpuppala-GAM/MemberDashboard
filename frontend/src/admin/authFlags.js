/** Dev-only escape hatch: preview the admin panel before the Laravel backend exists. See .env.example. */
export const MOCK_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_MOCK_AUTH === "true";
export const MOCK_USER = { id: 1, name: "Aanya Sharma", email: "aanya@goldenagewisdom.org", role: "super_admin" };
