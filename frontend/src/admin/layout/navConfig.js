import {
  LayoutDashboard, FileText, Image, Inbox, UsersRound, UserCog, ShieldCheck,
  Megaphone, Radio, QrCode, BarChart3, Globe, Settings, Files, Phone, Landmark,
  Music2, MessageSquareQuote, HeartHandshake, ListChecks, CalendarClock, Timer,
  ClipboardList,
} from "lucide-react";

/**
 * `permission` on a leaf item gates that link — see Sidebar.jsx, which hides
 * any item the logged-in admin's role doesn't grant, and hides a whole group
 * once every one of its items is hidden. Must match a real `group.action`
 * permission name (see RolesAndPermissionsSeeder::GROUPS on the backend) so
 * this mirrors what the API route middleware actually enforces — this list
 * only controls what's shown, not what's allowed.
 */
export const NAV = [
  { type: "link", to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  {
    type: "group", key: "cms", label: "CMS", icon: FileText,
    items: [
      { to: "/admin/cms/pages", label: "Pages", icon: Files, permission: "cms.view" },
      { to: "/admin/cms/media", label: "Media", icon: Image, permission: "cms.view" },
      { to: "/admin/cms/music", label: "Music", icon: Music2, permission: "music.view" },
      { to: "/admin/cms/sit-presets", label: "Meditation Presets", icon: Timer, permission: "music.view" },
      { to: "/admin/cms/events", label: "Live Sessions", icon: CalendarClock, permission: "cms.view" },
      { to: "/admin/cms/testimonials", label: "Testimonials", icon: MessageSquareQuote, permission: "testimonials.view" },
      { to: "/admin/cms/contact", label: "Contact Info", icon: Phone, permission: "contact_channels.view" },
      { to: "/admin/cms/donations", label: "Donations", icon: Landmark, permission: "donations.view" },
    ],
  },
  {
    type: "group", key: "people", label: "People", icon: UsersRound,
    items: [
      { to: "/admin/queries", label: "Queries", icon: Inbox, permission: "members.view" },
      { to: "/admin/members", label: "Members", icon: UsersRound, permission: "members.view" },
      { to: "/admin/users", label: "Users", icon: UserCog, permission: "users.view" },
      { to: "/admin/roles", label: "Roles", icon: ShieldCheck, permission: "roles.view" },
    ],
  },
  {
    type: "group", key: "engage", label: "Engage", icon: Megaphone,
    items: [
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone, permission: "announcements.view" },
      { to: "/admin/broadcasts", label: "Broadcasts", icon: Radio, permission: "broadcast.view" },
      { to: "/admin/qr-codes", label: "QR Codes", icon: QrCode, permission: "qrcode.view" },
      { to: "/admin/registration-forms", label: "Registration Forms", icon: ClipboardList, permission: "registration_forms.view" },
    ],
  },
  {
    type: "group", key: "volunteers", label: "Volunteers", icon: HeartHandshake,
    items: [
      { to: "/admin/volunteers", label: "Applications", icon: Inbox, permission: "volunteers.view" },
      { to: "/admin/volunteers/categories", label: "Categories", icon: ListChecks, permission: "volunteers.view" },
    ],
  },
  { type: "link", to: "/admin/reports", icon: BarChart3, label: "Reports", permission: "reports.view" },
  { type: "link", to: "/admin/languages", icon: Globe, label: "Languages", permission: "languages.view" },
  { type: "link", to: "/admin/translations", icon: FileText, label: "Translations", permission: "translations.view" },
  { type: "link", to: "/admin/settings", icon: Settings, label: "Settings", permission: "settings.view" },
];

export const BREADCRUMB_RULES = [
  { pattern: /^\/admin\/?$/, crumbs: () => ["Dashboard"] },
  { pattern: /^\/admin\/cms\/pages\/new\/?$/, crumbs: () => ["CMS", "Pages", "New page"] },
  { pattern: /^\/admin\/cms\/pages\/([^/]+)\/sections\/([^/]+)\/?$/, crumbs: (m) => ["CMS", "Pages", m[1], "Section"] },
  { pattern: /^\/admin\/cms\/pages\/([^/]+)\/?$/, crumbs: (m) => ["CMS", "Pages", m[1]] },
  { pattern: /^\/admin\/cms\/pages\/?$/, crumbs: () => ["CMS", "Pages"] },
  { pattern: /^\/admin\/cms\/media\/?$/, crumbs: () => ["CMS", "Media"] },
  { pattern: /^\/admin\/cms\/music\/?$/, crumbs: () => ["CMS", "Music"] },
  { pattern: /^\/admin\/cms\/sit-presets\/?$/, crumbs: () => ["CMS", "Meditation Presets"] },
  { pattern: /^\/admin\/cms\/events\/?$/, crumbs: () => ["CMS", "Live Sessions"] },
  { pattern: /^\/admin\/cms\/testimonials\/?$/, crumbs: () => ["CMS", "Testimonials"] },
  { pattern: /^\/admin\/cms\/contact\/?$/, crumbs: () => ["CMS", "Contact Info"] },
  { pattern: /^\/admin\/cms\/donations\/?$/, crumbs: () => ["CMS", "Donations"] },
  { pattern: /^\/admin\/queries\/?$/, crumbs: () => ["People", "Queries"] },
  { pattern: /^\/admin\/members\/([^/]+)\/journey\/?$/, crumbs: (m) => ["People", "Members", m[1], "Records"] },
  { pattern: /^\/admin\/members\/([^/]+)\/?$/, crumbs: (m) => ["People", "Members", m[1]] },
  { pattern: /^\/admin\/members\/?$/, crumbs: () => ["People", "Members"] },
  { pattern: /^\/admin\/users\/?$/, crumbs: () => ["People", "Users"] },
  { pattern: /^\/admin\/roles\/?$/, crumbs: () => ["People", "Roles"] },
  { pattern: /^\/admin\/announcements\/?$/, crumbs: () => ["Engage", "Announcements"] },
  { pattern: /^\/admin\/broadcasts\/?$/, crumbs: () => ["Engage", "Broadcasts"] },
  { pattern: /^\/admin\/qr-codes\/?$/, crumbs: () => ["Engage", "QR Codes"] },
  { pattern: /^\/admin\/registration-forms\/new\/?$/, crumbs: () => ["Engage", "Registration Forms", "New form"] },
  { pattern: /^\/admin\/registration-forms\/([^/]+)\/submissions\/?$/, crumbs: (m) => ["Engage", "Registration Forms", m[1], "Registrations"] },
  { pattern: /^\/admin\/registration-forms\/([^/]+)\/?$/, crumbs: (m) => ["Engage", "Registration Forms", m[1]] },
  { pattern: /^\/admin\/registration-forms\/?$/, crumbs: () => ["Engage", "Registration Forms"] },
  { pattern: /^\/admin\/volunteers\/categories\/?$/, crumbs: () => ["Volunteers", "Categories"] },
  { pattern: /^\/admin\/volunteers\/?$/, crumbs: () => ["Volunteers", "Applications"] },
  { pattern: /^\/admin\/reports\/?$/, crumbs: () => ["Reports"] },
  { pattern: /^\/admin\/languages\/?$/, crumbs: () => ["Languages"] },
  { pattern: /^\/admin\/translations\/?$/, crumbs: () => ["Translations"] },
  { pattern: /^\/admin\/settings\/?$/, crumbs: () => ["Settings"] },
  { pattern: /^\/admin\/my-dashboard\/members\/([^/]+)\/?$/, crumbs: (m) => ["My Dashboard", "Members", m[1]] },
  { pattern: /^\/admin\/my-dashboard\/members\/?$/, crumbs: () => ["My Dashboard", "My Members"] },
  { pattern: /^\/admin\/my-dashboard\/announcements\/?$/, crumbs: () => ["My Dashboard", "Announcements"] },
  { pattern: /^\/admin\/my-dashboard\/?$/, crumbs: () => ["My Dashboard"] },
];

export function getBreadcrumb(pathname) {
  for (const rule of BREADCRUMB_RULES) {
    const m = pathname.match(rule.pattern);
    if (m) return rule.crumbs(m);
  }
  const last = pathname.split("/").filter(Boolean).pop();
  return last ? [last] : ["Dashboard"];
}
