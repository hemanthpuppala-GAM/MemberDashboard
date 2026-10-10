/** Public-site palette + shared inline styles for the member "My questions" page. */
export const INK = "#14241C";
export const BODY = "#2E3A33";
export const MUTED = "#5A5546";
export const GOLD_TEXT = "#7A5E22";
export const CARD = "#FFFDF8";
export const BORDER = "rgba(201,162,74,.32)";

export const card = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 20,
  boxShadow: "0 10px 30px -22px rgba(20,36,28,.45)",
};

export const goldButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  minHeight: 48,
  padding: "0 24px",
  border: 0,
  borderRadius: 999,
  fontFamily: "inherit",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

export const quietButton = {
  ...goldButton,
  minHeight: 44,
  padding: "0 18px",
  background: "transparent",
  border: `1px solid ${BORDER}`,
  color: INK,
  fontWeight: 600,
};

export const textarea = {
  width: "100%",
  minHeight: 110,
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid rgba(184,146,62,.45)",
  background: "#FFFFFF",
  color: INK,
  font: "inherit",
  fontSize: 16, // 16px stops iOS zooming into the field
  lineHeight: 1.55,
  resize: "vertical",
};
