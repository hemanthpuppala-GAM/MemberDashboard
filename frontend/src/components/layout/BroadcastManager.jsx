import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { publicApi, storageUrl } from "../../lib/api";
import { getVisitorType, isBroadcastSuppressed, markBroadcastSeen } from "../../lib/broadcasts";

const VIEW_TO_SLUG = { hub: "home", practice: "meditate" };

/** New public site: SiteHeader renders this inside its sticky head so a banner stays pinned with the header. */
export const BROADCAST_SLOT_ATTR = "data-gaw-broadcast-slot";

function BroadcastBanner({ b, onDismiss }) {
  return (
    <div className="gaw-bc-banner relative z-40 flex items-center justify-center gap-3 bg-[var(--color-ink)] px-10 py-2.5 text-center">
      <span className="text-[13px] font-medium text-white">{b.content_text}</span>
      {b.cta_label && b.cta_url && (
        <a href={b.cta_url} className="gaw-bc-cta shrink-0 rounded-full bg-white/15 px-3 py-1 text-[11.5px] font-semibold text-white transition-colors hover:bg-white/25">
          {b.cta_label}
        </a>
      )}
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="gaw-bc-x absolute right-3 text-white/60 hover:text-white">
        <X size={15} />
      </button>
    </div>
  );
}

function BroadcastTicker({ b, onDismiss }) {
  return (
    <div className="gaw-bc-ticker relative z-40 flex items-center gap-3 overflow-hidden bg-[var(--color-gold)] py-2 pl-4">
      <div className="flex-1 overflow-hidden">
        <div className="w-max animate-[marquee_18s_linear_infinite] text-[13px] font-medium whitespace-nowrap text-[var(--color-on-gold)]">
          {b.content_text}
          <span className="mx-8">·</span>
          {b.content_text}
          <span className="mx-8">·</span>
        </div>
      </div>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="shrink-0 pr-4 text-[var(--color-on-gold)]/70 hover:text-[var(--color-on-gold)]">
        <X size={15} />
      </button>
    </div>
  );
}

function BroadcastPopup({ b, onDismiss, isHub }) {
  return (
    <div
      className={`gaw-bc-popup animate-[viewIn_0.35s_ease] fixed right-4 z-[70] w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[rgba(168,185,160,0.35)] bg-[var(--color-bg)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] ${
        isHub ? "bottom-[132px]" : "bottom-4"
      }`}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className={`gaw-bc-x absolute top-2.5 right-2.5 z-10 rounded-full bg-black/10 p-1 hover:bg-black/20 ${b.content_image_path ? "text-white/90" : "text-[var(--color-ink)]"}`}
      >
        <X size={14} />
      </button>
      {b.content_image_path && (
        <img src={storageUrl(b.content_image_path)} alt="" className={b.type === "media_popup" ? "h-36 w-full object-cover" : "h-28 w-full object-cover"} />
      )}
      <div className="flex flex-col gap-1.5 p-4">
        <p className="gaw-bc-title font-body text-[14.5px] font-semibold text-[var(--color-ink)]">{b.title}</p>
        {b.content_text && <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">{b.content_text}</p>}
        {b.cta_label && b.cta_url && (
          <a
            href={b.cta_url}
            className="gaw-bc-cta mt-1.5 w-fit rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] px-4 py-1.5 text-[12.5px] font-semibold text-[var(--color-on-gold)] transition-all hover:shadow-[0_0_16px_rgba(198,161,91,0.5)]"
          >
            {b.cta_label}
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Fetches broadcasts active for the current page, applies audience + frequency
 * rules client-side (server already filtered by status/date/target page), and
 * renders at most one docked banner/ticker plus one floating popup at a time.
 *
 * `site` (new public site, src/site): restyled via the .gaw-bc-site rules in site/site.css, and the
 * banner/ticker goes into the sticky header's slot (BROADCAST_SLOT_ATTR) — or, on pages without one
 * (Home's one-screen layout, Privacy), floats as a dismissable toast so it never shifts the layout.
 */
export default function BroadcastManager({ view, site = false }) {
  const slug = VIEW_TO_SLUG[view] ?? view;
  const [eligible, setEligible] = useState([]);
  const [visibleIds, setVisibleIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .broadcasts(slug)
      .then((list) => {
        if (cancelled) return;
        const visitorType = getVisitorType();
        setEligible(
          list.filter((b) => (b.audience === "all" || b.audience === visitorType) && !isBroadcastSuppressed(b))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!eligible.length) return undefined;
    const timers = eligible.map((b) =>
      setTimeout(() => {
        markBroadcastSeen(b);
        setVisibleIds((prev) => (prev.includes(b.id) ? prev : [...prev, b.id]));
      }, (b.show_after_seconds ?? 0) * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [eligible]);

  const dismiss = (b) => {
    setVisibleIds((prev) => prev.filter((id) => id !== b.id));
    setEligible((prev) => prev.filter((x) => x.id !== b.id));
  };

  const visible = eligible.filter((b) => visibleIds.includes(b.id));
  const docked = visible.find((b) => b.type === "text_banner" || b.type === "news_ticker");
  const popup = visible.find((b) => b.type === "popup_card" || b.type === "media_popup");

  let dockedEl =
    docked &&
    (docked.type === "text_banner" ? (
      <BroadcastBanner b={docked} onDismiss={() => dismiss(docked)} />
    ) : (
      <BroadcastTicker b={docked} onDismiss={() => dismiss(docked)} />
    ));
  if (dockedEl && site) {
    // Broadcasts appear after a fetch (+ delay), so the header — and its slot — is already mounted.
    const slot = document.querySelector(`[${BROADCAST_SLOT_ATTR}]`);
    // No slot: float just under the (sticky, so fixed-height) header, clear of bottom bars and the popup.
    const head = slot ? null : document.querySelector(".gaw-sticky-head");
    const top = head ? Math.max(0, head.getBoundingClientRect().bottom) + 10 : 16;
    dockedEl = slot ? (
      createPortal(<div className="gaw-bc-site">{dockedEl}</div>, slot)
    ) : (
      <div className="gaw-bc-site gaw-bc-toast" style={{ top }}>
        {dockedEl}
      </div>
    );
  }

  return (
    <>
      {dockedEl}
      {popup && (
        <div className={site ? "gaw-bc-site" : undefined}>
          <BroadcastPopup b={popup} onDismiss={() => dismiss(popup)} isHub={view === "hub"} />
        </div>
      )}
    </>
  );
}
