import {
  Files,
  Image,
  CalendarDays,
  LayoutGrid,
  Inbox,
  MessageSquareText,
  UsersRound,
  UserCog,
  Shield,
  HeartHandshake,
  Quote,
  Music2,
  HandCoins,
  Megaphone,
  Radio,
  Languages,
  ShieldCheck,
} from "lucide-react";

/**
 * Catalog of every stat widget the dashboard can show. `id` must match a key
 * the backend's GET /admin/dashboard can return (see DashboardController's
 * WIDGET_PERMISSIONS) — the backend only ever includes a key if the logged-in
 * admin holds `permission`, so this list is filtered again here purely for
 * the "add a widget" picker UI, not as the source of truth for access.
 */
export const DASHBOARD_WIDGETS = [
  { id: "pages_total", label: "Website pages", icon: Files, permission: "cms.view", to: "/admin/cms/pages" },
  { id: "media_total", label: "Media items", icon: Image, permission: "cms.view", to: "/admin/cms/media" },
  { id: "events_upcoming", label: "Upcoming events", icon: CalendarDays, permission: "cms.view", to: "/admin/cms/events" },
  { id: "content_blocks", label: "Legacy content blocks", icon: LayoutGrid, permission: "cms.view" },
  { id: "queries_new", label: "New queries", icon: Inbox, permission: "members.view", to: "/admin/queries" },
  { id: "queries_total", label: "Total queries", icon: MessageSquareText, permission: "members.view", to: "/admin/queries" },
  { id: "members_active", label: "Active members", icon: UsersRound, permission: "members.view", to: "/admin/members" },
  { id: "members_total", label: "Total members", icon: UsersRound, permission: "members.view", to: "/admin/members" },
  { id: "practitioners_total", label: "Practitioners", icon: UserCog, permission: "users.view", to: "/admin/users" },
  { id: "users_total", label: "Admin users", icon: Shield, permission: "users.view", to: "/admin/users" },
  { id: "volunteer_applications_new", label: "New volunteer applications", icon: HeartHandshake, permission: "volunteers.view", to: "/admin/volunteers" },
  { id: "testimonials_total", label: "Testimonials", icon: Quote, permission: "testimonials.view", to: "/admin/cms/testimonials" },
  { id: "music_tracks_total", label: "Music tracks", icon: Music2, permission: "music.view", to: "/admin/cms/music" },
  { id: "donation_methods_total", label: "Donation methods", icon: HandCoins, permission: "donations.view", to: "/admin/cms/donations" },
  { id: "announcements_total", label: "Announcements", icon: Megaphone, permission: "announcements.view", to: "/admin/announcements" },
  { id: "broadcasts_active", label: "Active broadcasts", icon: Radio, permission: "broadcast.view", to: "/admin/broadcasts" },
  { id: "languages_enabled", label: "Enabled languages", icon: Languages, permission: "languages.view", to: "/admin/languages" },
  { id: "roles_total", label: "Roles", icon: ShieldCheck, permission: "roles.view", to: "/admin/roles" },
];

/** What a first-time admin (no saved layout yet) sees — mirrors the old fixed dashboard. */
export const DEFAULT_DASHBOARD_WIDGETS = ["pages_total", "media_total", "queries_new", "members_active", "practitioners_total"];
