import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SitePage, SiteHeader, Breadcrumb, SiteFooter } from "../SiteChrome";
import { useDonationMethods, useSiteSettings } from "../usePublicData";
import { OFFICIAL_EMAIL } from "../sitePages";
import { storageUrl } from "../../lib/api";
import { displayNumber } from "../../ask/support";
import "./donate.css";

const PAD = "clamp(20px,5vw,72px)";
const KICKER = { display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: "#7A5E22" };
const SMALL_CAPS = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#7A5E22" };
const rise = (delay = 0) => ({ animation: `gaw-rise .9s ${delay}s both` });

/** Same fields, labels and order as the admin's Donation methods form (DonationMethod has no explicit type). */
const BANK_FIELDS = [
  ["account_holder", "Account holder"],
  ["bank_name", "Bank"],
  ["account_number", "Account number"],
  ["ifsc", "IFSC"],
  ["branch", "Branch"],
  ["swift", "SWIFT"],
];
const COPYABLE = new Set(["account_number", "ifsc", "swift"]);

/** One "label / value" line; account numbers, codes and UPI IDs get a copy button. */
function DetailRow({ label, value, copy, first }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked — the value is on screen to copy by hand
    }
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48, padding: "6px 6px 6px 14px", borderTop: first ? 0 : "1px solid rgba(138,111,52,.16)" }}>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ ...SMALL_CAPS, fontSize: 9.5, color: "#8A7A5A" }}>{label}</span>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: "#12201A", overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </span>
      {copy && (
        <button type="button" onClick={doCopy} className="don-copy" aria-label={`Copy ${label}`} style={{ flex: "none", minWidth: 72, height: 36, padding: "0 12px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer" }}>
          <span aria-live="polite">{copied ? "Copied ✓" : "Copy"}</span>
        </button>
      )}
    </div>
  );
}

function MethodCard({ m, delay }) {
  const bank = BANK_FIELDS.filter(([k]) => m[k]);
  return (
    <article
      style={{ breakInside: "avoid", marginBottom: 18, display: "flex", flexDirection: "column", gap: 14, padding: "20px 20px 22px", borderRadius: 20, background: "rgba(255,253,248,.7)", border: "1px solid rgba(255,255,255,.75)", boxShadow: "0 1px 0 rgba(255,255,255,.8) inset,0 14px 34px -16px rgba(60,42,16,.32)", ...rise(delay) }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h2 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: 26, lineHeight: 1.1, color: "#12201A" }}>
          {m.label}
        </h2>
        {m.notes && <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#3A3128", textWrap: "pretty", whiteSpace: "pre-line" }}>{m.notes}</p>}
      </div>

      {m.qr_image_path && (
        <figure style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 12px 12px", borderRadius: 16, background: "#F3EAD3" }}>
          <img src={storageUrl(m.qr_image_path)} alt={`QR code — ${m.label}`} loading="lazy" style={{ display: "block", width: 176, height: 176, objectFit: "contain", padding: 8, borderRadius: 12, background: "#fff", boxShadow: "0 0 0 1px rgba(138,111,52,.25)" }} />
          <figcaption style={{ fontSize: 11.5, color: "#5A5546" }}>Scan with any UPI app</figcaption>
        </figure>
      )}

      {(m.upi_id || bank.length > 0) && (
        <div style={{ borderRadius: 14, background: "rgba(243,234,211,.55)", overflow: "hidden" }}>
          {m.upi_id && <DetailRow label="UPI ID" value={m.upi_id} copy first />}
          {bank.map(([k, label], i) => (
            <DetailRow key={k} label={label} value={m[k]} copy={COPYABLE.has(k)} first={!m.upi_id && i === 0} />
          ))}
        </div>
      )}

      {m.payout_link && (
        <a
          href={m.payout_link}
          target="_blank"
          rel="noopener noreferrer"
          className="gaw-pill-gold"
          style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 22px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}
        >
          Give online <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}

/** /donate — ways to give, from Admin → Donations (active methods, in the admin's order). */
export default function DonatePage() {
  const methods = useDonationMethods();
  const settings = useSiteSettings();
  const web = String(settings?.["support.web"] || "").replace(/\D/g, "");
  // The shared hook can't tell "still loading" from "failed / none", so wait briefly before the empty state.
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 1500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const prev = document.title;
    document.title = "Donate · Golden Age Wisdom";
    return () => {
      document.title = prev;
    };
  }, []);

  const list = Array.isArray(methods) ? methods : [];
  const contact = web ? (
    <>
      message us on WhatsApp at{" "}
      <a href={`https://wa.me/${web}?text=${encodeURIComponent("Hello — I would like to support Golden Age Wisdom.")}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
        {displayNumber(web)}
      </a>
    </>
  ) : (
    <>
      write to <a href={`mailto:${OFFICIAL_EMAIL}?subject=Supporting%20the%20mission`}>{OFFICIAL_EMAIL}</a>
    </>
  );

  return (
    <SitePage>
      <SiteHeader />
      <Breadcrumb current="Donate" />

      <main style={{ flex: 1, width: "100%", maxWidth: 1120, margin: "0 auto", padding: `clamp(22px,4vh,44px) ${PAD} clamp(40px,6vh,72px)`, display: "flex", flexDirection: "column", gap: "clamp(22px,4vh,36px)" }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 660 }}>
          <span style={{ ...KICKER, ...rise() }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A24A" }} />
            Support the mission
          </span>
          <h1 className="serif" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(34px,4.2vw,58px)", lineHeight: 1.02, letterSpacing: "-.015em", textWrap: "balance", color: "#12201A", ...rise(0.1) }}>
            The teachings are free. <em style={{ color: "#8A6F34" }}>Help keep them so.</em>
          </h1>
          <p style={{ margin: 0, fontSize: "clamp(15px,1.15vw,17px)", lineHeight: 1.6, color: "#3A3128", textWrap: "pretty", ...rise(0.2) }}>
            Every sit, talk and retreat is offered without charge. If you feel moved to give, any of the ways below reaches the work directly — whatever the amount, it is received with gratitude.
          </p>
        </header>

        {list.length > 0 ? (
          <div style={{ columnWidth: 320, columnGap: 18 }}>
            {list.map((m, i) => (
              <MethodCard key={m.id ?? i} m={m} delay={0.25 + i * 0.08} />
            ))}
          </div>
        ) : methods === null && !waited ? (
          <p aria-live="polite" style={{ margin: 0, fontSize: 13.5, color: "#5A5546" }}>
            Gathering the ways to give…
          </p>
        ) : (
          <div style={{ maxWidth: 660, padding: "22px 24px", borderRadius: 20, background: "rgba(255,253,248,.6)", border: "1px solid rgba(138,111,52,.22)", fontSize: 14.5, lineHeight: 1.65, color: "#3A3128", ...rise(0.25) }}>
            Ways to give are not listed here just yet. If you would like to support the work, please {contact} and a volunteer will gladly help.
          </div>
        )}

        <p style={{ margin: 0, maxWidth: 660, fontSize: 13.5, lineHeight: 1.65, color: "#5A5546", textWrap: "pretty" }}>
          {list.length > 0 && <>Questions about giving? Please {contact}. </>}
          Not in a position to give? Sitting with us is enough — or offer an hour of <Link to="/volunteer">seva</Link>.
        </p>
      </main>

      <SiteFooter title="With gratitude" sub="Every sit stays free because someone, somewhere, chose to give." />
    </SitePage>
  );
}
