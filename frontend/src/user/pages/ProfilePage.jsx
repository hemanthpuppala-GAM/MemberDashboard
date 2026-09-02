import { useState } from "react";
import { Save, KeyRound, CheckCircle2 } from "lucide-react";
import Card from "../ui/Card";
import Button from "../../components/ui/Button";
import { INPUT_CLASS } from "../../components/ui/sectionStyles";
import { useMemberAuth } from "../../auth/MemberAuthContext";
import { memberAuthApi } from "../../lib/memberAuth";

const inputClass = INPUT_CLASS;

function Banner({ error, success }) {
  if (!error && !success) return null;
  if (error) {
    return <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>;
  }
  return (
    <p className="flex items-center gap-1.5 rounded-xl border border-[rgba(122,155,110,0.35)] bg-[rgba(122,155,110,0.10)] px-3 py-2 text-[13px] text-[#2f8a4d]">
      <CheckCircle2 size={14} /> {success}
    </p>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useMemberAuth();

  const [profile, setProfile] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [password, setPassword] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const { user: u } = await memberAuthApi.updateProfile(profile);
      updateUser(u);
      setProfileSuccess("Profile updated.");
    } catch (err) {
      setProfileError(err.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await memberAuthApi.updatePassword(password);
      setPassword({ current_password: "", password: "", password_confirmation: "" });
      setPasswordSuccess("Password updated.");
    } catch (err) {
      setPasswordError(err.message || "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Profile</h2>
        <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">Manage your account details.</p>
      </div>

      <Card accent title="Your details">
        <form onSubmit={saveProfile} className="flex flex-col gap-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--color-ink)]">Name</label>
              <input
                required
                value={profile.name}
                onChange={(e) => setProfile((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--color-ink)]">Email</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--color-ink)]">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
          <Banner error={profileError} success={profileSuccess} />
          <div className="flex justify-end">
            <Button as="button" type="submit" disabled={savingProfile}>
              <Save size={15} />
              {savingProfile ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Change password">
        <form onSubmit={savePassword} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--color-ink)]">Current password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password.current_password}
              onChange={(e) => setPassword((f) => ({ ...f, current_password: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--color-ink)]">New password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password.password}
                onChange={(e) => setPassword((f) => ({ ...f, password: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--color-ink)]">Confirm new password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password.password_confirmation}
                onChange={(e) => setPassword((f) => ({ ...f, password_confirmation: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <Banner error={passwordError} success={passwordSuccess} />
          <div className="flex justify-end">
            <Button as="button" type="submit" variant="secondary" disabled={savingPassword}>
              <KeyRound size={15} />
              {savingPassword ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
