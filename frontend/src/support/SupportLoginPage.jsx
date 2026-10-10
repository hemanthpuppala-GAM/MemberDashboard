import { useState } from "react";
import { Phone, Users } from "lucide-react";
import { useSupportAuth } from "./SupportAuthContext";
import { Button, ErrorNote, GoogleIcon, cardClass, inputClass } from "./components/ui";

/** Signed-out desk: core team (phone + PIN) or volunteer (Google). */
export default function SupportLoginPage() {
  const { status, notice } = useSupportAuth();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[920px] flex-col px-4 pb-10 pt-[calc(28px+env(safe-area-inset-top))] sm:px-6 sm:pt-14">
      <header className="mb-6 text-center sm:mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A5E22]">Golden Age Wisdom</p>
        <h1 className="mt-1 text-[38px] leading-tight text-[#14241C] sm:text-[46px]">Member support desk</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-[#5A5546]">
          For the support team only. Choose how you sign in.
        </p>
      </header>

      {notice && status !== "forbidden" && <ErrorNote className="mb-4">{notice}</ErrorNote>}
      {status === "forbidden" && <NotOnTeam />}

      <div className="grid gap-4 md:grid-cols-2">
        <CoreLogin />
        <VolunteerLogin />
      </div>
    </main>
  );
}

function NotOnTeam() {
  const { memberEmail } = useSupportAuth();
  return (
    <div role="alert" className="mb-4 rounded-2xl border border-[rgba(201,162,74,0.55)] bg-[#FFF6DC] px-4 py-3.5 text-[14.5px] leading-relaxed text-[#5A4313]">
      <strong className="block text-[#14241C]">
        This Google account{memberEmail ? ` (${memberEmail})` : ""} isn't on the support team yet.
      </strong>
      Ask the coordinator to add your email, then come back to this page. Or sign in with a different Google account below.
    </div>
  );
}

function CoreLogin() {
  const { loginCore } = useSupportAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !pin.trim()) {
      setError("Enter your support phone number and PIN.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await loginCore(phone.trim(), pin.trim());
    } catch (err) {
      setError(err.status === 429 ? "Too many tries. Please wait a minute and try again." : err.message);
      setBusy(false);
    }
  };

  return (
    <section className={`${cardClass} p-5 sm:p-6`} aria-labelledby="core-title">
      <OptionHeading id="core-title" icon={Phone} title="Core support team" text="Sign in with your support phone number and PIN." />
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3" noValidate>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#1B3328]">
          Phone number
          <input
            className={inputClass}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your 10-digit mobile number"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#1B3328]">
          PIN
          <input
            className={`${inputClass} tracking-[0.3em]`}
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={12}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D+/g, ""))}
            placeholder="••••"
          />
        </label>
        {error && <p role="alert" className="text-[14px] text-[#7E2C20]">{error}</p>}
        <Button type="submit" variant="dark" busy={busy} className="mt-1 w-full">
          Sign in
        </Button>
      </form>
    </section>
  );
}

function VolunteerLogin() {
  const { startGoogle, status, logout } = useSupportAuth();
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    // Signed in with an account that isn't on the team: sign it out first so Google lets them pick another.
    if (status === "forbidden") await logout();
    startGoogle();
  };

  return (
    <section className={`${cardClass} flex flex-col p-5 sm:p-6`} aria-labelledby="vol-title">
      <OptionHeading id="vol-title" icon={Users} title="Volunteer" text="Use the Google account the coordinator added to the support team." />
      <div className="mt-4 flex flex-1 flex-col justify-end gap-3">
        <Button variant="outline" busy={busy} onClick={go} className="w-full gap-3 text-[15px]">
          {!busy && <GoogleIcon />}
          {status === "forbidden" ? "Use a different Google account" : "Continue with Google"}
        </Button>
        <p className="text-[12.5px] leading-relaxed text-[#5A5546]">
          If you land on your member dashboard afterwards, just open this page again.
        </p>
      </div>
    </section>
  );
}

function OptionHeading({ id, icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(201,162,74,0.16)] text-[#7A5E22]">
        <Icon size={20} aria-hidden />
      </span>
      <div>
        <h2 id={id} className="text-[24px] leading-tight text-[#14241C]">
          {title}
        </h2>
        <p className="mt-0.5 text-[14px] leading-relaxed text-[#5A5546]">{text}</p>
      </div>
    </div>
  );
}
