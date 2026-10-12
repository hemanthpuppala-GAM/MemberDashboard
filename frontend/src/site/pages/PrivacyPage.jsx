import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
import { OFFICIAL_EMAIL } from "../sitePages";
import { useSiteSettings } from "../usePublicData";
import { displayNumber } from "../../ask/support";
import "./privacy.css";

/* Restyled to the public site's theme (cream / ink / gold, Cormorant + Manrope) with the shared
   SitePage chrome — the original Privacy.dc.html was a standalone dark page. */

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

const PAD = "clamp(20px,5vw,72px)";
const KICKER = { display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22" };
const SMALL_CAPS = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "#7A5E22" };
const CARD = { borderRadius: 22, background: "rgba(255,253,248,.7)", border: "1px solid rgba(255,255,255,.75)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 14px 34px -16px rgba(60,42,16,.32)" };
const PILL_BTN = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 22px", borderRadius: 999, fontFamily: "inherit", fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer" };
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });

/** /privacy — design: Privacy.dc.html */
export default function PrivacyPage() {
  const { isMember } = useMemberBadge();
  const [consent, setConsent] = useState(readConsent);
  const settings = useSiteSettings();
  // Support lines come from admin Settings (server falls back to .env) — never bundled.
  const primary = String(settings?.["support.primary"] || "").replace(/\D/g, "");
  const web = String(settings?.["support.web"] || "").replace(/\D/g, "");

  useEffect(() => {
    const prev = document.title;
    document.title = "Privacy notice · Golden Age Wisdom";
    return () => {
      document.title = prev;
    };
  }, []);

  const state = consent ? (consent.analytics ? "Analytics allowed" : "Analytics declined") : "Not chosen yet";
  const stateBg = consent ? (consent.analytics ? "rgba(63,138,90,.14)" : "rgba(176,70,70,.12)") : "rgba(138,111,52,.14)";
  const stateColor = consent ? (consent.analytics ? "#245A38" : "#8A2626") : "#5E4A1B";
  const when = consent ? `chosen ${new Date(consent.at).toLocaleDateString()}` : "the banner will ask on your first visit";

  return (
    <SitePage>
      <SiteHeader />
      <Breadcrumb current="Privacy" />

      <main
        className="gaw-privacy"
        style={{ flex: 1, width: "100%", maxWidth: 1120, margin: "0 auto", padding: `clamp(22px,4vh,44px) ${PAD} clamp(40px,6vh,72px)`, display: "flex", flexDirection: "column", gap: "clamp(22px,4vh,36px)" }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 }}>
          <span style={{ ...KICKER, ...rise() }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            Privacy notice
          </span>
          <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.2vw,58px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", ...rise(0.1) }}>
            What we know about you, <em style={{ color: "#8A6F34" }}>and what we don&apos;t</em>
          </h1>
          <p style={{ margin: 0, fontSize: "clamp(15px,1.15vw,17px)", lineHeight: 1.6, color: "#3A3128", textWrap: "pretty", ...rise(0.2) }}>
            Golden Age Wisdom is a non-profit. We do not sell anything, we do not advertise, and we have no commercial interest in your data. This notice is written plainly on purpose.
          </p>
        </header>

        <div className="priv-grid" style={rise(0.25)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
            <div style={{ padding: "24px 26px", borderRadius: 22, background: "#14241C", color: "#F6F1E6", boxShadow: "0 18px 40px -20px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 28, lineHeight: 1.1 }}>
                The short version
              </h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "rgba(246,241,230,.86)", textWrap: "pretty" }}>
                We never see your password. We keep your name, email and practice history — nothing more. Your journal is yours alone. Analytics are anonymous, off until you accept, and we set no advertising cookies of any kind.
              </p>
            </div>

            <div style={{ ...CARD, padding: "8px clamp(20px,3vw,32px)" }}>
              {SECTIONS.map((s, i) => (
                <section key={s.title} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "22px 0", borderTop: i ? "1px solid rgba(138,111,52,.18)" : 0 }}>
                  <span aria-hidden="true" style={{ ...SMALL_CAPS, fontSize: 10, color: "#8A6F34" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="serif" style={{ fontWeight: 500, fontSize: 25, lineHeight: 1.12, margin: 0, color: "#12201A" }}>
                    {s.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.72, color: "#3A3128", textWrap: "pretty" }}>{s.body}</p>
                  {s.items.length > 0 && (
                    <ul className="priv-list" style={{ margin: "4px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                      {s.items.map((t) => (
                        <li key={t} style={{ fontSize: 14.5, lineHeight: 1.6, color: "#3A3128" }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>

          <aside className="priv-aside" style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <section aria-labelledby="privacy-choice" style={{ ...CARD, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 id="privacy-choice" className="serif" style={{ fontWeight: 500, margin: 0, fontSize: 24, lineHeight: 1.15, color: "#12201A" }}>
                Your choice, on this device
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }} aria-live="polite">
                <span style={{ padding: "6px 13px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", background: stateBg, color: stateColor }}>{state}</span>
                <span style={{ fontSize: 13, color: "#5A5546" }}>{when}</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setConsent(writeConsent(true))} className="gaw-pill-gold" style={{ ...PILL_BTN, border: 0 }}>
                  Allow anonymous analytics
                </button>
                <button type="button" onClick={() => setConsent(writeConsent(false))} className="priv-ghost" style={PILL_BTN}>
                  Decline &amp; erase
                </button>
              </div>
              <span style={{ fontSize: 13, lineHeight: 1.6, color: "#5A5546" }}>
                Declining erases the anonymous visit records and the random visitor key held in this browser. Nothing else changes — the teachings stay free either way.
              </span>
            </section>

            <section aria-label="Contact" style={{ padding: "20px 24px", borderRadius: 22, background: "rgba(255,253,248,.45)", border: "1px solid rgba(138,111,52,.22)", display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 14, lineHeight: 1.65, color: "#3A3128", overflowWrap: "anywhere" }}>
                Questions, corrections or a request to delete your data — write to{" "}
                <a href={`mailto:${OFFICIAL_EMAIL}?subject=Privacy%20request`} style={{ fontWeight: 600 }}>
                  {OFFICIAL_EMAIL}
                </a>{" "}
                and a volunteer will answer.
              </span>
              {(primary || web) && (
                <span style={{ fontSize: 13.5, lineHeight: 1.6, color: "#5A5546" }}>
                  <span style={{ ...SMALL_CAPS, marginRight: 8 }}>Member support</span>
                  {primary && (
                    <a href={`tel:+${primary}`} style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      call {displayNumber(primary)}
                    </a>
                  )}
                  {primary && web && " · "}
                  {web && (
                    <a href={`https://wa.me/${web}`} target="_blank" rel="noopener noreferrer" style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      WhatsApp {displayNumber(web)}
                    </a>
                  )}
                </span>
              )}
            </section>
          </aside>
        </div>
      </main>

      <SiteFooter title="Written plainly, on purpose" sub="A non-profit with no commercial interest in your data.">
        <Link to="/" className="gaw-pill-ghost-light" style={{ ...PILL_BTN, gap: 8, cursor: undefined }}>
          ← Back to Golden Age Wisdom
        </Link>
        <Link to={isMember ? "/dashboard" : "/join"} className="gaw-pill-gold" style={{ ...PILL_BTN, boxShadow: "none", cursor: undefined }}>
          Member dashboard
        </Link>
      </SiteFooter>
    </SitePage>
  );
}
