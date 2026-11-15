import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Baby, FileSignature, Printer, Video } from "lucide-react";
import Card from "../ui/Card";
import { memberAuthApi } from "../../lib/memberAuth";
import { publicApi } from "../../lib/api";
import { primaryButtonClass } from "../../ask/styles";
import ConsentText from "../../kids/ConsentText";
import { fmtDate } from "../../kids/kidsUtil";

const linkBtn = `${primaryButtonClass} inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13.5px] no-underline`;

/** Dashboard → My family: Kids Meditation Circle children, Zoom details, photo choices, signed consents. */
export default function FamilyPage() {
  const [data, setData] = useState(null);
  const [groups, setGroups] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    memberAuthApi.kids().then(setData).catch((e) => setError(e.message));
    publicApi.kidsProgram().then((p) => setGroups(Object.fromEntries(p.groups.map((g) => [g.key, g])))).catch(() => {});
  }, []);

  const act = async (id, fn) => {
    setBusy(id);
    setError("");
    try {
      setData(await fn());
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const header = (
    <div>
      <h2 className="font-display text-[22px] text-[var(--color-ink)]">My family</h2>
      <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">Kids Meditation Circle: live on Zoom, free.</p>
    </div>
  );

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <p className="text-[14px] text-[var(--color-muted)]">{error || "Loading…"}</p>
      </div>
    );
  }

  if (!data.registration) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card accent>
          <div className="flex flex-col items-start gap-3">
            <Baby className="text-[var(--color-gold-deep)]" />
            <p className="text-[14.5px] leading-relaxed text-[var(--color-ink-soft)]">
              Register your children for the weekly Kids Meditation Circle: breathing, short meditation, wisdom stories and games. A parent signs the consent online.
            </p>
            <Link to="/kids/register" className={linkBtn}>Register a child</Link>
          </div>
        </Card>
      </div>
    );
  }

  const active = data.kids.filter((k) => k.status === "active");
  const j = data.join;

  return (
    <div className="flex flex-col gap-6">
      {header}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}

      {data.needs_resign && (
        <Card accent>
          <p className="text-[14px] text-[var(--color-ink)]">
            <strong>Please sign again.</strong> The consent wording was updated. Zoom details show again once you sign.
          </p>
          <Link to="/kids/register" className={`${linkBtn} mt-3`}>Review and sign</Link>
        </Card>
      )}

      {data.registration.status === "withdrawn" || !active.length ? (
        <Card>
          <p className="text-[14px] text-[var(--color-ink-soft)]">Your family is not registered at the moment.</p>
          <Link to="/kids/register" className={`${linkBtn} mt-3`}>Register again</Link>
        </Card>
      ) : (
        j && (
          <Card title="How to join" description="Please keep these details private. They are only for registered families." accent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-2xl bg-[#14241C] px-5 py-3 text-[14.5px] leading-7 text-[#F3EAD3]">
                <Video size={15} className="mr-2 inline text-[#E8CF83]" />
                Zoom ID <strong className="text-[#E8CF83]">{j.zoom_id}</strong>
                {j.zoom_passcode && (
                  <>
                    {" "}· Passcode <strong className="text-[#E8CF83]">{j.zoom_passcode}</strong>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {j.zoom_link && <a href={j.zoom_link} target="_blank" rel="noopener noreferrer" className={linkBtn}>Open Zoom</a>}
                {j.whatsapp_link && <a href={j.whatsapp_link} target="_blank" rel="noopener noreferrer" className={linkBtn}>Parents&apos; WhatsApp</a>}
              </div>
            </div>
            <p className="mt-3 text-[12.5px] text-[var(--color-muted)]">Join 5 minutes early with your child&apos;s first name as the Zoom name. An adult stays at home during the session.</p>
          </Card>
        )
      )}

      {active.length > 0 && (
        <Card title="Children" actions={<Link to="/kids/register" className="text-[13px] font-semibold text-[var(--color-gold-deep)]">Edit details</Link>}>
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {active.map((k) => {
              const g = groups[k.group];
              return (
                <div key={k.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-[17px] text-[var(--color-ink)]">
                      {k.first_name} {k.last_name} <span className="text-[13px] text-[var(--color-muted)]">· age {k.age}</span>
                    </p>
                    <p className="text-[13px] text-[var(--color-ink-soft)]">
                      {g ? `${g.label}: ${g.zones.map((z) => `${z.time} ${z.zone}`).join(" · ")}` : k.group}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[13px]">
                    <label className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5">
                      Group photos
                      <select
                        value={k.media_consent}
                        disabled={busy === k.id}
                        onChange={(e) => act(k.id, () => memberAuthApi.kidMedia(k.id, e.target.value))}
                        className="bg-transparent font-semibold text-[var(--color-ink)] outline-none"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      disabled={busy === k.id}
                      onClick={() => window.confirm(`Withdraw ${k.first_name} from the Kids Circle?`) && act(k.id, () => memberAuthApi.withdrawKid(k.id))}
                      className="rounded-full px-3 py-1.5 text-red-700 hover:bg-red-50"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card title="Signed forms" description="Every time you sign, a copy is kept here and emailed to you.">
        <ul className="flex flex-col gap-2">
          {data.consents.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 text-[13.5px]">
              <span className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                <FileSignature size={15} className="text-[var(--color-gold-deep)]" />
                Version {c.version} · signed by {c.signature_name} · {fmtDate(c.signed_at)}
              </span>
              <Link to={`/dashboard/family/consent/${c.id}`} className="font-semibold text-[var(--color-gold-deep)]">View</Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/** A signed copy, printable (Print → Save as PDF). */
export function SignedConsentPage() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    memberAuthApi.kidsConsent(id).then(setC).catch((e) => setError(e.message));
  }, [id]);

  return <SignedConsent consent={c} error={error} back="/dashboard/family" />;
}

export function SignedConsent({ consent: c, error, back }) {
  if (error) return <p className="text-[14px] text-red-700">{error}</p>;
  if (!c) return <p className="text-[14px] text-[var(--color-muted)]">Loading…</p>;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 print:hidden">
        {back ? <Link to={back} className="text-[13px] font-semibold text-[var(--color-gold-deep)]">← Back</Link> : <span />}
        <button type="button" onClick={() => window.print()} className={`${linkBtn}`}>
          <Printer size={15} /> Print or save as PDF
        </button>
      </div>
      <div className="rounded-3xl border border-[var(--color-border)] bg-[#FFFDF8] p-5 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7A5E22]">Golden Age Wisdom · Signed copy</p>
        <h1 className="mt-1 font-display text-[24px] text-[#14241C]">{c.snapshot.title}</h1>
        <p className="mb-4 text-[13px] text-[var(--color-muted)]">Version {c.version}</p>
        <div className="mb-4 rounded-2xl bg-[#F6F1E6] p-4 text-[13.5px] text-[#2E3A33]">
          <strong>Children:</strong> {c.children.map((k) => `${k.name} (${k.age}, photos: ${k.photos})`).join(" · ")}
        </div>
        <ConsentText sections={c.snapshot.sections} agreed={c.agreed} compact headingClass="font-display" />
        <div className="mt-5 rounded-2xl border border-[var(--color-border)] p-4 text-[13px] leading-6 text-[#2E3A33]">
          Signed electronically by <strong className="font-display text-[18px] italic">{c.signature_name}</strong> on {fmtDate(c.signed_at)}.
          <br />
          Record KC-{c.id} · text fingerprint {c.text_hash?.slice(0, 16) ?? "—"}
          {c.ip && <> · IP {c.ip}</>}
        </div>
      </div>
    </div>
  );
}
