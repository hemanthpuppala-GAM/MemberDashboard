import { useLayoutEffect, useRef } from "react";
import { heartChakra } from "../../data/chakras";

const ARC_LABEL_PATH_ID = "center-orb-arc-label-path";

/**
 * Anahata / Heart — fixed centre of the mandala (live site orb).
 */
export default function CenterOrb({ onNavigate }) {
  const textPathRef = useRef(null);
  const orbRef = useRef(null);

  useLayoutEffect(() => {
    const el = textPathRef.current;
    if (!el) return;
    el.textContent = "Mass Meditation · ";
    const path = el.ownerDocument.getElementById(ARC_LABEL_PATH_ID);
    if (path) {
      el.setAttribute("textLength", String(path.getTotalLength()));
      el.setAttribute("lengthAdjust", "spacing");
    }
    const orb = orbRef.current;
    const lab = el.ownerDocument.querySelector(".m-node-label");
    const w = orb ? orb.getBoundingClientRect().width : 0;
    if (w > 20 && lab && el.parentElement) {
      const target = parseFloat(getComputedStyle(lab).fontSize) || 14;
      el.parentElement.style.fontSize = `${((target * 200) / w).toFixed(2)}px`;
    }
  }, []);

  const handleClick = (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(heartChakra.view);
    }
  };

  return (
    <a
      ref={orbRef}
      href={heartChakra.href}
      onClick={handleClick}
      title="Mass meditation for global peace"
      aria-label={`${heartChakra.label} — join the daily group meditation`}
      className="m-orb animate-breathe relative z-[5] -top-1 flex aspect-square w-[clamp(88px,calc(var(--orbit-r)*0.78),128px)] flex-col items-center justify-center gap-1 rounded-full border border-[rgba(243,216,154,0.75)] no-underline outline-none backdrop-blur-[12px]"
      style={{
        background:
          "radial-gradient(circle at 38% 34%, rgba(243,216,154,0.42), rgba(40,24,64,0.55) 55%, rgba(20,12,40,0.72))",
        boxShadow:
          "0 0 50px rgba(243,216,154,0.35), 0 0 70px rgba(110,198,234,0.22), inset 0 0 22px rgba(255,255,255,0.12)",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="relative z-[1] block h-[46%] w-[46%] shrink-0"
        style={{ filter: "drop-shadow(0 2px 16px rgba(230,211,168,0.7))" }}
      >
        <polygon
          points="50,8 86,71 14,71"
          fill="none"
          stroke="#f7f1e3"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polygon
          points="50,92 14,29 86,29"
          fill="none"
          stroke="#f7f1e3"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <path
            id={ARC_LABEL_PATH_ID}
            d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0"
            fill="none"
          />
        </defs>
        <text
          className="font-body font-medium uppercase"
          style={{
            fill: "#e6d3a8",
            filter: "drop-shadow(0 1px 4px rgba(13,10,28,0.95))",
          }}
        >
          <textPath
            ref={textPathRef}
            href={`#${ARC_LABEL_PATH_ID}`}
            startOffset="0%"
          />
        </text>
      </svg>
    </a>
  );
}
