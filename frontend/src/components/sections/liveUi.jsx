import { Link } from "react-router-dom";

/**
 * Shared primitives for the live-content subpages — one file so the six
 * pages read as one design (paper canvas, ink text, gold rule, dusk links).
 */

export function Page({ children }) {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-[clamp(64px,9vw,120px)] px-12 pb-24 max-md:px-5 max-md:pb-16">
      {children}
    </div>
  );
}

/** First block after the hero — lifts up into the dawn gradient. */
export function Lead({ children, className = "" }) {
  return <section className={`relative z-[2] -mt-[72px] max-md:-mt-[56px] ${className}`}>{children}</section>;
}

/** Gold hairline with a small caps title in the middle. */
export function Rule({ children }) {
  return (
    <div className="flex items-center gap-5">
      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,74,.6))" }} />
      <h3 className="m-0 font-display text-[13px] font-normal tracking-[0.3em] text-[var(--color-gold-deep)] uppercase">{children}</h3>
      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(201,162,74,.6), transparent)" }} />
    </div>
  );
}

export function Eyebrow({ children, className = "" }) {
  return <div className={`font-body text-[11px] tracking-[0.26em] text-[var(--color-gold-deep)] uppercase ${className}`}>{children}</div>;
}

export function H2({ children, className = "" }) {
  return (
    <h2 className={`m-0 text-[clamp(28px,3.4vw,40px)] leading-[1.15] font-light tracking-[-0.01em] text-[var(--color-ink)] text-balance ${className}`} style={{ fontFamily: "var(--font-headline)" }}>
      {children}
    </h2>
  );
}

/** Body copy — full ink weight (#2B3648) so long-form reads on paper and on the dawn band alike. */
export function Body({ children, className = "" }) {
  return <p className={`m-0 font-body text-[15.5px] leading-[1.75] font-normal text-[#2B3648] text-pretty ${className}`}>{children}</p>;
}

/** Bluish-white band — continues the hero's dawn (#C9D3E0) under the first content blocks before settling on paper. */
export function DawnBand({ children }) {
  return (
    <div style={{ background: "linear-gradient(180deg, #E4EAF2 0%, #EEF1F5 42%, var(--color-bg) 100%)" }}>
      {children}
    </div>
  );
}

/** White card on the band/paper. */
export function Card({ children, className = "" }) {
  return (
    <div className={`flex flex-col gap-3 rounded-[22px] border border-[#DCE3EC] bg-white p-6 shadow-[0_14px_40px_-20px_rgba(30,42,60,.35)] transition-colors hover:border-[rgba(201,162,74,.6)] ${className}`}>
      {children}
    </div>
  );
}

/** Round gold glyph badge — the live site's card icon. */
export function GlyphBadge({ children }) {
  return (
    <div
      className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[rgba(201,162,74,.45)] font-display text-[19px] text-[var(--color-gold-deep)]"
      style={{ background: "radial-gradient(circle at 35% 35%, rgba(232,207,131,.55), rgba(201,162,74,.12))" }}
    >
      {children}
    </div>
  );
}

/** Big pale numeral used by the "Three ways in" pattern. */
export function Numeral({ children }) {
  return <div className="text-[56px] leading-none font-light text-[#D9CDB0]" style={{ fontFamily: "var(--font-headline)" }}>{children}</div>;
}

export function CardTitle({ children }) {
  return <div className="font-display text-[21px] text-[var(--color-ink)]">{children}</div>;
}

/** Small-caps text link with a gold underline. */
export function TextLink({ to, href, children, tone = "ink", onClick }) {
  const cls = `inline-flex w-fit items-center gap-1.5 font-body text-[12px] tracking-[0.14em] uppercase no-underline transition-colors ${
    tone === "dusk"
      ? "text-[var(--color-dusk)] hover:text-[var(--color-ink)]"
      : "border-b border-[var(--color-gold)] pb-1 text-[var(--color-ink)] hover:text-[var(--color-gold-deep)]"
  }`;
  if (to) return <Link to={to} className={cls} onClick={onClick}>{children}</Link>;
  return <a href={href} onClick={onClick} className={cls} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>;
}

/** Filled gold pill (primary) or outlined (secondary). */
export function Pill({ to, href, onClick, children, variant = "primary", download }) {
  const base = "inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 font-body text-[12px] font-medium tracking-[0.12em] uppercase no-underline transition-all";
  const cls =
    variant === "primary"
      ? `${base} bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-on-gold)] shadow-[0_0_24px_rgba(201,162,74,.3)] hover:shadow-[0_0_34px_rgba(201,162,74,.55)]`
      : variant === "night"
        ? `${base} border border-[rgba(232,207,131,0.55)] bg-[rgba(5,8,15,0.4)] text-[var(--color-gold-light)] backdrop-blur-[6px] hover:border-[var(--color-gold-light)]`
        : `${base} border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold-deep)]`;
  if (to) return <Link to={to} className={cls} onClick={onClick}>{children}</Link>;
  if (href) return <a href={href} download={download} className={cls} onClick={onClick} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

/** Quote rail — the live site's "voices", rendered on paper. */
export function Voices({ voices }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 border-t border-[var(--color-border)] pt-10">
      {voices.map((v) => (
        <blockquote key={v.name} className="m-0 flex flex-col gap-4">
          <p className="m-0 text-[20px] leading-[1.4] font-light text-[var(--color-ink)] italic" style={{ fontFamily: "var(--font-headline)" }}>“{v.text}”</p>
          <footer className="flex items-center gap-2.5">
            <span className="h-px w-6 bg-[var(--color-gold)]" />
            <span className="font-body text-[11px] font-semibold tracking-[0.12em] text-[var(--color-gold-deep)] uppercase">{v.name}</span>
          </footer>
        </blockquote>
      ))}
    </div>
  );
}

/** Night panel — a dark card on the paper for the emphatic block on each page. */
export function NightPanel({ children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] px-[clamp(24px,4vw,56px)] py-[clamp(32px,4.5vw,56px)] text-[var(--color-cream)] ${className}`}
      style={{ background: "linear-gradient(160deg, #0C1728 0%, #05080F 100%)", boxShadow: "0 40px 80px -40px rgba(30,42,60,.6)" }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-[320px] w-[320px] rounded-full opacity-30 blur-[80px]" style={{ background: "radial-gradient(circle, #C9A24A, transparent 70%)" }} />
      <div className="relative">{children}</div>
    </div>
  );
}
