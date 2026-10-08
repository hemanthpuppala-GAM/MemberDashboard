import { useEffect, useState } from "react";
import { drawBrandedQr } from "./brandedQr";

/** Brand QR as an <img>; `resolution` is the canvas size, CSS size comes from className/style. */
export default function BrandedQr({ value, resolution = 512, alt, className = "", style }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    const canvas = document.createElement("canvas");
    drawBrandedQr(canvas, value, resolution).then(() => {
      if (!cancelled) setSrc(canvas.toDataURL("image/png"));
    });
    return () => {
      cancelled = true;
    };
  }, [value, resolution]);

  return src ? (
    <img src={src} alt={alt} className={className} style={style} />
  ) : (
    <span role="img" aria-label={alt} className={`block bg-[#FFFDF8] ${className}`} style={style} />
  );
}
