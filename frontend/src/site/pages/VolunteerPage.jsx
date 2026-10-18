import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter } from "../SiteChrome";
import { useViewportWidth } from "../useViewport";
import { OFFICIAL_EMAIL } from "../sitePages";
import { publicApi } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";
import { useSiteContent } from "../useSiteContent";
import "./volunteer.css";
import CmsExtraSections from "../cms/CmsExtraSections";

const PAD = "clamp(20px,5vw,72px)";
const KICKER = { display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22" };
const LABEL = { display: "inline-flex", alignItems: "center", gap: 10, fontSize: 10.5, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#7A5E22" };
const FIELD_LABEL = { fontSize: 12.5, fontWeight: 600, color: "#3A3128" };
const FIELD_ERR = { fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, color: "#9B2C2C" };
const CARD = { borderRadius: 22, background: "rgba(255,253,248,.7)", border: "1px solid rgba(255,255,255,.75)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 14px 34px -16px rgba(60,42,16,.32)" };
const PILL = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, padding: "0 26px", borderRadius: 999, fontFamily: "inherit", fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" };
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });
const inputStyle = (bad) => ({
  width: "100%",
  minHeight: 48,
  padding: "12px 15px",
  borderRadius: 14,
  border: `1px solid ${bad ? "#B04646" : "rgba(138,111,52,.38)"}`,
  background: "#FFFDF8",
  color: "#12201A",
  fontSize: 15,
});

/** Offline fallback team cards; the live wording comes from page content (`teams`). Slugs = volunteer_categories.slug. */
const TEAMS = [
  { id: "events-setup", glyph: "△", title: "Events — on the ground", desc: "Setting up halls, chairs, mats, sound and signage. Arrive early, leave last." },
  { id: "helpline", glyph: "☎", title: "Helpline — first level", desc: "Answer the first message or call, understand what is being asked, and pass it to the right team." },
  { id: "local-event", glyph: "◎", title: "Local event volunteer", desc: "Host or help run sits and gatherings in your own city." },
  {
    id: "kundalini-share",
    glyph: "✦",
    title: "Experiences & doubts — for seasoned meditators",
    desc: "Members write in about what rose in meditation — kundalini stirrings, heat, fear, something they cannot name. You have sat long enough to answer plainly and leave them unworried.",
  },
  { id: "donor", glyph: "❋", title: "Donor member", desc: "Give regularly so the teachings stay free for everyone else." },
  { id: "social-media", glyph: "☾", title: "Social media", desc: "Write, film, edit and post — carry the work to people who have not heard of it." },
  { id: "tech", glyph: "▽", title: "Tech", desc: "The website, the streams, the member tools. Anything that has to keep working." },
];

/** Same strings as VolunteerApplication::AVAILABILITY. */
const AVAILS = ["An hour or two a week", "A few hours a week", "Events only", "Whenever I am needed"];


const EMPTY = { name: "", email: "", phone: "", city: "", note: "", honey: "" };

/** Laravel 422 `errors` → { field: firstMessage }, folding teams.N into teams. */
function fieldErrors(errors) {
  const out = {};
  for (const [key, msgs] of Object.entries(errors || {})) {
    const k = key.startsWith("teams") || key === "category_id" ? "teams" : key;
    if (!out[k]) out[k] = Array.isArray(msgs) ? msgs[0] : String(msgs);
  }
  return out;
}

/** /volunteer — design: Volunteer.dc.html */
export default function VolunteerPage() {
  const { language } = useLanguage();
  const c = useSiteContent("volunteer");
  const steps = (Array.isArray(c.steps) ? c.steps : []).filter(Boolean);
  const w = useViewportWidth();
  const twoCol = w > 860;
  const twoRow = w > 620;

  const [categories, setCategories] = useState(null);
  const [picked, setPicked] = useState([]);
  const [avail, setAvail] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errs, setErrs] = useState({});
  const [sent, setSent] = useState(null);
  const [step, setStep] = useState(1); // 1: how you'd like to help, 2: about you

  useEffect(() => {
    let alive = true;
    publicApi
      .volunteerCategories()
      .then((list) => alive && Array.isArray(list) && setCategories(list))
      .catch(() => {}); // backend down → design list
    return () => {
      alive = false;
    };
  }, []);

  // Active categories from the API (admin order) with the design's glyph + copy for known slugs; design list as fallback.
  const teams = useMemo(() => {
    const copy = Array.isArray(c.teams) && c.teams.length ? c.teams : TEAMS;
    const byId = Object.fromEntries(copy.map((t) => [t.id, t]));
    const active = (categories || []).filter((cat) => cat.slug && cat.is_active !== false);
    if (!active.length) return copy;
    return active.map((cat) => byId[cat.slug] || { id: cat.slug, glyph: "✦", title: cat.name, desc: cat.description || "" });
  }, [categories, c.teams]);

  const clearErr = (k) => setErrs((e) => (e[k] ? { ...e, [k]: undefined } : e));
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    clearErr(k === "note" ? "notes" : k);
  };
  const toggle = (id) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    setError("");
    clearErr("teams");
  };

  const again = () => {
    setSent(null);
    setStep(1);
    setPicked([]);
    setAvail("");
    setForm(EMPTY);
    setErrs({});
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!picked.length) {
      setStep(1);
      return setError("Choose at least one team — that is the only part we cannot guess.");
    }
    if (!form.name.trim()) return setError("We need a name to write back to.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return setError("That email does not look right — check it once?");
    if (!form.phone.trim()) return setError("Leave a phone or WhatsApp number so a coordinator can reach you.");
    setBusy(true);
    setError("");
    setErrs({});

    // Honeypot filled → a bot. Pretend success, send nothing.
    if (form.honey) {
      setBusy(false);
      setSent(c.sentBody);
      return;
    }

    try {
      await publicApi.submitVolunteerApplication({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim() || null,
        teams: picked,
        availability: avail || null,
        notes: form.note.trim() || null,
        lang: (language || "en").toUpperCase(),
      });
      setBusy(false);
      setSent(c.sentBody);
    } catch (err) {
      setBusy(false);
      if (err?.status === 422) {
        const fe = fieldErrors(err.errors);
        setErrs(fe);
        // Field messages show beside their field; the box carries what has no field of its own.
        setError(fe.teams || fe.availability || fe.lang || (Object.keys(fe).length ? "" : err.message));
        if (fe.teams || fe.availability) setStep(1);
      } else if (err?.status) {
        setError(err.message || "Something went wrong. Please try again.");
      } else {
        setError(`We could not reach the server. Please email ${OFFICIAL_EMAIL} and we will add you by hand.`);
      }
    }
  };

  const field = (key, label, props, errKey = key) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={FIELD_LABEL}>{label}</span>
      <input
        value={form[key]}
        onChange={set(key)}
        aria-invalid={errs[errKey] ? true : undefined}
        aria-describedby={errs[errKey] ? `vol-err-${errKey}` : undefined}
        style={inputStyle(!!errs[errKey])}
        {...props}
      />
      {errs[errKey] && (
        <span id={`vol-err-${errKey}`} role="alert" style={FIELD_ERR}>
          {errs[errKey]}
        </span>
      )}
    </label>
  );

  // Step 1 → 2: a team is the one thing we need before the details.
  const toDetails = () => {
    if (!picked.length) return setError("Choose at least one team — that is the only part we cannot guess.");
    setError("");
    setStep(2);
    document.querySelector(".vol-steps")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pickedSummary = picked.length ? (picked.length === 1 ? "1 team chosen" : `${picked.length} teams chosen`) : "Nothing chosen yet";

  return (
    <SitePage>
      <SiteHeader />
      <Breadcrumb current="Volunteer" />

      <main
        className="vol-main"
        data-screen-label="Volunteer"
        style={{ flex: 1, width: "100%", maxWidth: 1120, margin: "0 auto", padding: `clamp(22px,4vh,44px) ${PAD} clamp(40px,6vh,72px)`, display: "flex", flexDirection: "column", gap: "clamp(22px,4vh,36px)" }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 660 }}>
          <span style={{ ...KICKER, ...rise() }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            {c.kicker}
          </span>
          <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.2vw,58px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", ...rise(0.1) }}>
            {c.title} <em style={{ color: "#8A6F34" }}>{c.titleAccent}</em>
          </h1>
          <p style={{ margin: 0, fontSize: "clamp(15px,1.15vw,17px)", lineHeight: 1.6, color: "#3A3128", textWrap: "pretty", ...rise(0.2) }}>
            {c.intro}
          </p>
        </header>

        {sent ? (
          <div role="status" style={{ ...CARD, maxWidth: 660, padding: "28px 30px", ...rise(0) }}>
            <span style={{ ...LABEL, color: "#2F6B45" }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: "#3F8A5A", boxShadow: "0 0 0 4px rgba(63,138,90,.18)" }} />
              Received
            </span>
            <h2 className="serif" style={{ fontWeight: 500, fontSize: "clamp(26px,3vw,34px)", lineHeight: 1.1, margin: "12px 0 0", color: "#12201A" }}>
              {c.sentTitle}
            </h2>
            <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6, color: "#3A3128" }}>{sent}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
              <Link to="/" className="gaw-pill-gold" style={{ ...PILL, minHeight: 44 }}>
                Back to the site
              </Link>
              <button type="button" onClick={again} className="vol-ghost" style={{ ...PILL, minHeight: 44, cursor: "pointer" }}>
                Add someone else
              </button>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={submit} style={{ display: "grid", gridTemplateColumns: twoCol && step === 2 ? "minmax(0,1.15fr) minmax(0,.85fr)" : "1fr", gap: "clamp(20px,3vw,36px)", alignItems: "start", ...rise(0.25) }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>
              {/* Two short steps instead of one long form */}
              <ol aria-label="Sign-up steps" className="vol-steps">
                {[c.serveLabel || "How you'd like to help", c.aboutLabel || "About you"].map((label, i) => (
                  <li key={i} className={`vol-step${step === i + 1 ? " is-on" : ""}${step > i + 1 ? " is-done" : ""}`} aria-current={step === i + 1 ? "step" : undefined}>
                    <span aria-hidden="true" className="serif">{step > i + 1 ? "✓" : i + 1}</span>
                    {label}
                  </li>
                ))}
              </ol>

              {step === 1 ? (
                <>
                <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
                  <legend className="vol-sr">
                    {c.serveLabel}
                  </legend>
                  <div style={{ fontSize: 13.5, color: "#5A5546" }}>{c.serveHint}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12, marginTop: 16 }}>
                    {teams.map((t) => {
                      const on = picked.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggle(t.id)}
                          aria-pressed={on}
                          className={`vol-team${on ? " is-on" : ""}`}
                          style={{ display: "flex", alignItems: "flex-start", gap: 14, width: "100%", minHeight: 44, padding: "16px 18px", borderRadius: 18, fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}
                        >
                          <span
                            aria-hidden="true"
                            className="serif"
                            style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: on ? "#14241C" : "#F3EAD3", color: on ? "#E8CF83" : "#8A6F34", fontSize: 17 }}
                          >
                            {t.glyph}
                          </span>
                          <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                            <span className="serif" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.15, color: "#12201A" }}>
                              {t.title}
                            </span>
                            <span style={{ fontSize: 13.5, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty" }}>{t.desc}</span>
                          </span>
                          <span
                            aria-hidden="true"
                            style={{ flexShrink: 0, marginLeft: "auto", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: on ? 0 : "1px solid rgba(138,111,52,.4)", background: on ? "linear-gradient(90deg,#E8CF83,#C9A24A)" : "transparent", color: "#14241C", fontSize: 13, fontWeight: 700 }}
                          >
                            {on ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
                  <legend style={{ ...FIELD_LABEL, padding: 0, marginBottom: 10 }}>{c.availLabel}</legend>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {AVAILS.map((a) => {
                      const on = avail === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setAvail(on ? "" : a);
                            clearErr("availability");
                          }}
                          className={`vol-avail${on ? " is-on" : ""}`}
                          style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                </>
              ) : (
                <>
                <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
                  <legend className="vol-sr">
                    {c.aboutLabel}
                  </legend>
                  <div style={{ display: "grid", gridTemplateColumns: twoRow ? "1fr 1fr" : "1fr", gap: 14, marginTop: 16 }}>
                    {field("name", c.nameLabel, { type: "text", autoComplete: "name", placeholder: c.namePlaceholder, required: true })}
                    {field("email", c.emailLabel, { type: "email", autoComplete: "email", placeholder: "you@example.com", required: true })}
                    {field("phone", c.phoneLabel, { type: "tel", autoComplete: "tel", placeholder: c.phonePlaceholder, required: true })}
                    {field("city", c.cityLabel, { type: "text", autoComplete: "address-level2", placeholder: c.cityPlaceholder })}
                  </div>
                </fieldset>
                <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <span style={FIELD_LABEL}>{c.noteLabel}</span>
                  <textarea
                    value={form.note}
                    onChange={set("note")}
                    rows={4}
                    placeholder={c.notePlaceholder}
                    aria-invalid={errs.notes ? true : undefined}
                    aria-describedby={errs.notes ? "vol-err-notes" : undefined}
                    style={{ ...inputStyle(!!errs.notes), padding: "13px 15px", borderRadius: 16, lineHeight: 1.55, resize: "vertical" }}
                  />
                  {errs.notes && (
                    <span id="vol-err-notes" role="alert" style={FIELD_ERR}>
                      {errs.notes}
                    </span>
                  )}
                </label>
                </>
              )}

              <input
                value={form.honey}
                onChange={set("honey")}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
              />

              {error && (
                <div role="alert" style={{ padding: "13px 16px", borderRadius: 16, border: "1px solid rgba(176,70,70,.45)", background: "rgba(176,70,70,.07)", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "#8A2626" }}>
                  {error}
                </div>
              )}

              {step === 1 ? (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                  <button type="button" onClick={toDetails} className="gaw-pill-gold vol-submit" style={{ ...PILL, padding: "0 30px", border: 0, fontSize: 12, cursor: "pointer" }}>
                    Next: about you →
                  </button>
                  <span aria-live="polite" style={{ fontSize: 13, lineHeight: 1.5, color: "#5A5546" }}>
                    {pickedSummary}
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                  <button type="button" onClick={() => { setError(""); setStep(1); }} className="vol-ghost" style={{ ...PILL, minHeight: 44, cursor: "pointer" }}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="gaw-pill-gold vol-submit"
                    style={{ ...PILL, padding: "0 34px", border: 0, fontSize: 12, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
                  >
                    {busy ? "Sending…" : c.submitLabel}
                  </button>
                  <span aria-live="polite" style={{ fontSize: 13, lineHeight: 1.5, color: "#5A5546" }}>
                    {pickedSummary}
                  </span>
                </div>
              )}
            </div>

            {/* Step 1 uses the full width for the teams; the side notes join on step 2. */}
            {step === 2 ? (
            <aside style={{ display: "flex", flexDirection: "column", gap: 16, position: twoCol ? "sticky" : "static", top: 130, minWidth: 0 }}>
              <div style={{ ...CARD, padding: "22px 24px" }}>
                <span style={LABEL}>{c.nextLabel}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                  {steps.map((body, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <span
                        aria-hidden="true"
                        className="serif"
                        style={{ width: 30, height: 30, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3EAD3", boxShadow: "0 0 0 1px rgba(138,111,52,.3)", fontSize: 16, fontWeight: 600, color: "#7A5E22" }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 14, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty" }}>{body}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "22px 24px", borderRadius: 22, background: "#14241C", color: "#F6F1E6", boxShadow: "0 18px 40px -20px rgba(0,0,0,.5)" }}>
                <div className="serif" style={{ fontSize: 24, lineHeight: 1.15 }}>
                  {c.smallTitle}
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.6, color: "rgba(246,241,230,.8)", textWrap: "pretty" }}>
                  {c.smallBody}
                </p>
              </div>

              <div style={{ padding: "18px 24px", borderRadius: 22, background: "rgba(255,253,248,.45)", border: "1px solid rgba(138,111,52,.22)", fontSize: 13.5, lineHeight: 1.6, color: "#3A3128", overflowWrap: "anywhere" }}>
                {c.writeLabel}{" "}
                <a href={`mailto:${OFFICIAL_EMAIL}?subject=Volunteering`} style={{ fontWeight: 600 }}>
                  {OFFICIAL_EMAIL}
                </a>
              </div>
            </aside>
            ) : null}
          </form>
        )}
      </main>

      <CmsExtraSections slug="volunteer" />
      <SiteFooter title={c.footerTitle} sub={c.footerSub} />
    </SitePage>
  );
}
