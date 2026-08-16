import { Toaster } from "react-hot-toast";
import { useAdminTheme } from "../theme/useAdminTheme";

/** react-hot-toast portals to document.body, outside .admin-shell's CSS-var scope — style it with resolved JS colors instead. */
export default function AdminToaster() {
  const { theme } = useAdminTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? "#1A1D27" : "#FFFFFF",
          color: isDark ? "#F1F3F9" : "#111827",
          border: `1px solid ${isDark ? "#2D3244" : "#E5E7EB"}`,
          fontFamily: "Inter, sans-serif",
          fontSize: "13.5px",
          boxShadow: isDark ? "0 12px 32px -16px rgba(0,0,0,0.55)" : "0 12px 32px -16px rgba(17,24,39,0.18)",
        },
        success: { iconTheme: { primary: "#10B981", secondary: "#fff" }, duration: 3000 },
        error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
      }}
    />
  );
}
