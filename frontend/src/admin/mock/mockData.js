/**
 * Static sample data for the admin frontend preview (ADMIN_PANEL_PLAN.md).
 * No backend yet — pages read/mutate in-memory copies of these exports.
 */

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", direction: "ltr", enabled: true, isDefault: true, completeness: 100 },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", direction: "ltr", enabled: true, isDefault: false, completeness: 72 },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", direction: "ltr", enabled: true, isDefault: false, completeness: 38 },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", direction: "rtl", enabled: false, isDefault: false, completeness: 5 },
];

export const UI_TRANSLATIONS = [
  { key: "nav.contact", en: "Contact", hi: "संपर्क करें", es: "Contacto" },
  { key: "form.submit", en: "Submit", hi: "जमा करें", es: "Enviar" },
  { key: "form.name", en: "Name", hi: "नाम", es: "Nombre" },
  { key: "cta.book_session", en: "Book a Session", hi: "सत्र बुक करें", es: "Reservar sesión" },
];

export const SECTION_TYPES = [
  { type: "hero", label: "Hero", description: "Full-width banner with heading and CTA" },
  { type: "content_block", label: "Content block", description: "Eyebrow, heading, description, bullets" },
  { type: "card_grid", label: "Card grid", description: "Heading with a grid of icon cards" },
  { type: "event_list", label: "Event list", description: "Auto-renders published events" },
  { type: "contact_form", label: "Contact form", description: "Public query form with categories" },
  { type: "media_embed", label: "Media embed", description: "Image or embedded video" },
  { type: "custom_html", label: "Custom HTML", description: "Raw HTML block (super admin only)" },
];

function sectionContent(overrides = {}) {
  return {
    en: { eyebrow: "", heading: "", description: "", points: [], cta_label: "", cta_href: "", ...overrides.en },
    hi: { eyebrow: "", heading: "", description: "", points: [], cta_label: "", cta_href: "", ...overrides.hi },
    es: { eyebrow: "", heading: "", description: "", points: [], cta_label: "", cta_href: "", ...overrides.es },
  };
}

export const PAGES = [
  {
    id: 1,
    slug: "home",
    title: "Home",
    isBuiltin: true,
    status: "published",
    lastEdited: "2026-08-12T10:20:00Z",
    langCoverage: { en: 100, hi: 80, es: 40 },
    sections: [
      {
        id: 101,
        type: "hero",
        order: 1,
        status: "active",
        content: sectionContent({
          en: { eyebrow: "Golden Age Wisdom", heading: "Awaken Your Inner Self", description: "Join the daily mass meditation and explore the seven chakras.", cta_label: "Meditate Now", cta_href: "#meditate" },
          hi: { eyebrow: "स्वर्ण युग ज्ञान", heading: "अपने भीतर के स्व को जगाएं", description: "" },
        }),
      },
      {
        id: 102,
        type: "card_grid",
        order: 2,
        status: "active",
        content: sectionContent({ en: { heading: "What we offer" } }),
      },
    ],
  },
  {
    id: 2,
    slug: "about",
    title: "About Me",
    isBuiltin: true,
    status: "published",
    lastEdited: "2026-08-10T14:05:00Z",
    langCoverage: { en: 100, hi: 100, es: 20 },
    sections: [
      {
        id: 201,
        type: "content_block",
        order: 1,
        status: "active",
        content: sectionContent({
          en: {
            eyebrow: "Spiritual Guide",
            heading: "A Journey of Stillness & Light",
            description: "Two decades guiding seekers through meditation, chakra work, and the Upanishadic tradition.",
            points: ["500+ guided sessions", "Certified kundalini instructor", "Daily live meditation host"],
            cta_label: "Book a Session",
            cta_href: "/contact",
          },
          hi: {
            eyebrow: "आध्यात्मिक गुरु",
            heading: "स्थिरता और प्रकाश की यात्रा",
            description: "ध्यान और चक्र कार्य में दो दशकों का अनुभव।",
            points: ["500+ निर्देशित सत्र"],
          },
        }),
      },
    ],
  },
  {
    id: 3,
    slug: "meditate",
    title: "Meditation",
    isBuiltin: true,
    status: "published",
    lastEdited: "2026-08-09T09:00:00Z",
    langCoverage: { en: 100, hi: 60, es: 0 },
    sections: [
      {
        id: 301,
        type: "content_block",
        order: 1,
        status: "active",
        content: sectionContent({
          en: {
            eyebrow: "Daily Practice",
            heading: "Meditate With the Global Circle",
            description: "A guided daily session for calming the mind and awakening awareness.",
            points: ["30-minute guided sittings", "Free & open to everyone", "Live every evening"],
            cta_label: "Join Today's Session",
            cta_href: "#meditate-now",
          },
        }),
      },
    ],
  },
  {
    id: 4,
    slug: "wellness",
    title: "Wellness",
    isBuiltin: true,
    status: "published",
    lastEdited: "2026-08-08T11:30:00Z",
    langCoverage: { en: 100, hi: 45, es: 0 },
    sections: [
      { id: 401, type: "content_block", order: 1, status: "active", content: sectionContent({ en: { eyebrow: "Holistic Health", heading: "Balance Body & Spirit", description: "Practices that bring the nervous system back to calm.", points: ["Breathwork", "Sound healing", "Chakra balancing"] } }) },
    ],
  },
  {
    id: 5,
    slug: "events",
    title: "Events",
    isBuiltin: true,
    status: "published",
    lastEdited: "2026-08-11T16:45:00Z",
    langCoverage: { en: 100, hi: 30, es: 0 },
    sections: [
      { id: 501, type: "content_block", order: 1, status: "active", content: sectionContent({ en: { eyebrow: "Gather With Us", heading: "Upcoming Events", description: "Live circles, retreats and workshops." } }) },
      { id: 502, type: "event_list", order: 2, status: "active", content: sectionContent({ en: { heading: "Calendar" } }) },
    ],
  },
  {
    id: 6,
    slug: "mission",
    title: "Our Mission",
    isBuiltin: true,
    status: "draft",
    lastEdited: "2026-08-05T08:15:00Z",
    langCoverage: { en: 90, hi: 0, es: 0 },
    sections: [
      { id: 601, type: "content_block", order: 1, status: "active", content: sectionContent({ en: { eyebrow: "Why We Exist", heading: "World Peace Through Meditation", description: "One mind at a time, one breath at a time." } }) },
    ],
  },
  {
    id: 7,
    slug: "contact",
    title: "Contact",
    isBuiltin: true,
    status: "published",
    lastEdited: "2026-07-28T12:00:00Z",
    langCoverage: { en: 100, hi: 100, es: 60 },
    sections: [
      { id: 701, type: "contact_form", order: 1, status: "active", content: sectionContent({ en: { heading: "Get in Touch", description: "Questions about meditation, wellness, or events? Reach out." } }) },
    ],
  },
  {
    id: 8,
    slug: "seven-chakras-guide",
    title: "The Seven Chakras — A Guide",
    isBuiltin: false,
    status: "draft",
    lastEdited: "2026-08-13T19:10:00Z",
    langCoverage: { en: 65, hi: 0, es: 0 },
    sections: [
      { id: 801, type: "hero", order: 1, status: "active", content: sectionContent({ en: { eyebrow: "Guide", heading: "Understanding the Seven Chakras" } }) },
    ],
  },
];

export const MEDIA_FOLDERS = ["All", "About", "Events", "Meditation", "General"];

export const MEDIA = [
  { id: 1, filename: "hero-sunrise.jpg", url: "https://picsum.photos/seed/gaw1/480/320", altText: "Sunrise over mountains", sizeKb: 214, mime: "image/jpeg", folder: "General", uploadedBy: "Aanya Sharma", uploadedAt: "2026-08-10T08:00:00Z" },
  { id: 2, filename: "guru-portrait.jpg", url: "https://picsum.photos/seed/gaw2/480/320", altText: "Portrait", sizeKb: 168, mime: "image/jpeg", folder: "About", uploadedBy: "Aanya Sharma", uploadedAt: "2026-08-09T08:00:00Z" },
  { id: 3, filename: "chakra-diagram.png", url: "https://picsum.photos/seed/gaw3/480/320", altText: "Seven chakras diagram", sizeKb: 302, mime: "image/png", folder: "Meditation", uploadedBy: "Ravi Kumar", uploadedAt: "2026-08-08T08:00:00Z" },
  { id: 4, filename: "meditation-circle.jpg", url: "https://picsum.photos/seed/gaw4/480/320", altText: "Group meditation", sizeKb: 256, mime: "image/jpeg", folder: "Meditation", uploadedBy: "Ravi Kumar", uploadedAt: "2026-08-07T08:00:00Z" },
  { id: 5, filename: "retreat-2026.jpg", url: "https://picsum.photos/seed/gaw5/480/320", altText: "Retreat gathering", sizeKb: 289, mime: "image/jpeg", folder: "Events", uploadedBy: "Aanya Sharma", uploadedAt: "2026-08-05T08:00:00Z" },
  { id: 6, filename: "logo-mark.png", url: "https://picsum.photos/seed/gaw6/480/320", altText: "Logo", sizeKb: 40, mime: "image/png", folder: "General", uploadedBy: "Super Admin", uploadedAt: "2026-08-01T08:00:00Z" },
];

export const PERMISSION_GROUPS = [
  { group: "cms", label: "CMS", permissions: ["view", "create", "edit", "delete"] },
  { group: "languages", label: "Languages", permissions: ["view", "create", "edit", "delete"] },
  { group: "users", label: "Users", permissions: ["view", "create", "edit", "delete"] },
  { group: "roles", label: "Roles", permissions: ["view", "create", "edit", "delete"] },
  { group: "members", label: "Members", permissions: ["view", "assign", "edit", "delete"] },
  { group: "reports", label: "Reports", permissions: ["view"] },
  { group: "announcements", label: "Announcements", permissions: ["view", "create", "edit", "delete"] },
  { group: "broadcast", label: "Broadcast", permissions: ["view", "create", "edit", "delete"] },
  { group: "qrcode", label: "QR Codes", permissions: ["view", "generate", "delete"] },
  { group: "settings", label: "Settings", permissions: ["view", "edit"] },
];

export const ROLES = [
  { id: 1, name: "super_admin", displayName: "Super Admin", description: "Everything. Can create other admins, manage roles.", isSystem: true, permissions: "all" },
  { id: 2, name: "admin", displayName: "Admin", description: "All content + practitioner management. Cannot delete roles or other admins.", isSystem: true, permissions: ["cms.*", "languages.*", "members.*", "reports.view", "announcements.*", "broadcast.*", "qrcode.*", "settings.view"] },
  { id: 3, name: "content_manager", displayName: "Content Manager", description: "CMS only (pages, media, languages, broadcast). No user management.", isSystem: true, permissions: ["cms.*", "languages.*", "broadcast.*"] },
  { id: 4, name: "practitioner", displayName: "Practitioner", description: "Own dashboard only: assigned members, journey notes, announcements.", isSystem: true, permissions: ["members.view", "members.edit"] },
  { id: 5, name: "editor", displayName: "Editor", description: "Custom role — content editing without publish rights.", isSystem: false, permissions: ["cms.view", "cms.edit"] },
];

export const USERS = [
  { id: 1, name: "Aanya Sharma", email: "aanya@goldenagewisdom.org", role: "super_admin", status: "active", membersAssigned: 0, lastLogin: "2026-08-14T07:30:00Z", createdAt: "2025-01-10T00:00:00Z" },
  { id: 2, name: "Devika Rao", email: "devika@goldenagewisdom.org", role: "content_manager", status: "active", membersAssigned: 0, lastLogin: "2026-08-13T18:12:00Z", createdAt: "2025-03-22T00:00:00Z" },
  { id: 3, name: "Ravi Kumar", email: "ravi@goldenagewisdom.org", role: "practitioner", status: "active", membersAssigned: 14, lastLogin: "2026-08-14T06:05:00Z", createdAt: "2025-05-02T00:00:00Z", specialty: "Kundalini & Breathwork", bio: "Guides seekers through kundalini activation and pranayama.", capacity: 20 },
  { id: 4, name: "Meera Iyer", email: "meera@goldenagewisdom.org", role: "practitioner", status: "active", membersAssigned: 9, lastLogin: "2026-08-12T09:44:00Z", createdAt: "2025-06-18T00:00:00Z", specialty: "Sound Healing", bio: "Uses Tibetan bowls and mantra for nervous-system reset.", capacity: 15 },
  { id: 5, name: "Karan Patel", email: "karan@goldenagewisdom.org", role: "practitioner", status: "inactive", membersAssigned: 3, lastLogin: "2026-07-30T12:00:00Z", createdAt: "2025-08-11T00:00:00Z", specialty: "General Wellness", bio: "Supports newcomers with grounding practices.", capacity: 10 },
];

export const CURRENT_PRACTITIONER_ID = 3;

/** Category dropdown shown on the public contact form; keys stay stable, labels are display-only. */
export const CATEGORY_LABELS = {
  meditation: "Meditation doubts",
  kundalini: "Kundalini activation",
  health: "Health",
  general: "Other problem",
};
export const CATEGORIES = Object.keys(CATEGORY_LABELS);

export const QUERIES = [
  { id: 1, name: "Sofia Mendes", email: "sofia.m@example.com", phone: "+1 555 0118", category: "meditation", message: "I'd love guidance on starting a daily meditation habit — mornings feel impossible right now.", submittedAt: "2026-08-14T05:12:00Z", status: "new", assignedTo: null },
  { id: 2, name: "Daniel Osei", email: "daniel.o@example.com", phone: "+1 555 0142", category: "kundalini", message: "Experiencing strong energy sensations after last week's session, would like to talk it through.", submittedAt: "2026-08-13T21:40:00Z", status: "assigned", assignedTo: 3 },
  { id: 3, name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 98765 43210", category: "health", message: "Looking for breathwork practices to help with chronic stress and sleep.", submittedAt: "2026-08-13T14:02:00Z", status: "in_progress", assignedTo: 4 },
  { id: 4, name: "Tom Fischer", email: "tom.f@example.com", phone: "+49 176 1234567", category: "general", message: "Is the retreat in October still happening, and is it open to beginners?", submittedAt: "2026-08-12T09:20:00Z", status: "resolved", assignedTo: 2 },
  { id: 5, name: "Layla Haddad", email: "layla.h@example.com", phone: "+971 50 123 4567", category: "meditation", message: "Would like a one-on-one consultation about chakra imbalance.", submittedAt: "2026-08-11T17:55:00Z", status: "archived", assignedTo: 4 },
  { id: 6, name: "Marcus Webb", email: "marcus.w@example.com", phone: "+1 555 0177", category: "kundalini", message: "Interested in the certified instructor program mentioned on the About page.", submittedAt: "2026-08-10T11:30:00Z", status: "new", assignedTo: null },
  { id: 7, name: "Hana Kobayashi", email: "hana.k@example.com", phone: "+81 90 1234 5678", category: "health", message: "Any recommendations for sound healing sessions near online timezone GMT+9?", submittedAt: "2026-08-09T03:15:00Z", status: "assigned", assignedTo: 3 },
];

export const MEMBERS = [
  { id: 1, name: "Daniel Osei", email: "daniel.o@example.com", phone: "+1 555 0142", assignedPractitioner: 3, category: "kundalini", joinDate: "2026-08-13", lastContact: "2026-08-14", status: "in_progress", sourceQueryId: 2, summary: "Strong energy sensations after group sessions — mostly normal activation symptoms. Responds well to grounding breathwork; keep sessions short until integration settles." },
  { id: 2, name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 98765 43210", assignedPractitioner: 4, category: "health", joinDate: "2026-08-13", lastContact: "2026-08-13", status: "active", sourceQueryId: 3, summary: "Chronic stress and poor sleep. Box breathing homework is working — reported better sleep after two nights." },
  { id: 3, name: "Hana Kobayashi", email: "hana.k@example.com", phone: "+81 90 1234 5678", assignedPractitioner: 3, category: "health", joinDate: "2026-08-09", lastContact: "2026-08-11", status: "active", sourceQueryId: 7, summary: "" },
  { id: 4, name: "Layla Haddad", email: "layla.h@example.com", phone: "+971 50 123 4567", assignedPractitioner: 4, category: "meditation", joinDate: "2026-07-20", lastContact: "2026-08-05", status: "resolved", sourceQueryId: 5, summary: "" },
  { id: 5, name: "Oliver Bennett", email: "oliver.b@example.com", phone: "+44 7700 900123", assignedPractitioner: 5, category: "general", joinDate: "2026-06-14", lastContact: "2026-07-01", status: "archived", sourceQueryId: null, summary: "" },
  { id: 6, name: "Nia Thompson", email: "nia.t@example.com", phone: "+1 555 0199", assignedPractitioner: 3, category: "meditation", joinDate: "2026-08-01", lastContact: "2026-08-10", status: "active", sourceQueryId: null, summary: "" },
];

export const JOURNEYS = {
  1: [
    { id: 1, date: "2026-08-13T21:45:00Z", type: "status_change", content: "Converted from query to member.", addedBy: "Aanya Sharma" },
    { id: 2, date: "2026-08-14T08:00:00Z", type: "note", content: "First call scheduled for tomorrow evening. Reported strong energy surges after group session — reassured this is common during activation.", addedBy: "Ravi Kumar" },
    { id: 3, date: "2026-08-14T09:15:00Z", type: "qa", question: "Is it normal to feel dizzy and warm during the group meditation?", answer: "Yes — that's typically energy moving through the crown and third-eye centers during activation. Ground afterward with a few minutes of slow belly breathing and skip caffeine before sessions.", addedBy: "Ravi Kumar" },
  ],
  2: [
    { id: 1, date: "2026-08-13T14:30:00Z", type: "status_change", content: "Converted from query to member.", addedBy: "Aanya Sharma" },
    { id: 2, date: "2026-08-13T16:00:00Z", type: "session_completed", content: "Completed intro breathwork session — 45 min, focused on box breathing for sleep.", addedBy: "Meera Iyer" },
    { id: 3, date: "2026-08-14T09:00:00Z", type: "note", content: "Reported better sleep after two nights of practice.", addedBy: "Meera Iyer" },
  ],
  3: [
    { id: 1, date: "2026-08-09T04:00:00Z", type: "status_change", content: "Converted from query to member.", addedBy: "Devika Rao" },
    { id: 2, date: "2026-08-11T10:00:00Z", type: "message_sent", content: "Sent recommended sound-healing session recordings for GMT+9 timezone.", addedBy: "Ravi Kumar" },
  ],
};

export const ANNOUNCEMENTS = [
  { id: 1, title: "New journey note template", body: "<p>Please use the updated journey note template for all new member entries starting this week.</p>", type: "info", target: "role:practitioner", sentOn: "2026-08-12T09:00:00Z", readCount: 3, totalRecipients: 3, priority: "normal" },
  { id: 2, title: "Scheduled maintenance Aug 16", body: "<p>The admin panel will be briefly unavailable on Aug 16, 2–3am IST for maintenance.</p>", type: "warning", target: "all", sentOn: "2026-08-11T15:00:00Z", readCount: 4, totalRecipients: 5, priority: "urgent" },
  { id: 3, title: "Welcome Karan Patel", body: "<p>Please welcome Karan Patel, our newest wellness practitioner.</p>", type: "info", target: "all", sentOn: "2026-08-05T10:00:00Z", readCount: 5, totalRecipients: 5, priority: "normal" },
];

export const BROADCASTS = [
  { id: 1, title: "October Retreat — Early Bird", type: "popup_card", content: "Save 20% on the October Himalayan retreat, ends this week.", cta: { label: "Reserve a spot", url: "/events" }, targetPages: ["home", "events"], audience: "all", scheduleFrom: "2026-08-10", scheduleUntil: "2026-08-20", showAfterSeconds: 4, frequency: "once_per_session", status: "active" },
  { id: 2, title: "New live session banner", type: "text_banner", content: "Daily meditation is live now — join the circle.", cta: { label: "Join now", url: "#meditate-now" }, targetPages: ["home", "meditate"], audience: "returning", scheduleFrom: "2026-08-01", scheduleUntil: "2026-09-01", showAfterSeconds: 0, frequency: "every_visit", status: "active" },
  { id: 3, title: "Chakra guide launch", type: "media_popup", content: "Our new Seven Chakras guide is live.", cta: { label: "Read the guide", url: "/seven-chakras-guide" }, targetPages: ["home"], audience: "new_visitors", scheduleFrom: "2026-08-15", scheduleUntil: "2026-08-30", showAfterSeconds: 8, frequency: "once_ever", status: "draft" },
  { id: 4, title: "Ticker — new member cap", type: "news_ticker", content: "Registrations for the November batch close soon · Book your spot today", cta: null, targetPages: ["home"], audience: "all", scheduleFrom: "2026-07-01", scheduleUntil: "2026-07-31", showAfterSeconds: 0, frequency: "every_visit", status: "expired" },
];

export const QR_CODES = [
  { id: 1, title: "Homepage link", type: "url", inputData: { url: "https://goldenagewisdom.org" }, fg: "#111827", bg: "#FFFFFF", createdAt: "2026-08-10T00:00:00Z", downloads: 34 },
  { id: 2, title: "WhatsApp support", type: "phone", inputData: { phone: "+1 555 0100" }, fg: "#6C63FF", bg: "#FFFFFF", createdAt: "2026-08-05T00:00:00Z", downloads: 12 },
  { id: 3, title: "Retreat flyer vCard", type: "vcard", inputData: { name: "Aanya Sharma", email: "aanya@goldenagewisdom.org", phone: "+1 555 0142", address: "", website: "goldenagewisdom.org" }, fg: "#10B981", bg: "#FFFFFF", createdAt: "2026-07-22T00:00:00Z", downloads: 8 },
  { id: 4, title: "Studio WiFi", type: "wifi", inputData: { ssid: "GAW-Studio", password: "om-shanti-108", encryption: "WPA" }, fg: "#F59E0B", bg: "#FFFFFF", createdAt: "2026-07-15T00:00:00Z", downloads: 5 },
];

export const ACTIVITY_LOG = [
  { id: 1, user: "Aanya Sharma", action: "published page", target: "about", ip: "203.0.113.14", timestamp: "2026-08-14T08:15:00Z" },
  { id: 2, user: "Ravi Kumar", action: "added journey note", target: "Daniel Osei", ip: "198.51.100.22", timestamp: "2026-08-14T08:00:00Z" },
  { id: 3, user: "Devika Rao", action: "uploaded media", target: "chakra-diagram.png", ip: "203.0.113.9", timestamp: "2026-08-13T19:10:00Z" },
  { id: 4, user: "Aanya Sharma", action: "assigned query", target: "Hana Kobayashi → Ravi Kumar", ip: "203.0.113.14", timestamp: "2026-08-13T09:32:00Z" },
  { id: 5, user: "Meera Iyer", action: "completed session", target: "Priya Nair", ip: "192.0.2.44", timestamp: "2026-08-13T16:00:00Z" },
  { id: 6, user: "Devika Rao", action: "created broadcast", target: "October Retreat — Early Bird", ip: "203.0.113.9", timestamp: "2026-08-10T11:12:00Z" },
  { id: 7, user: "Aanya Sharma", action: "created role", target: "editor", ip: "203.0.113.14", timestamp: "2026-08-04T10:00:00Z" },
];

export const REPORTS = {
  submissionsTotal: 214,
  submissionsMonthly: [
    { month: "Mar", count: 22 }, { month: "Apr", count: 28 }, { month: "May", count: 19 },
    { month: "Jun", count: 31 }, { month: "Jul", count: 40 }, { month: "Aug", count: 27 },
  ],
  byCategory: [
    { category: "meditation", count: 78 }, { category: "kundalini", count: 46 },
    { category: "health", count: 55 }, { category: "general", count: 35 },
  ],
  membersByPractitioner: [
    { name: "Ravi Kumar", members: 14 }, { name: "Meera Iyer", members: 9 },
    { name: "Karan Patel", members: 3 }, { name: "Devika Rao", members: 2 },
  ],
  statusBreakdown: [
    { status: "active", count: 3 }, { status: "in_progress", count: 1 },
    { status: "resolved", count: 1 }, { status: "archived", count: 1 },
  ],
  newVsResolvedMonthly: [
    { month: "Mar", new: 18, resolved: 12 }, { month: "Apr", new: 22, resolved: 20 },
    { month: "May", new: 15, resolved: 17 }, { month: "Jun", new: 27, resolved: 24 },
    { month: "Jul", new: 33, resolved: 30 }, { month: "Aug", new: 21, resolved: 16 },
  ],
  practitionerWorkload: [
    { name: "Ravi Kumar", members: 14, capacity: 20, resolvedThisMonth: 6 },
    { name: "Meera Iyer", members: 9, capacity: 15, resolvedThisMonth: 4 },
    { name: "Karan Patel", members: 3, capacity: 10, resolvedThisMonth: 1 },
  ],
};

export const SETTINGS = {
  general: { siteName: "Golden Age Wisdom", tagline: "World peace through meditation", adminEmail: "admin@goldenagewisdom.org", defaultLanguage: "en", timezone: "Asia/Kolkata" },
  social: { youtube: "https://youtube.com/@goldenagewisdom", instagram: "https://instagram.com/goldenagewisdom", facebook: "https://facebook.com/goldenagewisdom", whatsapp: "+1 555 0100", phone: "+1 555 0100", address: "108 Serenity Lane, Rishikesh, India" },
  banner: { enabled: true, text: "Daily meditation is live now — join the circle.", ctaLabel: "Join now", ctaUrl: "#meditate-now" },
  maintenance: { enabled: false, message: "We'll be back shortly — thank you for your patience.", allowedIps: "203.0.113.14" },
  appearance: { logoUrl: "", faviconUrl: "" },
  email: { smtpHost: "smtp.mailgun.org", smtpPort: 587, smtpUser: "postmaster@goldenagewisdom.org", notifyOnSubmission: true },
  advanced: { storageUsedMb: 842, storageLimitMb: 5120, appVersion: "0.4.0-preview" },
};

export const MUSIC_CATEGORIES = ["meditation", "chanting", "nature", "sleep", "instrumental"];

export const MUSIC_TRACKS = [
  {
    id: 1, title: "Om Chanting — 108 Repetitions", artist: "Dr. Hari Krishna", category: "chanting",
    description: "Traditional Om chant recorded live during the Sunday circle.",
    coverUrl: "https://picsum.photos/seed/gawmusic1/200/200", fileUrl: "", durationSec: 723,
    status: "published", order: 1, uploadedAt: "2026-08-10T08:00:00Z",
  },
  {
    id: 2, title: "Twenty Minute Body Scan", artist: "Ravi Kumar", category: "meditation",
    description: "A slow guided body scan for beginners — good for the daily evening sit.",
    coverUrl: "https://picsum.photos/seed/gawmusic2/200/200", fileUrl: "", durationSec: 1204,
    status: "published", order: 2, uploadedAt: "2026-08-08T08:00:00Z",
  },
  {
    id: 3, title: "Himalayan Stream (Ambient)", artist: "Field recording", category: "nature",
    description: "Unedited stream recording from the Rishikesh retreat, good for background focus.",
    coverUrl: "https://picsum.photos/seed/gawmusic3/200/200", fileUrl: "", durationSec: 1800,
    status: "draft", order: 3, uploadedAt: "2026-08-05T08:00:00Z",
  },
];

export const TESTIMONIALS = [
  {
    id: 1, name: "Sofia Mendes", role: "Practitioner, 2 years", photoUrl: "https://picsum.photos/seed/gawtest1/160/160",
    quote: "The daily meditation circle changed how I start my mornings — calmer, clearer, and genuinely looking forward to the sit instead of dreading it.",
    rating: 5, status: "published", featured: true, order: 1,
  },
  {
    id: 2, name: "Daniel Osei", role: "Kundalini student", photoUrl: "",
    quote: "My practitioner guided me through some intense energy sensations after group sessions — having someone to check in with made all the difference.",
    rating: 5, status: "published", featured: true, order: 2,
  },
  {
    id: 3, name: "Priya Nair", role: "Wellness member", photoUrl: "https://picsum.photos/seed/gawtest3/160/160",
    quote: "Breathwork homework from my first call actually fixed my sleep within two nights. Wasn't expecting results that fast.",
    rating: 4, status: "draft", featured: false, order: 3,
  },
];

export const DASHBOARD_TRENDS = {
  pages: [4, 5, 5, 6, 7, 8, 8],
  media: [40, 42, 44, 44, 45, 46, 46],
  queries: [3, 5, 2, 6, 4, 7, 3],
  members: [2, 3, 3, 4, 5, 5, 6],
};

export const CONTACT_CHANNEL_TYPES = [
  { type: "phone", label: "Phone" },
  { type: "whatsapp", label: "WhatsApp" },
  { type: "email", label: "Email" },
  { type: "address", label: "Address" },
  { type: "website", label: "Website" },
  { type: "social", label: "Social link" },
];

export const CONTACT_CHANNELS = [
  { id: 1, type: "phone", label: "Call us", value: "+1 555 0100", order: 1, visible: true },
  { id: 2, type: "whatsapp", label: "WhatsApp support", value: "+1 555 0100", order: 2, visible: true },
  { id: 3, type: "email", label: "General inquiries", value: "admin@goldenagewisdom.org", order: 3, visible: true },
  { id: 4, type: "address", label: "Studio", value: "108 Serenity Lane, Rishikesh, India", order: 4, visible: true },
  { id: 5, type: "social", label: "Instagram", value: "https://instagram.com/goldenagewisdom", order: 5, visible: true },
  { id: 6, type: "social", label: "YouTube", value: "https://youtube.com/@goldenagewisdom", order: 6, visible: false },
];

export const DONATION_METHODS = [
  {
    id: 1,
    label: "Bank Transfer — India",
    accountHolder: "Golden Age Wisdom Trust",
    bankName: "State Bank of India",
    accountNumber: "1234567890123",
    ifsc: "SBIN0001234",
    branch: "Rishikesh Main",
    swift: "SBININBB104",
    upiId: "goldenagewisdom@sbi",
    payoutLink: "",
    qrImageUrl: "",
    notes: "Preferred for domestic donors. Please email the receipt for a tax exemption certificate.",
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    label: "International — PayPal",
    accountHolder: "Golden Age Wisdom",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    swift: "",
    upiId: "",
    payoutLink: "https://paypal.me/goldenagewisdom",
    qrImageUrl: "",
    notes: "For donors outside India — no bank fees on our end.",
    isActive: true,
    order: 2,
  },
];
