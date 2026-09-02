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
  { id: "pages_total", label: "Website pages", icon: Files, permission: "cms.view" },
  { id: "media_total", label: "Media items", icon: Image, permission: "cms.view" },
  { id: "events_upcoming", label: "Upcoming events", icon: CalendarDays, permission: "cms.view" },
  { id: "content_blocks", label: "Legacy content blocks", icon: LayoutGrid, permission: "cms.view" },
  { id: "queries_new", label: "New queries", icon: Inbox, permission: "members.view" },
  { id: "queries_total", label: "Total queries", icon: MessageSquareText, permission: "members.view" },
  { id: "members_active", label: "Active members", icon: UsersRound, permission: "members.view" },
  { id: "members_total", label: "Total members", icon: UsersRound, permission: "members.view" },
  { id: "practitioners_total", label: "Practitioners", icon: UserCog, permission: "users.view" },
  { id: "users_total", label: "Admin users", icon: Shield, permission: "users.view" },
  { id: "volunteer_applications_new", label: "New volunteer applications", icon: HeartHandshake, permission: "volunteers.view" },
  { id: "testimonials_total", label: "Testimonials", icon: Quote, permission: "testimonials.view" },
  { id: "music_tracks_total", label: "Music tracks", icon: Music2, permission: "music.view" },
  { id: "donation_methods_total", label: "Donation methods", icon: HandCoins, permission: "donations.view" },
  { id: "announcements_total", label: "Announcements", icon: Megaphone, permission: "announcements.view" },
  { id: "broadcasts_active", label: "Active broadcasts", icon: Radio, permission: "broadcast.view" },
  { id: "languages_enabled", label: "Enabled languages", icon: Languages, permission: "languages.view" },
  { id: "roles_total", label: "Roles", icon: ShieldCheck, permission: "roles.view" },
];

/** What a first-time admin (no saved layout yet) sees — mirrors the old fixed dashboard. */
export const DEFAULT_DASHBOARD_WIDGETS = ["pages_total", "media_total", "queries_new", "members_active", "practitioners_total"];
