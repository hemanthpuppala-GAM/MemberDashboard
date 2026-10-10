import { statusOf } from "./memberTickets";
import { BODY } from "./styles";

export function StatusPill({ status, size = 12.5 }) {
  const s = statusOf(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontSize: size,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status === "waiting" && <span aria-hidden="true">●</span>}
      {s.label}
    </span>
  );
}

export function Stars({ value, size = 22 }) {
  return (
    <span aria-label={`${value} out of 5 stars`} style={{ display: "inline-flex", gap: 2, color: "#C9A24A", fontSize: size, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" style={{ opacity: n <= value ? 1 : 0.28 }}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Notice({ tone = "info", children }) {
  const tones = {
    info: { bg: "rgba(201,162,74,.12)", border: "rgba(201,162,74,.4)", fg: BODY },
    error: { bg: "rgba(168,64,63,.08)", border: "rgba(168,64,63,.35)", fg: "#8A3231" },
    ok: { bg: "rgba(47,107,69,.08)", border: "rgba(47,107,69,.3)", fg: "#2F6B45" },
  };
  const t = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} style={{ padding: "12px 16px", borderRadius: 14, background: t.bg, border: `1px solid ${t.border}`, color: t.fg, fontSize: 14.5, lineHeight: 1.55 }}>
      {children}
    </div>
  );
}

const STAR_WORDS = ["", "Poor", "Not great", "Okay", "Good", "Excellent"];

/** Five 48px star buttons (radio group) + the chosen word. */
export function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <div role="radiogroup" aria-label="Your rating" style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""} — ${STAR_WORDS[n]}`}
            onClick={() => onChange(n)}
            style={{
              width: 48,
              height: 48,
              border: 0,
              borderRadius: 999,
              background: "transparent",
              color: "#C9A24A",
              fontSize: 32,
              lineHeight: 1,
              cursor: "pointer",
              opacity: n <= value ? 1 : 0.3,
              transition: "opacity .15s, transform .15s",
              transform: n <= value ? "scale(1.05)" : "none",
            }}
          >
            ★
          </button>
        ))}
      </div>
      {value > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: BODY }}>{STAR_WORDS[value]}</span>}
    </div>
  );
}
