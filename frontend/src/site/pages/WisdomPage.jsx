import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter, AdminEditLink } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
import { useSiteContent } from "../useSiteContent";
import { usePageQuotes } from "../siteQuotes";
import { useViewportWidth } from "../useViewport";
import { YOUTUBE_URL } from "../sitePages";
import "./wisdom.css";
import CmsExtraSections from "../cms/CmsExtraSections";

const PAD = "clamp(20px,5vw,72px)";
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });
const CAPS = { textTransform: "uppercase", whiteSpace: "nowrap" };

/** Design defaults for keys the content JSON may omit (Wisdom.dc.html DEFAULTS). */
const FALLBACKS = {
  eyebrow: "Wisdom without boundaries",
  title: "Ancient Wisdom. Modern Science.",
  titleAccent: "Universal Understanding.",
  cards: [],
  intro: "",
  riverKicker: "",
  riverTitle: "",
  riverTitleAccent: "",
  riverStory: "",
  riverIntro: "",
  questions: [],
  questionsNote: "",
  stages: [],
  riverEnd: "",
  ghatsKicker: "",
  ghatsTitle: "",
  ghatsIntro: "",
  ghats: [],
  closingVerse: "",
  closingMeaning: "",
  closingRef: "",
  closingBody: "",
  sourceNote: "",
  bookLabel: "Read the full book",
  bookHref: "",
  libraryKicker: "Golden Age Wisdom Library",
  libraryTitle: "Explore the Golden Age Wisdom Library",
  libraryBody: "",
  libraryClose: "",
  libraryCloseSub: "",
  quotes: [],
  filmLabel: "Watch the intro film",
  filmHref: YOUTUBE_URL,
  cta: "Join the live sessions — free",
  ctaHref: "Member Flow.dc.html",
  chapterOverview: "Start here",
  chapterRiver: "The river of wisdom",
  chapterGhats: "Many ways in",
  chapterTruth: "One truth",
  footerTitle: "Sit with us — free, every day.",
  footerSub: "Guided live on YouTube, Monday to Saturday. No experience needed.",
};

const DESIGN_ROUTES = {
  "Home Bodhi Tree v2.dc.html": "/",
  "About.dc.html": "/about",
  "Mission.dc.html": "/mission",
  "Meditation.dc.html": "/meditation",
  "Wisdom.dc.html": "/wisdom",
  "Wellness.dc.html": "/wellness",
  "Events.dc.html": "/events",
  "Volunteer.dc.html": "/volunteer",
  "Privacy.dc.html": "/privacy",
  "Ask.dc.html": "/ask",
};

/** Link target from content (may be a design file name, an app path or an external URL). */
function ContentLink({ href, isMember, children, ...rest }) {
  const h = (href || "").trim();
  if (/^https?:/.test(h)) {
    return (
      <a href={h} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  const to = !h || h === "Member Flow.dc.html" ? (isMember ? "/dashboard" : "/join") : DESIGN_ROUTES[h] || h;
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}

const INK = "#12201A";
const BODY = "#3A3128";
const GOLD_INK = "#7A5E22";

function Kicker({ children, color = GOLD_INK }) {
  return <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color }}>{children}</span>;
}

/** A Sanskrit line, its meaning and its source. */
function Verse({ verse, meaning, refText, small }) {
  if (!verse) return null;
  return (
    <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
      <blockquote lang="sa-Latn" className="serif" style={{ margin: 0, fontStyle: "italic", fontSize: small ? 17 : "clamp(19px,1.6vw,23px)", lineHeight: 1.3, color: "#5A3C0E", textWrap: "balance" }}>
        “{verse}”
      </blockquote>
      {meaning ? <p style={{ margin: 0, fontSize: small ? 13.5 : 14.5, lineHeight: 1.5, color: BODY }}>{meaning}</p> : null}
      {refText ? <figcaption style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: GOLD_INK }}>— {refText}</figcaption> : null}
    </figure>
  );
}

/** Short label for a river stop: "Shruti — the Vedas" → "Shruti". */
const stopLabel = (name = "") => name.split(/\s+[—–-]\s+/)[0];

/** One stage of the river, as a card (text + optional verse). */
function StageCard({ st, desk }) {
  return (
    <article
      className="wisdom-card"
      style={{ display: "grid", gridTemplateColumns: desk && st.verse ? "minmax(0,1.25fr) minmax(0,1fr)" : "1fr", gap: desk ? 28 : 14, alignItems: "center", padding: "clamp(18px,2vw,28px)", borderRadius: 20, background: "rgba(255,253,248,.55)", boxShadow: "0 12px 30px -18px rgba(60,42,16,.28)" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {st.place ? <Kicker>{st.place}</Kicker> : null}
        <h3 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(23px,2vw,29px)", lineHeight: 1.12, color: INK, textWrap: "balance" }}>
          {st.name}
          {st.alias ? <span style={{ display: "block", marginTop: 2, fontSize: ".62em", fontStyle: "italic", color: "#8A6F34" }}>{st.alias}</span> : null}
        </h3>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: BODY, textWrap: "pretty" }}>{st.body}</p>
        {st.tryThis ? (
          <p style={{ margin: "4px 0 0", display: "flex", gap: 10, alignItems: "baseline", fontSize: 14, lineHeight: 1.55, color: "#14241C" }}>
            <span style={{ flex: "none", padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#F6F1E6", background: "#1B3328" }}>Try this</span>
            <span>{st.tryThis}</span>
          </p>
        ) : null}
      </div>
      {st.verse ? (
        <div style={{ padding: "16px 18px", borderRadius: 16, background: "rgba(232,207,131,.2)", border: "1px solid rgba(201,162,74,.35)" }}>
          <Verse verse={st.verse} meaning={st.meaning} refText={st.ref} />
        </div>
      ) : null}
    </article>
  );
}

/**
 * The river, walked one stop at a time: a row of numbered stops (∞ = the sea, where it ends)
 * and the chosen stage below. Arrow keys move along the stops.
 */
function RiverWalk({ stages, end, stop, onStop, desk }) {
  const stopsRef = useRef(null);
  const total = stages.length + (end ? 1 : 0);
  const atSea = end && stop === stages.length;
  const st = stages[stop];

  // Keep the chosen stop visible in the strip (phones scroll it sideways).
  useEffect(() => {
    const strip = stopsRef.current;
    const btn = strip?.querySelector(`[data-stop="${stop}"]`);
    if (strip && btn) strip.scrollTo({ left: btn.offsetLeft - strip.clientWidth / 2 + btn.clientWidth / 2, behavior: "smooth" });
  }, [stop]);

  const onKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const cur = Number(e.target.dataset?.stop ?? stop); // the focused stop: fast repeats run ahead of the re-render
      const next = Math.min(total - 1, Math.max(0, cur + (e.key === "ArrowRight" ? 1 : -1)));
      onStop(next);
      stopsRef.current?.querySelector(`[data-stop="${next}"]`)?.focus();
    }
  };

  const label = (i) => (i === stages.length ? "The sea" : stopLabel(stages[i]?.name));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1040, width: "100%", alignSelf: "center" }}>
      <div ref={stopsRef} role="tablist" aria-label="Stages of the river" onKeyDown={onKey} className="wisdom-walk">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            data-stop={i}
            aria-selected={i === stop}
            aria-controls="wisdom-stop-panel"
            tabIndex={i === stop ? 0 : -1}
            onClick={() => onStop(i)}
            className={`wisdom-stop${i === stop ? " is-on" : ""}${i < stop ? " is-past" : ""}`}
          >
            <span aria-hidden="true" className="serif wisdom-stop-dot">{i === stages.length ? "∞" : i + 1}</span>
            <span className="wisdom-stop-name">{label(i)}</span>
          </button>
        ))}
      </div>

      <div id="wisdom-stop-panel" role="tabpanel" aria-live="polite" key={stop} style={{ animation: "gaw-rise .45s both" }}>
        {atSea ? (
          <p className="serif" style={{ margin: 0, padding: "clamp(22px,3vw,36px)", borderRadius: 20, textAlign: "center", fontSize: "clamp(22px,2.2vw,30px)", lineHeight: 1.3, fontStyle: "italic", color: INK, background: "rgba(232,207,131,.18)", border: "1px solid rgba(201,162,74,.35)", textWrap: "balance" }}>
            {end}
          </p>
        ) : st ? (
          <StageCard st={st} desk={desk} />
        ) : null}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <button type="button" className="wisdom-step" disabled={stop === 0} onClick={() => onStop(stop - 1)}>
          ← {stop > 0 ? label(stop - 1) : "Start"}
        </button>
        <span style={{ alignSelf: "center", fontSize: 12, fontWeight: 600, letterSpacing: ".12em", color: GOLD_INK }}>
          {stop + 1} / {total}
        </span>
        <button type="button" className="wisdom-step" disabled={stop >= total - 1} onClick={() => onStop(stop + 1)}>
          {stop < total - 1 ? label(stop + 1) : "End"} →
        </button>
      </div>
    </div>
  );
}

/** Chapter II — "One living river": the story, the two questions, then the walk. */
function RiverChapter({ c, desk, mid, stop, onStop }) {
  const stages = c.stages || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px,3vh,30px)" }}>
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
        {c.riverKicker ? <Kicker>{c.riverKicker}</Kicker> : null}
        <h2 id="wisdom-river-title" className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(28px,3.2vw,46px)", lineHeight: 1.08, letterSpacing: "-.01em", color: INK, maxWidth: "26ch", textWrap: "balance" }}>
          {c.riverTitle} {c.riverTitleAccent ? <em style={{ color: "#8A6F34" }}>{c.riverTitleAccent}</em> : null}
        </h2>
        {c.riverStory ? (
          <p className="serif wisdom-story" style={{ margin: "6px 0 0", maxWidth: "52ch", padding: "16px 22px", borderRadius: 18, fontSize: "clamp(18px,1.6vw,22px)", lineHeight: 1.45, fontStyle: "italic", color: INK, background: "rgba(232,207,131,.18)", borderLeft: "3px solid #C9A24A", textAlign: "left", textWrap: "pretty" }}>
            {c.riverStory}
          </p>
        ) : null}
        {c.riverIntro ? <p style={{ margin: 0, maxWidth: "68ch", fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.7, color: BODY, textWrap: "pretty" }}>{c.riverIntro}</p> : null}
      </header>

      {(c.questions || []).length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: mid ? "repeat(2,minmax(0,1fr))" : "1fr", gap: 14 }}>
            {c.questions.map((q, i) => (
              <article key={i} className="wisdom-card" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "clamp(18px,2vw,26px)", borderRadius: 20, background: "rgba(255,253,248,.55)" }}>
                <Kicker>{`Question ${i + 1}${q.label ? ` · ${q.label}` : ""}`}</Kicker>
                <h3 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(24px,2.1vw,30px)", lineHeight: 1.1, color: INK }}>{q.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: BODY, textWrap: "pretty" }}>{q.body}</p>
              </article>
            ))}
          </div>
          {c.questionsNote ? <p style={{ margin: 0, textAlign: "center", fontSize: 14, fontStyle: "italic", color: GOLD_INK }}>{c.questionsNote}</p> : null}
        </div>
      ) : null}

      {stages.length ? <RiverWalk stages={stages} end={c.riverEnd} stop={stop} onStop={onStop} desk={desk} /> : null}
    </div>
  );
}

/** Chapter III — many ghats, one water. */
function GhatsChapter({ c, desk, mid }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
        {c.ghatsKicker ? <Kicker>{c.ghatsKicker}</Kicker> : null}
        {c.ghatsTitle ? <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(28px,3vw,42px)", lineHeight: 1.1, color: INK }}>{c.ghatsTitle}</h2> : null}
        {c.ghatsIntro ? <p style={{ margin: 0, maxWidth: "62ch", fontSize: 15, lineHeight: 1.65, color: BODY, textWrap: "pretty" }}>{c.ghatsIntro}</p> : null}
      </header>
      <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(5,minmax(0,1fr))" : mid ? "repeat(2,minmax(0,1fr))" : "1fr", gap: 12 }}>
        {(c.ghats || []).map((g, i) => (
          <article key={i} className="wisdom-card" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 18px 20px", borderRadius: 18, background: "rgba(255,253,248,.55)" }}>
            <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: GOLD_INK }}>{g.who}</h3>
            {g.text ? <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: BODY }}>{g.text}</p> : null}
            <Verse verse={g.verse} meaning={g.meaning} small />
          </article>
        ))}
      </div>
    </div>
  );
}

/** Chapter IV — one truth, many paths: the closing verse, sources and what members say. */
function TruthChapter({ c, quotes, mid }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px,3vh,30px)" }}>
      {c.closingVerse ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <span aria-hidden="true" className="serif" style={{ fontSize: 30, color: "#C9A24A", lineHeight: 1 }}>ॐ</span>
          <p lang="sa-Latn" className="serif" style={{ margin: 0, fontStyle: "italic", fontSize: "clamp(26px,3vw,42px)", lineHeight: 1.1, color: "#5A3C0E", textWrap: "balance" }}>“{c.closingVerse}”</p>
          {c.closingMeaning ? <p className="serif" style={{ margin: 0, fontSize: "clamp(18px,1.6vw,22px)", color: INK }}>{c.closingMeaning}</p> : null}
          {c.closingRef ? <Kicker>— {c.closingRef}</Kicker> : null}
          {c.closingBody ? <p style={{ margin: "6px 0 0", maxWidth: "62ch", fontSize: 15, lineHeight: 1.7, color: BODY, textWrap: "pretty" }}>{c.closingBody}</p> : null}
          {c.sourceNote || c.bookHref ? (
            <p style={{ margin: "4px 0 0", maxWidth: "70ch", fontSize: 12.5, lineHeight: 1.55, color: "#6B5C48" }}>
              {c.sourceNote}
              {c.bookHref ? (
                <>
                  {" "}
                  <a href={c.bookHref} target="_blank" rel="noopener noreferrer" style={{ color: "#7A5E22", fontWeight: 600 }}>
                    {c.bookLabel} →
                  </a>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      ) : null}
      {quotes.length ? (
        <div style={{ display: "grid", gridTemplateColumns: mid ? "repeat(2,minmax(0,1fr))" : "1fr", gap: 12 }}>
          {quotes.map((t, i) => (
            <blockquote key={i} style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6, padding: "16px 20px", borderRadius: 16, background: "rgba(232,207,131,.22)", border: "1px solid rgba(201,162,74,.4)" }}>
              <p className="serif" style={{ margin: 0, fontSize: 19, lineHeight: 1.3, color: "#12201A", textWrap: "pretty" }}>
                {t.text}
              </p>
              <footer style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#7A5E22" }}>— {t.name}, via NeoSouth</footer>
            </blockquote>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

/** /wisdom — design: Wisdom.dc.html */
export default function WisdomPage() {
  const c = useSiteContent("wisdom", FALLBACKS);
  const quotes = usePageQuotes("wisdom", c.quotes);
  const w = useViewportWidth();
  const { isMember } = useMemberBadge();
  const location = useLocation();
  const navigate = useNavigate();
  const barRef = useRef(null);
  const desk = w >= 900;
  const mid = w >= 640;
  const cardCols = desk ? "repeat(3,minmax(0,1fr))" : "1fr";

  // Four chapters instead of one long scroll; a chapter with no content is left out.
  const stages = c.stages || [];
  const chapters = [
    { key: "overview", label: c.chapterOverview || "Start here", show: (c.cards || []).length > 0 || !!c.libraryTitle },
    { key: "river", label: c.chapterRiver || "The river of wisdom", show: stages.length > 0 || !!c.riverTitle },
    { key: "ghats", label: c.chapterGhats || "Many ways in", show: (c.ghats || []).length > 0 },
    { key: "truth", label: c.chapterTruth || "One truth", show: !!c.closingVerse || quotes.length > 0 },
  ].filter((ch) => ch.show);

  // The address bar carries the place: /wisdom#river-3 = chapter "river", stop 3 (shareable; Back works).
  const [hashKey, hashStop] = decodeURIComponent((location.hash || "").replace(/^#/, "")).split("-");
  const chapter = chapters.find((ch) => ch.key === hashKey)?.key || chapters[0]?.key;
  const stopCount = stages.length + (c.riverEnd ? 1 : 0);
  const stop = chapter === "river" ? Math.min(Math.max(0, (parseInt(hashStop, 10) || 1) - 1), Math.max(0, stopCount - 1)) : 0;
  const idx = chapters.findIndex((ch) => ch.key === chapter);
  const nextChapter = chapters[idx + 1];

  // Phones scroll the chapter bar sideways: keep the chosen chapter in view.
  useEffect(() => {
    const strip = barRef.current?.querySelector(".wisdom-chapters");
    const tab = strip?.querySelector(`[data-chapter="${chapter}"]`);
    if (strip && tab && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: tab.offsetLeft - strip.clientWidth / 2 + tab.clientWidth / 2, behavior: "smooth" });
  }, [chapter]);

  const goChapter = (key) => {
    if (key === chapter) return;
    navigate({ hash: key === chapters[0]?.key ? "" : key });
    // Bring the chapter bar back to the top of the screen if the reader had scrolled past it.
    const bar = barRef.current;
    if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const goStop = (i) => navigate({ hash: `river-${i + 1}` }, { replace: true });

  const onTabKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const cur = Math.max(0, chapters.findIndex((ch) => ch.key === e.target.dataset?.chapter));
    const next = chapters[(cur + (e.key === "ArrowRight" ? 1 : chapters.length - 1)) % chapters.length];
    goChapter(next.key);
    barRef.current?.querySelector(`[data-chapter="${next.key}"]`)?.focus();
  };

  return (
    <SitePage>
      <SiteHeader active="wisdom" />
      <Breadcrumb current="Wisdom" />

      <section
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "clamp(20px,3vh,32px)", padding: `clamp(24px,4vh,48px) ${PAD} clamp(40px,6vh,72px)`, maxWidth: 1240, width: "100%", margin: "0 auto" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22", ...rise() }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            {c.eyebrow}
          </span>
          <h1
            className="serif"
            style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.4vw,64px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", maxWidth: "24ch", ...rise(0.1) }}
          >
            {c.title} <em style={{ display: "block", color: "#8A6F34" }}>{c.titleAccent}</em>
          </h1>
          {c.intro ? (
            <p style={{ margin: "4px 0 0", maxWidth: "68ch", fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.65, color: "#3A3128", textWrap: "pretty", ...rise(0.2) }}>{c.intro}</p>
          ) : null}
        </div>

        {/* Chapter bar */}
        {chapters.length > 1 ? (
          <nav ref={barRef} aria-label="Wisdom chapters" className="wisdom-chapters-wrap" style={rise(0.25)}>
            <div role="tablist" aria-label="Wisdom chapters" className="wisdom-chapters" onKeyDown={onTabKey}>
              {chapters.map((ch, i) => (
                <button
                  key={ch.key}
                  type="button"
                  role="tab"
                  id={`wisdom-tab-${ch.key}`}
                  data-chapter={ch.key}
                  aria-selected={ch.key === chapter}
                  aria-controls="wisdom-chapter"
                  tabIndex={ch.key === chapter ? 0 : -1}
                  onClick={() => goChapter(ch.key)}
                  className={`wisdom-chapter${ch.key === chapter ? " is-on" : ""}`}
                >
                  <span aria-hidden="true" className="serif wisdom-chapter-num">{ROMAN[i]}</span>
                  {ch.label}
                </button>
              ))}
            </div>
          </nav>
        ) : null}

        <div id="wisdom-chapter" role="tabpanel" aria-labelledby={`wisdom-tab-${chapter}`} key={chapter} style={{ display: "flex", flexDirection: "column", gap: "clamp(20px,3vh,32px)", animation: "gaw-rise .5s both" }}>
          {chapter === "overview" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: cardCols, gap: desk ? 18 : 14 }}>
                {(c.cards || []).map((card, i) => (
                  <article
                    key={i}
                    className="wisdom-card"
                    style={{ display: "flex", flexDirection: "column", gap: 12, padding: "clamp(20px,2vw,28px)", borderRadius: 20, background: "rgba(255,253,248,.55)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 12px 30px -14px rgba(60,42,16,.28)" }}
                  >
                    <span
                      aria-hidden="true"
                      className="serif"
                      style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 35% 35%,#F3EAD3,#E8CF83)", border: "1px solid #C9A24A", fontSize: 19, color: "#5A3C0E" }}
                    >
                      {card.glyph}
                    </span>
                    <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(22px,1.8vw,26px)", lineHeight: 1.15, color: "#12201A", textWrap: "balance" }}>
                      {card.title}
                    </h2>
                    <p style={{ margin: 0, maxWidth: "68ch", fontSize: 15, lineHeight: 1.65, color: "#3A3128", textWrap: "pretty" }}>{card.body}</p>
                  </article>
                ))}
              </div>

              {/* The Golden Age Wisdom Library */}
              {c.libraryTitle ? (
                <article
                  aria-labelledby="wisdom-library-title"
                  style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "clamp(26px,4vw,52px) clamp(20px,4vw,48px)", borderRadius: 26, background: "linear-gradient(170deg,#1B3328 0%,#14241C 100%)", color: "#F6F1E6", textAlign: "center", boxShadow: "0 30px 60px -30px rgba(20,14,6,.6)" }}
                >
                  <span aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 40% at 50% 0%,rgba(232,207,131,.18),transparent 70%)" }} />
                  <span style={{ position: "relative", fontSize: 11, fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#C9A24A" }}>{c.libraryKicker}</span>
                  <h2 id="wisdom-library-title" className="serif" style={{ position: "relative", margin: 0, fontWeight: 500, fontSize: "clamp(26px,2.8vw,38px)", lineHeight: 1.1, color: "#F6F1E6", textWrap: "balance" }}>
                    {c.libraryTitle}
                  </h2>
                  <p style={{ position: "relative", margin: 0, maxWidth: "64ch", fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.7, color: "rgba(246,241,230,.84)", textWrap: "pretty" }}>{c.libraryBody}</p>
                  <svg viewBox="0 0 260 44" style={{ position: "relative", width: "min(260px,70%)", height: 36 }} aria-hidden="true">
                    <path
                      d="M0,22 C13,4 26,4 39,22 C52,40 65,40 78,22 C91,4 104,4 117,22 C130,40 143,40 156,22 C169,4 182,4 195,22 C208,40 221,40 234,22 C247,4 254,8 260,16"
                      fill="none"
                      stroke="#E8CF83"
                      strokeWidth="1.6"
                      strokeDasharray="6 4"
                      style={{ animation: "wisdom-wave 14s linear infinite" }}
                    />
                  </svg>
                  {c.libraryClose ? (
                    <p className="serif" style={{ position: "relative", margin: 0, fontSize: "clamp(22px,2.2vw,30px)", lineHeight: 1.2, fontWeight: 500, color: "#E8CF83", textWrap: "balance" }}>
                      {c.libraryClose}
                    </p>
                  ) : null}
                  {c.libraryCloseSub ? <p style={{ position: "relative", margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(246,241,230,.72)" }}>{c.libraryCloseSub}</p> : null}
                </article>
              ) : null}
            </>
          ) : chapter === "river" ? (
            <RiverChapter c={c} desk={desk} mid={mid} stop={stop} onStop={goStop} />
          ) : chapter === "ghats" ? (
            <GhatsChapter c={c} desk={desk} mid={mid} />
          ) : chapter === "truth" ? (
            <TruthChapter c={c} quotes={quotes} mid={mid} />
          ) : null}

          {nextChapter ? (
            <button type="button" className="wisdom-next" onClick={() => goChapter(nextChapter.key)}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: GOLD_INK }}>
                Next chapter · {ROMAN[idx + 1]}
              </span>
              <span className="serif" style={{ fontSize: "clamp(22px,2vw,28px)", color: INK }}>
                {nextChapter.label} →
              </span>
            </button>
          ) : null}
        </div>

        {/* CTAs — under every chapter */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <ContentLink
            href={c.filmHref}
            isMember={isMember}
            className="wisdom-film-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 48, padding: "0 22px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", ...CAPS }}
          >
            <span aria-hidden="true" style={{ display: "inline-block", width: 0, height: 0, borderLeft: "7px solid currentColor", borderTop: "4.5px solid transparent", borderBottom: "4.5px solid transparent" }} />
            {c.filmLabel}
          </ContentLink>
          <ContentLink
            href={c.ctaHref}
            isMember={isMember}
            className="gaw-pill-gold"
            style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 26px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", boxShadow: "0 12px 30px -10px rgba(201,162,74,.7)", ...CAPS }}
          >
            {c.cta}
          </ContentLink>
        </div>
      </section>

      <CmsExtraSections slug="wisdom" />
      <SiteFooter title={c.footerTitle} sub={c.footerSub} />
      <AdminEditLink page="wisdom" />
    </SitePage>
  );
}
