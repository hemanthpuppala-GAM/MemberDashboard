import heroHari from "../../assets/hero-hari-day.png";
import Starfield from "./Starfield";

/**
 * Full-bleed hero photo + scrims + starfield.
 * bgLift pushes the figure down so the face clears the headline.
 */
export default function PageAtmosphere({ showFigure = true, bgLift = 0 }) {
  return (
    <>
      <div
        className="m-bg-wrap pointer-events-none absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: `translateY(${bgLift}px)` }}
        aria-hidden="true"
      >
        <img
          src={heroHari}
          alt=""
          width={2560}
          height={1525}
          fetchPriority="high"
          className="m-bg absolute inset-0 h-full w-full object-cover object-[50%_36%] origin-[50%_100%] scale-[0.98] transition-opacity duration-600"
          style={{ opacity: showFigure ? 1 : 0 }}
        />
      </div>

      <div
        className="m-scrim pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 46% 70% at 50% 48%, rgba(38,34,96,0.28) 0%, rgba(14,12,42,0.55) 55%, rgba(10,8,30,0.88) 82%, rgba(8,6,24,0.98) 100%),
            linear-gradient(180deg, rgba(11,8,24,0.82) 0%, rgba(11,8,24,0.45) 14%, rgba(11,8,24,0.12) 26%, rgba(13,10,28,0) 40%)
          `,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 40%, rgba(52,46,110,0.5) 0%, rgba(24,20,58,0.3) 55%, transparent 80%)",
          opacity: showFigure ? 0 : 1,
          transition: "opacity 0.6s ease",
        }}
      />

      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 z-[1] h-[170px]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(9,7,24,0.96) 0%, rgba(9,7,24,0.7) 45%, rgba(9,7,24,0) 100%)",
        }}
      />

      <Starfield />
    </>
  );
}
