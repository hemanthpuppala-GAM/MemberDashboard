import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, Landmark, Smartphone, Link2, HeartHandshake } from "lucide-react";
import CmsPageHeading from "./CmsPageHeading";
import Button from "../ui/Button";
import { colors } from "../../theme/colors";
import { publicApi } from "../../lib/api";
import { CardRule } from "../ui/CardAccent";
import { CARD_CLASS, SECTION_CLASS } from "../ui/sectionStyles";

const BANK_FIELDS = [
  ["account_holder", "Account holder"],
  ["bank_name", "Bank name"],
  ["account_number", "Account number"],
  ["ifsc", "IFSC"],
  ["branch", "Branch"],
  ["swift", "SWIFT"],
];

const METHOD_ICONS = { bank: Landmark, upi: Smartphone, link: Link2, other: HeartHandshake };

/** Best-guess icon kind for a method, based on which fields the admin actually filled in — there's no explicit "type" on DonationMethod. */
function methodKind(method) {
  if (method.account_number || method.bank_name || method.ifsc) return "bank";
  if (method.upi_id) return "upi";
  if (method.payout_link) return "link";
  return "other";
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — the value is still visible to copy by hand
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-soft)]"
    >
      <span className="min-w-0">
        <span className="block text-[10.5px] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">{label}</span>
        <span className="block break-words font-body text-[14.5px] font-medium text-[var(--color-ink)]">{value}</span>
      </span>
      {copied ? (
        <span className="flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-[#4a9d63]">
          <Check size={14} /> Copied
        </span>
      ) : (
        <Copy size={14} className="shrink-0 text-[var(--color-muted-soft)] transition-colors group-hover:text-[var(--color-gold-deep)]" />
      )}
    </button>
  );
}

function DonationCard({ method }) {
  const Icon = METHOD_ICONS[methodKind(method)];
  const bankRows = BANK_FIELDS.map(([key, label]) => [label, method[key]]).filter(([, v]) => v);
  const linkOnly = !bankRows.length && !method.upi_id && !method.qr_image_path && method.payout_link;

  return (
    <div className={`flex flex-col gap-5 overflow-hidden ${CARD_CLASS}`}>
      <CardRule />
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-110 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
          style={{ background: "rgba(138,106,50,0.18)", color: colors.goldDeep }}
        >
          <Icon size={19} />
        </span>
        <div className="min-w-0 pt-1">
          <h3 className="font-body text-[17px] font-semibold tracking-[-0.005em] text-[var(--color-ink)]">{method.label}</h3>
          {method.notes && <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-muted)]">{method.notes}</p>}
        </div>
      </div>

      {method.qr_image_path && (
        <div className="flex flex-col items-center gap-2.5 rounded-xl bg-[var(--color-bg-soft)] py-5">
          <img
            src={method.qr_image_path}
            alt={`${method.label} QR code`}
            className="h-40 w-40 rounded-lg border border-[var(--color-border)] bg-white object-contain p-2"
          />
          <span className="text-[11.5px] text-[var(--color-muted-soft)]">Scan with any UPI app</span>
        </div>
      )}

      {bankRows.length > 0 && (
        <div className="flex flex-col divide-y divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
          {bankRows.map(([label, value]) => (
            <CopyRow key={label} label={label} value={value} />
          ))}
        </div>
      )}

      {method.upi_id && (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
          <CopyRow label="UPI ID" value={method.upi_id} />
        </div>
      )}

      {method.payout_link && (
        <Button
          as="a"
          href={method.payout_link}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          className={linkOnly ? "w-full" : "w-fit"}
        >
          Donate now <ExternalLink size={14} />
        </Button>
      )}
    </div>
  );
}

/** Dedicated donation page — lists every active `DonationMethod` (bank details, UPI, QR, or a payment link), each shown only with the fields the admin actually filled in. A CSS-columns layout (not a grid) so cards of very different heights sit naturally without stretching or leaving dead space. */
export default function DonateSection() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .donationMethods()
      .then(setMethods)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="donate"
      className={`flex max-w-4xl flex-col gap-10 ${SECTION_CLASS}`}
    >
      <CmsPageHeading
        slug="donate"
        color={colors.goldDeep}
        fallbackEyebrow="Support the mission"
        fallbackTitle="Help keep every teaching free"
        fallbackDescription="Every session, retreat, and teaching stays free because of voluntary support like yours — choose whichever way works best for you below."
      />

      {loading ? (
        <p className="text-[13.5px] text-[var(--color-muted)]">Loading ways to give…</p>
      ) : methods.length === 0 ? (
        <p className="text-[13.5px] text-[var(--color-muted)]">
          Donation details aren't set up yet — check back soon, or reach out through the Contact page.
        </p>
      ) : (
        <div className="columns-1 gap-5 lg:columns-2">
          {methods.map((method) => (
            <div key={method.id} className="mb-5 break-inside-avoid">
              <DonationCard method={method} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
