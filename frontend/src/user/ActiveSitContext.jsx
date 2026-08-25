import { createContext, useCallback, useContext, useRef, useState } from "react";
import { DoorOpen } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "../components/ui/Button";

const ActiveSitContext = createContext(null);

/**
 * Lets Sit & Scribe register an in-progress session as a navigation guard —
 * any other part of the dashboard (sidebar links, sign out, "change session")
 * routes leaving-while-active through the same confirm-and-save prompt instead
 * of each needing its own copy of the logic.
 */
export function ActiveSitProvider({ children }) {
  const guardRef = useRef(null);
  const [hasActiveSit, setHasActiveSit] = useState(false);
  const [prompt, setPrompt] = useState(null); // { elapsedMinutes, proceed } | null
  const [saving, setSaving] = useState(false);

  const setGuard = useCallback((guard) => {
    guardRef.current = guard;
    setHasActiveSit(true);
  }, []);

  const clearGuard = useCallback(() => {
    guardRef.current = null;
    setHasActiveSit(false);
  }, []);

  /** Call before navigating away from anywhere in the dashboard; runs `proceed` immediately if no sit is active. */
  const requestNavigation = useCallback((proceed) => {
    const guard = guardRef.current;
    if (!guard) {
      proceed();
      return;
    }
    guard.pause?.();
    setPrompt({ elapsedMinutes: guard.getElapsedMinutes(), proceed });
  }, []);

  const confirm = async () => {
    setSaving(true);
    try {
      await guardRef.current?.onLeave?.();
    } catch {
      /* still leave even if the partial session couldn't be saved */
    } finally {
      setSaving(false);
      const proceed = prompt?.proceed;
      setPrompt(null);
      proceed?.();
    }
  };

  const cancel = () => setPrompt(null);

  return (
    <ActiveSitContext.Provider value={{ hasActiveSit, setGuard, clearGuard, requestNavigation }}>
      {children}
      <Modal
        open={!!prompt}
        onClose={cancel}
        title="Leave this sit?"
        description={
          prompt
            ? `You've sat for about ${prompt.elapsedMinutes} minute${prompt.elapsedMinutes === 1 ? "" : "s"}. Leave now and we'll save that as today's practice, or stay and keep going.`
            : ""
        }
      >
        <div className="flex justify-end gap-2">
          <Button as="button" variant="secondary" onClick={cancel} disabled={saving}>
            Stay
          </Button>
          <Button as="button" onClick={confirm} disabled={saving}>
            <DoorOpen size={15} />
            {saving ? "Saving…" : "Leave & save"}
          </Button>
        </div>
      </Modal>
    </ActiveSitContext.Provider>
  );
}

export function useActiveSit() {
  const ctx = useContext(ActiveSitContext);
  if (!ctx) throw new Error("useActiveSit must be used within ActiveSitProvider");
  return ctx;
}
