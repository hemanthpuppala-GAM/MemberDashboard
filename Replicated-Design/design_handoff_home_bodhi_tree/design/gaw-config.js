/* Golden Age Wisdom — roles, privacy and telemetry configuration.
   Edit ONLY this file to change who can reach the admin panel.
   Front-end gating is convenience, not security: the Laravel backend must
   re-check every role server-side before returning member data. */
window.GAW_CONFIG = {
  // Highest privilege: full member management, cleanup, telemetry.
  superAdminEmails: [
    'gamadmin@gmail.com',
  ],
  // Day-to-day moderation: member list + profile cleanup, no telemetry.
  adminEmails: [],

  // Preview mode would let ANY signed-in member grant themselves a role locally.
  // It stays OFF: the panel is reachable only by the emails listed above,
  // after a real OAuth sign-in.
  previewMode: false,

  // Telemetry retention (days) kept in the browser until the backend takes over.
  telemetryRetentionDays: 90,

  // Official email for everything public: privacy, support cc, receipts, chatbot fallback.
  officialEmail: 'goldenageguruteachings@gmail.com',
  privacyEmail: 'goldenageguruteachings@gmail.com',

  /* ── FRONT-LINE SUPPORT ───────────────────────────────────────
     Two people answer first and route to volunteers. WhatsApp lets a site
     send to only one number, so every web/QR message goes to `web`;
     `primary` is the published call/message line. */
  support: {
    primary: { e164: '917396112111', display: '+91 7396 112 111' },
    web:     { e164: '917396119111', display: '+91 7396 119 111' },
  },

  // Real Google OAuth for 'Continue with Google' (Google Cloud Console client ID).
  googleClientId: '927688395054-3b3praeptn0muruff5v90hr5t6n121lk.apps.googleusercontent.com',

  /* ── MEMBER NUMBERING ─────────────────────────────────────────
     The roster is authoritative. Any email listed here gets exactly that
     number on every device, overriding whatever their browser handed out
     during testing. Add people in the order they first signed in.
     Bump `epoch` to wipe every unlisted test number remotely — each browser
     drops its provisional number on the next visit and takes a fresh one. */
  numbering: {
    epoch: 2,
    start: 100001,
    roster: [
      // ✏️ Guruji first, then the core team in their real sign-in order.
      // `fixed` = a ceremonial number outside the running sequence.
      // Leave his email blank until he seals — the ceremony records the real one.
      { n: 111111, name: 'Dr. Hari Krishna', email: '', fixed: true },
      { n: 100001, name: 'Hemanth Puppala', email: 'hemanthpuppala@gmail.com' },
      // { n: 100002, name: '', email: '' },
    ],
  },

  /* ── SOFT LAUNCH ──────────────────────────────────────────────
     Edit the two ✏️ lines before the ceremony. Everything else follows. */
  launch: {
    // ✏️ Launch moment, IST. Format: YYYY-MM-DDTHH:MM:SS+05:30
    at: '2026-07-29T18:20:00+05:30',
    // Seats 1–11 are the core team; the room starts at 12.
    coreSeats: 11,
    foundingSeats: 108,
    reserved: [
      // Email left blank on purpose: the first person to seal during the
      // ceremony takes GAW-111111, and the address they use is recorded for good.
      // Put a real address here instead if you want the seat locked to it.
      { n: 111111, name: 'Dr. Hari Krishna', email: '', role: 'Founder' },
      { n: 100001, name: 'Hemanth Puppala', email: 'hemanthpuppala@gmail.com', role: 'Core team' },
    ],
    /* ✏️ The eleven who built this. They appear on the launch page as a row of
       lamps flanking the founder's seat, and light up one by one when the
       ribbon is cut. Add a name and the lamp appears; leave the line out and
       nothing is shown. `craft` is the two or three words under the name. */
    team: [
      { name: 'Lakshmi Durga', craft: '' },
      { name: 'Nikhila', craft: '' },
      { name: 'Prasad', craft: '' },
      { name: 'Vamshi', craft: '' },
      { name: 'Aruna', craft: '' },
      { name: 'Ravinder', craft: '' },
      { name: 'Kullai', craft: '' },
      { name: 'Himaja', craft: '' },
      { name: 'Saichand', craft: '' },
      { name: 'Hemanth Puppala', craft: '' },
    ],
  },
};

window.GAW_ROLE = function (email) {
  const c = window.GAW_CONFIG, e = String(email || '').trim().toLowerCase();
  if (c.superAdminEmails.some(x => x.toLowerCase() === e)) return 'super_admin';
  if (c.adminEmails.some(x => x.toLowerCase() === e)) return 'admin';
  if (c.previewMode) {
    try {
      const o = localStorage.getItem('gaw_role_preview');
      if (o === 'super_admin' || o === 'admin') return o;
    } catch (err) {}
  }
  return 'member';
};

/* The number an email is entitled to, or null if it isn't on the roster. */
window.GAW_ROSTER_ID = function (email) {
  const n = (window.GAW_CONFIG.numbering || {}), e = String(email || '').trim().toLowerCase();
  if (!e) return null;
  const hit = (n.roster || []).find(r => {
    const re = String(r.email || '').trim().toLowerCase();
    return re && re === e;
  });
  return hit ? 'GAW-' + hit.n : null;
};
