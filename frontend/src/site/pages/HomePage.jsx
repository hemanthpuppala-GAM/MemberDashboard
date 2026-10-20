import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SitePage, AdminEditLink, DailySitLink } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
import { useSiteContent } from "../useSiteContent";
import { siteAsset } from "../siteAssets";
import HomeHeader from "../home/HomeHeader";
import FilmOverlay from "../home/FilmOverlay";
import QuoteOverlay from "../home/QuoteOverlay";
import { useDailyQuote } from "../home/dailyQuote";
import StoryRings from "../stories/StoryRings";
import StoriesViewer from "../stories/StoriesViewer";
import { useSeenStories, useVideoStories } from "../stories/stories";
import "../stories/stories.css";
import ChaptersSheet from "../home/ChaptersSheet";
import BodhiNavigator from "../home/BodhiNavigator";
import { WorldSitsFooter } from "../home/WorldSits";
import { CHAPTER_HASHES, QUESTIONS, chapterData, listOr } from "../home/homeData";
import { useSits } from "../home/sits";
import { eventRow, useEventSessions, useHomeSessions } from "../liveSessions";
import { useHomeVoices } from "../siteQuotes";
import "../home/home.css";
import CmsExtraSections from "../cms/CmsExtraSections";

/** Design DEFAULTS keys that content/home.json doesn't carry. */
const FALLBACKS = {
  testiKicker: "What members say",
  testiCta: "More stories",
  storiesCta: "Watch their stories",
  storiesRailTitle: "Seeker stories",
  quoteKicker: "Quote of the day",
  quoteCta: "Read today’s musing",
  joinShortLabel: "Join",
  privacyLabel: "Privacy",
  filmSrc: "assets/peace-film.mp4",
};

const VOICES = [
  { text: "A doctor in a white coat heals the body; a spiritual teacher heals the soul.", name: "Manohar Gnani" },
  { text: "He explains spiritual principles in a simple, logical and scientific way.", name: "Sreenivas Kumar G." },
  { text: "My thoughts really changed after listening to Hari sir — and I started doing meditation.", name: "Vamshi" },
  { text: "Now I know what inner peace is, and how to attain it.", name: "Jyothi Gunda" },
  { text: "After knowing him I have not only improved my health but also my thinking towards my life.", name: "Sheela Shivraman" },
  { text: "His teachings have helped me navigate daily stress with a calm and grounded spirit.", name: "Hem" },
  { text: "Incredibly knowledgeable — a walking encyclopedia, with answers to even the most profound spiritual questions.", name: "Kavitha Reddy" },
  { text: "I have attended a few of his sessions — fantastic, and free of cost.", name: "Swathi G" },
  { text: "He is a modern Guru for people who want to grow spiritually.", name: "Premalatha" },
  { text: "The Golden Age movement will definitely attract more youth towards meditation.", name: "Aruna Chatla" },
  { text: "He is a torch bearer to many in spirituality.", name: "Kalyani" },
];

/** Content hrefs come from the design (anchors / design files) — map them to app routes. */
const ANCHOR_ROUTES = { "#events": "/events", "#wisdom": "/wisdom", "#wellness": "/wellness", "#meditate": "/meditation", "#about": "/about", "#mission": "/mission", "#testimonials": "/about" };
function toRoute(href, fallback) {
  const h = (href || "").trim();
  if (!h) return fallback;
  if (ANCHOR_ROUTES[h]) return ANCHOR_ROUTES[h];
  const m = h.match(/^([A-Za-z ]+)\.dc\.html(#.*)?$/);
  if (m) return m[1] === "Home Bodhi Tree v2" ? `/${m[2] || ""}` : `/${m[1].toLowerCase()}`;
  return h;
}
function SmartLink({ to, children, ...rest }) {
  if (/^https?:/.test(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}

function useViewportSize() {
  const read = () => (typeof window === "undefined" ? { w: 1440, h: 900 } : { w: window.innerWidth, h: window.innerHeight });
  const [size, setSize] = useState(read);
  useEffect(() => {
    const on = () => setSize(read());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return size;
}

function useElementHeight(ref) {
  const [hh, setHh] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => setHh(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return hh;
}

const CARD_PAD = "clamp(12px,1.2vw,20px) clamp(14px,1.4vw,24px)";
const CARD_KICK = { fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase" };
const CARD_TITLE = { fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "clamp(18px,1.5vw,26px)", lineHeight: 1.1, textWrap: "balance" };
const CARD_SUB = { fontSize: "clamp(12px,.95vw,14px)", lineHeight: 1.4, color: "#3A3128" };
const CARD_CTA = { display: "inline-flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" };
const ARROW = (
  <span aria-hidden="true" style={{ letterSpacing: 0 }}>
    →
  </span>
);

/** A <div> standing in for <Link> (same props), for cards that hold their own buttons. */
function StaticCard({ to, children, ...rest }) {
  void to;
  return <div {...rest}>{children}</div>;
}

/** / — design: Home Bodhi Tree v2.dc.html */
export default function HomePage() {
  const c = useSiteContent("home", FALLBACKS);
  const { isMember } = useMemberBadge();
  const joinTo = isMember ? "/dashboard" : "/join";
  const location = useLocation();

  const { w, h } = useViewportSize();
  const desk = w >= 700 && w >= h * 1.05;
  const phone = w < 640;
  const tablet = !desk && w >= 700; // iPad portrait: stacked like phones, but sized up
  const headerRef = useRef(null);
  const hh = Math.max(useElementHeight(headerRef), 64);
  const heroRef = useRef(null);
  const footRef = useRef(null);
  const heroH = useElementHeight(heroRef);
  const footH = useElementHeight(footRef);

  const [active, setActive] = useState(0);
  const [ch, setCh] = useState(0);
  const [chOpen, setChOpen] = useState(false);
  const [film, setFilm] = useState(false);
  const [qi, setQi] = useState(0);
  const [vi, setVi] = useState(0);
  const sits = useSits(useHomeSessions(c.sessions));
  const voices = useHomeVoices(VOICES);
  // "Seeker stories": video testimonials, opened like phone stories. #story-3 links to one.
  const stories = useVideoStories();
  const [seen, markSeen] = useSeenStories();
  const [storyAt, setStoryAt] = useState(null);
  const openStory = useCallback((i) => setStoryAt(i), []);
  const closeStory = useCallback(() => {
    setStoryAt(null);
    try {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }
  }, []);
  const storyIndex = useCallback((i) => {
    try {
      window.history.replaceState(window.history.state, "", `#story-${i + 1}`);
    } catch {
      /* ignore */
    }
  }, []);
  const firstUnseen = Math.max(0, stories.findIndex((s) => !seen.has(s.id)));
  // The members-say card is one big link — unless it holds the stories button (no buttons inside links).
  const TestiCard = stories.length ? StaticCard : Link;

  const questions = listOr(c.questions, QUESTIONS);
  const question = questions[qi % questions.length];
  const chapters = chapterData(question, c.chapters);

  const openChapter = useCallback((i) => {
    setCh(i);
    setActive(i);
    setChOpen(true);
    try {
      window.history.replaceState(window.history.state, "", `#${CHAPTER_HASHES[i]}`);
    } catch {
      /* ignore */
    }
  }, []);
  const closeChapters = useCallback(() => {
    setChOpen(false);
    try {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }
  }, []);

  // Rotating member voices (design: every 7s). The list may change length when admin
  // testimonials arrive, so the index is wrapped where it's read.
  useEffect(() => {
    const t = setInterval(() => setVi((v) => v + 1), 7000);
    return () => clearInterval(t);
  }, []);

  // Esc closes the film first, then the chapter sheet.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (film) setFilm(false);
      else if (chOpen) closeChapters();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [film, chOpen, closeChapters]);

  // Hash on load / in-app nav: chapter hashes open the sheet; #world-sits / #teachings scroll into view.
  useEffect(() => {
    const id = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (!id) return undefined;
    const raf = requestAnimationFrame(() => {
      const story = /^story-(\d+)$/.exec(id);
      if (story) {
        if (stories.length) setStoryAt(Math.min(stories.length, Math.max(1, +story[1])) - 1);
        return;
      }
      const i = CHAPTER_HASHES.indexOf(id);
      if (i >= 0) {
        openChapter(i);
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [location.hash, location.key, openChapter, stories.length]);

  // Layout maths from renderVals().
  const gutPx = Math.min(72, Math.max(24, w * 0.05));
  const treePx = Math.max(380, Math.min((w - 2 * gutPx - 48) * 0.56, (h - hh - 640) * (1277 / 835), 900));
  const cardsPx = Math.max(320, w - 2 * gutPx - treePx - 48);
  // Wide, short screens (e.g. 1900×860): give the hero column a little more width and put the
  // meditation pill + Watch link beside the headline, so the height they used goes to the tree.
  // Phones get roomier cards: 20px padding, larger titles and body copy.
  const cardPad = phone ? "20px" : CARD_PAD;
  const cardTitle = phone ? { ...CARD_TITLE, fontSize: 24 } : CARD_TITLE;
  const cardSub = phone ? { ...CARD_SUB, fontSize: 14.5, lineHeight: 1.5 } : CARD_SUB;
  const fitOn = w >= 1024 && w >= h * 1.15 && h >= 560;
  const headPx = 6.9 * Math.max(34, Math.min(w * 0.039, h * 0.075, 64)); // two-line headline width
  const wideFit = fitOn && (w - 2 * gutPx - 48) * (1.2 / 2.2) - gutPx >= headPx + 40 + 280;
  // Shorter screens: the pill sits beside the headline and the hero's Watch link is dropped
  // (the "Watch the intro" card on the right is the same thing). Both compact modes drop the
  // "Free meditation · every day" kicker so the headline starts at the top.
  const fitColW = (w - 2 * gutPx - 48) * (wideFit ? 1.2 / 2.2 : 0.5);
  const tightFit = fitOn && !wideFit && h < 800;
  // Very short screens (a 1080p laptop at 150% scaling is ~1280×590): smaller headline and line.
  const shortFit = tightFit && h < 680;
  // Room beside the headline for the pill (else it goes under the sub-line, e.g. 1024px tablets).
  const headFitPx = 6.9 * (shortFit ? Math.max(30, Math.min(h * 0.062, 44)) : Math.max(34, Math.min(w * 0.039, h * 0.075, 64)));
  const pillBeside = wideFit || fitColW - gutPx - headFitPx - 18 >= 250;
  const fitTreeH = h - hh - (w >= 1200 ? 34 : 0) - (heroH || 300) - (footH || 80) - 28;
  // Tree beside its caption, or — on tall wide screens where the caption's column is what limits
  // the tree — caption underneath (≈150px) so the tree can use the column's full width.
  const besideTreePx = Math.min(fitColW - 200, fitTreeH * (1277 / 835));
  const stackedTreePx = Math.min(fitColW - gutPx, (fitTreeH - 150) * (1277 / 835));
  const treeStacked = stackedTreePx > besideTreePx + 40;
  const fitTreePx = Math.max(240, treeStacked ? stackedTreePx : besideTreePx);
  // Desktop / landscape tablet: the whole home page fits one screen. Hero copy + tree in the left
  // column, the four cards fill the right column (where the hero emblem used to be), footer at the bottom.
  const fit = fitOn;
  const fullHeight = fit || (desk && h >= 900);
  const ivory = desk ? "transparent" : "rgba(243,234,211,.92)";
  const heroImage = siteAsset((c.heroImage && c.heroImage.trim()) || "assets/hari-stream-forest.png");
  const filmSrc = (c.filmSrc && c.filmSrc.trim()) || "assets/peace-film.mp4";
  const openFilm = (e) => {
    e.preventDefault();
    setFilm(true);
  };
  const voice = voices[vi % voices.length];
  // Fourth card: today's Daily Musings poster (CMS → Quote of the day); "Watch the intro" when there is none.
  const quotes = useDailyQuote();
  const quote = quotes.today;
  const [quoteOpen, setQuoteOpen] = useState(false);
  const closeQuote = useCallback(() => setQuoteOpen(false), []);
  // "Upcoming" card: the next one-off Live Session from admin, else the editable default copy.
  const nextEvent = useEventSessions().upcoming?.[0];
  const nextRow = nextEvent ? eventRow(nextEvent) : null;

  return (
    <SitePage>
      <main
        style={{
          position: "relative",
          minHeight: "100dvh",
          height: fullHeight ? "100dvh" : "auto",
          overflow: fullHeight ? "hidden" : "visible",
          background: "#F3EAD3",
          ...(fit
            ? { display: "grid", gridTemplateColumns: wideFit ? "minmax(0,1.2fr) minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr)", gridTemplateRows: "auto auto minmax(0,1fr) auto", columnGap: 48, padding: 0 }
            : { display: "flex", flexDirection: "column" }),
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#F7F1E3" }} />

        <HomeHeader c={c} vp={{ w, h, desk, phone }} headerRef={headerRef} />

        {/* Hero copy */}
        <div
          id="top"
          ref={heroRef}
          style={{ ...(fit ? { gridColumn: 1, gridRow: 2, paddingRight: 0 } : {}), position: "relative", zIndex: 5, order: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "clamp(10px,1.8vh,16px)", ...(wideFit || tightFit ? { display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gridTemplateAreas: pillBeside ? '"h c" "p p"' : '"h h" "p p" "c c"', justifyContent: "start", alignItems: "center", columnGap: wideFit ? 40 : 18 } : {}), width: fit ? "auto" : desk ? "50%" : "100%", padding: desk ? "clamp(8px,2vh,28px) clamp(24px,5vw,72px) 0" : tablet ? "20px clamp(32px,6vw,56px) 16px" : "22px 20px 6px", textAlign: "left", background: ivory }}
        >

          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22", animation: "gaw-rise .9s both", gridArea: "k", whiteSpace: "nowrap", ...(wideFit || tightFit || !desk ? { display: "none" } : {}) }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            Free meditation · every day
          </span>
          <h1
            className="serif"
            style={{ margin: 0, fontWeight: 500, fontSize: shortFit ? "clamp(30px,6.2dvh,44px)" : desk ? "clamp(34px,min(3.9vw,7.5dvh),64px)" : tablet ? "clamp(40px,5.6vw,56px)" : "clamp(32px,9vw,40px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", maxWidth: desk ? "14ch" : "none", color: "#12201A", animation: "gaw-rise .9s .1s both", gridArea: "h" }}
          >
            {c.headline} <em style={{ color: "#8A6F34" }}>{c.headlineAccent}</em>
          </h1>
          <p style={{ margin: 0, fontSize: shortFit ? 14.5 : desk ? "clamp(15px,1.2vw,18px)" : tablet ? 17 : "clamp(15px,4.1vw,16.5px)", fontWeight: 400, lineHeight: phone ? 1.55 : 1.45, color: "#3A3128", textWrap: "pretty", maxWidth: desk || tablet ? "48ch" : "none", animation: "gaw-rise .9s .25s both", gridArea: "p" }}>{c.subline}</p>
          <div style={{ display: "flex", flexWrap: desk ? "nowrap" : "wrap", justifyContent: "flex-start", alignItems: "center", gap: desk ? 24 : 10, marginTop: desk ? 8 : 6, ...(phone ? { width: "100%" } : {}), animation: "gaw-rise .9s .4s both", ...(wideFit ? { gridArea: "c", flexDirection: "column", alignItems: "flex-start", gap: 6, marginTop: 0, minWidth: 0 } : tightFit ? { gridArea: "c", marginTop: 0, minWidth: 0 } : {}) }}>
            <a
              href="#film"
              onClick={openFilm}
              className="home-watch"
              style={{
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                height: desk ? 48 : 44,
                padding: desk ? "0 4px" : "0 12px",
                borderRadius: 999,
                border: desk ? "none" : "1px solid rgba(255,255,255,.7)",
                background: desk ? "transparent" : "rgba(255,253,248,.45)",
                backdropFilter: desk ? "none" : "blur(16px) saturate(1.3)",
                WebkitBackdropFilter: desk ? "none" : "blur(16px) saturate(1.3)",
                boxShadow: desk ? "none" : "0 1px 0 rgba(255,255,255,.8) inset,0 10px 24px -8px rgba(60,42,16,.25)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                flex: desk ? "none" : "0 0 auto",
                minWidth: 0,
                justifyContent: "center",
                order: 2,
                ...(tightFit && !quote ? { display: "none" } : {}),
              }}
            >
              <span aria-hidden="true" style={{ display: "inline-block", width: 0, height: 0, borderLeft: "7px solid currentColor", borderTop: "4.5px solid transparent", borderBottom: "4.5px solid transparent" }} />
              {c.watchLabel}
            </a>
              <DailySitLink
                className="home-sits-cta"
                style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 48, padding: "0 22px 0 16px", borderRadius: 999, background: "linear-gradient(90deg,#E8CF83,#C9A24A)", border: "1px solid rgba(255,255,255,.5)", boxShadow: "0 1px 0 rgba(255,255,255,.6) inset,0 12px 30px -10px rgba(201,162,74,.7)", whiteSpace: "nowrap", ...(tightFit ? { height: "auto", minHeight: 48, padding: "8px 22px 8px 16px", maxWidth: "100%", borderRadius: 26 } : {}), ...(phone ? { order: 1, width: "100%", whiteSpace: "normal", height: "auto", minHeight: 56, padding: "10px 18px 10px 16px" } : {}) }}
              >
                <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: "50%", background: sits.dot, boxShadow: sits.dotGlow, animation: sits.dotAnim }} />
                <span style={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "left", minWidth: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: tightFit ? ".12em" : ".22em", textTransform: "uppercase", color: "#5A3C0E" }}>{sits.heroKicker}</span>
                  {tightFit || phone ? (
                    // Narrow pill: name and time on their own lines, a long name shortened with "…".
                    <>
                      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".02em", color: "#14241C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: phone ? "none" : 260 }}>{sits.heroName}</span>
                      {sits.heroWhen && <span style={{ fontSize: 12, fontWeight: 600, color: "#3A2A0E", whiteSpace: "nowrap" }}>{sits.heroWhen}</span>}
                    </>
                  ) : (
                    <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".02em", color: "#14241C" }}>{sits.heroLine}</span>
                  )}
                </span>
              </DailySitLink>
          </div>
        </div>

        {/* Phones / iPad portrait: video stories right under the headline, like a stories row. */}
        {!desk && stories.length ? (
          <div style={{ order: 2, position: "relative", zIndex: 5, background: ivory, padding: tablet ? "6px clamp(32px,6vw,56px) 4px" : "4px 20px 2px", display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ ...CARD_KICK, fontSize: 10.5, color: "#7A5E22" }}>{c.storiesRailTitle}</span>
            <StoryRings variant="rail" stories={stories} seen={seen} onOpen={openStory} />
          </div>
        ) : null}

        {/* Stacked layouts (phones, iPad portrait): Guruji gets a full-width portrait right under the hero, not a quarter tile. */}
        {!desk && (
          <div style={{ order: 2, background: ivory, padding: tablet ? "8px 0 18px" : "10px 0 16px" }}>
            <Link
              to="/meditation"
              className="home-guru"
              style={{ position: "relative", display: "block", width: tablet ? "min(calc(100% - 64px), 760px)" : "calc(100% - 40px)", margin: "0 auto", aspectRatio: tablet ? "16/10" : "4/5", overflow: "hidden", borderRadius: 26, background: "#14241C", boxShadow: "0 1px 0 rgba(255,255,255,.6) inset,0 28px 56px -26px rgba(60,42,16,.55)", animation: "gaw-rise .9s .3s both" }}
            >
              <img src={heroImage} alt="Dr Hari Krishna" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: tablet ? "70% 35%" : "71% 30%" }} />
              <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", gap: 4, padding: "56px 20px 18px", background: "linear-gradient(180deg,rgba(20,36,28,0),rgba(20,36,28,.88))" }}>
                <span className="serif" style={{ fontSize: tablet ? 28 : 24, lineHeight: 1.15, color: "#F6F1E6" }}>
                  {c.heroCaption}
                </span>
              </span>
            </Link>
          </div>
        )}

        {/* Bodhi-tree navigator + side cards. #teachings = the header's "Teachings" link target. */}
        <div
          id="teachings"
          style={{
            position: "relative",
            zIndex: 6,
            order: 3,
            flex: desk ? "1" : "0 0 auto",
            minHeight: 0,
            display: "flex",
            flexDirection: desk ? "row" : "column",
            alignItems: desk ? "stretch" : "center",
            justifyContent: "flex-start",
            gap: desk ? 48 : 18,
            width: "100%",
            padding: desk ? "clamp(24px,5vh,56px) clamp(24px,5vw,72px) 24px" : "4px 0 10px",
            background: ivory,
            scrollMarginTop: 12,
            ...(fit ? { display: "contents" } : {}),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: desk ? "flex-start" : "center", flex: "none", minWidth: 0, maxWidth: "100%", width: desk ? undefined : "100%", ...(fit ? { gridColumn: 1, gridRow: 3, position: "relative", zIndex: 6, padding: `12px 0 12px ${gutPx}px`, minHeight: 0, overflow: "hidden", flexDirection: treeStacked ? "column" : "row", alignItems: treeStacked ? "flex-start" : "center", justifyContent: "center", gap: 0 } : {}) }}>
            <BodhiNavigator active={active} chapters={chapters} desk={desk} treeW={fit ? `${fitTreePx}px` : desk ? `${treePx}px` : tablet ? "min(100%, 640px)" : "100%"} onActive={setActive} onOpen={openChapter} side={fit && !treeStacked} />
          </div>

          <div style={{ ...(fit ? { gridColumn: 2, gridRow: "2 / 4", position: "relative", zIndex: 6, padding: `clamp(12px,2.2vh,28px) ${gutPx}px 16px 0`, minHeight: 0 } : {}), display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start", flex: "0 0 auto", minWidth: 0, width: fit ? "auto" : desk ? cardsPx : tablet ? "min(calc(100% - 64px), 760px)" : "calc(100% - 40px)", alignSelf: desk ? "stretch" : "center", margin: desk ? 0 : "4px auto 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(2,minmax(0,1fr))" : phone ? "minmax(0,1fr)" : "repeat(3,minmax(0,1fr))", gridTemplateRows: desk ? "1fr 1fr" : "auto", gap: phone ? 14 : 12, width: "100%", flex: "1 1 auto", minHeight: 0 }}>
              <Link
                to="/meditation"
                style={{ position: "relative", display: desk ? "block" : "none", aspectRatio: desk ? "auto" : "5/4", minHeight: desk ? 160 : 0, overflow: "hidden", borderRadius: 22, background: "#14241C", boxShadow: "0 1px 0 rgba(255,255,255,.6) inset,0 24px 50px -22px rgba(60,42,16,.5)", animation: "gaw-rise .9s .4s both" }}
              >
                <img src={heroImage} alt="Dr Hari Krishna" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "72% 40%", position: desk ? "absolute" : "static", inset: 0 }} />
                <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px", background: "linear-gradient(180deg,rgba(20,36,28,0),rgba(20,36,28,.75))", ...CARD_KICK, color: "#E8CF83" }}>{c.heroCaption}</span>
              </Link>

              <SmartLink
                to={toRoute(c.eventHref, "/events")}
                className="home-card-light"
                style={{ position: "relative", minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, overflow: "hidden", padding: cardPad, borderRadius: 22, background: "rgba(255,253,248,.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 20px 40px -14px rgba(60,42,16,.22)", animation: "gaw-rise .9s .7s both" }}
              >
                <span style={{ ...CARD_KICK, color: "#7A5E22" }}>{c.eventKicker}</span>
                <span style={cardTitle}>{nextRow ? nextRow.title : c.eventTitle}</span>
                <span style={cardSub}>{nextRow ? `${nextRow.day} ${nextRow.month} · ${nextRow.meta}` : c.eventSub}</span>
                <span style={{ ...CARD_CTA, color: "#7A5E22" }}>
                  {c.eventCta} {ARROW}
                </span>
              </SmartLink>

              <TestiCard
                to="/about"
                className="home-card-dark"
                style={{ position: "relative", minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, overflow: "hidden", padding: cardPad, borderRadius: 22, background: "#14241C", boxShadow: "0 1px 0 rgba(255,255,255,.1) inset,0 24px 50px -22px rgba(60,42,16,.5)", animation: "gaw-rise .9s .8s both" }}
              >
                <span aria-hidden="true" style={{ position: "absolute", right: "-12%", top: "-18%", width: "60%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle,rgba(232,207,131,.28),rgba(232,207,131,0) 70%)" }} />
                <span style={{ ...CARD_KICK, color: "#E8CF83" }}>{c.testiKicker}</span>
                {fit && stories.length ? null : (
                  <span aria-hidden="true" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, lineHeight: 0.6, color: "#C9A24A" }}>
                    “
                  </span>
                )}
                <span key={vi} style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: fit ? (stories.length ? (h < 860 ? 0 : "4.6em") : 0) : "7.2em", flexShrink: fit && stories.length ? 0 : 1, animation: "gaw-rise .7s both" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: fit ? "clamp(14px,min(1.3vw,2.5dvh),22px)" : "clamp(16px,1.3vw,22px)", lineHeight: 1.15, textWrap: "pretty", ...(fit ? { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: stories.length ? (h < 860 ? 2 : 3) : 4, overflow: "hidden" } : {}) }}>{voice.text}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", color: "rgba(246,241,230,.75)" }}>— {voice.name}</span>
                </span>
                {stories.length ? (
                  // With video stories: the faces + "Watch their stories" open the player; the text link stays.
                  <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px", marginTop: 4 }}>
                    <button type="button" className="home-stories-btn" onClick={() => openStory(firstUnseen)} aria-label={`${c.storiesCta} — ${stories.length} video${stories.length === 1 ? "" : "s"}`}>
                      <StoryRings stories={stories} seen={seen} max={fit && h < 760 ? 3 : 4} />
                      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                        <span style={{ ...CARD_CTA, marginTop: 0, color: "#E8CF83" }}>▶ {c.storiesCta}</span>
                        <span style={{ fontSize: 11, color: "rgba(246,241,230,.7)" }}>{stories.length} video{stories.length === 1 ? "" : "s"}</span>
                      </span>
                    </button>
                    {/* Short screens: the card itself opens the stories page; this link would not fit. */}
                    {!(fit && h < 860) && (
                      <Link to="/about" style={{ ...CARD_CTA, marginTop: 0, fontSize: 10.5, color: "rgba(232,207,131,.8)" }}>
                        {c.testiCta} {ARROW}
                      </Link>
                    )}
                  </span>
                ) : (
                  <span style={{ ...CARD_CTA, color: "#E8CF83" }}>
                    {c.testiCta} {ARROW}
                  </span>
                )}
              </TestiCard>

              {quote ? (
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="home-card-dark"
                  aria-label={`${c.quoteKicker}: ${quote.title || c.quoteCta}`}
                  style={{ position: "relative", display: "flex", alignItems: "stretch", gap: "clamp(10px,1vw,16px)", overflow: "hidden", padding: phone ? 14 : "clamp(10px,1vw,14px)", borderRadius: 22, border: "none", background: "linear-gradient(160deg,#1C2F24 0%,#14241C 100%)", color: "#F6F1E6", minHeight: desk ? 0 : 210, boxShadow: "0 1px 0 rgba(255,255,255,.1) inset,0 24px 50px -22px rgba(60,42,16,.5)", animation: "gaw-rise .9s .9s both", cursor: "pointer", textAlign: "left", font: "inherit" }}
                >
                  {/* Never wider than ~45% of the card, so the text keeps its room on tall, narrow cards; "contain" shows the whole poster. */}
                  <img src={quote.image_url} alt="" loading="lazy" style={{ display: "block", flex: "0 1 auto", minWidth: 0, height: desk ? "100%" : 182, maxHeight: desk ? "100%" : 182, maxWidth: "45%", aspectRatio: "9/16", width: "auto", objectFit: "contain", objectPosition: "center", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.35))" }} />
                  <span style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, minWidth: 0, flex: "1 1 auto" }}>
                    <span style={{ ...CARD_KICK, color: "#E8CF83", letterSpacing: ".18em" }}>{c.quoteKicker}</span>
                    {quote.title && <span style={{ ...cardTitle, color: "#F6F1E6", ...(desk ? { fontSize: "clamp(16px,1.3vw,22px)" } : {}), ...(fit ? { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 4, overflow: "hidden" } : {}) }}>{quote.title}</span>}
                    {quote.author && <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", color: "rgba(246,241,230,.75)" }}>— {quote.author}</span>}
                    <span style={{ ...CARD_CTA, color: "#E8CF83", letterSpacing: ".14em" }}>{c.quoteCta} {ARROW}</span>
                  </span>
                </button>
              ) : (
                <a
                  href="#film"
                  onClick={openFilm}
                  className="home-card-light"
                  style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, overflow: "hidden", padding: cardPad, borderRadius: 22, background: "linear-gradient(160deg,#E9EEDF 0%,#D6DEC8 100%)", minHeight: desk ? 0 : 210, border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 20px 40px -14px rgba(31,61,43,.22)", animation: "gaw-rise .9s .9s both", cursor: "pointer" }}
                >
                  <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "38%", width: 56, height: 56, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#14241C", boxShadow: "0 0 0 8px rgba(20,36,28,.08),0 12px 24px -8px rgba(20,36,28,.5)", ...(fit && h < 760 ? { left: "auto", right: 18, top: 18, transform: "none" } : {}) }}>
                    <span style={{ position: "absolute", left: "55%", top: "50%", transform: "translate(-50%,-50%)", width: 0, height: 0, borderLeft: "16px solid #E8CF83", borderTop: "10px solid transparent", borderBottom: "10px solid transparent" }} />
                  </span>
                  <span style={{ ...CARD_KICK, color: "#1F3D2B" }}>Two minutes</span>
                  <span style={cardTitle}>Watch the intro</span>
                  <span style={cardSub}>What a session feels like, before you join one.</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div ref={footRef} style={fit ? { gridColumn: "1 / -1", gridRow: 4 } : { order: 4 }}>
          <WorldSitsFooter c={c} s={sits} compact={!desk} />
        </div>
      </main>

      {/* Sections the team adds to the Home page in Admin → CMS → Pages appear below the one-screen hero. */}
      <div style={{ background: "#F3EAD3" }}>
        <CmsExtraSections slug="home" />
      </div>

      {film && <FilmOverlay src={filmSrc} onClose={() => setFilm(false)} />}
      {storyAt !== null && stories.length ? (
        <StoriesViewer stories={stories} start={storyAt} onClose={closeStory} onSeen={markSeen} onIndex={storyIndex} />
      ) : null}
      {quoteOpen && quote && <QuoteOverlay quotes={quotes.recent.length ? quotes.recent : [quote]} onClose={closeQuote} />}
      {chOpen && <ChaptersSheet ch={ch} w={w} joinTo={joinTo} question={question} c={c} chapters={chapters} onNextQuestion={() => setQi((q) => q + 1)} onChapter={openChapter} onClose={closeChapters} />}

      <AdminEditLink page="home" />
    </SitePage>
  );
}
