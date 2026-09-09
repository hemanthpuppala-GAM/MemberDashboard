import PageSections from "./PageSections";
import SubpageHero from "./SubpageHero";
import { Page, Lead, Rule, Eyebrow, H2, Body, CardTitle, Pill, NightPanel } from "./liveUi";
import { chakraByView } from "../../data/chakras";
import { MISSION } from "../../data/liveContent";

const chakra = chakraByView.mission;

export default function MissionSection({ onNavigate }) {
  return (
    <>
      <SubpageHero chakra={chakra} onHome={() => onNavigate?.("hub")}>
        <Pill onClick={() => onNavigate?.("events")}>Be the next lit dot · sit tonight</Pill>
        <Pill variant="night" onClick={() => onNavigate?.("volunteer")}>Volunteer</Pill>
      </SubpageHero>

      <Page>
        {/* Yugas */}
        <Lead className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-14 max-md:grid-cols-1 max-md:gap-8">
          <div className="flex flex-col gap-5 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] px-[clamp(24px,3.5vw,48px)] py-[clamp(28px,3.5vw,48px)] shadow-[0_40px_80px_-40px_rgba(30,42,60,.4)]">
            <Eyebrow>The yuga cycle</Eyebrow>
            <H2>Four ages. We rise from the last one.</H2>
            <Body>{MISSION.intro}</Body>
          </div>
          <ol className="m-0 flex list-none flex-col p-0">
            {MISSION.yugas.map((y) => (
              <li key={y.name} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-5 border-t border-[var(--color-border)] py-5 last:border-b">
                <span className="mt-1.5 h-3.5 w-3.5 rounded-full" style={y.now ? { background: "radial-gradient(circle at 35% 35%, #F2E3BB, #C9A24A)", boxShadow: "0 0 12px rgba(201,162,74,.7)" } : { background: "rgba(30,42,60,.15)" }} />
                <div className="flex flex-col gap-1">
                  <span className="font-display text-[20px]" style={{ color: y.now ? "var(--color-gold-deep)" : "var(--color-ink)" }}>{y.name}</span>
                  <Body className="text-[14.5px]">{y.tag}</Body>
                </div>
              </li>
            ))}
          </ol>
        </Lead>

        {/* 8% */}
        <NightPanel>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-12 max-md:grid-cols-1">
            <div className="flex flex-col gap-5">
              <div className="font-body text-[11px] tracking-[0.28em] text-[var(--color-gold-light)] uppercase">The critical mass</div>
              <div className="flex items-baseline gap-4">
                <span className="text-[clamp(84px,10vw,140px)] leading-none font-light text-[var(--color-gold-light)]" style={{ fontFamily: "var(--font-headline)" }}>{MISSION.goal.pct}</span>
                <span className="max-w-[12ch] font-body text-[15px] leading-[1.4] text-[rgba(237,230,214,.8)]">{MISSION.goal.label}</span>
              </div>
              <p className="m-0 font-body text-[15px] leading-[1.75] font-light text-[rgba(237,230,214,.85)]">{MISSION.science}</p>
              <div className="font-body text-[11px] tracking-[0.18em] text-[rgba(237,230,214,.55)] uppercase">{MISSION.goal.note}</div>
            </div>
            <div className="grid grid-cols-10 gap-2.5 justify-self-center max-md:w-full" aria-hidden="true">
              {Array.from({ length: 100 }, (_, i) => {
                const lit = MISSION.litDots.includes(i);
                return (
                  <span
                    key={i}
                    className="aspect-square w-full min-w-[10px] rounded-full"
                    style={lit ? { background: "radial-gradient(circle at 35% 35%, #F2E3BB, #C9A24A)", boxShadow: "0 0 12px rgba(232,207,131,.8)", animation: `hero-ticker 3s ease-in-out ${(i % 7) * 0.4}s infinite` } : { background: "rgba(255,255,255,.08)" }}
                  />
                );
              })}
            </div>
          </div>
        </NightPanel>

        {/* Evidence */}
        <section className="flex flex-col gap-10">
          <Rule>What has been measured</Rule>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-9">
            {MISSION.evidence.map((e) => (
              <div key={e.year} className="flex flex-col gap-3">
                <div className="text-[44px] leading-none font-light text-[#D9CDB0]" style={{ fontFamily: "var(--font-headline)" }}>{e.year}</div>
                <CardTitle>{e.title}</CardTitle>
                <Body className="text-[14.5px]">{e.body}</Body>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Pill onClick={() => onNavigate?.("practice")}>Learn to sit</Pill>
            <Pill variant="secondary" onClick={() => onNavigate?.("donate")}>Support the movement</Pill>
          </div>
        </section>

        <PageSections slug="mission" chakraId="mission" chakra={chakra} silent />
      </Page>
    </>
  );
}
