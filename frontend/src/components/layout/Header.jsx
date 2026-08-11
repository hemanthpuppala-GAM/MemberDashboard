import logoMark from "../../assets/logo-mark.png";
import Button from "../ui/Button";

/**
 * Top bar: brand mark + wordmark + tagline, one CTA. The chakra mandala
 * is the site's real navigation (Design.md §1) — this stays minimal.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-[var(--color-gold)]/15 bg-[var(--color-bg)]/55 px-6 py-4 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150 sm:px-10">
      <a href="#top" className="flex items-center gap-3">
        <img
          src={logoMark}
          alt="Golden Age Wisdom"
          className="h-11 w-11 rounded-full border border-[var(--color-gold)]/50 sm:h-12 sm:w-12"
        />
        <span className="flex flex-col leading-tight">
          <span className="font-display text-base tracking-wide text-[var(--color-ink)] sm:text-lg">
            Golden Age Wisdom
          </span>
          <span className="hidden items-center gap-2 text-[10px] tracking-[0.35em] text-[var(--color-muted-soft)] uppercase sm:flex">
            <span className="h-px w-4 bg-[var(--color-gold)]/50" />
            A spiritual movement
          </span>
        </span>
      </a>

      <div className="hidden sm:block">
        <Button href="#meditate-now">Join free</Button>
      </div>
    </header>
  );
}
