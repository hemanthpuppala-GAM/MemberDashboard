/**
 * The signed consent, exactly as stored (snapshot). Used on the register form (with tick boxes), the parent's
 * signed copy and the admin view. `conspicuous` sections (the release) are boxed and bold, as Texas requires.
 */
export default function ConsentText({ sections, agreed, onToggle, disabled, compact = false, headingClass = "serif" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 14 }}>
      {sections.map((s, i) => {
        const ticked = agreed?.includes(s.key);
        return (
          <section
            key={s.key}
            style={{
              borderRadius: 16,
              padding: compact ? "12px 14px" : "16px 18px",
              background: s.conspicuous ? "#FFF8E6" : "#FFFDF8",
              border: s.conspicuous ? "2px solid #A8853A" : "1px solid rgba(138,111,52,.28)",
            }}
          >
            <h3 className={headingClass} style={{ margin: "0 0 8px", fontSize: compact ? 18 : 21, fontWeight: 600, color: "#14241C" }}>
              {i + 1}. {s.title}
            </h3>
            {s.paragraphs.map((p, j) => (
              <p key={j} style={{ margin: "0 0 7px", fontSize: compact ? 13 : 14, lineHeight: 1.6, color: "#2E3A33", fontWeight: s.conspicuous ? 700 : 400 }}>
                {p}
              </p>
            ))}
            {onToggle ? (
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 14, fontWeight: 600, color: "#14241C", cursor: "pointer" }}>
                <input type="checkbox" checked={!!ticked} onChange={() => onToggle(s.key)} disabled={disabled} style={{ width: 20, height: 20, accentColor: "#A8853A" }} />
                {s.key === "release" ? "I have read the release and agree" : "I have read and agree"}
              </label>
            ) : agreed ? (
              <p style={{ margin: "8px 0 0", fontSize: 12.5, fontWeight: 700, color: ticked ? "#25803F" : "#9B2C2C" }}>{ticked ? "✓ Agreed" : "Not ticked"}</p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
