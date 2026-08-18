const TONES = {
  blue: "bg-[rgba(110,198,234,0.18)] text-[var(--color-blue-dark)]",
  gold: "bg-[rgba(243,216,154,0.32)] text-[#9a7a2e]",
  crown: "bg-[rgba(201,166,240,0.28)] text-[#7d5bb8]",
  thirdeye: "bg-[rgba(157,143,224,0.28)] text-[#6a58b8]",
  throat: "bg-[rgba(127,176,224,0.28)] text-[#3d7bb0]",
  solar: "bg-[rgba(230,201,106,0.30)] text-[#8a6f1a]",
  sacral: "bg-[rgba(237,160,106,0.28)] text-[#b5641c]",
  root: "bg-[rgba(224,138,138,0.28)] text-[#b53f3f]",
  live: "bg-[rgba(93,184,117,0.24)] text-[#2f8a4d]",
};

export default function IconBadge({ icon: Icon, tone = "blue", size = 40, iconSize = 18, className = "" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${TONES[tone] ?? TONES.blue} ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} strokeWidth={2} />
    </div>
  );
}
