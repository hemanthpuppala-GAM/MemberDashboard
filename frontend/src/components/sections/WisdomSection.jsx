import PageSections from "./PageSections";
import SubpageHero from "./SubpageHero";
import { Page, Lead, Eyebrow, H2, Body, Pill, Voices, DawnBand, Card, GlyphBadge } from "./liveUi";
import { chakraByView } from "../../data/chakras";
import { WISDOM } from "../../data/liveContent";

const chakra = chakraByView.wisdom;
const A = WISDOM.architecture;

/** Wisdom — the live site's page, block for block: heading, four glyph cards,
 *  "Architecture of Reality" panel, voices, CTAs. Rendered on the dawn band. */
export default function WisdomSection({ onNavigate }) {
  return (
    <>
      <SubpageHero chakra={chakra} onHome={() => onNavigate?.("hub")}>
        <Pill href={WISDOM.youtube}>▶ Watch the intro film</Pill>
        <Pill variant="night" to="/join">Join the live sessions — free</Pill>
      </SubpageHero>

      <DawnBand>
        <Page>
          <Lead className="flex flex-col items-center gap-3 text-center">
            <Eyebrow>Wisdom</Eyebrow>
            <H2>{WISDOM.heading}</H2>
          </Lead>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
            {WISDOM.cards.map((c) => (
              <Card key={c.title}>
                <GlyphBadge>{c.glyph}</GlyphBadge>
                <h3 className="m-0 font-display text-[19px] font-normal text-[var(--color-ink)]">{c.title}</h3>
                <Body className="text-[14.5px] leading-[1.65]">{c.body}</Body>
              </Card>
            ))}
          </section>

          {/* Architecture of Reality — dusk panel, as on the live site */}
          <section
            className="relative flex flex-col gap-7 overflow-hidden rounded-[28px] border border-[rgba(127,176,224,.35)] px-[clamp(20px,3.5vw,40px)] py-[clamp(28px,4vw,44px)] text-[var(--color-cream)]"
            style={{ background: "linear-gradient(150deg, #1B2E4F 0%, #0C1728 60%, #05080F 100%)", boxShadow: "0 40px 80px -40px rgba(30,42,60,.6)" }}
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(127,176,224,.22), transparent 70%)" }} />
            <div className="relative flex flex-col items-center gap-2 text-center">
              <div className="font-body text-[11px] tracking-[0.26em] text-[#A8C4FF] uppercase">{A.eyebrow}</div>
              <h3 className="m-0 text-[clamp(24px,2.8vw,34px)] leading-[1.15] font-light text-[#F6F1E6]" style={{ fontFamily: "var(--font-headline)" }}>{A.title}</h3>
              <p className="m-0 max-w-[640px] font-body text-[15px] leading-[1.65] text-[rgba(237,230,214,.9)] text-pretty">{A.lead}</p>
            </div>

            <div className="relative grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <div className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-white/[.04] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-body text-[11px] tracking-[0.2em] text-[#E08A8A] uppercase">{A.static.label}</span>
                  <span className="font-body text-[11px] text-[rgba(237,230,214,.6)]">{A.static.chem}</span>
                </div>
                <svg viewBox="0 0 260 44" className="h-11 w-full" aria-hidden="true"><polyline points="0,24 14,10 22,34 34,16 42,38 56,8 66,30 78,14 88,36 100,12 112,32 124,18 134,40 148,10 158,28 170,16 182,34 194,12 206,30 218,20 230,36 244,14 260,26" fill="none" stroke="rgba(224,138,138,0.85)" strokeWidth="1.6" /></svg>
                <p className="m-0 font-body text-[14px] leading-[1.6] text-[rgba(237,230,214,.88)]">{A.static.body}</p>
              </div>
              <div className="flex flex-col gap-3 rounded-[18px] border border-[rgba(127,176,224,.45)] bg-[rgba(127,176,224,.08)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-body text-[11px] tracking-[0.2em] text-[#A8C4FF] uppercase">{A.coherent.label}</span>
                  <span className="font-body text-[11px] text-[rgba(237,230,214,.6)]">{A.coherent.chem}</span>
                </div>
                <svg viewBox="0 0 260 44" className="h-11 w-full" aria-hidden="true"><path d="M0,22 C13,4 26,4 39,22 C52,40 65,40 78,22 C91,4 104,4 117,22 C130,40 143,40 156,22 C169,4 182,4 195,22 C208,40 221,40 234,22 C247,4 254,8 260,16" fill="none" stroke="rgba(150,190,255,0.9)" strokeWidth="1.6" /></svg>
                <p className="m-0 font-body text-[14px] leading-[1.6] text-[rgba(237,230,214,.88)]">{A.coherent.body}</p>
              </div>
            </div>

            <div className="relative grid grid-cols-3 gap-5 max-md:grid-cols-1">
              {A.principles.map((p) => (
                <div key={p.title} className="flex flex-col gap-1.5 px-1">
                  <span className="font-display text-[16px] text-[var(--color-gold-light)]">{p.glyph} {p.title}</span>
                  <p className="m-0 font-body text-[13.5px] leading-[1.6] text-[rgba(237,230,214,.82)]">{p.body}</p>
                </div>
              ))}
            </div>

            <div className="relative flex flex-col gap-4 border-t border-white/10 pt-5">
              <div className="text-center font-body text-[11px] tracking-[0.24em] text-[var(--color-gold-light)] uppercase">{A.protocolTitle}</div>
              <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                {A.protocol.map((s) => (
                  <div key={s.n} className="flex flex-col gap-1.5 rounded-[16px] border border-[rgba(201,162,74,.3)] bg-[rgba(201,162,74,.07)] px-4 py-3.5">
                    <span className="font-body text-[12px] text-[var(--color-gold-light)]">{s.n} · {s.title}</span>
                    <p className="m-0 font-body text-[13.5px] leading-[1.6] text-[rgba(237,230,214,.85)]">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Voices voices={WISDOM.voices} />

          <div className="flex flex-wrap justify-center gap-3.5">
            <Pill href={WISDOM.youtube}>▶ Watch the intro film</Pill>
            <Pill variant="outline" to="/join">Join the live sessions — free</Pill>
          </div>

          <PageSections slug="wisdom" chakraId="wisdom" chakra={chakra} silent />
        </Page>
      </DawnBand>
    </>
  );
}
