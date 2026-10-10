import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMemberBadge } from "../useMemberBadge";
import { siteAsset } from "../siteAssets";
import { OFFICIAL_EMAIL } from "../sitePages";
import "./privacy.css";

/* Privacy.dc.html uses its own dark, standalone layout (Marcellus + Outfit, brand row) —
   not the shared site header — so this page does not render SiteHeader. */

const RETENTION_DAYS = 90; // design: GAW_CONFIG.telemetryRetentionDays || 90

/** Analytics consent on this device — same keys as the design's telemetry.js. */
const CONSENT_KEY = "gaw_consent";
const TELEMETRY_KEYS = ["gaw_telemetry", "gaw_vid"];

function readConsent() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
  } catch {
    return null;
  }
}

function writeConsent(analytics) {
  const rec = { analytics: !!analytics, at: Date.now(), version: 1 };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(rec));
    if (!analytics) TELEMETRY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage blocked — still reflect the choice for this view */
  }
  return rec;
}

const sec = (title, body, items) => ({ title, body, items: items || [] });

const SECTIONS = [
  sec(
    "Signing in",
    "You sign in with Google, Microsoft, Facebook or Apple. Your password is typed on their site, never ours — we never see it, store it or handle it. From them we receive only your name and email address, and we use those two things to greet you and to keep your practice history attached to you.",
  ),
  sec("What we store about your practice", "Your dashboard is built from what you actually do:", [
    "The dates and lengths of your sits, to show your streak and your place on the 41-day journey.",
    "Your journal entries — private to your account and shown to nobody else, ever.",
    "Your member number, so the same person is recognised across visits.",
  ]),
  sec(
    "Your journal",
    "Journal entries exist for you alone. No volunteer, admin or teacher reads them, and they are never used for analytics or shared with anyone. You can delete any entry, or ask us to delete all of them.",
  ),
  sec(
    "Cookies",
    "We set no cookies for advertising, tracking or profiling — none at all. The site remembers your sign-in and your preferences using your browser’s own local storage, which stays on your device and is not transmitted to third parties. Clearing your browser data clears it.",
  ),
  sec(
    "Anonymous analytics",
    "To understand which teachings people reach for, we count page visits — and only after you accept. What is recorded is deliberately thin:",
    [
      "The page name, the date and hour, and a random key for your browser (not your name or email).",
      "Whether the screen is phone, tablet or desktop size, and your timezone name.",
      "Nothing is bought, sold, joined with outside data, or sent to an advertising network.",
    ],
  ),
  sec(
    "Live sessions",
    "The daily sessions run on Zoom and YouTube. Once you open either, that service’s own privacy policy applies to what happens inside it — we have no view into the meeting beyond what you choose to tell us when you log your sit.",
  ),
  sec(
    "Donations",
    "Payments are processed by Stripe. Card details go straight to Stripe and never touch our servers; we see only that a donation succeeded, its amount, and the name and email you gave.",
  ),
  sec(
    "Keeping and deleting",
    `Practice history stays as long as you are a member. Anonymous visit records are pruned automatically after ${RETENTION_DAYS} days. Ask us to delete your account and we will remove your profile, your practice history and your journal.`,
  ),
  sec("Children", "The teachings are open to all, but a member account is meant for adults. If a child has signed up, write to us and we will remove the account."),
  sec("Changes", "If this notice changes in a way that matters, we will say so on the site rather than quietly editing the page."),
];

const MARCELLUS = { fontFamily: "'Marcellus', serif" };
const PILL_BTN = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "10px 20px", borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 13, cursor: "pointer" };

/** /privacy — design: Privacy.dc.html */
export default function PrivacyPage() {
  const { isMember } = useMemberBadge();
  const [consent, setConsent] = useState(readConsent);

  useEffect(() => {
    const prev = document.title;
    document.title = "Privacy notice · Golden Age Wisdom";
    return () => {
      document.title = prev;
    };
  }, []);

  const state = consent ? (consent.analytics ? "Analytics allowed" : "Analytics declined") : "Not chosen yet";
  const stateBg = consent ? (consent.analytics ? "rgba(126,203,143,0.18)" : "rgba(224,132,132,0.16)") : "rgba(255,255,255,0.08)";
  const stateColor = consent ? (consent.analytics ? "#a9dfb8" : "#e0a3a3") : "#b9b1a0";
  const when = consent ? `chosen ${new Date(consent.at).toLocaleDateString()}` : "the banner will ask on your first visit";

  return (
    <div className="gaw-privacy" style={{ minHeight: "100vh", background: "radial-gradient(ellipse 70% 60% at 50% 0%, #141029 0%, #0d0a1c 55%, #080614 100%)", padding: "40px 22px 60px" }}>
      <main style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 26 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, alignSelf: "flex-start", minHeight: 44 }}>
          <img src={siteAsset("assets/logo-128.webp")} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(213,183,124,0.5)" }} />
          <span style={{ ...MARCELLUS, fontSize: 16, letterSpacing: "0.06em", color: "#e6d3a8" }}>GOLDEN AGE WISDOM</span>
        </Link>

        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#b89758" }}>Privacy notice</div>
          <h1 style={{ ...MARCELLUS, fontWeight: 400, fontSize: "clamp(28px, 4vw, 38px)", margin: "8px 0 0", color: "#f7f1e3" }}>What we know about you, and what we don&apos;t</h1>
          <p style={{ margin: "12px 0 0", fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: "#b9b1a0", textWrap: "pretty" }}>
            Golden Age Wisdom is a non-profit. We do not sell anything, we do not advertise, and we have no commercial interest in your data. This notice is written plainly on purpose.
          </p>
        </div>

        <div style={{ padding: "22px 24px", borderRadius: 24, background: "rgba(213,183,124,0.07)", border: "1px solid rgba(213,183,124,0.26)", display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...MARCELLUS, fontSize: 18, color: "#f7f1e3" }}>The short version</span>
          <span style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "#cfc8ba" }}>
            We never see your password. We keep your name, email and practice history — nothing more. Your journal is yours alone. Analytics are anonymous, off until you accept, and we set no advertising cookies of any kind.
          </span>
        </div>

        {SECTIONS.map((s) => (
          <section key={s.title} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <h2 style={{ ...MARCELLUS, fontWeight: 400, fontSize: 20, margin: 0, color: "#f2e9d8" }}>{s.title}</h2>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 300, lineHeight: 1.72, color: "#b9b1a0", textWrap: "pretty" }}>{s.body}</p>
            {s.items.length > 0 && (
              <ul style={{ margin: "4px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                {s.items.map((t) => (
                  <li key={t} style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 1.6, color: "#cfc8ba" }}>
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section
          aria-labelledby="privacy-choice"
          style={{ padding: "22px 24px", borderRadius: 24, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 12 }}
        >
          <h2 id="privacy-choice" style={{ ...MARCELLUS, fontWeight: 400, margin: 0, fontSize: 18, color: "#f2e9d8" }}>
            Your choice, on this device
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }} aria-live="polite">
            <span style={{ padding: "5px 13px", borderRadius: 999, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", background: stateBg, color: stateColor }}>{state}</span>
            <span style={{ fontSize: 12.5, fontWeight: 300, color: "#9a927f" }}>{when}</span>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setConsent(writeConsent(true))} style={{ ...PILL_BTN, border: "none", background: "linear-gradient(135deg, #d5b77c, #b89758)", color: "#241b06", fontWeight: 600 }}>
              Allow anonymous analytics
            </button>
            <button type="button" onClick={() => setConsent(writeConsent(false))} style={{ ...PILL_BTN, border: "1px solid rgba(255,255,255,0.2)", background: "none", color: "#d8d2c4" }}>
              Decline &amp; erase
            </button>
          </div>
          <span style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.6, color: "#7d7666" }}>
            Declining erases the anonymous visit records and the random visitor key held in this browser. Nothing else changes — the teachings stay free either way.
          </span>
        </section>

        <footer style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 300, color: "#b9b1a0" }}>
            Questions, corrections or a request to delete your data — write to <a href={`mailto:${OFFICIAL_EMAIL}?subject=Privacy%20request`}>{OFFICIAL_EMAIL}</a> and a volunteer will answer.
          </span>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", minHeight: 44 }}>
              ← Back to Golden Age Wisdom
            </Link>
            <Link to={isMember ? "/dashboard" : "/join"} style={{ display: "inline-flex", alignItems: "center", minHeight: 44 }}>
              Member dashboard
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
