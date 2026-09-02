import { useState } from "react";
import { HeartPulse, Sparkles, Flower2, Compass, HelpCircle, Send, CheckCircle2 } from "lucide-react";
import Card from "../ui/Card";
import IconBadge from "../ui/IconBadge";
import Modal from "../ui/Modal";
import Button from "../../components/ui/Button";
import { useMemberAuth } from "../../auth/MemberAuthContext";
import { memberAuthApi } from "../../lib/memberAuth";

const TOPICS = [
  { icon: HeartPulse, tone: "root", label: "Health", description: "Physical wellbeing during practice.", category: "health" },
  { icon: Sparkles, tone: "crown", label: "Kundalini", description: "Energy experiences and guidance.", category: "kundalini" },
  { icon: Flower2, tone: "thirdeye", label: "Practice", description: "Technique and sitting questions.", category: "meditation" },
  { icon: Compass, tone: "throat", label: "Life", description: "Everyday life and practice balance.", category: "general" },
  { icon: HelpCircle, tone: "solar", label: "Other", description: "Anything else on your mind.", category: "general" },
];

export default function CirclesHelpPage() {
  const { user } = useMemberAuth();
  const [activeTopic, setActiveTopic] = useState(null);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const closeModal = () => {
    setActiveTopic(null);
    setMessage("");
    setError("");
    setSent(false);
  };

  const handleSend = async () => {
    if (!message.trim() || !phone.trim()) return;
    setSending(true);
    setError("");
    try {
      await memberAuthApi.contact({
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: phone.trim(),
        category: activeTopic.category,
        message: `[${activeTopic.label}] ${message.trim()}`,
      });
      setSent(true);
    } catch (e) {
      setError(e.message || "Could not send your question. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Circles & help</h2>
        <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">Reach a volunteer for guidance on your topic.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TOPICS.map((topic) => {
          const { icon, tone, label, description } = topic;
          return (
            <Card key={label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <IconBadge icon={icon} tone={tone} size={44} iconSize={19} />
                <div>
                  <div className="text-[14.5px] font-semibold text-[var(--color-ink)]">{label}</div>
                  <div className="text-[13px] text-[var(--color-ink-soft)]">{description}</div>
                </div>
              </div>
              <Button as="button" variant="secondary" className="shrink-0" onClick={() => setActiveTopic(topic)}>
                Ask
              </Button>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!activeTopic}
        onClose={closeModal}
        title={activeTopic ? `Ask about ${activeTopic.label}` : ""}
        description="A volunteer from this circle will follow up with you."
      >
        {activeTopic &&
          (sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 size={36} className="text-[var(--color-gold-live)]" />
              <p className="text-[14px] text-[var(--color-ink)]">
                Your question has been sent. A volunteer will reach out soon.
              </p>
              <Button as="button" variant="secondary" onClick={closeModal}>
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex w-fit items-center gap-2.5 rounded-full bg-[rgba(168,185,160,0.12)] px-3.5 py-2">
                <IconBadge icon={activeTopic.icon} tone={activeTopic.tone} size={28} iconSize={14} />
                <span className="text-[13px] font-medium text-[var(--color-ink)]">{activeTopic.label}</span>
              </div>

              <textarea
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={`What would you like to ask about ${activeTopic.label.toLowerCase()}?`}
                className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] p-3 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] transition-all focus:border-[var(--color-gold-deep)] focus:bg-[var(--color-surface)] focus:shadow-[0_0_0_3px_rgba(198,161,91,0.28)] focus:outline-none"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[var(--color-ink)]">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="So a volunteer can reach you"
                  className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] transition-all focus:border-[var(--color-gold-deep)] focus:bg-[var(--color-surface)] focus:shadow-[0_0_0_3px_rgba(198,161,91,0.28)] focus:outline-none"
                />
                <span className="text-[11.5px] text-[var(--color-ink-soft)]">Required — a volunteer needs a way to reach you.</span>
              </div>

              {error && <p className="text-[13px] text-red-600">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button as="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  as="button"
                  onClick={handleSend}
                  disabled={!message.trim() || !phone.trim() || sending}
                  className={!message.trim() || !phone.trim() ? "pointer-events-none opacity-50" : ""}
                >
                  <Send size={15} />
                  {sending ? "Sending…" : "Send"}
                </Button>
              </div>
            </div>
          ))}
      </Modal>
    </div>
  );
}
