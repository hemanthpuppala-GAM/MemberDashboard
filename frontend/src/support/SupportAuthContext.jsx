import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMemberAuth } from "../auth/MemberAuthContext";
import { getLastMember, oauthRedirectUrl } from "../lib/memberAuth";
import {
  adminTokenRefused,
  currentTokenKind,
  hasAdminToken,
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

const ADMIN_REFUSED_NOTICE =
  "Your admin sign-in can't open the desk (it needs access to Queries). Sign in below, or ask an admin to add Queries to your role.";

/** Validate the stored token(s): core support token first, then the admin token, then the member (Google) token. */
async function resolveAgent() {
  // A 401 clears a support/member token; a refused admin token is skipped (never deleted) — see supportApi. So this loop ends.
  let adminRefused = false;
  while (currentTokenKind()) {
    const kind = currentTokenKind();
    try {
      const { agent } = await supportApi.me();
      return { status: "in", agent };
    } catch (err) {
      if (kind === "admin" && (err.status === 401 || err.status === 403)) {
        adminRefused = err.status === 403;
        continue;
      }
      if (err.status === 401) continue;
      if (err.status === 403 && kind === "member") return { status: "forbidden" };
      return { status: "signedOut", notice: err.status === 403 ? "" : err.message };
    }
  }
  return { status: "signedOut", notice: adminRefused ? ADMIN_REFUSED_NOTICE : "" };
}

export function SupportAuthProvider({ children }) {
  const memberAuth = useMemberAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(() => (currentTokenKind() ? "checking" : "signedOut"));
  const [agent, setAgent] = useState(null);
  const [notice, setNotice] = useState("");

  const check = useCallback(async () => {
    if (currentTokenKind()) setStatus("checking");
    const result = await resolveAgent();
    setAgent(result.agent ?? null);
    if (result.notice) setNotice(result.notice);
    setStatus(result.status);
  }, []);

  useEffect(() => {
    // Member auth (Google) also validates its token on load; wait for it to settle first.
    if (memberAuth.loading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off token validation on load
    check();
  }, [memberAuth.loading, check]);

  // While signed in, any 401/403 from the API means the session is gone.
  useEffect(() => {
    if (status !== "in") return undefined;
    setUnauthorizedHandler((err) => {
      setAgent(null);
      // The admin token was turned away (now skipped): try whatever sign-in is left (support / Google).
      if (err.tokenKind === "admin") check();
      else if (err.status === 403 && err.tokenKind === "member") setStatus("forbidden");
      else {
        setNotice(err.status === 401 ? "Your session ended. Please sign in again." : err.message);
        setStatus("signedOut");
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [status, check]);

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
    } else if (kind === "admin") {
      // Admin staff: just leave the desk. The admin sign-in belongs to the admin panel; keep it.
      navigate("/admin");
      return;
    } else if (kind === "member") {
      // Volunteers share a device often: sign the Google account out too.
      await memberLogout();
    }
    setAgent(null);
    setNotice("");
    setStatus("signedOut");
  }, [memberLogout, navigate]);

  const value = useMemo(
    () => ({
      status,
      agent,
      notice,
      setNotice,
      tokenKind: currentTokenKind(),
      hasAdminSession: hasAdminToken(),
      adminRefused: adminTokenRefused(),
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
