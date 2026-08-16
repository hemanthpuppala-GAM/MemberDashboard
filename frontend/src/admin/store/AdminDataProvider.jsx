import { useCallback, useMemo, useState } from "react";
import { AdminDataContext } from "./adminDataContextInstance";
import {
  PAGES, MEDIA, LANGUAGES, ROLES, USERS, QUERIES, MEMBERS, JOURNEYS,
  ANNOUNCEMENTS, BROADCASTS, QR_CODES, SETTINGS, CONTACT_CHANNELS, DONATION_METHODS,
  MUSIC_TRACKS, TESTIMONIALS,
} from "../mock/mockData";

let idCounter = 10000;
const nextId = () => ++idCounter;

/**
 * In-memory store standing in for the future Laravel API (ADMIN_PANEL_PLAN.md §12).
 * Seeded from mock/mockData.js; every CRUD helper below is the frontend-only
 * shape of what will become a real fetch() call once the backend exists.
 */
export function AdminDataProvider({ children }) {
  const [pages, setPages] = useState(PAGES);
  const [media, setMedia] = useState(MEDIA);
  const [languages, setLanguages] = useState(LANGUAGES);
  const [roles, setRoles] = useState(ROLES);
  const [users, setUsers] = useState(USERS);
  const [queries, setQueries] = useState(QUERIES);
  const [members, setMembers] = useState(MEMBERS);
  const [journeys, setJourneys] = useState(JOURNEYS);
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS);
  const [broadcasts, setBroadcasts] = useState(BROADCASTS);
  const [qrCodes, setQrCodes] = useState(QR_CODES);
  const [settings, setSettings] = useState(SETTINGS);
  const [contactChannels, setContactChannels] = useState(CONTACT_CHANNELS);
  const [donationMethods, setDonationMethods] = useState(DONATION_METHODS);
  const [musicTracks, setMusicTracks] = useState(MUSIC_TRACKS);
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);

  // ---- Pages / Sections ----
  const addPage = useCallback((page) => {
    const created = { id: nextId(), status: "draft", isBuiltin: false, sections: [], lastEdited: new Date().toISOString(), langCoverage: {}, ...page };
    setPages((prev) => [...prev, created]);
    return created;
  }, []);
  const updatePage = useCallback((id, patch) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, lastEdited: new Date().toISOString() } : p)));
  }, []);
  const deletePage = useCallback((id) => setPages((prev) => prev.filter((p) => p.id !== id)), []);

  const addSection = useCallback((pageId, section) => {
    const created = { id: nextId(), status: "active", content: { en: {}, hi: {}, es: {} }, ...section };
    setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, sections: [...p.sections, created], lastEdited: new Date().toISOString() } : p)));
    return created;
  }, []);
  const updateSection = useCallback((pageId, sectionId, patch) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? { ...p, sections: p.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)), lastEdited: new Date().toISOString() }
          : p
      )
    );
  }, []);
  const deleteSection = useCallback((pageId, sectionId) => {
    setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId) } : p)));
  }, []);
  const reorderSections = useCallback((pageId, orderedIds) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        const bySection = new Map(p.sections.map((s) => [s.id, s]));
        return { ...p, sections: orderedIds.map((id, i) => ({ ...bySection.get(id), order: i + 1 })) };
      })
    );
  }, []);
  const updateSectionContent = useCallback((pageId, sectionId, lang, patch) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? {
              ...p,
              sections: p.sections.map((s) =>
                s.id === sectionId ? { ...s, content: { ...s.content, [lang]: { ...s.content[lang], ...patch } } } : s
              ),
              lastEdited: new Date().toISOString(),
            }
          : p
      )
    );
  }, []);

  // ---- Media ----
  const addMedia = useCallback((item) => {
    const created = { id: nextId(), uploadedAt: new Date().toISOString(), uploadedBy: "You", ...item };
    setMedia((prev) => [created, ...prev]);
    return created;
  }, []);
  const updateMedia = useCallback((id, patch) => setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))), []);
  const deleteMedia = useCallback((id) => setMedia((prev) => prev.filter((m) => m.id !== id)), []);

  // ---- Languages ----
  const addLanguage = useCallback((lang) => {
    const created = { enabled: true, isDefault: false, completeness: 0, ...lang };
    setLanguages((prev) => [...prev, created]);
    return created;
  }, []);
  const updateLanguage = useCallback((code, patch) => setLanguages((prev) => prev.map((l) => (l.code === code ? { ...l, ...patch } : l))), []);
  const deleteLanguage = useCallback((code) => setLanguages((prev) => prev.filter((l) => l.code !== code)), []);

  // ---- Roles ----
  const addRole = useCallback((role) => {
    const created = { id: nextId(), isSystem: false, permissions: [], ...role };
    setRoles((prev) => [...prev, created]);
    return created;
  }, []);
  const updateRole = useCallback((id, patch) => setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))), []);
  const deleteRole = useCallback((id) => setRoles((prev) => prev.filter((r) => r.id !== id)), []);

  // ---- Users ----
  const addUser = useCallback((user) => {
    const created = { id: nextId(), status: "active", membersAssigned: 0, createdAt: new Date().toISOString(), lastLogin: null, ...user };
    setUsers((prev) => [...prev, created]);
    return created;
  }, []);
  const updateUser = useCallback((id, patch) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u))), []);
  const deleteUser = useCallback((id) => setUsers((prev) => prev.filter((u) => u.id !== id)), []);

  // ---- Queries ----
  const updateQuery = useCallback((id, patch) => setQueries((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q))), []);
  const convertToMember = useCallback(
    (queryId) => {
      const q = queries.find((x) => x.id === queryId);
      if (!q) return null;
      const created = {
        id: nextId(), name: q.name, email: q.email, phone: q.phone ?? "", assignedPractitioner: q.assignedTo,
        category: q.category, joinDate: new Date().toISOString().slice(0, 10), lastContact: new Date().toISOString().slice(0, 10),
        status: "active", sourceQueryId: q.id, summary: "",
      };
      setMembers((prev) => [...prev, created]);
      setJourneys((prev) => ({
        ...prev,
        [created.id]: [
          { id: nextId(), date: new Date().toISOString(), type: "status_change", content: "Converted from query to member.", addedBy: "You" },
          { id: nextId(), date: new Date().toISOString(), type: "note", content: `Original query: "${q.message}"`, addedBy: "System" },
        ],
      }));
      updateQuery(queryId, { status: "resolved" });
      return created;
    },
    [queries, updateQuery]
  );

  // ---- Members / Journeys ----
  const addMember = useCallback((member) => {
    const created = { id: nextId(), status: "new", joinDate: new Date().toISOString().slice(0, 10), lastContact: new Date().toISOString().slice(0, 10), sourceQueryId: null, summary: "", ...member };
    setMembers((prev) => [...prev, created]);
    return created;
  }, []);
  const updateMember = useCallback((id, patch) => setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))), []);
  const deleteMember = useCallback((id) => setMembers((prev) => prev.filter((m) => m.id !== id)), []);
  const addJourneyEntry = useCallback((memberId, entry) => {
    const created = { id: nextId(), date: new Date().toISOString(), ...entry };
    setJourneys((prev) => ({ ...prev, [memberId]: [...(prev[memberId] || []), created] }));
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, lastContact: new Date().toISOString().slice(0, 10) } : m)));
    return created;
  }, []);

  // ---- Announcements ----
  const addAnnouncement = useCallback((a) => {
    const created = { id: nextId(), sentOn: new Date().toISOString(), readCount: 0, totalRecipients: users.length, ...a };
    setAnnouncements((prev) => [created, ...prev]);
    return created;
  }, [users.length]);
  const updateAnnouncement = useCallback((id, patch) => setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))), []);
  const deleteAnnouncement = useCallback((id) => setAnnouncements((prev) => prev.filter((a) => a.id !== id)), []);

  // ---- Broadcasts ----
  const addBroadcast = useCallback((b) => {
    const created = { id: nextId(), status: "draft", ...b };
    setBroadcasts((prev) => [created, ...prev]);
    return created;
  }, []);
  const updateBroadcast = useCallback((id, patch) => setBroadcasts((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b))), []);
  const deleteBroadcast = useCallback((id) => setBroadcasts((prev) => prev.filter((b) => b.id !== id)), []);

  // ---- QR codes ----
  const addQrCode = useCallback((qr) => {
    const created = { id: nextId(), createdAt: new Date().toISOString(), downloads: 0, ...qr };
    setQrCodes((prev) => [created, ...prev]);
    return created;
  }, []);
  const deleteQrCode = useCallback((id) => setQrCodes((prev) => prev.filter((q) => q.id !== id)), []);
  const bumpQrDownload = useCallback((id) => setQrCodes((prev) => prev.map((q) => (q.id === id ? { ...q, downloads: q.downloads + 1 } : q))), []);

  // ---- Settings ----
  const updateSettingsGroup = useCallback((group, patch) => setSettings((prev) => ({ ...prev, [group]: { ...prev[group], ...patch } })), []);

  // ---- Contact channels (public Contact page) ----
  const addContactChannel = useCallback((channel) => {
    setContactChannels((prev) => {
      const created = { id: nextId(), visible: true, order: prev.length + 1, ...channel };
      return [...prev, created];
    });
  }, []);
  const updateContactChannel = useCallback((id, patch) => setContactChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))), []);
  const deleteContactChannel = useCallback((id) => setContactChannels((prev) => prev.filter((c) => c.id !== id)), []);
  const reorderContactChannel = useCallback((id, direction) => {
    setContactChannels((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((c) => c.id === id);
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return prev;
      const orders = sorted.map((c) => c.order);
      [orders[idx], orders[swapWith]] = [orders[swapWith], orders[idx]];
      return sorted.map((c, i) => ({ ...c, order: orders[i] }));
    });
  }, []);

  // ---- Donation methods ----
  const addDonationMethod = useCallback((method) => {
    const created = { id: nextId(), isActive: true, order: donationMethods.length + 1, ...method };
    setDonationMethods((prev) => [...prev, created]);
    return created;
  }, [donationMethods.length]);
  const updateDonationMethod = useCallback((id, patch) => setDonationMethods((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d))), []);
  const deleteDonationMethod = useCallback((id) => setDonationMethods((prev) => prev.filter((d) => d.id !== id)), []);

  // ---- Music tracks ----
  const addMusicTrack = useCallback((track) => {
    setMusicTracks((prev) => {
      const created = { id: nextId(), status: "draft", order: prev.length + 1, uploadedAt: new Date().toISOString(), ...track };
      return [...prev, created];
    });
  }, []);
  const updateMusicTrack = useCallback((id, patch) => setMusicTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))), []);
  const deleteMusicTrack = useCallback((id) => setMusicTracks((prev) => prev.filter((t) => t.id !== id)), []);
  const reorderMusicTrack = useCallback((id, direction) => {
    setMusicTracks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((t) => t.id === id);
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return prev;
      const orders = sorted.map((t) => t.order);
      [orders[idx], orders[swapWith]] = [orders[swapWith], orders[idx]];
      return sorted.map((t, i) => ({ ...t, order: orders[i] }));
    });
  }, []);

  // ---- Testimonials ----
  const addTestimonial = useCallback((testimonial) => {
    setTestimonials((prev) => {
      const created = { id: nextId(), status: "draft", featured: false, order: prev.length + 1, ...testimonial };
      return [...prev, created];
    });
  }, []);
  const updateTestimonial = useCallback((id, patch) => setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))), []);
  const deleteTestimonial = useCallback((id) => setTestimonials((prev) => prev.filter((t) => t.id !== id)), []);

  const value = useMemo(
    () => ({
      pages, addPage, updatePage, deletePage, addSection, updateSection, deleteSection, reorderSections, updateSectionContent,
      media, addMedia, updateMedia, deleteMedia,
      languages, addLanguage, updateLanguage, deleteLanguage,
      roles, addRole, updateRole, deleteRole,
      users, addUser, updateUser, deleteUser,
      queries, updateQuery, convertToMember,
      members, addMember, updateMember, deleteMember,
      journeys, addJourneyEntry,
      announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
      broadcasts, addBroadcast, updateBroadcast, deleteBroadcast,
      qrCodes, addQrCode, deleteQrCode, bumpQrDownload,
      settings, updateSettingsGroup,
      contactChannels, addContactChannel, updateContactChannel, deleteContactChannel, reorderContactChannel,
      donationMethods, addDonationMethod, updateDonationMethod, deleteDonationMethod,
      musicTracks, addMusicTrack, updateMusicTrack, deleteMusicTrack, reorderMusicTrack,
      testimonials, addTestimonial, updateTestimonial, deleteTestimonial,
    }),
    [
      pages, addPage, updatePage, deletePage, addSection, updateSection, deleteSection, reorderSections, updateSectionContent,
      media, addMedia, updateMedia, deleteMedia,
      languages, addLanguage, updateLanguage, deleteLanguage,
      roles, addRole, updateRole, deleteRole,
      users, addUser, updateUser, deleteUser,
      queries, updateQuery, convertToMember,
      members, addMember, updateMember, deleteMember,
      journeys, addJourneyEntry,
      announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
      broadcasts, addBroadcast, updateBroadcast, deleteBroadcast,
      qrCodes, addQrCode, deleteQrCode, bumpQrDownload,
      settings, updateSettingsGroup,
      contactChannels, addContactChannel, updateContactChannel, deleteContactChannel, reorderContactChannel,
      donationMethods, addDonationMethod, updateDonationMethod, deleteDonationMethod,
      musicTracks, addMusicTrack, updateMusicTrack, deleteMusicTrack, reorderMusicTrack,
      testimonials, addTestimonial, updateTestimonial, deleteTestimonial,
    ]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
