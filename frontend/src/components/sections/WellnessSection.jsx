import { useState } from "react";
import PageSections from "./PageSections";
import SubpageHero from "./SubpageHero";
import { Page, Lead, Rule, Eyebrow, H2, Body, CardTitle, Pill, Voices, NightPanel } from "./liveUi";
import { chakraByView } from "../../data/chakras";
import { WELLNESS } from "../../data/liveContent";
import detoxPdf from "../../assets/detox-diet.pdf";

const chakra = chakraByView.wellness;

export default function WellnessSection({ onNavigate }) {
  const [tab, setTab] = useState(0);
  const d = WELLNESS.detox[tab];

  return (
    <>
      <SubpageHero chakra={chakra} onHome={() => onNavigate?.("hub")}>
        <Pill href={detoxPdf} download="GoldenAge Detox Diet.pdf">Download the detox diet · PDF</Pill>
        <Pill variant="night" to="/join">Take the 41-day challenge</Pill>
      </SubpageHero>

      <Page>
        {/* 5 Golden Rules — the lead card */}
        <Lead>
          <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] px-[clamp(24px,4vw,56px)] py-[clamp(32px,4vw,52px)] shadow-[0_40px_80px_-40px_rgba(30,42,60,.4)]">
            <div className="flex flex-col items-center gap-2 text-center">
              <Eyebrow>Golden Age Spiritual Movement</Eyebrow>
              <H2><span className="text-[1.35em] text-[var(--color-gold)]">5</span> Golden Rules to a healthy and happy life</H2>
            </div>
            <ol className="m-0 mt-10 grid list-none grid-cols-5 gap-6 p-0 max-lg:grid-cols-3 max-md:grid-cols-1">
              {WELLNESS.rules.map((r) => (
                <li key={r.n} className="flex flex-col items-center gap-3 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full text-[18px] text-[var(--color-on-gold)]" style={{ fontFamily: "var(--font-headline)", background: "radial-gradient(circle at 35% 35%, #F2E3BB, #C9A24A)", boxShadow: "0 0 18px rgba(201,162,74,.45)" }}>{r.n}</span>
                  <span className="font-display text-[16px] text-[var(--color-ink)]">{r.title}</span>
                  <Body className="text-[14px]">{r.body}</Body>
                </li>
              ))}
            </ol>
          </div>
        </Lead>

        {/* Detox diet tabs */}
        <section className="flex flex-col gap-9">
          <div className="flex flex-col items-center gap-3 text-center">
            <Eyebrow>Wellness</Eyebrow>
            <H2>The Golden Age Detox Diet</H2>
            <span className="inline-flex rounded-full border border-[rgba(201,162,74,.5)] px-4 py-1.5 font-body text-[11px] tracking-[0.18em] text-[var(--color-gold-deep)] uppercase">41 days · repeat every 6 months</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2" role="tablist">
            {WELLNESS.detox.map((t, i) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={i === tab}
                onClick={() => setTab(i)}
                className={`cursor-pointer rounded-full border px-4 py-2 font-body text-[12px] tracking-[0.06em] transition-all ${
                  i === tab ? "border-[var(--color-gold)] bg-[rgba(201,162,74,.14)] text-[var(--color-ink)]" : "border-[var(--color-border)] bg-transparent text-[var(--color-muted)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div key={tab} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start gap-12 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-[clamp(24px,3.5vw,44px)] max-md:grid-cols-1 max-md:gap-6" style={{ animation: "hero-rise .45s both" }}>
            <div className="flex flex-col gap-4">
              <div className="font-body text-[11px] tracking-[0.2em] text-[var(--color-muted)] uppercase">{tab + 1} / {WELLNESS.detox.length}</div>
              <CardTitle>{d.title}</CardTitle>
              <Body>{d.desc}</Body>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {d.items.map((it) => (
                <li key={it} className="flex items-start gap-3.5 font-body text-[15px] leading-[1.6] text-[var(--color-ink-soft)]">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: chakra.color }} />
                  {it}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Pill href={detoxPdf} download="GoldenAge Detox Diet.pdf">Download the full program</Pill>
            <Pill variant="secondary" onClick={() => onNavigate?.("practice")}>Start with the sitting</Pill>
          </div>
        </section>

        <NightPanel>
          <div className="grid grid-cols-[minmax(0,1.2fr)_auto] items-center gap-10 max-md:grid-cols-1">
            <div className="flex flex-col gap-4">
              <div className="font-body text-[11px] tracking-[0.28em] text-[var(--color-gold-light)] uppercase">And the body?</div>
              <h3 className="m-0 text-[clamp(24px,2.8vw,36px)] leading-[1.15] font-light text-[#F6F1E6]" style={{ fontFamily: "var(--font-headline)" }}>Most disease sits at the mitochondrial level. Restored prana reaches the cell and heals upward.</h3>
              <p className="m-0 font-body text-[15px] leading-[1.7] font-light text-[rgba(237,230,214,.85)]">Cellular, bodily, psychic, emotional — in that order. The diet clears the ground; the sitting does the work.</p>
            </div>
            <Pill to="/join">Take the 41-day challenge</Pill>
          </div>
        </NightPanel>

        <Rule>Voices</Rule>
        <Voices voices={WELLNESS.voices} />
        <PageSections slug="wellness" chakraId="wellness" chakra={chakra} silent />
      </Page>
    </>
  );
}
