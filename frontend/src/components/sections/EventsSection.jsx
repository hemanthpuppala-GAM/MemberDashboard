import { useMemo } from "react";
import PageSections from "./PageSections";
import SubpageHero from "./SubpageHero";
import { Page, Lead, Rule, Eyebrow, H2, Body, CardTitle, Pill, Voices, NightPanel } from "./liveUi";
import { chakraByView } from "../../data/chakras";
import { EVENTS } from "../../data/liveContent";
import { istToLocal } from "../../utils/peaceTime";
import invite from "../../assets/awakening-hyderabad-invite.jpg";

const chakra = chakraByView.events;

export default function EventsSection({ onNavigate }) {
  const now = Date.now();
  const upcoming = EVENTS.gatherings.filter((g) => g.ends > now);
  const past = EVENTS.gatherings.filter((g) => g.ends <= now);
  const sessions = useMemo(() => EVENTS.sessions.map((s) => ({ ...s, ist: istToLocal(s.h, s.m, "Asia/Kolkata"), local: istToLocal(s.h, s.m) })), []);
  const isIST = sessions[0]?.local === sessions[0]?.ist;

  return (
    <>
      <SubpageHero chakra={chakra} onHome={() => onNavigate?.("hub")}>
        <Pill href={EVENTS.youtube}>▶ Watch live on YouTube</Pill>
        <Pill variant="night" to="/join">Zoom circle · members</Pill>
      </SubpageHero>

      <Page>
        {/* Daily sessions */}
        <Lead>
          <NightPanel>
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="font-body text-[11px] tracking-[0.28em] text-[var(--color-gold-light)] uppercase">Daily live sessions · every day, Sundays included</div>
                  <h3 className="m-0 text-[clamp(26px,3vw,38px)] leading-[1.1] font-light text-[#F6F1E6]" style={{ fontFamily: "var(--font-headline)" }}>Four sittings a day, free, worldwide</h3>
                </div>
                {!isIST && <div className="font-body text-[12px] tracking-[0.1em] text-[rgba(237,230,214,.6)] uppercase">Shown in your local time · IST in grey</div>}
              </div>
              <ol className="m-0 flex list-none flex-col p-0">
                {sessions.map((s) => (
                  <li key={s.title} className="grid grid-cols-[160px_minmax(0,1fr)] items-start gap-6 border-t border-[rgba(232,207,131,.16)] py-5 max-md:grid-cols-1 max-md:gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[24px] leading-none text-[#F6F1E6]" style={{ fontFamily: "var(--font-headline)" }}>{s.local}</span>
                      {!isIST && <span className="font-body text-[11px] tracking-[0.08em] text-[rgba(237,230,214,.5)]">{s.ist} IST · {s.dur} min</span>}
                      {isIST && <span className="font-body text-[11px] tracking-[0.08em] text-[rgba(237,230,214,.5)]">{s.dur} min</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5 font-display text-[17px] text-[var(--color-cream)]">
                        {s.peace && <span className="h-2 w-2 rounded-full bg-[var(--color-gold-live)]" style={{ boxShadow: "0 0 12px var(--color-gold-live)", animation: "hero-ticker 2s infinite" }} />}
                        {s.title}
                      </div>
                      <p className="m-0 font-body text-[14px] leading-[1.6] font-light text-[rgba(237,230,214,.75)]">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-3">
                <Pill href={EVENTS.youtube}>▶ Watch live · free</Pill>
                <Pill variant="night" to="/join">Ask Dr Hari on Zoom · sign in</Pill>
              </div>
            </div>
          </NightPanel>
        </Lead>

        {/* Gatherings */}
        <section className="flex flex-col gap-10">
          <Rule>Gatherings</Rule>
          {upcoming.length === 0 && past.length === 0 && <Body>{EVENTS.empty}</Body>}
          {upcoming.map((g) => <Gathering key={g.title} g={g} />)}
          {past.length > 0 && (
            <div className="flex flex-col gap-6">
              <Eyebrow>Past</Eyebrow>
              {past.map((g) => <Gathering key={g.title} g={g} past />)}
            </div>
          )}
          {upcoming.length === 0 && past.length > 0 && <Body className="italic">{EVENTS.empty}</Body>}
        </section>

        <section className="grid grid-cols-[minmax(0,1.2fr)_auto] items-center gap-10 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-[clamp(24px,4vw,56px)] py-[clamp(28px,4vw,48px)] max-md:grid-cols-1">
          <div className="flex flex-col gap-3">
            <Eyebrow>Membership</Eyebrow>
            <H2>Register as a member — free, always.</H2>
            <Body>Zoom access, 1:1 questions with Dr Hari, the journal and the 41-day challenge tracker.</Body>
          </div>
          <Pill to="/join">Register as a member →</Pill>
        </section>

        <Voices voices={EVENTS.voices} />
        <PageSections slug="events" chakraId="events" chakra={chakra} silent />
      </Page>
    </>
  );
}

function Gathering({ g, past = false }) {
  return (
    <article className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-10 max-md:grid-cols-1 ${past ? "opacity-60" : ""}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] shadow-[0_30px_60px_-36px_rgba(30,42,60,.5)]">
        <img src={invite} alt="" className="h-full w-full object-cover" />
        {past && <span className="absolute left-4 top-4 rounded-full bg-[rgba(5,8,15,.7)] px-3 py-1.5 font-body text-[10px] tracking-[0.16em] text-[var(--color-cream)] uppercase">Complete</span>}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <span className="text-[56px] leading-none font-light text-[var(--color-ink)]" style={{ fontFamily: "var(--font-headline)" }}>{g.day}</span>
          <span className="font-body text-[12px] tracking-[0.2em] text-[var(--color-gold-deep)] uppercase">{g.month} {g.year} · {g.time}</span>
        </div>
        <CardTitle>{g.title}</CardTitle>
        <Body>{g.meta}</Body>
        <Body className="text-[14px]">{g.place}</Body>
        <a href={`mailto:${g.contact}`} className="font-body text-[12px] tracking-[0.14em] text-[var(--color-dusk)] uppercase no-underline">{g.contact}</a>
      </div>
    </article>
  );
}
