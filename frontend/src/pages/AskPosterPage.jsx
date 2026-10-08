import { useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-coin-tight.png";
import BrandedQr from "../ask/BrandedQr";
import { QR_PROMO } from "../ask/copy";
import { ASK_PUBLIC_URL, useSupportNumbers } from "../ask/support";

/** Printable US-Letter (8.5×11in = 816×1056 CSS px) poster with the brand QR to /ask. */
export default function AskPosterPage() {
  const support = useSupportNumbers();

  useEffect(() => {
    document.title = "Ask a question — QR poster · Golden Age Wisdom";
  }, []);

  return (
    <div className="min-h-dvh bg-[#F3EAD3] ask-font text-[#1B3328] antialiased print:min-h-0 print:bg-[#14241C]">
      <style>{`@page { size: letter; margin: 0; } @media print { html, body { background: #14241C; } }`}</style>

      <div className="flex flex-wrap items-center justify-center gap-3.5 p-3 text-[13px] text-[#5A5546] print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-[40px] cursor-pointer rounded-full border border-[rgba(138,111,52,0.35)] bg-[#FFFDF8] px-[18px] py-2 font-semibold text-[#7A5E22]"
        >
          Print poster
        </button>
        <Link to="/ask/zoom" className="text-[#7A5E22] underline underline-offset-[3px] hover:text-[#14241C]">
          Need it for Zoom / screen share? Open the 16:9 version →
        </Link>
      </div>

      <div
        className="mx-auto box-border flex h-[1056px] w-[816px] flex-col items-center gap-4 overflow-hidden bg-[#14241C] px-16 py-12 text-center text-[#F3EAD3]"
        style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      >
        <img src={logo} alt="Golden Age Wisdom" className="h-[150px] w-[150px] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
        <div className="text-[14px] tracking-[0.3em] text-[#E8CF83] uppercase">{QR_PROMO.eyebrow}</div>
        <h1 className="m-0 font-headline text-[64px] leading-[1.05] font-bold text-[#FFFDF8]">
          {QR_PROMO.titleLines[0]}
          <br />
          {QR_PROMO.titleLines[1]}
        </h1>
        <p className="m-0 max-w-[520px] text-[20px] leading-[1.6] text-[#D8D2C4]">{QR_PROMO.posterBody}</p>
        <a
          href={ASK_PUBLIC_URL}
          title="Open the Ask page"
          className="block rounded-[32px] border-4 border-[#B8923E] bg-[#FFFDF8] p-5 shadow-[0_0_0_12px_rgba(232,207,131,0.1),0_20px_50px_rgba(0,0,0,0.45)]"
        >
          <BrandedQr value={ASK_PUBLIC_URL} resolution={1024} alt="Scan or tap to ask Golden Age Wisdom" className="block h-[300px] w-[300px] rounded-2xl" />
        </a>
        <div className="flex flex-col gap-1 text-[24px] leading-[1.3] text-[#E8CF83]">
          {QR_PROMO.regional.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex flex-col gap-1.5 text-[16px] text-[#D8D2C4]">
          <span>
            Call or WhatsApp {support.primaryDisplay} · {support.webDisplay}
          </span>
          <span>{ASK_PUBLIC_URL.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    </div>
  );
}
