import { useEffect, useState } from "react";
import { Copy, Mail, MessageCircle, Heart } from "lucide-react";
import Card from "../ui/Card";
import IconBadge from "../ui/IconBadge";
import Button from "../../components/ui/Button";
import { memberAuthApi } from "../../lib/memberAuth";

export default function ShareLightPage() {
  const [referral, setReferral] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    memberAuthApi
      .referral()
      .then(setReferral)
      .catch((e) => setError(e.message || "Could not load your referral link."));
  }, []);

  const link = referral ? `${window.location.origin}/join?ref=${referral.referral_code}` : "";

  const copyLink = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Share the light</h2>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">Invite others into free daily meditation.</p>
      </div>

      {error && <p className="rounded-xl border border-red-400/30 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{error}</p>}

      <Card
        className="relative overflow-hidden"
        title="Your referral link"
        description={referral ? `${referral.referred_count} friend${referral.referred_count === 1 ? "" : "s"} joined so far` : "Every sit begins with an invitation."}
      >
        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-2">
          <IconBadge icon={Heart} tone="sacral" size={38} iconSize={16} />
          <input
            readOnly
            value={link}
            placeholder="Loading…"
            className="min-w-0 flex-1 rounded-full border border-[rgba(110,198,234,0.35)] bg-white/70 px-4 py-2 text-[13.5px] text-[var(--color-ink)]"
          />
          <Button as="button" onClick={copyLink} disabled={!link}>
            <Copy size={15} />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Invite by email" description="Send a personal invitation.">
          <Button
            as="a"
            href={link ? `mailto:?body=${encodeURIComponent(link)}` : undefined}
            variant="secondary"
            className={`mt-1 w-full ${!link ? "pointer-events-none opacity-50" : ""}`}
          >
            <Mail size={15} />
            Email a friend
          </Button>
        </Card>
        <Card title="Share on WhatsApp" description="Message it directly.">
          <Button
            as="a"
            href={link ? `https://wa.me/?text=${encodeURIComponent(link)}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className={`mt-1 w-full ${!link ? "pointer-events-none opacity-50" : ""}`}
          >
            <MessageCircle size={15} />
            Share on WhatsApp
          </Button>
        </Card>
      </div>
    </div>
  );
}
