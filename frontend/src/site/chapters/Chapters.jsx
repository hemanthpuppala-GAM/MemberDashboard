import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./chapters.css";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** "How to sit, Quick answers" → ["How to sit", "Quick answers"] (CMS: one line or comma-separated). */
const splitNames = (names) =>
  String(names || "")
    .split(/\n|,/)
    .map((s) => s.trim());

/**
 * A page shown as chapters instead of one long scroll: a tab bar, one chapter at a time,
 * and a "Next chapter" card at the end of each. The place lives in the URL hash (/events#past),
 * so chapters can be shared and Back works.
 *
 * chapters: [{ key, label, content, show = true }] — empty chapters are left out.
 * names:    optional CMS override for the labels, in the same order ("A, B, C").
 * anchors:  { "clips": "answers" } — other hashes that open a chapter and scroll to that element.
 * compact:  smaller bar, left-aligned (for use inside a column).
 */
export default function Chapters({ chapters, names, anchors = {}, label = "Chapters", compact = false, nextLabel = "Next chapter", children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const barRef = useRef(null);

  const overrides = splitNames(names);
  const list = chapters.map((ch, i) => ({ ...ch, label: overrides[i] || ch.label })).filter((ch) => ch.show !== false);
  const hash = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  const fromAnchor = anchors[hash];
  const current = list.find((ch) => ch.key === hash)?.key || (fromAnchor && list.some((ch) => ch.key === fromAnchor) ? fromAnchor : null) || list[0]?.key;
  const idx = list.findIndex((ch) => ch.key === current);
  const next = list[idx + 1];

  // A shared anchor (e.g. /meditation#clips) opens its chapter, then scrolls to the element.
  useEffect(() => {
    if (!fromAnchor) return undefined;
    const t = setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => clearTimeout(t);
  }, [hash, fromAnchor]);

  // Phones scroll the bar sideways: keep the chosen chapter in view.
  useEffect(() => {
    const strip = barRef.current?.querySelector(".gaw-ch-bar");
    const tab = strip?.querySelector(`[data-chapter="${current}"]`);
    if (strip && tab && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: tab.offsetLeft - strip.clientWidth / 2 + tab.clientWidth / 2, behavior: "smooth" });
  }, [current]);

  const go = (key, { focus = false } = {}) => {
    if (key !== current) navigate({ hash: key === list[0]?.key ? "" : key });
    const bar = barRef.current;
    // Bring the bar back into view if the reader had scrolled past it.
    if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focus) bar?.querySelector(`[data-chapter="${key}"]`)?.focus();
  };

  const onKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const at = Math.max(0, list.findIndex((ch) => ch.key === e.target.dataset?.chapter));
    go(list[(at + (e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length].key, { focus: true });
  };

  if (!list.length) return null;
  const active = list[idx];

  return (
    <div className={`gaw-ch${compact ? " is-compact" : ""}`}>
      {list.length > 1 ? (
        <nav ref={barRef} aria-label={label} className="gaw-ch-wrap">
          <div role="tablist" aria-label={label} className="gaw-ch-bar" onKeyDown={onKey}>
            {list.map((ch, i) => (
              <button
                key={ch.key}
                type="button"
                role="tab"
                id={`gaw-ch-tab-${ch.key}`}
                data-chapter={ch.key}
                aria-selected={ch.key === current}
                aria-controls="gaw-ch-panel"
                tabIndex={ch.key === current ? 0 : -1}
                onClick={() => go(ch.key)}
                className={`gaw-ch-tab${ch.key === current ? " is-on" : ""}`}
              >
                <span aria-hidden="true" className="serif gaw-ch-num">
                  {ROMAN[i]}
                </span>
                {ch.label}
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      <div id="gaw-ch-panel" role="tabpanel" aria-labelledby={`gaw-ch-tab-${current}`} key={current} className="gaw-ch-panel">
        {active.content}
        {next ? (
          <button type="button" className="gaw-ch-next" onClick={() => go(next.key)}>
            <span className="gaw-ch-next-kicker">
              {nextLabel} · {ROMAN[idx + 1]}
            </span>
            <span className="serif gaw-ch-next-title">{next.label} →</span>
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
