import { useEffect, useRef, useState } from "react";

const TRANSITIONS = {
  fade: { hidden: "opacity-0", shown: "opacity-100" },
  "slide-left": { hidden: "opacity-0 -translate-x-8", shown: "opacity-100 translate-x-0" },
  "slide-right": { hidden: "opacity-0 translate-x-8", shown: "opacity-100 translate-x-0" },
  "slide-up": { hidden: "opacity-0 translate-y-8", shown: "opacity-100 translate-y-0" },
  zoom: { hidden: "opacity-0 scale-95", shown: "opacity-100 scale-100" },
  none: { hidden: "", shown: "" },
};

function startsVisible(animation) {
  return animation === "none" || typeof IntersectionObserver === "undefined";
}

/**
 * Fades/slides its children in the moment they scroll into view (plays once
 * per mount). `animation` is one of ANIMATIONS' values, set per-section or
 * per-card from the admin panel and passed straight through from CMS fields.
 */
export default function Reveal({ animation = "fade", delay = 0, className = "", style, as: As = "div", children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => startsVisible(animation));

  useEffect(() => {
    if (startsVisible(animation)) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animation]);

  const t = TRANSITIONS[animation] ?? TRANSITIONS.fade;

  return (
    <As
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${visible ? t.shown : t.hidden} ${className}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </As>
  );
}
