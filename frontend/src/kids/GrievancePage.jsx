import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter } from "../site/SiteChrome";
import { memberFetch } from "../lib/memberAuth";
import { useMemberAuth } from "../auth/MemberAuthContext";
import "./kids.css";

const PAD = "clamp(20px,5vw,72px)";
const CARD = { borderRadius: 22, background: "rgba(255,253,248,.82)", border: "1px solid rgba(255,255,255,.75)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 14px 34px -16px rgba(60,42,16,.32)", padding: "clamp(18px,3vw,30px)" };
const PILL = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 28px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", border: 0, cursor: "pointer", fontFamily: "inherit" };

/**
 * /grievance — the grievance cell. Goes straight to the grievance chief: encrypted, and the rest of the support
 * team only sees that a grievance arrived ("Anonymous"). Name and contact are optional.
 */
export default function GrievancePage() {
  const { user } = useMemberAuth();
  const [about, setAbout] = useState([]);
  // name/email/phone stay null until typed in, so a signed-in member's details show pre-filled.
  const [raw, setF] = useState({ about: "", message: "", name: null, email: null, phone: null, website: "" });
  const f = { ...raw, name: raw.name ?? user?.name ?? "", email: raw.email ?? user?.email ?? "", phone: raw.phone ?? user?.phone ?? "" };
  const [errs, setErrs] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    memberFetch("/grievances/options", { auth: false }).then((r) => setAbout(r.about)).catch(() => setAbout([]));
  }, []);

  const set = (k) => (e) => {
    setF((v) => ({ ...v, [k]: e.target.value }));
    setErrs((x) => ({ ...x, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const local = {};
    if (!f.about) local.about = "Choose what it is about.";
    if (f.message.trim().length < 10) local.message = "Please tell us a little more (at least 10 characters).";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) local.email = "Enter a valid email, or leave it empty.";
    setErrs(local);
    if (Object.keys(local).length) return;
    setBusy(true);
    setError("");
    try {
      const res = await memberFetch("/grievances", {
        method: "POST",
        body: { about: f.about, message: f.message.trim(), name: f.name.trim() || null, email: f.email.trim() || null, phone: f.phone.trim() || null, website: f.website },
      });
      setDone(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.errors) setErrs(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])));
      setError(err.status === 429 ? "Too many tries. Please wait a minute and send again." : err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const noContact = !f.email.trim() && !f.phone.trim();

  return (
    <SitePage>
      <SiteHeader />
      <Breadcrumb current="Grievance cell" />
      <main style={{ flex: 1, width: "100%", maxWidth: 760, margin: "0 auto", padding: `clamp(22px,4vh,40px) ${PAD} clamp(40px,6vh,72px)`, display: "flex", flexDirection: "column", gap: 20 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.2vw,52px)", lineHeight: 1.05, color: "#12201A" }}>
            Grievance <em style={{ color: "#8A6F34" }}>cell</em>
          </h1>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "#2E3A33" }}>
            Something went wrong, or someone made you feel unsafe or unheard? Write to our grievance chief directly. For everyday questions, use <Link to="/ask">Member support</Link>.
          </p>
          <ul style={{ margin: 0, padding: "14px 18px", listStyle: "none", borderRadius: 16, background: "#14241C", color: "#F3EAD3", fontSize: 13.5, lineHeight: 1.8 }}>
            <li>🔒 Only the grievance chief can read your name, contact details and message. They are stored encrypted.</li>
            <li>👤 The support team only sees that a grievance arrived, shown as “Anonymous”, so they can make sure it is answered.</li>
            <li>✉️ Leave an email or phone if you want a reply. You can also stay fully anonymous.</li>
          </ul>
        </header>

        {done ? (
          <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 className="serif" style={{ margin: 0, fontSize: 30, fontWeight: 500 }}>Your grievance reached the chief</h2>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#2E3A33" }}>
              Reference <strong>{done.ref}</strong>. {noContact ? "You stayed anonymous, so we can't reply, but it will be looked into." : "The chief will reply to the contact details you gave."} Thank you for telling us.
            </p>
            <Link to="/" className="gaw-pill-gold" style={{ ...PILL, alignSelf: "flex-start" }}>Back to home</Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ ...CARD, display: "flex", flexDirection: "column", gap: 16 }} noValidate>
            <div className="kids-field">
              What is it about? *
              <div className="kids-choice" role="radiogroup">
                {about.map((o) => (
                  <label key={o} className={f.about === o ? "on" : ""}>
                    <input type="radio" name="about" checked={f.about === o} onChange={() => { setF((v) => ({ ...v, about: o })); setErrs((x) => ({ ...x, about: undefined })); }} />
                    {o}
                  </label>
                ))}
              </div>
              {errs.about && <span className="kids-err">{errs.about}</span>}
            </div>
            <label className="kids-field">
              Your grievance *
              <textarea className={`kids-input ${errs.message ? "bad" : ""}`} rows={7} maxLength={5000} value={f.message} onChange={set("message")} placeholder="What happened, when, and who was involved. Write as much as you need." />
              {errs.message && <span className="kids-err">{errs.message}</span>}
            </label>
            <div className="kids-form-grid">
              <label className="kids-field full">
                Your name (optional)
                <input className="kids-input" value={f.name} onChange={set("name")} autoComplete="name" />
              </label>
              <label className="kids-field">
                Email (optional)
                <input type="email" className={`kids-input ${errs.email ? "bad" : ""}`} value={f.email} onChange={set("email")} autoComplete="email" />
                {errs.email && <span className="kids-err">{errs.email}</span>}
              </label>
              <label className="kids-field">
                Phone / WhatsApp (optional)
                <input type="tel" className="kids-input" value={f.phone} onChange={set("phone")} autoComplete="tel" />
              </label>
            </div>
            {noContact && <p className="kids-hint" style={{ margin: 0 }}>Without an email or phone, the chief can read your grievance but can't reply to you.</p>}
            <input type="text" name="website" value={f.website} onChange={set("website")} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
            {error && <p role="alert" style={{ margin: 0, padding: "10px 14px", borderRadius: 12, border: "1px solid #E7B4B4", background: "#FDF0F0", color: "#9B2C2C", fontSize: 13.5 }}>{error}</p>}
            <button type="submit" className="gaw-pill-gold" style={{ ...PILL, alignSelf: "flex-start" }} disabled={busy}>
              {busy ? "Sending…" : "Send to the grievance chief"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter title="Grievance cell" sub="Heard in confidence. Read only by the grievance chief." />
    </SitePage>
  );
}
