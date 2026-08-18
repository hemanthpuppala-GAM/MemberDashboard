import { Copy, Mail, MessageCircle, Heart } from "lucide-react";
import Card from "../ui/Card";
import IconBadge from "../ui/IconBadge";
import Button from "../../components/ui/Button";

const REFERRAL_LINK = "https://goldenagewisdom.org/join?ref=you";

export default function ShareLightPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Share the light</h2>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">Invite others into free daily meditation.</p>
      </div>

      <Card
        className="relative overflow-hidden"
        title="Your referral link"
        description="Every sit begins with an invitation."
      >
        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-2">
          <IconBadge icon={Heart} tone="sacral" size={38} iconSize={16} />
          <input
            readOnly
            value={REFERRAL_LINK}
            className="min-w-0 flex-1 rounded-full border border-[rgba(110,198,234,0.35)] bg-white/70 px-4 py-2 text-[13.5px] text-[var(--color-ink)]"
          />
          <Button as="button" onClick={() => navigator.clipboard?.writeText(REFERRAL_LINK)}>
            <Copy size={15} />
            Copy
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Invite by email" description="Send a personal invitation.">
          <Button
            as="a"
            href={`mailto:?body=${encodeURIComponent(REFERRAL_LINK)}`}
            variant="secondary"
            className="mt-1 w-full"
          >
            <Mail size={15} />
            Email a friend
          </Button>
        </Card>
        <Card title="Share on WhatsApp" description="Message it directly.">
          <Button
            as="a"
            href={`https://wa.me/?text=${encodeURIComponent(REFERRAL_LINK)}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="mt-1 w-full"
          >
            <MessageCircle size={15} />
            Share on WhatsApp
          </Button>
        </Card>
      </div>
    </div>
  );
}
