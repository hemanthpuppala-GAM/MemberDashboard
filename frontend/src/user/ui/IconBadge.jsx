const TONES = {
  blue: "bg-[rgba(168,185,160,0.18)] text-[var(--color-blue-dark)]",
  gold: "bg-[rgba(198,161,91,0.32)] text-[var(--color-gold-deep)]",
  crown: "bg-[rgba(170,139,194,0.28)] text-[#6b5480]",
  thirdeye: "bg-[rgba(145,135,184,0.28)] text-[#5a5480]",
  throat: "bg-[rgba(121,175,192,0.28)] text-[#3e6e7d]",
  solar: "bg-[rgba(214,184,92,0.30)] text-[#8a6e1f]",
  sacral: "bg-[rgba(217,154,98,0.28)] text-[#8a5a2e]",
  root: "bg-[rgba(201,107,107,0.28)] text-[#8a3e3e]",
  live: "bg-[rgba(122,155,110,0.24)] text-[#2f8a4d]",
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
