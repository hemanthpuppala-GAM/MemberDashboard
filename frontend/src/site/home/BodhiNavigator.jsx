import { siteAsset } from "../siteAssets";
import { CHAPTER_HASHES } from "./homeData";

const NUMS = ["I", "II", "III", "IV", "V", "VI"];
/** Node centres in % of the 1277/835 frame (design: chapterNodes P[]). */
const POS = [
  [81.8, 63.5],
  [61.9, 62.3],
  [21.5, 61.1],
  [27.6, 29.9],
  [46.2, 16.8],
  [66.7, 27.5],
];

/**
 * Bodhi-tree chapter navigator: six leaf-pills on the tree art. Hover / focus
 * makes a chapter active (caption below updates); click opens it.
 */
export default function BodhiNavigator({ active, chapters, desk, treeW, onActive, onOpen }) {
  const cur = chapters[active];
  const open = (i) => (e) => {
    e.preventDefault();
    onActive(i);
    onOpen(i);
  };
  return (
    <>
      <nav aria-label="Explore Golden Age Wisdom" style={{ position: "relative", width: treeW, maxWidth: "100%", aspectRatio: "1277/835", flex: "none", margin: desk ? 0 : "0 auto", overflow: "hidden", containerType: "inline-size" }}>
        <img
          src={siteAsset("assets/bodhi-tree.png")}
          alt=""
          style={{ position: "absolute", left: 0, top: "-10.78%", width: "100%", height: "auto", display: "block", mixBlendMode: "multiply", pointerEvents: "none", userSelect: "none" }}
        />
        {chapters.map((k, i) => {
          const on = active === i;
          return (
            <a
              key={k.label}
              href={`#${CHAPTER_HASHES[i]}`}
              aria-label={k.label}
              aria-current={on ? "true" : undefined}
              onClick={open(i)}
              onMouseEnter={() => onActive(i)}
              onFocus={() => onActive(i)}
              className="home-node"
              style={{
                position: "absolute",
                left: `${POS[i][0]}%`,
                top: `${POS[i][1]}%`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: ".4cqw",
                minWidth: "15cqw",
                minHeight: "max(44px,9cqw)",
                padding: "1.2cqw 2cqw",
                borderRadius: 999,
                background: on ? "#14241C" : "#FBF6EA",
                color: on ? "#E8CF83" : "#7A5E22",
                boxShadow: "0 0 1.4cqw 1cqw #FBF6EA",
                outline: `1.5px solid ${on ? "#C9A24A" : "rgba(201,162,74,.55)"}`,
                outlineOffset: -1.5,
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                textAlign: "center",
                whiteSpace: "nowrap",
                fontSize: "clamp(8px,1.55cqw,11px)",
                fontWeight: 700,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                lineHeight: 1.25,
              }}
            >
              <span aria-hidden="true" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(10px,2cqw,14px)", fontWeight: 500, letterSpacing: ".12em", lineHeight: 1, opacity: 0.85 }}>
                {NUMS[i]}
              </span>
              {k.label}
            </a>
          );
        })}
      </nav>
      <div
        aria-live="polite"
        style={{ display: "flex", flexDirection: "column", alignItems: desk ? "flex-start" : "center", textAlign: desk ? "left" : "center", gap: 6, margin: desk ? "6px 0 0 0" : "8px auto 0", width: treeW, maxWidth: "100%", minHeight: 118, padding: "14px 20px 0", borderTop: "1px solid rgba(201,162,74,.35)" }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "#7A5E22" }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 500, letterSpacing: ".12em" }}>{NUMS[active]}</span>
          {cur.kicker}
        </span>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: "clamp(20px,1.7vw,28px)", lineHeight: 1.15, color: "#14241C", textWrap: "balance", maxWidth: 520 }}>{cur.title}</span>
        <a
          href={`#${CHAPTER_HASHES[active]}`}
          onClick={open(active)}
          className="home-caption-cta"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, marginTop: 2, fontSize: 11, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}
        >
          {cur.cta} <span aria-hidden="true" style={{ letterSpacing: 0 }}>→</span>
        </a>
      </div>
    </>
  );
}
