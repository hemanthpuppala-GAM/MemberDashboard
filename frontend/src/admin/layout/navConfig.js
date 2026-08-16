import {
  LayoutDashboard, FileText, Image, Inbox, UsersRound, UserCog, ShieldCheck,
  Megaphone, Radio, QrCode, BarChart3, Globe, Settings, Files, Phone, Landmark,
  Music2, MessageSquareQuote,
} from "lucide-react";

export const NAV = [
  { type: "link", to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  {
    type: "group", key: "cms", label: "CMS", icon: FileText,
    items: [
      { to: "/admin/cms/pages", label: "Pages", icon: Files },
      { to: "/admin/cms/media", label: "Media", icon: Image },
      { to: "/admin/cms/music", label: "Music", icon: Music2 },
      { to: "/admin/cms/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { to: "/admin/cms/contact", label: "Contact Info", icon: Phone },
      { to: "/admin/cms/donations", label: "Donations", icon: Landmark },
    ],
  },
  {
    type: "group", key: "people", label: "People", icon: UsersRound,
    items: [
      { to: "/admin/queries", label: "Queries", icon: Inbox },
      { to: "/admin/members", label: "Members", icon: UsersRound },
      { to: "/admin/users", label: "Users", icon: UserCog },
      { to: "/admin/roles", label: "Roles", icon: ShieldCheck },
    ],
  },
  {
    type: "group", key: "engage", label: "Engage", icon: Megaphone,
    items: [
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/admin/broadcasts", label: "Broadcasts", icon: Radio },
      { to: "/admin/qr-codes", label: "QR Codes", icon: QrCode },
    ],
  },
  { type: "link", to: "/admin/reports", icon: BarChart3, label: "Reports" },
  { type: "link", to: "/admin/languages", icon: Globe, label: "Languages" },
  { type: "link", to: "/admin/settings", icon: Settings, label: "Settings" },
];

export const BREADCRUMB_RULES = [
  { pattern: /^\/admin\/?$/, crumbs: () => ["Dashboard"] },
  { pattern: /^\/admin\/cms\/pages\/new\/?$/, crumbs: () => ["CMS", "Pages", "New page"] },
  { pattern: /^\/admin\/cms\/pages\/([^/]+)\/sections\/([^/]+)\/?$/, crumbs: (m) => ["CMS", "Pages", m[1], "Section"] },
  { pattern: /^\/admin\/cms\/pages\/([^/]+)\/?$/, crumbs: (m) => ["CMS", "Pages", m[1]] },
  { pattern: /^\/admin\/cms\/pages\/?$/, crumbs: () => ["CMS", "Pages"] },
  { pattern: /^\/admin\/cms\/media\/?$/, crumbs: () => ["CMS", "Media"] },
  { pattern: /^\/admin\/cms\/music\/?$/, crumbs: () => ["CMS", "Music"] },
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
  { pattern: /^\/admin\/reports\/?$/, crumbs: () => ["Reports"] },
  { pattern: /^\/admin\/languages\/?$/, crumbs: () => ["Languages"] },
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
