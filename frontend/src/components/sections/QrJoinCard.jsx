import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { colors } from "../../theme/colors";

const JOIN_URL = "https://goldenagewisdom.org/join";

/** Small "scan to join" card, bottom-corner of the hero (reference mockup). */
export default function QrJoinCard() {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(JOIN_URL, {
      type: "svg",
      margin: 0,
      color: { dark: colors.bg, light: "#00000000" },
    }).then((markup) => {
      if (!cancelled) setSvg(markup);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="absolute right-4 bottom-4 z-10 hidden items-center gap-3 rounded-2xl border border-[var(--color-gold)]/25 bg-[var(--color-surface)]/80 p-3 backdrop-blur-md sm:flex">
      <div
        className="h-14 w-14 shrink-0 rounded-md bg-[var(--color-ink)] p-1.5 [&_svg]:h-full [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="pr-1 text-left">
        <p className="text-xs font-semibold tracking-wide text-[var(--color-ink)] uppercase">
          Scan to join
        </p>
        <p className="text-[11px] text-[var(--color-muted-soft)]">
          Free membership · /join
        </p>
      </div>
    </div>
  );
}
