import logoMark from "../../assets/logo-128.webp";
import Button from "../ui/Button";

/**
 * Pill top bar matching goldenagewisdom.org: brand · tagline · Join free.
 */
export default function Header({ onLogoClick }) {
  return (
    <nav
      className="relative z-50 mx-auto mt-3 flex w-[min(1180px,calc(100%-32px))] shrink-0 items-center justify-between gap-4 rounded-full border border-[var(--color-gold)]/18 bg-[rgba(20,15,40,0.55)] px-4 py-2 backdrop-blur-[18px] sm:gap-5"
      aria-label="Primary"
    >
      <button
        type="button"
        onClick={onLogoClick}
        className="flex min-w-0 flex-1 cursor-pointer items-center justify-start gap-2.5 border-0 bg-transparent p-0 text-left"
      >
        <img
          src={logoMark}
          alt="Golden Age Wisdom"
          width={44}
          height={44}
          className="h-8 w-8 shrink-0 rounded-full border border-[var(--color-gold)]/60 object-cover shadow-[0_0_18px_rgba(213,183,124,0.3)] sm:h-11 sm:w-11"
        />
        <span
          className="font-display whitespace-nowrap text-[15px] leading-none tracking-[0.09em] sm:text-[21px]"
          style={{
            background:
              "linear-gradient(115deg, #f6e7c1 10%, #d5b77c 48%, #b89758 90%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 14px rgba(213,183,124,0.35))",
          }}
        >
          GOLDEN AGE WISDOM
        </span>
      </button>

      <div className="m-tagline hidden min-w-0 shrink-0 items-center gap-3.5 md:flex">
        <span
          className="m-tag-line h-px w-[clamp(18px,4vw,54px)]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(213,183,124,0.55))",
          }}
        />
        <span className="m-tag-text whitespace-nowrap text-[13px] tracking-[0.34em] text-[var(--color-gold-deep)] uppercase">
          A Spiritual Movement
        </span>
        <span
          className="m-tag-line h-px w-[clamp(18px,4vw,54px)]"
          style={{
            background:
              "linear-gradient(90deg, rgba(213,183,124,0.55), transparent)",
          }}
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end">
        <Button
          href="https://goldenagewisdom.org/join"
          className="px-4 py-1.5 text-[13.5px] shadow-none"
        >
          Join free
        </Button>
      </div>
    </nav>
  );
}
