import { useState } from "react";
import PageSections from "./PageSections";
import SubpageHero from "./SubpageHero";
import { Page, Lead, Rule, Eyebrow, H2, Body, CardTitle, Pill, Voices, NightPanel } from "./liveUi";
import { chakraByView } from "../../data/chakras";
import { MEDITATION } from "../../data/liveContent";
import posture from "../../assets/hari-posture.webp";

const chakra = chakraByView.practice;

export default function MeditateSection({ onNavigate }) {
  const [deep, setDeep] = useState(false);

  return (
    <>
      <SubpageHero chakra={chakra} onHome={() => onNavigate?.("hub")}>
        <Pill onClick={() => onNavigate?.("events")}>Sit with us tonight · free</Pill>
        <Pill variant="night" to="/join">Take the 41-day challenge</Pill>
      </SubpageHero>

      <Page>
        {/* How to meditate */}
        <Lead className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start gap-14 max-md:grid-cols-1 max-md:gap-8">
          <figure className="relative m-0 aspect-[4/5] overflow-hidden rounded-[24px] shadow-[0_40px_80px_-40px_rgba(30,42,60,.45)] md:sticky md:top-24">
            <img src={posture} alt="Dr Hari Krishna seated in meditation posture" className="h-full w-full object-cover object-top" />
            <figcaption className="absolute left-5 bottom-5 rounded-full bg-[rgba(248,245,238,.9)] px-4 py-2 font-body text-[10.5px] tracking-[0.12em] text-[#23201C] uppercase backdrop-blur-[8px]">The posture — nothing more than this</figcaption>
          </figure>
          <div className="flex flex-col gap-8 pt-24 max-md:pt-0">
            <div className="flex flex-col gap-3">
              <Eyebrow>The Path · Meditation 101</Eyebrow>
              <H2>Explained simply — and scientifically</H2>
            </div>
            <ol className="m-0 flex list-none flex-col gap-7 p-0">
              {MEDITATION.steps.map((s) => (
                <li key={s.n} className="grid grid-cols-[52px_minmax(0,1fr)] gap-4">
                  <span className="text-[34px] leading-none font-light text-[#D9CDB0]" style={{ fontFamily: "var(--font-headline)" }}>{s.n}</span>
                  <div className="flex flex-col gap-1.5">
                    <CardTitle>{s.title}</CardTitle>
                    <Body>{s.body}</Body>
                  </div>
                </li>
              ))}
            </ol>
            <p className="m-0 border-l-2 border-[var(--color-gold)] pl-5 text-[20px] leading-[1.4] font-light text-[var(--color-ink)] italic" style={{ fontFamily: "var(--font-headline)" }}>That's the whole method. Nothing to buy, nothing to master.</p>
          </div>
        </Lead>

        {/* Quick answers */}
        <section className="flex flex-col gap-10">
          <Rule>Quick answers</Rule>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-9">
            {MEDITATION.quick.map((q) => (
              <div key={q.label} className="flex flex-col gap-3">
                <Eyebrow>{q.label}</Eyebrow>
                <div className="text-[26px] leading-[1.2] font-light text-[var(--color-ink)]" style={{ fontFamily: "var(--font-headline)" }}>{q.answer}</div>
                <Body>{q.detail}</Body>
              </div>
            ))}
          </div>
        </section>

        {/* Science + recommends */}
        <section className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
          <NightPanel>
            <div className="flex flex-col gap-4">
              <div className="font-body text-[11px] tracking-[0.28em] text-[var(--color-gold-light)] uppercase">The science, simply</div>
              <h3 className="m-0 text-[clamp(24px,2.4vw,32px)] leading-[1.15] font-light text-[#F6F1E6]" style={{ fontFamily: "var(--font-headline)" }}>{MEDITATION.science.title}</h3>
              <p className="m-0 font-body text-[14.5px] leading-[1.75] font-light text-[rgba(237,230,214,.85)]">{MEDITATION.science.body}</p>
            </div>
          </NightPanel>
          <div className="flex flex-col gap-5 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-[clamp(24px,3.5vw,44px)] py-[clamp(28px,3.5vw,44px)]">
            <Eyebrow>Dr Hari Krishna recommends</Eyebrow>
            <h3 className="m-0 text-[clamp(24px,2.4vw,32px)] leading-[1.15] font-light text-[var(--color-ink)]" style={{ fontFamily: "var(--font-headline)" }}>{MEDITATION.recommends.title}</h3>
            <Body>{MEDITATION.recommends.body}</Body>
            <div className="flex flex-wrap gap-2 pt-1">
              {MEDITATION.recommends.techniques.map((t) => (
                <span key={t} className="rounded-full border border-[var(--color-border-strong)] px-3.5 py-1.5 font-body text-[12px] text-[var(--color-ink-soft)]">{t}</span>
              ))}
            </div>
            <Body className="text-[14px] italic">{MEDITATION.recommends.note}</Body>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
              <Body className="text-[14px]"><span className="text-[var(--color-ink)]">And the body?</span> {MEDITATION.recommends.body2}</Body>
              <Pill variant="secondary" onClick={() => onNavigate?.("wellness")}>The detox diet</Pill>
            </div>
          </div>
        </section>

        {/* Where are you on the path */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <H2>Where are you on the path?</H2>
            <div className="inline-flex rounded-full border border-[var(--color-border-strong)] p-1" role="tablist">
              {[["New to this", false], ["Seasoned meditator", true]].map(([label, val]) => (
                <button key={label} type="button" role="tab" aria-selected={deep === val} onClick={() => setDeep(val)} className={`cursor-pointer rounded-full px-5 py-2 font-body text-[12px] tracking-[0.06em] transition-all ${deep === val ? "bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-on-gold)]" : "text-[var(--color-muted)]"}`}>{label}</button>
              ))}
            </div>
          </div>
          {!deep ? (
            <div key="simple" className="flex flex-col gap-6" style={{ animation: "hero-rise .45s both" }}>
              <p className="m-0 text-[clamp(26px,3vw,40px)] leading-[1.25] font-light text-[var(--color-ink)] italic" style={{ fontFamily: "var(--font-headline)" }}>As Dr Hari says — “Gammuga kurcho”: simply sit, quietly.</p>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
                {MEDITATION.stages.map((s) => (
                  <div key={s.n} className="flex flex-col gap-2.5">
                    <Eyebrow>{s.n}</Eyebrow>
                    <CardTitle>{s.title}</CardTitle>
                    <Body className="text-[14.5px]">{s.body}</Body>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div key="deep" className="flex flex-col gap-6" style={{ animation: "hero-rise .45s both" }}>
              <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                {MEDITATION.deep.map((c) => (
                  <div key={c.title} className="flex gap-5 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                    <span className="text-[26px] leading-none" style={{ color: chakra.color }}>{c.glyph}</span>
                    <div className="flex flex-col gap-2">
                      <CardTitle>{c.title}</CardTitle>
                      <Body className="text-[14.5px]">{c.body}</Body>
                    </div>
                  </div>
                ))}
              </div>
              <Body className="italic">Letters, shapes, numbers, colours behind the eyes? Enough reading, friend — time to meditate.</Body>
            </div>
          )}
          <div><Pill to="/join">Take the 41-day challenge</Pill></div>
        </section>

        <Voices voices={MEDITATION.voices} />
        <PageSections slug="meditate" chakraId="meditate" chakra={chakra} silent />
      </Page>
    </>
  );
}
