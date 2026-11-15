import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb } from "../site/SiteChrome";
import { publicApi } from "../lib/api";
import { memberAuthApi, oauthRedirectUrl } from "../lib/memberAuth";
import { useMemberAuth } from "../auth/MemberAuthContext";
import ConsentText from "./ConsentText";
import { groupFor } from "./kidsUtil";
import "./kids.css";

const PAD = "clamp(20px,5vw,72px)";
const CARD = { borderRadius: 22, background: "rgba(255,253,248,.82)", border: "1px solid rgba(255,255,255,.75)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 14px 34px -16px rgba(60,42,16,.32)", padding: "clamp(18px,3vw,30px)" };
const PILL = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 28px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", border: 0, cursor: "pointer", fontFamily: "inherit" };
const STEPS = ["Children", "Parent", "Consent"];
const blankChild = () => ({ first_name: "", last_name: "", age: "", group: "", experience: "", media_consent: "", notes: "" });

/** Which step a server field error belongs to. */
const stepOf = (key) => (key.startsWith("children") ? 0 : ["agreed", "esign", "signature_name", "consent_version"].some((k) => key.startsWith(k)) ? 2 : 1);

/**
 * /kids/register — parent signs in with Google, then: 1 children · 2 parent + emergency · 3 consent + e-signature.
 * Coming back later edits the same household and signs again (every signature is kept).
 */
export default function KidsRegisterPage() {
  const { user, loading: authLoading } = useMemberAuth();
  const { pathname } = useLocation();
  const [info, setInfo] = useState(null);
  const [existing, setExisting] = useState(undefined);
  const [step, setStep] = useState(0);
  const [kids, setKids] = useState([blankChild()]);
  const [p, setP] = useState({ guardian_name: "", relationship: "", email: "", phone: "", emergency_name: "", emergency_phone: "", city: "", state: "", heard_about: "" });
  const [agreed, setAgreed] = useState([]);
  const [esign, setEsign] = useState(false);
  const [signature, setSignature] = useState("");
  const [errs, setErrs] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    publicApi.kidsProgram().then(setInfo).catch(() => setInfo(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    memberAuthApi
      .kids()
      .then((res) => {
        setExisting(res);
        if (res?.registration) {
          const r = res.registration;
          setP({ guardian_name: r.guardian_name, relationship: r.relationship, email: r.email, phone: r.phone, emergency_name: r.emergency_name, emergency_phone: r.emergency_phone, city: r.city, state: r.state, heard_about: r.heard_about || "" });
          const active = (res.kids || []).filter((k) => k.status === "active");
          if (active.length) setKids(active.map((k) => ({ ...k, age: String(k.age), notes: k.notes || "" })));
        } else {
          setP((v) => ({ ...v, guardian_name: user.name || "", email: user.email || "", phone: user.phone || "" }));
        }
      })
      .catch(() => setExisting(null));
  }, [user]);

  const groups = useMemo(() => (info ? info.groups : []), [info]);
  const sections = info?.consent?.sections ?? [];

  const setKid = (i, key, value) => {
    setErrs((x) => ({ ...x, [`children.${i}.${key}`]: undefined, ...(key === "age" ? { [`children.${i}.group`]: undefined } : {}) }));
    setKids((list) =>
      list.map((k, j) => {
        if (j !== i) return k;
        const next = { ...k, [key]: value };
        if (key === "age" && !k.group) next.group = groupFor(groups, value);
        return next;
      }),
    );
  };
  const setField = (key) => (e) => {
    setP((v) => ({ ...v, [key]: e.target.value }));
    setErrs((x) => ({ ...x, [key]: undefined }));
  };

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      kids.forEach((k, i) => {
        if (!k.first_name.trim()) e[`children.${i}.first_name`] = "First name is required.";
        if (!k.last_name.trim()) e[`children.${i}.last_name`] = "Last name is required.";
        const a = Number(k.age);
        if (!a || a < info.min_age || a > info.max_age) e[`children.${i}.age`] = `Age ${info.min_age} to ${info.max_age}.`;
        if (!k.group) e[`children.${i}.group`] = "Choose a session.";
        if (!k.experience) e[`children.${i}.experience`] = "Choose one.";
        if (!k.media_consent) e[`children.${i}.media_consent`] = "Choose yes or no.";
      });
    }
    if (s === 1) {
      for (const [k, label] of [["guardian_name", "Your full name"], ["relationship", "Relationship"], ["email", "Email"], ["phone", "Mobile number"], ["emergency_name", "Emergency contact"], ["emergency_phone", "Emergency phone"], ["city", "City"], ["state", "State"]]) {
        if (!String(p[k] || "").trim()) e[k] = `${label} is required.`;
      }
      if (p.email && !/^\S+@\S+\.\S+$/.test(p.email)) e.email = "Enter a valid email.";
      for (const k of ["phone", "emergency_phone"]) if (p[k] && String(p[k]).replace(/\D/g, "").length < 7) e[k] = "Enter a full phone number.";
    }
    if (s === 2) {
      if (sections.some((sec) => !agreed.includes(sec.key))) e.agreed = "Please read and tick every section.";
      if (!esign) e.esign = "Please agree to sign electronically.";
      const norm = (v) => v.trim().replace(/\s+/g, " ").toLowerCase();
      if (!signature.trim()) e.signature_name = "Type your full name to sign.";
      else if (norm(signature) !== norm(p.guardian_name)) e.signature_name = `Type your name exactly as entered: ${p.guardian_name}`;
    }
    setErrs(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!validate(2)) return;
    setBusy(true);
    setError("");
    try {
      const res = await memberAuthApi.saveKids({
        ...p,
        heard_about: p.heard_about || null,
        children: kids.map((k) => ({ ...(k.id ? { id: k.id } : {}), first_name: k.first_name, last_name: k.last_name, age: Number(k.age), group: k.group, experience: k.experience, media_consent: k.media_consent, notes: k.notes || null })),
        agreed,
        esign,
        signature_name: signature,
        consent_version: info.consent.version,
      });
      setDone(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.errors) {
        const flat = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]));
        setErrs(flat);
        setStep(Math.min(...Object.keys(flat).map(stepOf)));
      }
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signIn = () => {
    try {
      sessionStorage.setItem("gaw_after_signin", pathname);
    } catch {
      /* storage blocked: they land on the dashboard */
    }
    window.location.href = oauthRedirectUrl("google");
  };

  let body;
  if (info === null || authLoading || (user && existing === undefined)) {
    body = <p style={{ color: "#5A5546" }}>Loading…</p>;
  } else if (info === false) {
    body = <p style={{ color: "#9B2C2C" }}>The form could not load. Please refresh the page.</p>;
  } else if (!user) {
    body = (
      <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start", maxWidth: 560 }}>
        <h2 className="serif" style={{ margin: 0, fontSize: 30, fontWeight: 500 }}>Sign in to register</h2>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#2E3A33" }}>
          A parent or legal guardian registers and signs for the children. Sign in with Google: it keeps your signed form safe and lets you change details or your photo choice later. New here? Signing in makes you a member, free.
        </p>
        <button type="button" onClick={signIn} className="gaw-pill-gold" style={PILL}>
          Sign in with Google
        </button>
      </div>
    );
  } else if (done) {
    body = <Done res={done} />;
  } else {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {existing?.registration && (
          <p style={{ margin: 0, padding: "10px 14px", borderRadius: 12, background: existing.needs_resign ? "#FFF3D6" : "#F1EBDA", fontSize: 13.5, color: "#3A3128" }}>
            {existing.needs_resign
              ? "The consent wording was updated. Please check your details and sign again."
              : "You are already registered. Change anything below, then sign again to save."}
          </p>
        )}
        <ol className="kids-stepper" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i <= step ? "on" : ""} aria-current={i === step ? "step" : undefined}>
              {i + 1}. {s}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {kids.map((k, i) => (
              <ChildCard key={k.id ?? `new-${i}`} i={i} k={k} info={info} errs={errs} onChange={setKid} onRemove={kids.length > 1 ? () => setKids((l) => l.filter((_, j) => j !== i)) : null} />
            ))}
            {kids.length < info.max_children && (
              <button type="button" onClick={() => setKids((l) => [...l, { ...blankChild(), last_name: l[0]?.last_name || "" }])} className="kids-pill-line" style={{ ...PILL, alignSelf: "flex-start", background: "transparent" }}>
                + Add a brother or sister
              </button>
            )}
          </div>
        )}

        {step === 1 && (
          <div style={CARD}>
            <h2 className="serif" style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 500 }}>Parent or guardian</h2>
            <p className="kids-hint" style={{ margin: "0 0 16px" }}>Used only to place your child in the right group and keep you updated.</p>
            <div className="kids-form-grid">
              <Field label="Your full name *" err={errs.guardian_name}>
                <input className={`kids-input ${errs.guardian_name ? "bad" : ""}`} value={p.guardian_name} onChange={setField("guardian_name")} autoComplete="name" />
              </Field>
              <Field label="Relationship to the child *" err={errs.relationship}>
                <Select value={p.relationship} onChange={setField("relationship")} options={info.relationships} bad={errs.relationship} />
              </Field>
              <Field label="Email *" err={errs.email}>
                <input type="email" className={`kids-input ${errs.email ? "bad" : ""}`} value={p.email} onChange={setField("email")} autoComplete="email" />
              </Field>
              <Field label="Mobile number (WhatsApp, if you use it) *" err={errs.phone}>
                <input type="tel" className={`kids-input ${errs.phone ? "bad" : ""}`} value={p.phone} onChange={setField("phone")} autoComplete="tel" placeholder="(512) 555-0100" />
              </Field>
              <Field label="Emergency contact name *" err={errs.emergency_name} hint="If possible, someone other than you.">
                <input className={`kids-input ${errs.emergency_name ? "bad" : ""}`} value={p.emergency_name} onChange={setField("emergency_name")} />
              </Field>
              <Field label="Emergency contact phone *" err={errs.emergency_phone}>
                <input type="tel" className={`kids-input ${errs.emergency_phone ? "bad" : ""}`} value={p.emergency_phone} onChange={setField("emergency_phone")} />
              </Field>
              <Field label="City *" err={errs.city}>
                <input className={`kids-input ${errs.city ? "bad" : ""}`} value={p.city} onChange={setField("city")} autoComplete="address-level2" />
              </Field>
              <Field label="State *" err={errs.state}>
                <Select value={p.state} onChange={setField("state")} options={info.states} bad={errs.state} />
              </Field>
              <Field label="How did you hear about us?" err={errs.heard_about}>
                <Select value={p.heard_about} onChange={setField("heard_about")} options={info.heard_about} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={CARD}>
              <h2 className="serif" style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 500 }}>{info.consent.title}</h2>
              <p className="kids-hint" style={{ margin: "0 0 14px" }}>
                Between you and {info.organization}. Please read each part and tick it. Version {info.consent.version}.
              </p>
              <ConsentText sections={sections} agreed={agreed} disabled={busy} onToggle={(key) => { setAgreed((a) => (a.includes(key) ? a.filter((x) => x !== key) : [...a, key])); setErrs((x) => ({ ...x, agreed: undefined })); }} />
              {errs.agreed && <p className="kids-err">{errs.agreed}</p>}
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: "#F6F1E6", fontSize: 13.5, color: "#2E3A33" }}>
                <strong>Your photo answers:</strong> {kids.map((k) => `${k.first_name || "Child"}: ${k.media_consent === "yes" ? "yes" : "no"}`).join(" · ")}{" "}
                <button type="button" onClick={() => setStep(0)} style={{ border: 0, background: "none", color: "#7A5E22", textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5 }}>
                  change
                </button>
              </div>
            </div>
            <div style={CARD}>
              <h2 className="serif" style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 500 }}>Sign</h2>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#14241C", cursor: "pointer" }}>
                <input type="checkbox" checked={esign} onChange={(e) => { setEsign(e.target.checked); setErrs((x) => ({ ...x, esign: undefined })); }} style={{ width: 20, height: 20, marginTop: 1, accentColor: "#A8853A" }} />
                <span>I agree to sign electronically. My typed name is my legal signature, the same as signing by hand.</span>
              </label>
              {errs.esign && <p className="kids-err">{errs.esign}</p>}
              <div className="kids-form-grid" style={{ marginTop: 14 }}>
                <Field label="Type your full name to sign *" err={errs.signature_name}>
                  <input className={`kids-input ${errs.signature_name ? "bad" : ""}`} value={signature} onChange={(e) => { setSignature(e.target.value); setErrs((x) => ({ ...x, signature_name: undefined })); }} placeholder={p.guardian_name} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontStyle: "italic" }} />
                </Field>
                <Field label="Date">
                  <input className="kids-input" value={new Date().toLocaleDateString()} readOnly />
                </Field>
              </div>
              <p className="kids-hint" style={{ marginTop: 10 }}>We record the date, time and your device&apos;s internet address with your signature, and email you a copy.</p>
            </div>
          </div>
        )}

        {error && <p role="alert" style={{ margin: 0, padding: "10px 14px", borderRadius: 12, border: "1px solid #E7B4B4", background: "#FDF0F0", color: "#9B2C2C", fontSize: 13.5 }}>{error}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="kids-pill-line" style={{ ...PILL, background: "transparent" }} disabled={busy}>
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button type="button" onClick={next} className="gaw-pill-gold" style={PILL}>
              Continue
            </button>
          ) : (
            <button type="button" onClick={submit} className="gaw-pill-gold" style={PILL} disabled={busy}>
              {busy ? "Signing…" : "Sign and register"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <SitePage>
      <SiteHeader />
      <Breadcrumb current="Kids Circle · Register" />
      <main style={{ flex: 1, width: "100%", maxWidth: 860, margin: "0 auto", padding: `clamp(22px,4vh,40px) ${PAD} clamp(40px,6vh,72px)`, display: "flex", flexDirection: "column", gap: 22 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(32px,4vw,50px)", lineHeight: 1.05, color: "#12201A" }}>
            Register for the Kids <em style={{ color: "#8A6F34" }}>Meditation Circle</em>
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: "#5A5546" }}>
            Free, live on Zoom. <Link to="/kids">About the program</Link>
          </p>
        </header>
        {body}
      </main>
    </SitePage>
  );
}

function Field({ label, err, hint, children, full }) {
  return (
    <label className={`kids-field ${full ? "full" : ""}`}>
      {label}
      {children}
      {hint && <span className="kids-hint">{hint}</span>}
      {err && <span className="kids-err">{err}</span>}
    </label>
  );
}

function Select({ value, onChange, options, bad }) {
  return (
    <select className={`kids-input ${bad ? "bad" : ""}`} value={value} onChange={onChange}>
      <option value="">Select one</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function ChildCard({ i, k, info, errs, onChange, onRemove }) {
  const e = (f) => errs[`children.${i}.${f}`];
  const set = (f) => (ev) => onChange(i, f, ev.target.value);
  const ages = Array.from({ length: info.max_age - info.min_age + 1 }, (_, n) => String(info.min_age + n));
  return (
    <div style={CARD}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <h2 className="serif" style={{ margin: 0, fontSize: 26, fontWeight: 500 }}>{i === 0 ? "Your child" : `Child ${i + 1}`}</h2>
        {onRemove && (
          <button type="button" onClick={onRemove} style={{ border: 0, background: "none", color: "#9B2C2C", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
            Remove
          </button>
        )}
      </div>
      <div className="kids-form-grid">
        <Field label="First name *" err={e("first_name")}>
          <input className={`kids-input ${e("first_name") ? "bad" : ""}`} value={k.first_name} onChange={set("first_name")} />
        </Field>
        <Field label="Last name *" err={e("last_name")}>
          <input className={`kids-input ${e("last_name") ? "bad" : ""}`} value={k.last_name} onChange={set("last_name")} />
        </Field>
        <Field label="Age *" err={e("age")}>
          <select className={`kids-input ${e("age") ? "bad" : ""}`} value={k.age} onChange={set("age")}>
            <option value="">Select age</option>
            {ages.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Tried meditation before? *" err={e("experience")}>
          <select className={`kids-input ${e("experience") ? "bad" : ""}`} value={k.experience} onChange={set("experience")}>
            <option value="">Select one</option>
            {info.experience.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>
        <div className="kids-field full">
          Which session? *
          <div className="kids-choice" role="radiogroup">
            {info.groups.map((g) => (
              <label key={g.key} className={k.group === g.key ? "on" : ""}>
                <input type="radio" name={`group-${i}`} checked={k.group === g.key} onChange={() => onChange(i, "group", g.key)} />
                {g.label} (ages {g.ages[0]}–{g.ages[1]}) · {g.zones.find((z) => z.zone === "CT")?.time} CT
              </label>
            ))}
          </div>
          {e("group") && <span className="kids-err">{e("group")}</span>}
        </div>
        <div className="kids-field full">
          May we include {k.first_name || "this child"} in an occasional group photo? *
          <span className="kids-hint">Sessions are never recorded. We never show a child&apos;s full name. You can change this anytime.</span>
          <div className="kids-choice" role="radiogroup">
            {[["yes", "Yes, that's fine"], ["no", "No photos, please"]].map(([v, l]) => (
              <label key={v} className={k.media_consent === v ? "on" : ""}>
                <input type="radio" name={`media-${i}`} checked={k.media_consent === v} onChange={() => onChange(i, "media_consent", v)} />
                {l}
              </label>
            ))}
          </div>
          {e("media_consent") && <span className="kids-err">{e("media_consent")}</span>}
        </div>
        <Field full label="Anything our teachers should know to help your child feel comfortable?" hint="Optional. Only program coordinators see this." err={e("notes")}>
          <textarea className="kids-input" rows={3} maxLength={1000} value={k.notes} onChange={set("notes")} />
        </Field>
      </div>
    </div>
  );
}

function Done({ res }) {
  const j = res.join;
  return (
    <div style={{ ...CARD, display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 500 }}>You&apos;re registered. Thank you!</h2>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#2E3A33" }}>
        We emailed the Zoom details and a copy of your signed form to {res.registration?.email}. Everything is also in <strong>My family</strong> in your member dashboard.
      </p>
      {j && (
        <div style={{ padding: "14px 18px", borderRadius: 16, background: "#14241C", color: "#F3EAD3", fontSize: 14.5, lineHeight: 1.8 }}>
          Zoom meeting ID: <strong style={{ color: "#E8CF83" }}>{j.zoom_id}</strong>
          {j.zoom_passcode && (
            <>
              <br />
              Passcode: <strong style={{ color: "#E8CF83" }}>{j.zoom_passcode}</strong>
            </>
          )}
          <br />
          <span style={{ fontSize: 12.5, opacity: 0.8 }}>Please keep these private. Join 5 minutes early with your child&apos;s first name as the Zoom name.</span>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {j?.whatsapp_link && (
          <a href={j.whatsapp_link} target="_blank" rel="noopener noreferrer" className="gaw-pill-gold" style={PILL}>
            Join parents&apos; WhatsApp
          </a>
        )}
        <Link to="/dashboard/family" className="kids-pill-line" style={PILL}>
          Open My family
        </Link>
      </div>
    </div>
  );
}
