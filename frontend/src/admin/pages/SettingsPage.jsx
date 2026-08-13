import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import Card from "../components/ui/Card";
import Field, { TextInput } from "../components/ui/Field";
import Button from "../../components/ui/Button";

const GROUPS = [
  {
    title: "Contact",
    fields: [["contact_email", "Contact email"]],
  },
  {
    title: "Social links",
    fields: [
      ["social_youtube", "YouTube"],
      ["social_instagram", "Instagram"],
      ["social_facebook", "Facebook"],
    ],
  },
  {
    title: "Banner",
    fields: [["banner_text", "Live session banner text"]],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api.settings().then(setSettings);
  }, []);

  const set = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const saved = await api.updateSettings(settings);
      setSettings((s) => ({ ...s, ...saved }));
      setSavedAt(new Date());
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <p className="text-[13.5px] text-[var(--color-muted)]">Loading…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[26px] text-[var(--color-ink)]">Settings</h1>
        <p className="mt-1 text-[13.5px] text-[var(--color-muted)]">
          Site-wide values referenced across the public pages.
        </p>
      </div>

      {GROUPS.map((group) => (
        <Card key={group.title} title={group.title}>
          <div className="flex flex-col gap-5">
            {group.fields.map(([key, label]) => (
              <Field key={key} label={label} error={errors[`settings.${key}`]?.[0]}>
                <TextInput value={settings[key] ?? ""} onChange={(e) => set(key)(e.target.value)} />
              </Field>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex items-center gap-4">
        <Button as="button" type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        {savedAt && (
          <span className="text-[12.5px] text-[var(--color-gold-live,#5DB875)]">
            Saved at {savedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </form>
  );
}
