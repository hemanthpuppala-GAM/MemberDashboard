import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import Button from "../../components/ui/Button";
import { memberAuthApi } from "../../lib/memberAuth";

function formatSessionTime(iso) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

function joinButtonLabel(session) {
  if (!session.is_live) return "Not live yet";
  return session.join_url ? "Join now" : "Link not set yet";
}

export default function JoinLivePage() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    memberAuthApi
      .liveSessions()
      .then(setSessions)
      .catch((e) => setError(e.message || "Could not load live sessions."));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[22px] text-[var(--color-ink)]">Join live</h2>
        <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">Sit with the community in real time.</p>
      </div>

      {error && <p className="rounded-xl border border-red-400/30 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{error}</p>}

      {!error && sessions && sessions.length === 0 && (
        <Card padded={false}>
          <EmptyState icon={Radio} title="No sessions scheduled" description="Check back soon — group sessions will appear here as they're scheduled." />
        </Card>
      )}

      {sessions?.map((session) => {
        const canJoin = session.is_live && !!session.join_url;
        return (
          <Card key={session.id} accent={session.is_live}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                  {session.is_live && (
                    <span
                      className="pointer-events-none absolute top-1/2 left-1/2 animate-ripple rounded-full bg-[var(--color-gold-live)]/50"
                      style={{ width: 48, height: 48 }}
                    />
                  )}
                  <span
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full ${
                      session.is_live
                        ? "bg-[rgba(122,155,110,0.22)] text-[#2f8a4d]"
                        : "bg-[rgba(168,185,160,0.18)] text-[var(--color-blue-dark)]"
                    }`}
                  >
                    <Radio size={20} />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[var(--color-ink)]">{session.title}</span>
                    {session.is_live && (
                      <span className="rounded-full bg-[var(--color-gold-live)] px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-white uppercase shadow-[0_0_10px_rgba(122,155,110,0.55)]">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-[var(--color-ink-soft)]">
                    {formatSessionTime(session.starts_at)}
                    {session.teacher ? ` · ${session.teacher}` : ""}
                  </div>
                </div>
              </div>
              <Button
                as={canJoin ? "a" : "button"}
                href={canJoin ? session.join_url : undefined}
                target={canJoin ? "_blank" : undefined}
                rel={canJoin ? "noopener noreferrer" : undefined}
                disabled={!canJoin}
                className={!canJoin ? "pointer-events-none opacity-50" : ""}
              >
                {joinButtonLabel(session)}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
