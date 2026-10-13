import { Video } from "lucide-react";
import Youtube from "./YoutubeIcon";
import Button from "../../components/ui/Button";

/** Opens the session where it happens — Zoom for the group sits, YouTube for the live stream. */
export default function JoinButton({ sit, size = "md", className = "" }) {
  const yt = sit.kind === "youtube";
  const Icon = yt ? Youtube : Video;
  const label = yt ? (sit.live ? "Watch live" : "Open YouTube") : sit.live ? "Join now on Zoom" : "Join on Zoom";
  if (!sit.joinUrl) return null;
  return (
    <Button
      href={sit.joinUrl}
      target="_blank"
      rel="noopener noreferrer"
      variant={sit.live || size === "lg" ? "primary" : "secondary"}
      className={`${size === "lg" ? "!px-7 !py-3 !text-[15px]" : "!px-4 !py-2 !text-[13px]"} ${className}`}
    >
      <Icon size={size === "lg" ? 18 : 15} />
      {label}
    </Button>
  );
}
