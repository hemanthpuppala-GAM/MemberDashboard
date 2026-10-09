import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-coin-tight.png";
import BrandedQr from "../ask/BrandedQr";
import { QR_PROMO } from "../ask/copy";
import { ASK_PUBLIC_URL, useSupportNumbers } from "../ask/support";
import { renderZoomSlidePng } from "../ask/zoomSlide";

/** 1920×1080 Zoom / screen-share slide, scaled to fit the viewport, with a PNG export. */
export default function AskZoomPage() {
  const support = useSupportNumbers();
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [dl, setDl] = useState("");
  const numbersLine = `Call or WhatsApp ${support.primaryDisplay} · ${support.webDisplay}`;

  useEffect(() => {
    document.title = "Ask a question — Zoom slide · Golden Age Wisdom";
    const fit = () => setScale(Math.max(0.1, Math.min(1, (wrapRef.current?.clientWidth ?? 1920) / 1920)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const download = async () => {
    setDl("Preparing…");
    try {
      const url = await renderZoomSlidePng({ url: ASK_PUBLIC_URL, numbersLine });
      const a = document.createElement("a");
      a.href = url;
      a.download = "golden-age-ask-qr-zoom-1920x1080.png";
      a.click();
      setDl("");
    } catch {
      setDl("Download failed — use a screenshot instead");
    }
  };

  return (
    <div className="box-border flex min-h-dvh flex-col items-center gap-[18px] bg-[#0E1A14] p-6 ask-font text-[#F3EAD3] antialiased">
      <div className="flex flex-wrap items-center justify-center gap-2.5 text-[13px] text-[#D8D2C4]">
        <span>Zoom slide · 1920 × 1080</span>
        <button
          type="button"
          onClick={download}
          className="min-h-[40px] cursor-pointer rounded-full border border-[rgba(232,207,131,0.5)] bg-transparent px-[18px] py-2 text-[13px] font-semibold text-[#E8CF83]"
        >
          {dl || "Download PNG for Zoom"}
        </button>
        <Link to="/ask/poster" className="text-[#E8CF83] underline underline-offset-[3px] hover:text-[#FFFDF8]">
          Print poster (Letter) →
        </Link>
      </div>

      <div ref={wrapRef} className="relative w-full max-w-[1920px] overflow-hidden" style={{ height: Math.round(1080 * scale) }}>
        <div
          className="relative box-border grid h-[1080px] w-[1920px] origin-top-left grid-cols-[1fr_auto] items-center gap-24 overflow-hidden bg-[#14241C] px-[120px] py-24"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(201,162,74,0.12),transparent_60%)]" />
          <div className="relative flex flex-col gap-[34px]">
            <div className="flex items-center gap-[22px]">
              <img src={logo} alt="Golden Age Wisdom" className="h-28 w-28 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
              <span className="text-[20px] tracking-[0.3em] text-[#E8CF83] uppercase">{QR_PROMO.eyebrow}</span>
            </div>
            <h1 className="m-0 font-headline text-[104px] leading-none font-bold text-[#FFFDF8]">
              {QR_PROMO.titleLines[0]}
              <br />
              {QR_PROMO.titleLines[1]}
            </h1>
            <p className="m-0 max-w-[760px] text-[30px] leading-[1.5] text-[#D8D2C4]">{QR_PROMO.zoomBody}</p>
            <div className="flex flex-col gap-1.5 text-[30px] leading-[1.3] text-[#E8CF83]">
              {QR_PROMO.regional.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-[24px] text-[#D8D2C4]">
              <span>{ASK_PUBLIC_URL.replace(/^https?:\/\//, "")}</span>
              <span>{numbersLine}</span>
            </div>
          </div>
          <div className="relative rounded-[48px] border-[6px] border-[#B8923E] bg-[#FFFDF8] p-8 shadow-[0_0_0_18px_rgba(232,207,131,0.1),0_30px_70px_rgba(0,0,0,0.5)]">
            <BrandedQr value={ASK_PUBLIC_URL} resolution={1280} alt="Scan to ask Golden Age Wisdom" className="block h-[640px] w-[640px] rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
