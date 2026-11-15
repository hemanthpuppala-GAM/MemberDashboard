import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter } from "../site/SiteChrome";
import { publicApi } from "../lib/api";
import { useMemberAuth } from "../auth/MemberAuthContext";
import { isUsZone, localTime, phoneDisplay, viewerZone } from "./kidsUtil";
import "./kids.css";

const PAD = "clamp(20px,5vw,72px)";
const KICKER = { display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22" };
const CARD = { borderRadius: 22, background: "rgba(255,253,248,.78)", border: "1px solid rgba(255,255,255,.75)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 14px 34px -16px rgba(60,42,16,.32)" };
const PILL = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0 28px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" };
const rise = (d = 0) => ({ animation: `gaw-rise .9s ${d}s both` });

const GAINS = [
  ["Wisdom", "Noticing thoughts and feelings, and pausing before reacting."],
  ["Wellness", "Easy, calming breaths for moments of worry, restlessness or bedtime."],
  ["Meditation", "A steady habit of sitting quietly for a few minutes, growing with them."],
];
const STEPS = [
  ["Breathing", "A warm welcome, then simple kid-friendly breathing that calms the body."],
  ["Guided meditation", "A short quiet sitting, sized to your child's age."],
  ["Wisdom", "A simple life lesson: kindness, gratitude, honesty, courage."],
  ["Stories", "Inspiring stories that bring the lesson to life."],
  ["Fun", "Riddles, drawing and playful movement."],
  ["Share and close", "Children share how they feel, and end with gratitude."],
];
const SAFETY = [
  "Two approved adults in every session",
  "No private chats or one-to-one rooms",
  "Only registered children are let in, by name",
  "Sessions are never recorded",
  "Zoom details go only to registered parents",
  "Parents may watch any session",
];

/** /kids — Kids Meditation Circle (USA, online). Site green + gold. Registration needs the parent's Google sign-in. */
export default function KidsPage() {
  const { user } = useMemberAuth();
  const [info, setInfo] = useState(null);
  const zone = viewerZone();

  useEffect(() => {
    publicApi.kidsProgram().then(setInfo).catch(() => setInfo(false));
  }, []);

  return (
    <SitePage>
      <SiteHeader />
      <Breadcrumb current="Kids Circle" />

      <main style={{ flex: 1, width: "100%", maxWidth: 1120, margin: "0 auto", padding: `clamp(22px,4vh,44px) ${PAD} clamp(40px,6vh,72px)`, display: "flex", flexDirection: "column", gap: "clamp(30px,5vh,52px)" }}>
        <header className="kids-hero">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
            <span style={{ ...KICKER, ...rise() }}>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
              Live on Zoom · Free · USA
            </span>
            <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(38px,4.8vw,64px)", lineHeight: 1.02, letterSpacing: "-.015em", color: "#12201A", ...rise(0.1) }}>
              Kids Meditation <em style={{ color: "#8A6F34" }}>Circle</em>
            </h1>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.65, color: "#2E3A33", ...rise(0.2) }}>
              A gentle weekly online circle where children slow down, breathe with awareness and find the quiet space inside, inspired by the teachings of Dr. Hari Krishna. Short breathing, meditation, wisdom stories and games. Nothing is forced and no experience is needed.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6, ...rise(0.3) }}>
              <Link to="/kids/register" className="gaw-pill-gold" style={PILL}>
                Register your child
              </Link>
              {user && (
                <Link to="/dashboard/family" className="kids-pill-line" style={PILL}>
                  My family
                </Link>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: "#5A5546" }}>A parent or guardian registers with Google sign-in and signs the consent online. It takes about 5 minutes.</p>
          </div>
        </header>

        <section aria-labelledby="k-gains">
          <h2 id="k-gains" className="serif kids-h2">What your child gains</h2>
          <div className="kids-grid-3">
            {GAINS.map(([t, d]) => (
              <div key={t} style={{ ...CARD, padding: "20px 22px" }}>
                <span aria-hidden="true" style={{ display: "block", width: 34, height: 3, borderRadius: 2, background: "#C9A24A", marginBottom: 12 }} />
                <h3 className="serif" style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 600, color: "#14241C" }}>{t}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#2E3A33" }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="k-session">
          <h2 id="k-session" className="serif kids-h2">Inside a 30-minute session</h2>
          <ol className="kids-steps">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <span className="kids-num">{i + 1}</span>
                <span>
                  <strong style={{ color: "#14241C" }}>{t}:</strong> {d}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="k-times">
          <h2 id="k-times" className="serif kids-h2">Program at a glance</h2>
          <p style={{ margin: "-6px 0 14px", fontSize: 14, color: "#5A5546" }}>
            {info?.day ? `Every ${info.day}` : "Weekly"} · live on Zoom · free of cost · two age groups
          </p>
          {info === null ? (
            <p style={{ color: "#5A5546" }}>Loading times…</p>
          ) : info === false ? (
            <p style={{ color: "#9B2C2C" }}>Times could not load. Please refresh the page.</p>
          ) : (
            <div style={{ ...CARD, overflow: "hidden" }}>
              <div className="kids-table" role="table" aria-label="Session times">
                <div role="row" className="kids-tr kids-th">
                  <span role="columnheader">Group</span>
                  {info.groups[0].zones.map((z) => (
                    <span role="columnheader" key={z.zone}>{z.zone}</span>
                  ))}
                </div>
                {info.groups.map((g) => (
                  <div role="row" className="kids-tr" key={g.key}>
                    <span role="cell">
                      <strong>{g.label}</strong>
                      <small> ages {g.ages[0]}–{g.ages[1]}</small>
                    </span>
                    {g.zones.map((z) => (
                      <span role="cell" key={z.zone} data-zone={z.zone}>{z.time}</span>
                    ))}
                  </div>
                ))}
              </div>
              {!isUsZone(zone) && (
                <p style={{ margin: 0, padding: "12px 18px", fontSize: 13, background: "#FBF6EA", color: "#2E3A33" }}>
                  Your time ({zone || "local"}): {info.groups.map((g) => `${g.label}: ${localTime(g.start_utc, g.end_utc)}`).join(" · ")}
                </p>
              )}
            </div>
          )}
        </section>

        <section aria-labelledby="k-safe" style={{ ...CARD, padding: "clamp(20px,3vw,32px)", background: "linear-gradient(180deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6" }}>
          <h2 id="k-safe" className="serif" style={{ margin: "0 0 14px", fontSize: "clamp(26px,2.6vw,36px)", fontWeight: 500, color: "#F3EAD3" }}>
            Our child-safety promise
          </h2>
          <ul className="kids-safe">
            {SAFETY.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p style={{ margin: "14px 0 0", fontSize: 13, color: "rgba(246,241,230,.75)" }}>
            Volunteers who work with children are screened, and we follow state child-abuse reporting laws. Questions?{" "}
            {info?.phone && (
              <a href={`tel:+${info.phone}`} style={{ color: "#E8CF83" }}>
                {phoneDisplay(info.phone)}
              </a>
            )}
          </p>
        </section>

        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <h2 className="serif kids-h2" style={{ margin: 0 }}>Ready to join?</h2>
          <p style={{ margin: 0, maxWidth: 520, fontSize: 14.5, lineHeight: 1.6, color: "#2E3A33" }}>
            Register each child, read and sign the parent consent, and you get the Zoom details by email and in your member dashboard.
          </p>
          <Link to="/kids/register" className="gaw-pill-gold" style={PILL}>
            Register your child
          </Link>
        </section>
      </main>

      <SiteFooter title="Kids Meditation Circle" sub="Wisdom · Wellness · Meditation — for children, online and free." />
    </SitePage>
  );
}
