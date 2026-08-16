import { useState } from "react";
import toast from "react-hot-toast";
import { Send, Trash2, HardDrive, Check } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Field, { TextInput, TextArea } from "../ui/Field";
import Toggle from "../ui/Toggle";
import ColorField from "../ui/ColorField";
import { PillTabs } from "../ui/Tabs";
import { useAdminData } from "../store/useAdminData";
import { useAdminTheme } from "../theme/useAdminTheme";
import { COLOR_PRESETS, FONT_OPTIONS, TEXT_SIZES, getPresetTokens } from "../theme/displayPresets";

const TABS = [
  { key: "general", label: "General" },
  { key: "social", label: "Social & Contact" },
  { key: "banner", label: "Live Session Banner" },
  { key: "maintenance", label: "Maintenance" },
  { key: "appearance", label: "Appearance" },
  { key: "email", label: "Email" },
  { key: "advanced", label: "Advanced" },
];

function GroupForm({ group, fields, values, onChange, areas = [] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map(([key, label]) => (
        <Field key={key} label={label} className={areas.includes(key) ? "sm:col-span-2" : ""}>
          {areas.includes(key) ? (
            <TextArea rows={2} value={values[key] ?? ""} onChange={(e) => onChange(group, { [key]: e.target.value })} />
          ) : (
            <TextInput value={values[key] ?? ""} onChange={(e) => onChange(group, { [key]: e.target.value })} />
          )}
        </Field>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettingsGroup } = useAdminData();
  const {
    theme, setTheme, resolvedTheme,
    textSize, setTextSize,
    fontChoice, setFontChoice,
    colorPreset, setColorPreset,
    customAccent, setCustomAccent,
  } = useAdminTheme();
  const [tab, setTab] = useState("general");

  const resolvedAccent = customAccent || getPresetTokens(colorPreset, resolvedTheme).accent;

  const save = (label) => toast.success(`${label} saved`);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Settings</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Site-wide configuration referenced across the public pages.</p>
      </div>

      <div className="overflow-x-auto pb-1">
        <PillTabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === "general" && (
        <Card title="General">
          <GroupForm
            group="general"
            values={settings.general}
            onChange={updateSettingsGroup}
            fields={[["siteName", "Site name"], ["tagline", "Tagline"], ["adminEmail", "Admin email"], ["timezone", "Timezone"]]}
          />
          <Button as="button" size="sm" className="mt-5" onClick={() => save("General settings")}>Save</Button>
        </Card>
      )}

      {tab === "social" && (
        <Card title="Social & contact">
          <GroupForm
            group="social"
            values={settings.social}
            onChange={updateSettingsGroup}
            areas={["address"]}
            fields={[["youtube", "YouTube"], ["instagram", "Instagram"], ["facebook", "Facebook"], ["whatsapp", "WhatsApp"], ["phone", "Phone"], ["address", "Address"]]}
          />
          <Button as="button" size="sm" className="mt-5" onClick={() => save("Social & contact settings")}>Save</Button>
        </Card>
      )}

      {tab === "banner" && (
        <Card title="Live session banner">
          <div className="flex flex-col gap-5">
            <Toggle checked={settings.banner.enabled} onChange={(v) => updateSettingsGroup("banner", { enabled: v })} label="Show banner" description="Displays across the public site when a live session is on" />
            <Field label="Banner text"><TextInput value={settings.banner.text} onChange={(e) => updateSettingsGroup("banner", { text: e.target.value })} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="CTA label"><TextInput value={settings.banner.ctaLabel} onChange={(e) => updateSettingsGroup("banner", { ctaLabel: e.target.value })} /></Field>
              <Field label="CTA URL"><TextInput value={settings.banner.ctaUrl} onChange={(e) => updateSettingsGroup("banner", { ctaUrl: e.target.value })} /></Field>
            </div>
          </div>
          <Button as="button" size="sm" className="mt-5" onClick={() => save("Banner settings")}>Save</Button>
        </Card>
      )}

      {tab === "maintenance" && (
        <Card title="Maintenance mode">
          <div className="flex flex-col gap-5">
            <Toggle checked={settings.maintenance.enabled} onChange={(v) => updateSettingsGroup("maintenance", { enabled: v })} label="Enable maintenance mode" description="Visitors see the maintenance message instead of the site" />
            <Field label="Maintenance message"><TextArea rows={2} value={settings.maintenance.message} onChange={(e) => updateSettingsGroup("maintenance", { message: e.target.value })} /></Field>
            <Field label="Allowed IPs" hint="Comma-separated — these IPs bypass maintenance mode"><TextInput value={settings.maintenance.allowedIps} onChange={(e) => updateSettingsGroup("maintenance", { allowedIps: e.target.value })} /></Field>
          </div>
          <Button as="button" size="sm" className="mt-5" onClick={() => save("Maintenance settings")}>Save</Button>
        </Card>
      )}

      {tab === "appearance" && (
        <>
          <Card title="Admin panel theme" description="Controls the whole panel — sidebar, tables, forms, everything.">
            <div className="flex gap-2">
              {["light", "dark", "system"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTheme(opt)}
                  className={`rounded-lg px-3.5 py-2 text-[13px] font-medium capitalize transition-colors ${theme === opt ? "bg-[var(--a-accent)] text-[var(--a-accent-ink)]" : "bg-[var(--a-bg-surface-2)] text-[var(--a-text-muted)]"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Text size" description="Scales text, icons, and spacing across the sidebar and every page — handy for anyone who wants a bigger or more compact view.">
            <div className="grid grid-cols-4 gap-2">
              {TEXT_SIZES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTextSize(opt.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border py-3 transition-colors ${
                    textSize === opt.id
                      ? "border-[var(--a-accent)] bg-[var(--a-accent-muted)]"
                      : "border-[var(--a-border)] hover:border-[var(--a-accent)]/50"
                  }`}
                >
                  <span
                    className={`font-semibold ${textSize === opt.id ? "text-[var(--a-accent)]" : "text-[var(--a-text-primary)]"}`}
                    style={{ fontSize: `${14 * opt.scale}px` }}
                  >
                    Aa
                  </span>
                  <span className="text-[11.5px] text-[var(--a-text-muted)]">{opt.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Font" description="Applies to the whole panel. Headings keep the brand serif until you pick something other than the default.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontChoice(opt.id)}
                  className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                    fontChoice === opt.id
                      ? "border-[var(--a-accent)] bg-[var(--a-accent-muted)]"
                      : "border-[var(--a-border)] hover:border-[var(--a-accent)]/50"
                  }`}
                >
                  <div
                    className={`text-[15px] font-semibold ${fontChoice === opt.id ? "text-[var(--a-accent)]" : "text-[var(--a-text-primary)]"}`}
                    style={{ fontFamily: opt.stack }}
                  >
                    {opt.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--a-text-muted)]" style={{ fontFamily: opt.stack }}>
                    The quick brown fox
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Color theme" description="Pick a preset, or fine-tune with a custom accent color below.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COLOR_PRESETS.map((preset) => {
                const tokens = preset[resolvedTheme];
                const active = colorPreset === preset.id && !customAccent;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setColorPreset(preset.id)}
                    className={`flex flex-col items-center gap-2 rounded-lg border py-3 transition-colors ${
                      active ? "border-[var(--a-accent)] bg-[var(--a-accent-muted)]" : "border-[var(--a-border)] hover:border-[var(--a-accent)]/50"
                    }`}
                  >
                    <span
                      className="relative flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ background: `linear-gradient(135deg, ${tokens.accentFrom}, ${tokens.focus})` }}
                    >
                      {active && <Check size={14} className="text-white drop-shadow" />}
                    </span>
                    <span className="text-[11.5px] font-medium text-[var(--a-text-primary)]">{preset.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 border-t border-[var(--a-border)] pt-5">
              <ColorField label="Custom accent color" value={resolvedAccent} onChange={setCustomAccent} />
              {customAccent && (
                <button
                  type="button"
                  onClick={() => setColorPreset(colorPreset)}
                  className="mt-2 text-[12px] font-medium text-[var(--a-focus)] hover:underline"
                >
                  Reset to "{COLOR_PRESETS.find((p) => p.id === colorPreset)?.label}" preset
                </button>
              )}
            </div>
          </Card>

          <Card title="Branding">
            <p className="text-[12px] text-[var(--a-text-muted)]">Logo and favicon upload will be available once media storage is wired to the backend.</p>
          </Card>
        </>
      )}

      {tab === "email" && (
        <Card title="Email & notifications">
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="SMTP host"><TextInput value={settings.email.smtpHost} onChange={(e) => updateSettingsGroup("email", { smtpHost: e.target.value })} /></Field>
              <Field label="SMTP port"><TextInput type="number" value={settings.email.smtpPort} onChange={(e) => updateSettingsGroup("email", { smtpPort: Number(e.target.value) })} /></Field>
              <Field label="SMTP user"><TextInput value={settings.email.smtpUser} onChange={(e) => updateSettingsGroup("email", { smtpUser: e.target.value })} /></Field>
            </div>
            <Toggle checked={settings.email.notifyOnSubmission} onChange={(v) => updateSettingsGroup("email", { notifyOnSubmission: v })} label="Notify admin on new submission" />
            <Button as="button" size="sm" variant="secondary" icon={Send} onClick={() => toast.success("Test email sent (demo)")} className="w-fit">Send test email</Button>
          </div>
          <Button as="button" size="sm" className="mt-5" onClick={() => save("Email settings")}>Save</Button>
        </Card>
      )}

      {tab === "advanced" && (
        <Card title="Advanced">
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-1.5 font-medium text-[var(--a-text-primary)]"><HardDrive size={14} /> Storage used</span>
                <span className="text-[var(--a-text-muted)]">{(settings.advanced.storageUsedMb / 1024).toFixed(2)} GB / {(settings.advanced.storageLimitMb / 1024).toFixed(0)} GB</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--a-bg-surface-2)]">
                <div className="h-full rounded-full bg-[var(--a-accent)]" style={{ width: `${(settings.advanced.storageUsedMb / settings.advanced.storageLimitMb) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--a-border)] px-4 py-3">
              <span className="text-[13.5px] text-[var(--a-text-primary)]">App version</span>
              <span className="text-[13px] text-[var(--a-text-muted)]">{settings.advanced.appVersion}</span>
            </div>
            <Button as="button" size="sm" variant="secondary" icon={Trash2} onClick={() => toast.success("Cache cleared (demo)")} className="w-fit">Clear cache</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
