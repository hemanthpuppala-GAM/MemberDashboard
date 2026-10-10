import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SitePage, AdminEditLink } from "../SiteChrome";
import { useMemberBadge } from "../useMemberBadge";
import { useSiteContent } from "../useSiteContent";
import { siteAsset } from "../siteAssets";
import HomeHeader from "../home/HomeHeader";
import FilmOverlay from "../home/FilmOverlay";
import ChaptersSheet from "../home/ChaptersSheet";
import BodhiNavigator from "../home/BodhiNavigator";
import { WorldSitsFooter } from "../home/WorldSits";
import { CHAPTER_HASHES, QUESTIONS, chapterData } from "../home/homeData";
import { useSits } from "../home/sits";
import { useHomeSessions } from "../liveSessions";
import { useHomeVoices } from "../siteQuotes";
import "../home/home.css";

/** Design DEFAULTS keys that content/home.json doesn't carry. */
const FALLBACKS = {
  testiKicker: "What members say",
  testiCta: "More stories",
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

  const question = QUESTIONS[qi % QUESTIONS.length];
  const chapters = chapterData(question);

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
      const i = CHAPTER_HASHES.indexOf(id);
      if (i >= 0) {
        openChapter(i);
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [location.hash, location.key, openChapter]);

  // Layout maths from renderVals().
  const gutPx = Math.min(72, Math.max(24, w * 0.05));
  const treePx = Math.max(380, Math.min((w - 2 * gutPx - 48) * 0.56, (h - hh - 640) * (1277 / 835), 900));
  const cardsPx = Math.max(320, w - 2 * gutPx - treePx - 48);
  // Wide, short screens (e.g. 1900×860): give the hero column a little more width and put the
  // meditation pill + Watch link beside the headline, so the height they used goes to the tree.
  const fitOn = w >= 1024 && w >= h * 1.15 && h >= 560;
  const headPx = 6.9 * Math.max(34, Math.min(w * 0.039, h * 0.075, 64)); // two-line headline width
  const wideFit = fitOn && (w - 2 * gutPx - 48) * (1.2 / 2.2) - gutPx >= headPx + 40 + 280;
  // Shorter screens without that room: the pill moves up beside the kicker line and the hero's
  // Watch link is dropped (the "Watch the intro" card on the right is the same thing).
  const fitColW = (w - 2 * gutPx - 48) * (wideFit ? 1.2 / 2.2 : 0.5);
  const tightFit = fitOn && !wideFit && h < 800 && fitColW - gutPx >= 470; // kicker + pill side by side (kicker spacing tightens below)
  // Very short screens (a 1080p laptop at 150% scaling is ~1280×590): smaller headline and line.
  const shortFit = tightFit && h < 680;
  const fitTreeH = h - hh - (w >= 1200 ? 34 : 0) - (heroH || 300) - (footH || 80) - 28;
  const fitTreePx = Math.max(240, Math.min(fitColW - 200, fitTreeH * (1277 / 835)));
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
          style={{ ...(fit ? { gridColumn: 1, gridRow: 2, paddingRight: 0 } : {}), position: "relative", zIndex: 5, order: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "clamp(10px,1.8vh,16px)", ...(wideFit || tightFit ? { display: "grid", gridTemplateColumns: "auto auto", gridTemplateAreas: wideFit ? '"k k" "h c" "p p"' : '"k c" "h h" "p p"', justifyContent: "start", alignItems: "center", columnGap: wideFit ? 40 : 18 } : {}), width: fit ? "auto" : desk ? "50%" : "100%", padding: desk ? "clamp(8px,2vh,28px) clamp(24px,5vw,72px) 0" : tablet ? "20px clamp(32px,6vw,56px) 16px" : "0 22px 12px", textAlign: "left", background: ivory }}
        >

          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22", animation: "gaw-rise .9s both", gridArea: "k", whiteSpace: "nowrap", ...(tightFit ? { letterSpacing: ".2em" } : {}) }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            Free meditation · every day
          </span>
          <h1
            className="serif"
            style={{ margin: 0, fontWeight: 500, fontSize: shortFit ? "clamp(30px,6.2dvh,44px)" : desk ? "clamp(34px,min(3.9vw,7.5dvh),64px)" : tablet ? "clamp(40px,5.6vw,56px)" : "clamp(26px,7.4vw,34px)", lineHeight: 1, letterSpacing: "-.015em", textWrap: "balance", maxWidth: desk ? "14ch" : "none", color: "#12201A", animation: "gaw-rise .9s .1s both", gridArea: "h" }}
          >
            {c.headline} <em style={{ color: "#8A6F34" }}>{c.headlineAccent}</em>
          </h1>
          <p style={{ margin: 0, fontSize: shortFit ? 14.5 : desk ? "clamp(15px,1.2vw,18px)" : tablet ? 17 : "clamp(11.5px,3.2vw,14px)", fontWeight: 400, lineHeight: 1.45, color: "#3A3128", textWrap: "pretty", maxWidth: desk || tablet ? "48ch" : "none", animation: "gaw-rise .9s .25s both", gridArea: "p" }}>{c.subline}</p>
          <div style={{ display: "flex", flexWrap: desk ? "nowrap" : "wrap", justifyContent: "flex-start", alignItems: "center", gap: desk ? 24 : 10, marginTop: desk ? 8 : 4, animation: "gaw-rise .9s .4s both", ...(wideFit ? { gridArea: "c", flexDirection: "column", alignItems: "flex-start", gap: 6, marginTop: 0 } : tightFit ? { gridArea: "c", marginTop: 0 } : {}) }}>
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
                ...(tightFit ? { display: "none" } : {}),
              }}
            >
              <span aria-hidden="true" style={{ display: "inline-block", width: 0, height: 0, borderLeft: "7px solid currentColor", borderTop: "4.5px solid transparent", borderBottom: "4.5px solid transparent" }} />
              {c.watchLabel}
            </a>
              <Link
                to="/#world-sits"
                className="home-sits-cta"
                style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 48, padding: "0 22px 0 16px", borderRadius: 999, background: "linear-gradient(90deg,#E8CF83,#C9A24A)", border: "1px solid rgba(255,255,255,.5)", boxShadow: "0 1px 0 rgba(255,255,255,.6) inset,0 12px 30px -10px rgba(201,162,74,.7)", whiteSpace: "nowrap" }}
              >
                <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: "50%", background: sits.dot, boxShadow: sits.dotGlow, animation: sits.dotAnim }} />
                <span style={{ display: "flex", flexDirection: "column", gap: 1, textAlign: "left" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase", color: "#5A3C0E" }}>{sits.heroKicker}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".02em", color: "#14241C" }}>{sits.heroLine}</span>
                </span>
              </Link>
          </div>
        </div>

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
          <div style={{ display: "flex", flexDirection: "column", alignItems: desk ? "flex-start" : "center", flex: "none", minWidth: 0, maxWidth: "100%", width: desk ? undefined : "100%", ...(fit ? { gridColumn: 1, gridRow: 3, position: "relative", zIndex: 6, padding: `12px 0 12px ${gutPx}px`, minHeight: 0, overflow: "hidden", flexDirection: "row", alignItems: "center", gap: 0 } : {}) }}>
            <BodhiNavigator active={active} chapters={chapters} desk={desk} treeW={fit ? `${fitTreePx}px` : desk ? `${treePx}px` : tablet ? "min(100%, 640px)" : "100%"} onActive={setActive} onOpen={openChapter} side={fit} />
          </div>

          <div style={{ ...(fit ? { gridColumn: 2, gridRow: "2 / 4", position: "relative", zIndex: 6, padding: `clamp(12px,2.2vh,28px) ${gutPx}px 16px 0`, minHeight: 0 } : {}), display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start", flex: "0 0 auto", minWidth: 0, width: fit ? "auto" : desk ? cardsPx : tablet ? "min(calc(100% - 64px), 760px)" : "calc(100% - 44px)", alignSelf: desk ? "stretch" : "center", margin: desk ? 0 : "0 auto 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gridTemplateRows: desk ? "1fr 1fr" : "auto", gap: 12, width: "100%", flex: "1 1 auto", minHeight: 0 }}>
              <Link
                to="/meditation"
                style={{ position: "relative", display: "block", aspectRatio: desk ? "auto" : "5/4", minHeight: desk ? 160 : 0, overflow: "hidden", borderRadius: 22, background: "#14241C", boxShadow: "0 1px 0 rgba(255,255,255,.6) inset,0 24px 50px -22px rgba(60,42,16,.5)", animation: "gaw-rise .9s .4s both" }}
              >
                <img src={heroImage} alt="Dr Hari Krishna" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "72% 40%", position: desk ? "absolute" : "static", inset: 0 }} />
                <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px", background: "linear-gradient(180deg,rgba(20,36,28,0),rgba(20,36,28,.75))", ...CARD_KICK, color: "#E8CF83" }}>{c.heroCaption}</span>
              </Link>

              <SmartLink
                to={toRoute(c.eventHref, "/events")}
                className="home-card-light"
                style={{ position: "relative", minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, overflow: "hidden", padding: CARD_PAD, borderRadius: 22, background: "rgba(255,253,248,.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 20px 40px -14px rgba(60,42,16,.22)", animation: "gaw-rise .9s .7s both" }}
              >
                <span style={{ ...CARD_KICK, color: "#7A5E22" }}>{c.eventKicker}</span>
                <span style={CARD_TITLE}>{c.eventTitle}</span>
                <span style={CARD_SUB}>{c.eventSub}</span>
                <span style={{ ...CARD_CTA, color: "#7A5E22" }}>
                  {c.eventCta} {ARROW}
                </span>
              </SmartLink>

              <Link
                to="/about"
                className="home-card-dark"
                style={{ position: "relative", minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, overflow: "hidden", padding: CARD_PAD, borderRadius: 22, background: "#14241C", boxShadow: "0 1px 0 rgba(255,255,255,.1) inset,0 24px 50px -22px rgba(60,42,16,.5)", animation: "gaw-rise .9s .8s both" }}
              >
                <span aria-hidden="true" style={{ position: "absolute", right: "-12%", top: "-18%", width: "60%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle,rgba(232,207,131,.28),rgba(232,207,131,0) 70%)" }} />
                <span style={{ ...CARD_KICK, color: "#E8CF83" }}>{c.testiKicker}</span>
                <span aria-hidden="true" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, lineHeight: 0.6, color: "#C9A24A" }}>
                  “
                </span>
                <span key={vi} style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: "7.2em", animation: "gaw-rise .7s both" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "clamp(16px,1.3vw,22px)", lineHeight: 1.15, textWrap: "pretty" }}>{voice.text}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", color: "rgba(246,241,230,.75)" }}>— {voice.name}, via NeoSouth</span>
                </span>
                <span style={{ ...CARD_CTA, color: "#E8CF83" }}>
                  {c.testiCta} {ARROW}
                </span>
              </Link>

              <a
                href="#film"
                onClick={openFilm}
                className="home-card-light"
                style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, overflow: "hidden", padding: CARD_PAD, borderRadius: 22, background: "linear-gradient(160deg,#E9EEDF 0%,#D6DEC8 100%)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 20px 40px -14px rgba(31,61,43,.22)", animation: "gaw-rise .9s .9s both", cursor: "pointer" }}
              >
                <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "38%", width: 56, height: 56, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#14241C", boxShadow: "0 0 0 8px rgba(20,36,28,.08),0 12px 24px -8px rgba(20,36,28,.5)" }}>
                  <span style={{ position: "absolute", left: "55%", top: "50%", transform: "translate(-50%,-50%)", width: 0, height: 0, borderLeft: "16px solid #E8CF83", borderTop: "10px solid transparent", borderBottom: "10px solid transparent" }} />
                </span>
                <span style={{ ...CARD_KICK, color: "#1F3D2B" }}>Two minutes</span>
                <span style={CARD_TITLE}>Watch the intro</span>
                <span style={CARD_SUB}>What a session feels like, before you join one.</span>
              </a>
            </div>
          </div>
        </div>

        <div ref={footRef} style={fit ? { gridColumn: "1 / -1", gridRow: 4 } : { order: 4 }}>
          <WorldSitsFooter c={c} s={sits} compact={!desk} />
        </div>
      </main>

      {film && <FilmOverlay src={filmSrc} onClose={() => setFilm(false)} />}
      {chOpen && <ChaptersSheet ch={ch} w={w} joinTo={joinTo} question={question} onNextQuestion={() => setQi((q) => q + 1)} onChapter={openChapter} onClose={closeChapters} />}

      <AdminEditLink page="home" />
    </SitePage>
  );
}
