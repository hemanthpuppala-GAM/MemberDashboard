import { useAdminTheme } from "./useAdminTheme";
import "./admin-theme.css";

/**
 * Applies the user's text-size preference as a whole-shell zoom (most admin text
 * uses fixed px sizes, not rem, so a root font-size bump alone wouldn't reach it)
 * plus the resolved color-preset/font CSS variables. The outer div keeps the real
 * viewport-sized box (so h-dvh math inside stays correct); the inner div is the
 * one actually scaled, pre-sized larger/smaller by the inverse factor so it still
 * fills the outer box exactly after the transform.
 */
export default function ScaledShell({ className = "", children }) {
  const { scale, resolvedTheme, cssVars } = useAdminTheme();

  return (
    <div className="h-dvh w-full overflow-hidden">
      <div
        style={{
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className={`admin-shell h-full ${className}`} data-theme={resolvedTheme} style={cssVars}>
          {children}
        </div>
      </div>
    </div>
  );
}
