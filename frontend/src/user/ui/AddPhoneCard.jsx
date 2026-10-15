import { useState } from "react";
import { Phone, X } from "lucide-react";
import Button from "../../components/ui/Button";
import { memberAuthApi } from "../../lib/memberAuth";
import { useMemberAuth } from "../../auth/MemberAuthContext";

const DISMISS_KEY = "gaw_phone_prompt_dismissed";

/**
 * Google sign-in gives us no phone number. Ask once (dismissible) so support can reach the member
 * and so someone registered at an event by phone is joined to this account with the same member ID.
 */
export default function AddPhoneCard() {
  const { user, updateUser } = useMemberAuth();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (!user || user.phone || hidden) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage blocked: just hide for now */
    }
    setHidden(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) return setError("Enter a full phone number — 10 digits, or with your country code.");
    setBusy(true);
    setError("");
    try {
      const { user: u } = await memberAuthApi.updateProfile({ name: user.name, email: user.email, phone: phone.trim() });
      updateUser(u);
    } catch (err) {
      setError(err.message || "Could not save your number. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="relative flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--color-gold)]/40 bg-[var(--color-surface)] px-5 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold-deep)]">
        <Phone size={18} />
      </span>
      <div className="min-w-[200px] flex-1">
        <p className="text-[15px] font-semibold text-[var(--color-ink)]">Add your phone number</p>
        <p className="text-[13px] text-[var(--color-ink-soft)]">
          So our support team can reach you — and if you registered at a satsang or camp, your existing member ID stays with you.
        </p>
        {error && <p className="mt-1 text-[12.5px] font-medium text-red-700">{error}</p>}
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          aria-label="Phone number"
          className="min-h-[44px] w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-[15px] sm:w-[200px]"
        />
        <Button as="button" type="submit" disabled={busy} className="!px-4 !py-2.5 !text-[13px] whitespace-nowrap">
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
      <button type="button" onClick={dismiss} aria-label="Not now" className="absolute top-2 right-2 rounded-full p-1.5 text-[var(--color-ink-soft)] hover:bg-black/5">
        <X size={15} />
      </button>
    </form>
  );
}
