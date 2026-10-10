import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader } from "../SiteChrome";
import { useViewportWidth } from "../useViewport";
import { OFFICIAL_EMAIL } from "../sitePages";
import { publicApi } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";
import "./volunteer.css";

const DISPLAY = "'Marcellus', serif";
const BODY = "'Outfit', sans-serif";
const LABEL = { fontSize: 10.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "#b89758" };
const FIELD_LABEL = { fontSize: 12, fontWeight: 300, color: "rgba(185,177,160,0.95)" };
const FIELD_ERR = { fontSize: 12, fontWeight: 300, lineHeight: 1.4, color: "#f0c3c3" };
const inputStyle = (bad) => ({
  width: "100%",
  minHeight: 44,
  padding: "12px 15px",
  borderRadius: 14,
  border: `1px solid ${bad ? "rgba(224,132,132,0.7)" : "rgba(255,255,255,0.16)"}`,
  background: "rgba(255,255,255,0.045)",
  color: "#efe9dc",
  fontSize: 14,
  fontWeight: 300,
});

/** Team cards from the design; slugs = volunteer_categories.slug (migration 2026_10_10_000001). */
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
const TEAM_BY_ID = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

/** Same strings as VolunteerApplication::AVAILABILITY. */
const AVAILS = ["An hour or two a week", "A few hours a week", "Events only", "Whenever I am needed"];

const STEPS = [
  { n: "1", body: "Your note reaches a coordinator for each team you chose — not a queue, a person." },
  { n: "2", body: "They write back to understand what you enjoy and what you would rather not do." },
  { n: "3", body: "You are added to that team’s circle and start at whatever pace suits you." },
];

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
    const active = (categories || []).filter((c) => c.slug && c.is_active !== false);
    if (!active.length) return TEAMS;
    return active.map((c) => TEAM_BY_ID[c.slug] || { id: c.slug, glyph: "✦", title: c.name, desc: c.description || "" });
  }, [categories]);

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
    setPicked([]);
    setAvail("");
    setForm(EMPTY);
    setErrs({});
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!picked.length) return setError("Choose at least one team — that is the only part we cannot guess.");
    if (!form.name.trim()) return setError("We need a name to write back to.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return setError("That email does not look right — check it once?");
    if (!form.phone.trim()) return setError("Leave a phone or WhatsApp number so a coordinator can reach you.");
    setBusy(true);
    setError("");
    setErrs({});

    // Honeypot filled → a bot. Pretend success, send nothing.
    if (form.honey) {
      setBusy(false);
      setSent("Thank you — we have your note.");
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
      setSent("Thank you — we have your note.");
    } catch (err) {
      setBusy(false);
      if (err?.status === 422) {
        const fe = fieldErrors(err.errors);
        setErrs(fe);
        // Field messages show beside their field; the box carries what has no field of its own.
        setError(fe.teams || fe.availability || fe.lang || (Object.keys(fe).length ? "" : err.message));
      } else if (err?.status) {
        setError(err.message || "Something went wrong. Please try again.");
      } else {
        setError(`We could not reach the server. Please email ${OFFICIAL_EMAIL} and we will add you by hand.`);
      }
    }
  };

  const field = (key, label, props, errKey = key) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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

  const pickedSummary = picked.length ? (picked.length === 1 ? "1 team chosen" : `${picked.length} teams chosen`) : "Nothing chosen yet";

  return (
    <SitePage style={{ position: "relative", background: "#09071a", color: "#efe9dc", fontFamily: BODY }}>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(820px 640px at 26% 18%, rgba(96,84,166,0.28), transparent 68%), radial-gradient(900px 560px at 82% 104%, rgba(213,183,124,0.10), transparent 72%)",
        }}
      />
      <SiteHeader />

      <main
        className="vol-main"
        data-screen-label="Volunteer"
        style={{ position: "relative", zIndex: 1, flex: 1, width: "100%", maxWidth: 1120, margin: "0 auto", padding: "clamp(14px, 2.5vh, 30px) clamp(18px, 4vw, 44px) 60px", animation: "vol-in 0.6s ease both" }}
      >
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89758" }}>Seva · service</div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(30px, 4.6vw, 52px)", lineHeight: 1.08, margin: "10px 0 0", color: "#f7f1e3", textWrap: "balance" }}>
            The work is quiet, and there is a lot of it.
          </h1>
          <p style={{ maxWidth: "34em", margin: "14px 0 0", fontSize: "clamp(14px, 1.4vw, 16px)", fontWeight: 200, lineHeight: 1.65, color: "rgba(226,219,204,0.95)", textWrap: "pretty" }}>
            Chairs get carried, calls get answered, someone new writes at midnight frightened by what they felt in meditation. None of it is glamorous. All of it is the movement. Tell us where you would like to stand.
          </p>
        </div>

        {sent ? (
          <div
            role="status"
            style={{ marginTop: 28, maxWidth: 640, padding: "28px 30px", borderRadius: 26, border: "1px solid rgba(126,203,143,0.45)", background: "rgba(126,203,143,0.09)", animation: "vol-in 0.5s ease both" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: "50%", background: "#7ecb8f", boxShadow: "0 0 12px #7ecb8f" }} />
              <span style={{ fontSize: 10.5, letterSpacing: "0.26em", textTransform: "uppercase", color: "#9fd7ae" }}>Received</span>
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.2, margin: "12px 0 0", color: "#f2e9d8" }}>Thank you for offering to serve.</h2>
            <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 300, lineHeight: 1.6, color: "rgba(214,207,193,0.95)" }}>{sent}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
              <Link
                to="/"
                className="vol-back"
                style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "11px 24px", borderRadius: 999, background: "linear-gradient(135deg, #e6d3a8, #b89758)", fontSize: 14, fontWeight: 500 }}
              >
                Back to the site
              </Link>
              <button
                type="button"
                onClick={again}
                className="vol-choice"
                style={{ minHeight: 44, padding: "11px 24px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.04)", color: "rgba(226,219,204,0.95)", fontFamily: BODY, fontSize: 14, fontWeight: 300, cursor: "pointer" }}
              >
                Add someone else
              </button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={submit}
            style={{ display: "grid", gridTemplateColumns: twoCol ? "1.15fr 0.85fr" : "1fr", gap: "clamp(18px, 3vw, 34px)", marginTop: "clamp(22px, 4vh, 40px)", alignItems: "start" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
              <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
                <legend style={{ ...LABEL, padding: 0 }}>Where you would like to serve</legend>
                <div style={{ fontSize: 12.5, fontWeight: 300, color: "rgba(185,177,160,0.9)", marginTop: 5 }}>Choose as many as you mean. Somebody will read this by hand.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                  {teams.map((t) => {
                    const on = picked.includes(t.id);
                    const border = on ? "rgba(213,183,124,0.7)" : "rgba(255,255,255,0.13)";
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggle(t.id)}
                        aria-pressed={on}
                        className="vol-choice vol-team"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 13,
                          width: "100%",
                          minHeight: 44,
                          padding: "14px 16px",
                          borderRadius: 18,
                          border: `1px solid ${border}`,
                          background: on ? "rgba(213,183,124,0.12)" : "rgba(255,255,255,0.035)",
                          color: "#efe9dc",
                          fontFamily: BODY,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 30,
                            height: 30,
                            flexShrink: 0,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `1px solid ${border}`,
                            background: on ? "rgba(213,183,124,0.2)" : "rgba(255,255,255,0.05)",
                            color: on ? "#f0dcaf" : "rgba(213,183,124,0.75)",
                            fontSize: 14,
                          }}
                        >
                          {t.glyph}
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                          <span style={{ fontSize: 14.5, fontWeight: 500, color: on ? "#f7ecd0" : "#efe9dc" }}>{t.title}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 1.5, color: "rgba(185,177,160,0.95)", textWrap: "pretty" }}>{t.desc}</span>
                        </span>
                        <span aria-hidden="true" style={{ flexShrink: 0, marginLeft: "auto", fontSize: 13, color: "#d5b77c" }}>
                          {on ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
                <legend style={{ ...LABEL, padding: 0 }}>About you</legend>
                <div style={{ display: "grid", gridTemplateColumns: twoRow ? "1fr 1fr" : "1fr", gap: 12, marginTop: 14 }}>
                  {field("name", "Your name", { type: "text", autoComplete: "name", placeholder: "Full name", required: true })}
                  {field("email", "Email", { type: "email", autoComplete: "email", placeholder: "you@example.com", required: true })}
                  {field("phone", "Phone or WhatsApp", { type: "tel", autoComplete: "tel", placeholder: "With country code, e.g. +91", required: true })}
                  {field("city", "City", { type: "text", autoComplete: "address-level2", placeholder: "Hyderabad, Pune, anywhere" })}
                </div>
              </fieldset>

              <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
                <legend style={{ ...FIELD_LABEL, padding: 0, marginBottom: 9 }}>How much time can you give?</legend>
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
                        className="vol-choice"
                        style={{
                          minHeight: 44,
                          padding: "9px 17px",
                          borderRadius: 999,
                          border: `1px solid ${on ? "rgba(213,183,124,0.7)" : "rgba(255,255,255,0.14)"}`,
                          background: on ? "rgba(213,183,124,0.14)" : "rgba(255,255,255,0.04)",
                          color: on ? "#f7ecd0" : "rgba(207,200,186,0.9)",
                          fontFamily: BODY,
                          fontSize: 12.5,
                          fontWeight: 400,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={FIELD_LABEL}>Anything you want us to know</span>
                <textarea
                  value={form.note}
                  onChange={set("note")}
                  rows={4}
                  placeholder="Skills, languages you speak, when you are usually free, or why this matters to you."
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
                <div role="alert" style={{ padding: "13px 16px", borderRadius: 16, border: "1px solid rgba(224,132,132,0.5)", background: "rgba(224,132,132,0.1)", fontSize: 13, fontWeight: 300, lineHeight: 1.5, color: "#f0c3c3" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                <button
                  type="submit"
                  disabled={busy}
                  className="vol-submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 9,
                    minHeight: 48,
                    padding: "14px 34px",
                    borderRadius: 999,
                    border: "none",
                    background: "linear-gradient(135deg, #e6d3a8, #b89758)",
                    color: "#241b06",
                    fontFamily: BODY,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: busy ? "default" : "pointer",
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  {busy ? "Sending…" : "Count me in"}
                </button>
                <span aria-live="polite" style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.5, color: "rgba(154,146,127,0.95)" }}>
                  {pickedSummary}
                </span>
              </div>
            </div>

            <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 18, minWidth: 0 }}>
              <div style={{ padding: "20px 22px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.035)" }}>
                <div style={LABEL}>What happens next</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                  {STEPS.map((s) => (
                    <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span
                        aria-hidden="true"
                        style={{ width: 24, height: 24, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(213,183,124,0.45)", fontFamily: DISPLAY, fontSize: 12, color: "#d5b77c" }}
                      >
                        {s.n}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 1.55, color: "rgba(200,192,178,0.95)", textWrap: "pretty" }}>{s.body}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "20px 22px", borderRadius: 24, border: "1px solid rgba(213,183,124,0.3)", background: "rgba(213,183,124,0.06)" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 17, color: "#f2e9d8" }}>No commitment is too small</div>
                <p style={{ margin: "8px 0 0", fontSize: 12.5, fontWeight: 300, lineHeight: 1.6, color: "rgba(200,192,178,0.95)", textWrap: "pretty" }}>
                  One event a year is help. Answering three messages a week is help. Say what is true and we will never ask for more than that.
                </p>
              </div>

              <div style={{ padding: "18px 22px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 1.6, color: "rgba(185,177,160,0.95)", overflowWrap: "anywhere" }}>
                  Rather write to a person?{" "}
                  <a className="vol-link" href={`mailto:${OFFICIAL_EMAIL}?subject=Volunteering`}>
                    {OFFICIAL_EMAIL}
                  </a>
                </div>
              </div>
            </aside>
          </form>
        )}
      </main>

      <footer
        style={{ position: "relative", zIndex: 1, flexShrink: 0, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "8px 22px", padding: "0 clamp(18px, 4vw, 44px) 22px", fontSize: 11.5, fontWeight: 300, color: "rgba(154,146,127,0.95)" }}
      >
        <span style={{ fontFamily: DISPLAY, letterSpacing: "0.18em", color: "rgba(213,183,124,0.9)" }}>GOLDEN AGE WISDOM</span>
        <span>A registered non-profit · © 2026</span>
        <Link to="/privacy" className="vol-link" style={{ display: "inline-flex", alignItems: "center", minHeight: 44 }}>
          Privacy
        </Link>
      </footer>
    </SitePage>
  );
}
