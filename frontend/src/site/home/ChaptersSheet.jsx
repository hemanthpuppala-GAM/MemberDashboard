import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { siteAsset } from "../siteAssets";
import { CHAPTER_HASHES, FAQS } from "./homeData";

const CHAPTER_LABELS = ["Rituals", "Daily pause", "Nourish", "One minute", "Reflect", "New here?"];
const CHAPTER_NOW = ["Small rituals", "Daily pause", "Nourish", "One minute", "Reflect", "New here?"];

const RITUALS = [
  { num: "01", kicker: "Mind", hue: "#A8403F", title: "Make room for stillness", body: "Give your thoughts a little space. Meditation is a practice of returning to the moment, one breath at a time.", cta: "Try a moment of calm", ch: 3 },
  { num: "02", kicker: "Body", hue: "#B5652A", title: "Nourish with intention", body: "Enjoy food that brings colour to your plate and care to your day. Slow down and savour what’s in front of you.", cta: "Discover mindful eating", ch: 2 },
  { num: "03", kicker: "Self", hue: "#5B4BA8", title: "Get to know you", body: "Notice what matters to you, what restores you, and what you’re ready to let go of. Curiosity is a lovely place to start.", cta: "Take a moment to reflect", ch: 4 },
];
const STEPS = [
  { min: "05", title: "Arrive & settle", body: "Find a comfortable seat and ease into the moment." },
  { min: "20", title: "Guided meditation", body: "Practice attention, awareness and gentle breathing." },
  { min: "05", title: "Reflect & reconnect", body: "Carry one quiet intention into the rest of your day." },
];
const EATING = [
  { hue: "#8fd0a0", lead: "Bring colour to your plate.", text: "Explore fresh vegetables, whole grains and foods you enjoy." },
  { hue: "#e6c96a", lead: "Give your meal your attention.", text: "Put your phone aside and notice taste, texture and aroma." },
  { hue: "#eda06a", lead: "Listen with kindness.", text: "Notice your hunger and fullness without rules or judgment." },
];

const SECTION_PAD = "clamp(24px,4vh,64px) clamp(24px,6vw,96px)";
const sectionBase = { flex: 1, flexDirection: "column", justifyContent: "center", alignContent: "center", position: "relative", padding: SECTION_PAD };
const KICK = { display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#7A5E22" };
const RULE = (bg = "#C9A24A") => <span aria-hidden="true" style={{ width: 28, height: 1, background: bg }} />;
const H2 = { margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 400 };
const EM = { fontStyle: "italic", color: "#7A5E22" };
const BODY = { margin: 0, maxWidth: "46ch", fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.6, color: "#3A3128", textWrap: "pretty" };
const PILL_CHIP = { padding: "7px 12px", borderRadius: 999, border: "1px solid rgba(232,207,131,.4)", fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#E8CF83" };

/** srcset limited to the portrait crops — the 4/5 frame would mangle the wide ones. */
const WELLNESS_PORTRAIT = ["320x480", "360x540", "600x720"].map((s) => `${siteAsset(`assets/pillars/wellness-${s}.webp`)} ${s.split("x")[0]}w`).join(", ");

function OneMinute() {
  const [left, setLeft] = useState(0); // 0 = idle, else seconds remaining
  const breathing = left > 0;
  useEffect(() => {
    if (!breathing) return undefined;
    const t = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [breathing]);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#7A5E22" }}>A moment, right here</span>
      <h2 style={{ ...H2, fontSize: "clamp(34px,4.6vw,64px)", lineHeight: 1.02, textWrap: "balance" }}>
        Your next breath <em style={EM}>is a new beginning.</em>
      </h2>
      <p style={{ ...BODY, fontSize: "clamp(15px,1.1vw,17px)" }}>Settle into a comfortable position. Breathe naturally, or follow this gentle rhythm if it feels comfortable.</p>
      <div style={{ position: "relative", width: "min(clamp(160px,26vw,260px),calc(100dvh - 430px))", minWidth: 120, aspectRatio: "1", margin: "12px 0 4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(138,111,52,.5)" }} />
        <span
          aria-hidden="true"
          style={{ position: "absolute", inset: "12%", borderRadius: "50%", background: "radial-gradient(circle,rgba(232,207,131,.9),rgba(201,162,74,.55) 60%,rgba(201,162,74,.15) 100%)", animation: breathing ? "home-inhale 8s ease-in-out infinite" : "none", transformOrigin: "center" }}
        />
        <span aria-live="off" style={{ position: "relative", fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,2.4vw,32px)", color: "#14241C" }}>
          {breathing ? `${left}s` : "Just be."}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setLeft((s) => (s > 0 ? 0 : 60))}
        style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 24px", borderRadius: 999, border: "1px solid #14241C", background: breathing ? "transparent" : "#14241C", color: breathing ? "#14241C" : "#F6F1E6", font: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", cursor: "pointer", transition: "background .25s,color .25s" }}
      >
        {breathing ? "Stop" : "Start a one-minute pause"}
      </button>
      <span style={{ fontSize: 12.5, color: "#6B5E48" }}>Keep your breath comfortable. You can stop at any time.</span>
    </div>
  );
}

/** Full-screen chapter sheet (design: #chapters dialog). Sections swap by `ch`. */
export default function ChaptersSheet({ ch, w, joinTo, question, onNextQuestion, onChapter, onClose }) {
  const sheet = useRef(null);
  const [faq, setFaq] = useState(-1);
  const [faqFor, setFaqFor] = useState(ch);
  if (faqFor !== ch) {
    // A new chapter closes any open answer (design: setChapter resets faq).
    setFaqFor(ch);
    setFaq(-1);
  }

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    el.scrollTop = 0;
    el.querySelector("button")?.focus({ preventScroll: true });
  }, [ch]);

  const show = (i) => (ch === i ? "flex" : "none");

  return (
    <div
      ref={sheet}
      id="chapters"
      role="dialog"
      aria-modal="true"
      aria-label="Chapter"
      data-screen-label="Chapters"
      style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", background: "#F3EAD3", color: "#14241C", boxShadow: "0 -30px 80px rgba(20,14,6,.35)", animation: "home-sheet .45s cubic-bezier(.2,.8,.2,1) both" }}
    >
      <div
        style={{ position: "sticky", top: 0, zIndex: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px clamp(16px,4vw,48px)", paddingTop: "calc(10px + env(safe-area-inset-top))", background: "rgba(243,234,211,.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(138,111,52,.2)" }}
      >
        <span aria-hidden="true" style={{ width: 44, height: 44, flex: "none" }} />
        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "#7A5E22", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
          {CHAPTER_NOW[ch]}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="home-ch-outline"
          style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(138,111,52,.4)", background: "transparent", color: "#14241C", font: "inherit", fontSize: 18, lineHeight: 1, cursor: "pointer", transition: "background .2s,color .2s" }}
        >
          ×
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* I · Small rituals */}
        <section id="rituals" data-chapter="0" data-screen-label="Small rituals" style={{ ...sectionBase, display: show(0), background: "#F3EAD3" }}>
          <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(32px,5vw,80px)", alignItems: "end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <span style={KICK}>
                {RULE()}Small rituals. Meaningful change.
              </span>
              <h2 style={{ ...H2, fontSize: "clamp(34px,4.6vw,64px)", lineHeight: 1.02, letterSpacing: "-.01em", textWrap: "balance" }}>
                Feeling better begins <em style={EM}>with being present.</em>
              </h2>
            </div>
            <p style={{ ...BODY, maxWidth: "44ch" }}>
              You don’t need to change everything to reconnect with yourself. A quiet moment, a nourishing meal, an honest reflection. Begin with the small things, and let them become your way of life.
            </p>
          </div>
          <div
            style={{ maxWidth: 1200, width: "100%", margin: "clamp(28px,4vh,56px) auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 1, background: "rgba(138,111,52,.25)", borderTop: "1px solid rgba(138,111,52,.25)", borderBottom: "1px solid rgba(138,111,52,.25)" }}
          >
            {RITUALS.map((r) => (
              <a
                key={r.num}
                href={`#${CHAPTER_HASHES[r.ch]}`}
                onClick={(e) => {
                  e.preventDefault();
                  onChapter(r.ch);
                }}
                className="home-ritual"
                style={{ display: "flex", flexDirection: "column", gap: 14, padding: "clamp(24px,2.6vw,40px) clamp(20px,2vw,32px)", background: "#F3EAD3" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".24em", textTransform: "uppercase", color: "#7A5E22" }}>
                  <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: r.hue }} />
                  {r.num} / {r.kicker}
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "clamp(24px,2.1vw,32px)", lineHeight: 1.1 }}>{r.title}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty" }}>{r.body}</span>
                <span style={{ marginTop: "auto", paddingTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#7A5E22" }}>{r.cta} ↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* II · Daily pause */}
        <section id="daily-pause" data-chapter="1" data-screen-label="Daily pause" style={{ ...sectionBase, display: show(1), background: "#14241C", color: "#F6F1E6", overflow: "hidden" }}>
          <span aria-hidden="true" style={{ position: "absolute", right: "-10%", top: "-30%", width: "min(60vw,700px)", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle,rgba(232,207,131,.22),rgba(232,207,131,0) 70%)" }} />
          <div style={{ position: "relative", maxWidth: 1200, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(40px,6vw,96px)", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <span style={{ ...KICK, color: "#E8CF83" }}>
                {RULE("#E8CF83")}Your daily pause
              </span>
              <h2 style={{ ...H2, fontSize: "clamp(40px,5.4vw,84px)", lineHeight: 0.98, letterSpacing: "-.01em" }}>
                30 minutes.
                <br />
                Every day.
                <br />
                <em style={{ ...EM, color: "#E8CF83" }}>Just for you.</em>
              </h2>
              <p style={{ ...BODY, color: "rgba(246,241,230,.8)" }}>A free meditation program to help you build a gentle, consistent practice. Come as you are — no experience, special equipment, or perfect mindset needed.</p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 24px", marginTop: 6 }}>
                <Link
                  to={joinTo}
                  className="home-gold-cta"
                  style={{ display: "inline-flex", alignItems: "center", height: 50, padding: "0 26px", borderRadius: 999, background: "linear-gradient(90deg,#E8CF83,#C9A24A)", fontSize: 12, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", boxShadow: "0 14px 30px -12px rgba(201,162,74,.7)" }}
                >
                  Join the free program
                </Link>
                <span style={{ fontSize: 12.5, color: "rgba(246,241,230,.65)" }}>Always free · Beginner-friendly · A fresh start every day</span>
              </div>
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
              {STEPS.map((st) => (
                <li key={st.title} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 20, padding: "clamp(18px,2vw,28px) 0", borderTop: "1px solid rgba(232,207,131,.22)" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,2.6vw,40px)", lineHeight: 1, color: "#E8CF83" }}>
                    {st.min}
                    <span style={{ fontSize: ".4em", letterSpacing: ".1em", marginLeft: 4, fontFamily: "'Manrope',sans-serif", fontWeight: 600 }}>MIN</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{st.title}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(246,241,230,.7)" }}>{st.body}</span>
                  </span>
                </li>
              ))}
              <li style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 22, borderTop: "1px solid rgba(232,207,131,.22)" }}>
                <span style={PILL_CHIP}>Every day</span>
                <span style={PILL_CHIP}>30 minutes</span>
                <span style={PILL_CHIP}>All levels</span>
              </li>
            </ol>
          </div>
        </section>

        {/* III · Nourish */}
        <section id="nourish" data-chapter="2" data-screen-label="Nourish" style={{ ...sectionBase, display: show(2), background: "#F3EAD3" }}>
          <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,80px)", alignItems: "center" }}>
            <div style={{ position: "relative", aspectRatio: "4/5", maxHeight: "min(620px,calc(100dvh - 300px))", margin: "0 auto", borderRadius: 28, overflow: "hidden", background: "#14241C", boxShadow: "0 30px 60px -30px rgba(60,42,16,.5)" }}>
              <img
                src={siteAsset("assets/pillars/wellness-600x720.webp")}
                srcSet={WELLNESS_PORTRAIT}
                sizes="(min-width: 700px) 500px, 90vw"
                alt="Colourful bowl of grains, greens and vegetables"
                loading="lazy"
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span style={{ position: "absolute", left: 20, bottom: 18, fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "#E8CF83" }}>Good food. Full attention.</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <span style={KICK}>
                {RULE()}Nourish your body
              </span>
              <h2 style={{ ...H2, fontSize: "clamp(30px,4.2vw,68px)", lineHeight: 0.98, letterSpacing: "-.01em" }}>
                Eat well. Slow down.
                <br />
                <em style={EM}>Savor life.</em>
              </h2>
              <p style={BODY}>Good food is more than what’s on your plate. It’s the way you choose, prepare and enjoy it. Make your next meal a small act of care.</p>
              <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0, display: "flex", flexDirection: "column" }}>
                {EATING.map((e) => (
                  <li key={e.lead} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 14, padding: "16px 0", borderTop: "1px solid rgba(138,111,52,.25)", fontSize: 15, lineHeight: 1.5, color: "#3A3128" }}>
                    <span aria-hidden="true" style={{ marginTop: 7, width: 8, height: 8, borderRadius: "50%", background: e.hue }} />
                    <span>
                      <strong style={{ fontWeight: 600, color: "#14241C" }}>{e.lead}</strong> {e.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* IV · One minute */}
        <section id="one-minute" data-chapter="3" data-screen-label="One minute" style={{ ...sectionBase, display: show(3), background: "#EDE2C6", textAlign: "center" }}>
          {ch === 3 && <OneMinute />}
        </section>

        {/* V · Reflect */}
        <section id="reflect" data-chapter="4" data-screen-label="Reflect" style={{ ...sectionBase, display: show(4), background: "#F3EAD3" }}>
          <div style={{ maxWidth: 960, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
            <span style={KICK}>
              {RULE()}Meet yourself with curiosity
            </span>
            <h2 aria-live="polite" style={{ ...H2, fontSize: "clamp(36px,5.2vw,80px)", lineHeight: 1, letterSpacing: "-.01em", textWrap: "balance", minHeight: "2em" }}>
              {question}
            </h2>
            <p style={{ margin: 0, fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.6, color: "#3A3128" }}>No right answer. No need to rush. Let the question sit with you.</p>
            <button
              type="button"
              onClick={onNextQuestion}
              style={{ alignSelf: "flex-start", minHeight: 44, background: "none", border: "none", padding: "8px 0", font: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: "#7A5E22", cursor: "pointer", borderBottom: "1px solid #C9A24A", borderRadius: 0 }}
            >
              Explore another question ↻
            </button>
          </div>
        </section>

        {/* VI · FAQ */}
        <section id="new-here" data-chapter="5" data-screen-label="FAQ" style={{ ...sectionBase, display: show(5), background: "#F3EAD3" }}>
          <div style={{ maxWidth: 960, width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(32px,5vw,80px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#7A5E22" }}>A few things to know</span>
              <h2 style={{ ...H2, fontSize: "clamp(32px,4vw,56px)", lineHeight: 1.02 }}>
                New here?
                <br />
                <em style={EM}>You’re welcome.</em>
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {FAQS.map((q, i) => {
                const open = faq === i;
                return (
                  <div key={q.q} style={{ borderTop: "1px solid rgba(138,111,52,.3)" }}>
                    <button
                      type="button"
                      onClick={() => setFaq((f) => (f === i ? -1 : i))}
                      aria-expanded={open}
                      aria-controls={`home-faq-${i}`}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 0", background: "none", border: "none", font: "inherit", textAlign: "left", fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,1.8vw,26px)", color: "#14241C", cursor: "pointer", borderRadius: 0 }}
                    >
                      {q.q}
                      <span
                        aria-hidden="true"
                        style={{ flex: "none", width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(138,111,52,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif", fontSize: 16, color: "#7A5E22", transform: open ? "rotate(45deg)" : "none", transition: "transform .3s" }}
                      >
                        +
                      </span>
                    </button>
                    <p id={`home-faq-${i}`} style={{ display: open ? "block" : "none", margin: "0 0 22px", maxWidth: "52ch", fontSize: 15, lineHeight: 1.6, color: "#3A3128" }}>
                      {q.a}
                    </p>
                  </div>
                );
              })}
              <div style={{ borderTop: "1px solid rgba(138,111,52,.3)" }} />
            </div>
          </div>
        </section>
      </div>

      <nav
        aria-label="Chapters"
        style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px clamp(24px,6vw,96px)", paddingBottom: "calc(14px + env(safe-area-inset-bottom))", background: "rgba(243,234,211,.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid rgba(138,111,52,.25)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px 18px", flexWrap: "wrap", minWidth: 0 }}>
          {CHAPTER_LABELS.map((label, i) => {
            const on = ch === i;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChapter(i)}
                aria-current={on ? "step" : undefined}
                aria-label={w >= 900 ? undefined : label}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minWidth: w >= 900 ? 0 : 24, minHeight: 44, background: "none", border: "none", padding: "6px 0", font: "inherit", fontSize: 10.5, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: on ? "#14241C" : "#7A5E22", cursor: "pointer", borderBottom: `1px solid ${on ? "#C9A24A" : "transparent"}`, borderRadius: 0 }}
              >
                <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: on ? "#C9A24A" : "rgba(138,111,52,.35)" }} />
                {w >= 900 && <span>{label}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          <button
            type="button"
            onClick={onClose}
            className="home-ch-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 16px 0 12px", marginRight: 8, borderRadius: 999, border: "1px solid rgba(138,111,52,.45)", background: "transparent", color: "#14241C", font: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", cursor: "pointer", transition: "background .2s,color .2s" }}
          >
            <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1, letterSpacing: 0 }}>
              ⌂
            </span>
            Home
          </button>
          <button
            type="button"
            onClick={() => onChapter((ch + 5) % 6)}
            aria-label="Previous"
            className="home-ch-prev"
            style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(138,111,52,.45)", background: "transparent", color: "#14241C", font: "inherit", fontSize: 16, cursor: "pointer" }}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => onChapter((ch + 1) % 6)}
            className="home-ch-next"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 44, padding: "0 20px", borderRadius: 999, border: "none", background: "#14241C", color: "#F6F1E6", font: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", cursor: "pointer" }}
          >
            {ch >= 5 ? "Back to start" : "Next"} <span aria-hidden="true" style={{ letterSpacing: 0 }}>→</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
