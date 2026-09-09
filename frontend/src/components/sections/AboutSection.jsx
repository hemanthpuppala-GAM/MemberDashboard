import PageSections from "./PageSections";
import SubpageHero from "./SubpageHero";
import { Page, Lead, Rule, Eyebrow, H2, Body, Numeral, CardTitle, Pill, Voices } from "./liveUi";
import { chakraByView } from "../../data/chakras";
import { ABOUT } from "../../data/liveContent";
import graduation from "../../assets/hari-graduation.jpg";
import reflect from "../../assets/hari-reflect.webp";
import posture from "../../assets/hari-posture.webp";

const chakra = chakraByView.about;
const photos = [graduation, reflect, posture];

export default function AboutSection({ onNavigate }) {
  return (
    <>
      <SubpageHero chakra={chakra} onHome={() => onNavigate?.("hub")}>
        <Pill to="/join">Join free</Pill>
        <Pill variant="night" onClick={() => onNavigate?.("events")}>Meet him live · daily</Pill>
      </SubpageHero>

      <Page>
        <Lead className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
          {photos.map((src, i) => (
            <figure key={src} className={`relative m-0 overflow-hidden rounded-[22px] shadow-[0_40px_80px_-40px_rgba(30,42,60,.5)] ${i === 1 ? "aspect-[4/5] md:-mt-8" : "aspect-[4/5]"}`}>
              <img src={src} alt={ABOUT.captions[i]} className="h-full w-full object-cover object-top" />
              <figcaption className="absolute left-4 bottom-4 rounded-full bg-[rgba(248,245,238,.9)] px-4 py-2 font-body text-[10.5px] tracking-[0.12em] text-[#23201C] uppercase backdrop-blur-[8px]">{ABOUT.captions[i]}</figcaption>
            </figure>
          ))}
        </Lead>

        <section className="flex flex-col gap-10">
          <Rule>Our guide</Rule>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-9">
            {ABOUT.strengths.map((s, i) => (
              <div key={s.title} className="flex flex-col gap-3.5">
                <Numeral>0{i + 1}</Numeral>
                <CardTitle>{s.title}</CardTitle>
                <Body>{s.body}</Body>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 items-center gap-16 max-md:grid-cols-1 max-md:gap-8">
          <div className="flex flex-col gap-5">
            <Eyebrow>Golden Age Spiritual Movement</Eyebrow>
            <H2>Meditation made logical, practical — and free for all.</H2>
            <Body>Dr Hari teaches twice daily, live and without charge, to a worldwide circle. Knowledge from the Upanishads, explained through the body he studied as a physician: biology, psychology, physiology — never blind belief.</Body>
            <div className="flex flex-wrap gap-3 pt-2">
              <Pill variant="secondary" onClick={() => onNavigate?.("wisdom")}>Read the teachings</Pill>
              <Pill variant="secondary" onClick={() => onNavigate?.("practice")}>How to meditate</Pill>
            </div>
          </div>
          <Voices voices={ABOUT.voices.slice(0, 2)} />
        </section>

        <Voices voices={ABOUT.voices.slice(2)} />
        <PageSections slug="about" chakraId="about" chakra={chakra} silent />
      </Page>
    </>
  );
}
