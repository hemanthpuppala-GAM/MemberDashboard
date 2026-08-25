import { Sun, Play, Radio, PenLine, Heart, Phone, UserRound } from "lucide-react";

export const NAV = [
  { to: "/dashboard", end: true, icon: Sun, label: "Overview" },
  { to: "/dashboard/sit-scribe", icon: Play, label: "Sit & Scribe" },
  { to: "/dashboard/join-live", icon: Radio, label: "Join live" },
  { to: "/dashboard/journal", icon: PenLine, label: "Journal" },
  { to: "/dashboard/share", icon: Heart, label: "Share the light" },
  { to: "/dashboard/circles", icon: Phone, label: "Circles & help" },
  { to: "/dashboard/profile", icon: UserRound, label: "Profile" },
];
