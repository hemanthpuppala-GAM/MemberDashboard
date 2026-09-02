import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import logoMark from "../assets/logo-golden-age.jpg";
import Starfield from "../components/layout/Starfield";
import { publicApi } from "../lib/api";

const inputClass =
  "w-full rounded-xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] outline-none transition-all focus:border-[var(--color-gold-deep)] focus:shadow-[0_0_0_3px_rgba(198,161,91,0.28)] disabled:opacity-60";

/** Public "register for a program" page — the form an admin builds in Admin → Engage → Registration Forms, rendered from its field definitions. */
export default function RegisterPage() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    publicApi
      .registrationForm(slug)
      .then((f) => {
        setForm(f);
        const initial = {};
        for (const field of f.fields) initial[field.field_key] = field.type === "checkbox" ? false : "";
        setValues(initial);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const setValue = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await publicApi.submitRegistration(slug, values);
      setResult(res);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--color-bg)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(220,197,138,0.14) 0%, rgba(200,185,217,0.10) 55%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <Starfield />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-12">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logoMark} alt="" className="mb-4 h-14 w-14 rounded-full object-cover shadow-[0_8px_32px_rgba(80,65,40,0.15)]" />
        </div>

        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_20px_60px_rgba(80,65,40,0.10)]">
          {notFound ? (
            <div className="py-6 text-center">
              <p className="font-display text-[20px] text-[var(--color-ink)]">Registration not found</p>
              <p className="mt-2 text-[13.5px] text-[var(--color-muted)]">This link may have closed or been removed.</p>
            </div>
          ) : !form ? (
            <p className="py-10 text-center text-[13.5px] text-[var(--color-muted)]">Loading…</p>
          ) : result ? (
            <div className="py-4 text-center">
              <CheckCircle2 size={40} className="mx-auto text-[var(--color-gold-deep)]" />
              <p className="mt-3 font-display text-[20px] text-[var(--color-ink)]">You're in!</p>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-muted)]">{result.success_message}</p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-[clamp(22px,4.5vw,28px)] leading-tight text-[var(--color-ink)]">{form.title}</h1>
              {form.description && <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-muted)]">{form.description}</p>}

              <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
                {form.fields.map((field) => (
                  <FieldInput key={field.field_key} field={field} value={values[field.field_key]} onChange={(v) => setValue(field.field_key, v)} disabled={submitting} />
                ))}

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-[13px] text-red-700">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 w-full rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-deep)] px-4 py-3 text-[14.5px] font-semibold text-[var(--color-on-gold)] transition-opacity hover:opacity-95 disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : form.submit_label || "Register"}
                </button>
              </form>
            </>
          )}
        </div>

        <Link to="/" className="mt-6 text-center text-[13px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-deep)]">
          ← Back to Golden Age Wisdom
        </Link>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange, disabled }) {
  const label = (
    <label className="mb-1 block text-[13px] font-medium text-[var(--color-ink-soft)]">
      {field.label} {field.is_required && <span className="text-[#C96B6B]">*</span>}
    </label>
  );

  switch (field.type) {
    case "textarea":
      return (
        <div>
          {label}
          <textarea
            rows={3}
            required={field.is_required}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      );
    case "select":
      return (
        <div>
          {label}
          <select
            required={field.is_required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={inputClass}
          >
            <option value="" disabled>{field.placeholder || "Choose…"}</option>
            {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    case "radio":
      return (
        <div>
          {label}
          <div className="flex flex-col gap-1.5">
            {(field.options ?? []).map((o) => (
              <label key={o} className="flex items-center gap-2 text-[13.5px] text-[var(--color-ink-soft)]">
                <input
                  type="radio"
                  name={field.field_key}
                  required={field.is_required}
                  checked={value === o}
                  onChange={() => onChange(o)}
                  disabled={disabled}
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-start gap-2.5 text-[13.5px] text-[var(--color-ink-soft)]">
          <input
            type="checkbox"
            required={field.is_required}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="mt-0.5"
          />
          <span>
            {field.label} {field.is_required && <span className="text-[#C96B6B]">*</span>}
          </span>
        </label>
      );
    default:
      return (
        <div>
          {label}
          <input
            type={field.type === "phone" ? "tel" : field.type}
            required={field.is_required}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      );
  }
}
