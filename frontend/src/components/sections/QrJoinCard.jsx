import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { colors } from "../../theme/colors";

const JOIN_URL = "https://goldenagewisdom.org/join";

/** Floating "scan to join" card — hub only, bottom-right (live site). */
export default function QrJoinCard({ show = true }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (!show) return undefined;
    let cancelled = false;
    QRCode.toString(JOIN_URL, {
      type: "svg",
      margin: 1,
      color: { dark: colors.onGold ?? "#241b06", light: "#f2e3bb" },
    }).then((markup) => {
      if (!cancelled) setSvg(markup);
    });
    return () => {
      cancelled = true;
    };
  }, [show]);

  if (!show) return null;

  return (
    <a
      href={JOIN_URL}
      title="Join Golden Age Wisdom"
      className="absolute right-[clamp(12px,2vw,24px)] bottom-[58px] z-[60] hidden items-center gap-3 rounded-3xl border border-[rgba(110,198,234,0.30)] bg-[rgba(14,42,58,0.72)] py-2 pr-4 pl-2 shadow-[0_8px_26px_rgba(0,0,0,0.50)] backdrop-blur-[14px] transition-all hover:border-[var(--color-gold-light)]/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.55),0_0_30px_rgba(110,198,234,0.25)] sm:flex"
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
    </a>
  );
}
