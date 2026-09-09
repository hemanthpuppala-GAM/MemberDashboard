import { chakraIcons } from "../mandala/icons";
import heroForest from "../../assets/hero-hari-forest.png";
import { HEROES } from "../../data/liveContent";

/** "\n" line break · "*text*" gold italic — same conventions as the home hero. */
function renderTitle(title) {
  return title.split("\n").map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line.split("*").map((part, j) =>
        j % 2 === 1 ? (
          <em key={j} className="font-normal text-[var(--color-gold-light)] not-italic italic">{part}</em>
        ) : (
          part
        ),
      )}
    </span>
  ));
}

/**
 * Subpage banner — the "night to day" gradient from the preview design.
 * Dark night at the top (the header sits on it), dusk blue, dawn, then the
 * paper the content is read on. The page's chakra sits left as its emblem.
 */
export default function SubpageHero({ chakra, onHome, children }) {
  const copy = HEROES[chakra.view];
  const Icon = chakraIcons[chakra.id];
  const hue = chakra.glyphColor || chakra.color;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #05080F 0%, #0C1728 34%, #3C5A85 62%, #C9D3E0 84%, var(--color-bg) 100%)" }}
    >
      <img
        src={heroForest}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%] w-full object-cover object-[50%_20%] opacity-[0.26] blur-[2px]"
        style={{ maskImage: "linear-gradient(180deg, rgba(0,0,0,.9), transparent)", WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,.9), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[18%] h-[420px] w-[420px] rounded-full opacity-40 blur-[90px] max-md:hidden"
        style={{ background: `radial-gradient(circle, ${hue}, transparent 70%)` }}
      />

      <div className="relative mx-auto grid w-full max-w-[1080px] grid-cols-[240px_minmax(0,1fr)] items-center gap-14 px-12 pt-16 pb-[120px] max-md:grid-cols-1 max-md:gap-8 max-md:px-5 max-md:pt-10 max-md:pb-[88px]">
        {/* Chakra emblem */}
        <div className="relative flex aspect-square w-[240px] items-center justify-center max-md:w-[150px] max-md:justify-self-center">
          <span aria-hidden="true" className="absolute inset-0 rounded-full border border-dashed border-white/25" style={{ animation: "slow-spin 90s linear infinite" }} />
          <span aria-hidden="true" className="absolute inset-[14%] rounded-full border border-[rgba(201,162,74,0.45)]" style={{ animation: "hero-ripple 7s ease-out infinite" }} />
          <span
            className="relative flex h-[58%] w-[58%] items-center justify-center rounded-full border border-[rgba(201,162,74,0.5)] bg-[rgba(12,20,36,0.6)] backdrop-blur-[10px]"
            style={{ color: hue, boxShadow: `0 10px 40px rgba(0,0,0,.5), 0 0 40px ${hue}55` }}
          >
            <span className="flex h-[70%] w-[70%] items-center justify-center" style={{ filter: `drop-shadow(0 0 12px ${hue}aa)` }}>
              {Icon ? <Icon size="100%" petals={chakra.petals} /> : null}
            </span>
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-5 max-md:items-center max-md:text-center">
          <div className="hero-rise flex items-center gap-3 font-body text-[11px] tracking-[0.28em] text-[var(--color-gold-light)] uppercase" style={{ animationDelay: ".1s" }}>
            <button type="button" onClick={onHome} className="cursor-pointer text-[rgba(237,230,214,0.6)] transition-colors hover:text-[var(--color-cream)]">Home</button>
            <span className="text-[rgba(237,230,214,0.4)]">·</span>
            <span>{copy.crumb}</span>
          </div>
          <h2
            className="hero-rise m-0 text-[clamp(38px,5.2vw,78px)] leading-[1] tracking-[-0.02em] text-[#F6F1E6] text-balance"
            style={{ fontFamily: "var(--font-headline)", fontWeight: 300, animationDelay: ".25s", textShadow: "0 2px 24px rgba(0,0,0,.5)" }}
          >
            {renderTitle(copy.title)}
          </h2>
          <p className="hero-rise m-0 max-w-[560px] font-body text-[16px] leading-[1.7] font-light text-white/90 text-pretty" style={{ animationDelay: ".4s", textShadow: "0 1px 10px rgba(0,0,0,.5)" }}>
            {copy.sub}
          </p>
          {children && <div className="hero-rise flex flex-wrap gap-3 pt-1 max-md:justify-center" style={{ animationDelay: ".55s" }}>{children}</div>}
        </div>
      </div>
    </section>
  );
}
