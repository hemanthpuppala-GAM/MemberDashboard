import { ArrowLeft, LogOut, PhoneCall } from "lucide-react";
import { KIND_LABELS } from "../format";
import { Button } from "./ui";

/**
 * Dark band at the top of the desk: title, who is signed in, Log a call, Log out.
 * `viaAdmin`: signed in with the admin-panel login — the button goes back to the admin panel instead.
 */
export default function DeskHeader({ agent, onLogCall, onLogout, loggingOut, viaAdmin = false }) {
  const LeaveIcon = viaAdmin ? ArrowLeft : LogOut;
  const leaveLabel = viaAdmin ? "Back to admin" : "Log out";
  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(232,207,131,0.14)] bg-[#14241C] text-[#F6F1E6]">
      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 pb-2.5 pt-[calc(10px+env(safe-area-inset-top))] sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[rgba(246,241,230,0.6)]">Golden Age Wisdom</p>
          <h1 className="text-[24px] leading-tight text-[#E8CF83] sm:text-[28px]">Support desk</h1>
        </div>
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-[14px] font-semibold">{agent?.name}</p>
          <p className="text-[12px] text-[rgba(246,241,230,0.65)]">{KIND_LABELS[agent?.kind] ?? ""}</p>
        </div>
        <div className="hidden sm:block">
          <Button variant="primary" onClick={onLogCall}>
            <PhoneCall size={16} aria-hidden /> Log a call / WhatsApp
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          busy={loggingOut}
          className="text-[#F6F1E6]! hover:bg-[rgba(246,241,230,0.1)]!"
          aria-label={leaveLabel}
        >
          {!loggingOut && <LeaveIcon size={17} aria-hidden />}
          <span className="hidden sm:inline">{leaveLabel}</span>
        </Button>
      </div>
      <p className="mx-auto max-w-[1320px] truncate px-4 pb-2 text-[12.5px] text-[rgba(246,241,230,0.7)] sm:hidden">
        Signed in as <strong className="text-[#F6F1E6]">{agent?.name}</strong> · {KIND_LABELS[agent?.kind] ?? ""}
      </p>
    </header>
  );
}
