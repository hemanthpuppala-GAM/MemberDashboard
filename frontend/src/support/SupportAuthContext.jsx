import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMemberAuth } from "../auth/MemberAuthContext";
import { getLastMember, getMemberToken, oauthRedirectUrl } from "../lib/memberAuth";
import {
  currentTokenKind,
  getSupportToken,
  rememberReturnToDesk,
  setSupportToken,
  setUnauthorizedHandler,
  supportApi,
} from "./supportApi";

/**
 * Who is on the desk. status:
 *  "checking"  — validating a stored token
 *  "signedOut" — show the login screen
 *  "forbidden" — signed in with Google, but that email isn't on the support team
 *  "in"        — agent is set
 */
const SupportAuthContext = createContext(null);

export function SupportAuthProvider({ children }) {
  const memberAuth = useMemberAuth();
  const [status, setStatus] = useState(() => (currentTokenKind() ? "checking" : "signedOut"));
  const [agent, setAgent] = useState(null);
  const [notice, setNotice] = useState("");

  const check = useCallback(async () => {
    if (!currentTokenKind()) {
      setStatus("signedOut");
      return;
    }
    setStatus("checking");
    try {
      const { agent: a } = await supportApi.me();
      setAgent(a);
      setStatus("in");
    } catch (err) {
      if (err.status === 403 && currentTokenKind() === "member") {
        setStatus("forbidden");
      } else if (err.status === 401 && currentTokenKind()) {
        // The core token expired; a member token may still get a volunteer in.
        check();
      } else if (err.status === 401 || err.status === 403) {
        setStatus("signedOut");
      } else {
        setNotice(err.message);
        setStatus("signedOut");
      }
    }
  }, []);

  useEffect(() => {
    // Member auth (Google) also validates its token on load; wait for it to settle first.
    if (memberAuth.loading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off token validation on mount
    check();
  }, [memberAuth.loading, check]);

  // While signed in, any 401/403 from the API means the session is gone.
  useEffect(() => {
    if (status !== "in") return undefined;
    setUnauthorizedHandler((err) => {
      setAgent(null);
      if (err.status === 403 && currentTokenKind() === "member") setStatus("forbidden");
      else {
        setNotice(err.status === 401 ? "Your session ended. Please sign in again." : err.message);
        setStatus("signedOut");
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [status]);

  const loginCore = useCallback(async (phone, pin) => {
    const { token, agent: a } = await supportApi.login(phone, pin);
    setSupportToken(token);
    setNotice("");
    setAgent(a);
    setStatus("in");
  }, []);

  const startGoogle = useCallback(() => {
    rememberReturnToDesk();
    window.location.href = oauthRedirectUrl("google");
  }, []);

  const { logout: memberLogout } = memberAuth;
  const logout = useCallback(async () => {
    const kind = currentTokenKind();
    if (kind === "support") {
      try {
        await supportApi.logout();
      } catch {
        /* clear locally anyway */
      }
      setSupportToken(null);
    } else if (kind === "member") {
      // Volunteers share a device often: sign the Google account out too.
      await memberLogout();
    }
    setAgent(null);
    setNotice("");
    setStatus("signedOut");
  }, [memberLogout]);

  const value = useMemo(
    () => ({
      status,
      agent,
      notice,
      setNotice,
      tokenKind: getSupportToken() ? "support" : getMemberToken() ? "member" : null,
      memberEmail: memberAuth.user?.email ?? getLastMember()?.email ?? null,
      hasMemberSession: !!memberAuth.user,
      loginCore,
      startGoogle,
      logout,
    }),
    [status, agent, notice, memberAuth.user, loginCore, startGoogle, logout],
  );

  return <SupportAuthContext.Provider value={value}>{children}</SupportAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSupportAuth() {
  const ctx = useContext(SupportAuthContext);
  if (!ctx) throw new Error("useSupportAuth must be used within SupportAuthProvider");
  return ctx;
}
