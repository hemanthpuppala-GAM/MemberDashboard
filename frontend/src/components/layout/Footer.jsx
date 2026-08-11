import { chakras } from "../../data/chakras";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-gold)]/20 bg-[var(--color-bg-soft)] px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-display text-lg text-[var(--color-ink)]">
            Golden Age <span className="text-[var(--color-gold-light)]">Wisdom</span>
          </span>
          <p className="max-w-xs text-sm text-[var(--color-muted)]">
            World peace through meditation — one daily sit, one global circle.
          </p>
        </div>

        <nav
          aria-label="Section links"
          className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-[var(--color-muted)] sm:grid-cols-3"
        >
          {chakras.map((chakra) => (
            <a
              key={chakra.id}
              href={chakra.href}
              className="transition-colors hover:text-[var(--color-gold-light)]"
            >
              {chakra.label}
            </a>
          ))}
        </nav>
      </div>

      <p className="mx-auto mt-10 max-w-5xl text-xs text-[var(--color-muted-soft)]">
        © {new Date().getFullYear()} Golden Age Wisdom. All rights reserved.
      </p>
    </footer>
  );
}
