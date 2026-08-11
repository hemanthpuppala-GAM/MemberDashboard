import { useLayoutEffect, useEffect, useRef, useState } from "react";
import {
  DEFAULT_HUB_LAYOUT,
  computeHubLayout,
  hubLayoutChanged,
} from "./useHubLayout";

/**
 * Runs the chin-anchored layout solve whenever the hub is visible or the
 * viewport changes. Iterates a few frames so orbit/lift/translate settle.
 */
export function useHubLayout(enabled) {
  const [layout, setLayout] = useState(DEFAULT_HUB_LAYOUT);
  const [nonce, setNonce] = useState(0);
  const passRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      passRef.current = 0;
      setLayout(DEFAULT_HUB_LAYOUT);
      return undefined;
    }

    const bump = () => {
      passRef.current = 0;
      setNonce((n) => n + 1);
    };

    window.addEventListener("resize", bump);
    window.visualViewport?.addEventListener("resize", bump);
    window.visualViewport?.addEventListener("scroll", bump);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(bump)
        : null;
    const main = document.querySelector("main");
    if (ro && main) ro.observe(main);

    return () => {
      window.removeEventListener("resize", bump);
      window.visualViewport?.removeEventListener("resize", bump);
      window.visualViewport?.removeEventListener("scroll", bump);
      ro?.disconnect();
    };
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled) return undefined;

    let settleTimer;
    const next = computeHubLayout(layout);

    if (!hubLayoutChanged(layout, next)) {
      passRef.current = 0;
      return undefined;
    }

    if (passRef.current < 24) {
      passRef.current += 1;
      setLayout(next);
      return undefined;
    }

    // Budget spent mid-transition — settle after transforms finish.
    passRef.current = 0;
    settleTimer = window.setTimeout(() => {
      setLayout(next);
      setNonce((n) => n + 1);
    }, 750);

    return () => window.clearTimeout(settleTimer);
  }, [enabled, layout, nonce]);

  return enabled ? layout : DEFAULT_HUB_LAYOUT;
}
