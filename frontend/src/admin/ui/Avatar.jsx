const COLORS = ["#2F9FD1", "#9D8FE0", "#4A9D63", "#C07A2E", "#C0554A", "#7FB0E0"];

function hashColor(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export default function Avatar({ name = "", size = 32, className = "" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4, background: hashColor(name) }}
    >
      {initials || "?"}
    </div>
  );
}
