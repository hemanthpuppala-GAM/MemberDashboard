import Starfield from "./Starfield";

/**
 * Background atmosphere for non-hub section views.
 * Hub photo is full-bleed inside HeroSection.
 */
export default function PageAtmosphere({ showFigure = true }) {
  return (
    <>
      {/* Soft radial glow — only when a chakra section is open */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 40%, rgba(200,185,217,0.22) 0%, rgba(200,185,217,0.08) 55%, transparent 80%)",
          opacity: showFigure ? 0 : 1,
          transition: "opacity 0.6s ease",
        }}
      />

      {/* Bottom fade behind footer — skip on hub so the photo stays edge-to-edge */}
      {!showFigure && (
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-[1] h-[100px]"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to top, rgba(252,250,245,0.80) 0%, rgba(252,250,245,0.30) 40%, transparent 100%)",
          }}
        />
      )}

      {!showFigure && <Starfield />}
    </>
  );
}
