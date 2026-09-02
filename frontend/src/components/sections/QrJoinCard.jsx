import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { colors } from "../../theme/colors";

const JOIN_PATH = "join";

/** Floating hub actions — Volunteer CTA stacked above "scan to join" (bottom-right). */
export default function QrJoinCard({ show = true, onNavigate }) {
  const [svg, setSvg] = useState("");
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}${import.meta.env.BASE_URL}${JOIN_PATH}` : `/${JOIN_PATH}`;

  useEffect(() => {
    if (!show) return undefined;
    let cancelled = false;
    QRCode.toString(joinUrl, {
      type: "svg",
      margin: 1,
      color: { dark: colors.onGold ?? "#3A2A12", light: "#FCFAF5" },
    }).then((markup) => {
      if (!cancelled) setSvg(markup);
    });
    return () => {
      cancelled = true;
    };
  }, [show, joinUrl]);

  if (!show) return null;

  return (
    <div className="absolute right-[clamp(12px,2vw,24px)] bottom-[58px] z-[60] hidden flex-col items-stretch gap-3 sm:flex">
      <button
        type="button"
        onClick={() => onNavigate?.("volunteer")}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[rgba(198,161,91,0.55)] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] px-6 py-3 font-body text-[15px] font-semibold tracking-[0.04em] text-[var(--color-on-gold)] shadow-[0_8px_26px_rgba(0,0,0,0.35),0_0_24px_rgba(198,161,91,0.35)] backdrop-blur-[10px] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_32px_rgba(198,161,91,0.5)]"
      >
        Volunteer
      </button>

      <Link
        to={JOIN_PATH}
        title="Join Golden Age Wisdom"
        className="flex items-center gap-3 rounded-3xl border border-[rgba(168,185,160,0.30)] bg-[rgba(26,19,12,0.72)] py-2 pr-4 pl-2 shadow-[0_8px_26px_rgba(0,0,0,0.50)] backdrop-blur-[14px] transition-all hover:border-[var(--color-gold-light)]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.55),0_0_30px_rgba(168,185,160,0.25)]"
      >
        <div
          className="h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl border border-[var(--color-gold)]/50 [&_svg]:h-full [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <span className="flex flex-col gap-[3px]">
          <span className="text-[11px] tracking-[0.2em] text-[var(--color-gold-light)] uppercase">
            Scan to join
          </span>
          <span className="text-[10.5px] font-light text-[#9a927f]">
            Free membership
          </span>
        </span>
      </Link>
    </div>
  );
}
