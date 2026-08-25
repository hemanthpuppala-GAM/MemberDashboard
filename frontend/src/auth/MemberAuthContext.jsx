import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getLastMember,
  getMemberToken,
  memberAuthApi,
  setLastMember,
  setMemberToken,
} from "../lib/memberAuth";

const MemberAuthContext = createContext(null);

export function MemberAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getMemberToken());

  useEffect(() => {
    if (!getMemberToken()) {
      setLoading(false);
      return;
    }
    memberAuthApi
      .me()
      .then(({ user: u }) => {
        setUser(u);
        setLastMember(u);
      })
      .catch(() => setMemberToken(null))
      .finally(() => setLoading(false));
  }, []);

  const applySession = useCallback((token, nextUser, { demo = false } = {}) => {
    setMemberToken(token);
    setUser(nextUser);
    if (!demo) setLastMember(nextUser);
  }, []);

  const loginDemo = useCallback(async () => {
    const { token, user: u } = await memberAuthApi.demo();
    applySession(token, u, { demo: true });
    return u;
  }, [applySession]);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await memberAuthApi.login({ email, password });
    applySession(token, u);
    return u;
  }, [applySession]);

  const register = useCallback(async (name, email, password, password_confirmation, ref) => {
    const { token, user: u } = await memberAuthApi.register({ name, email, password, password_confirmation, ref });
    applySession(token, u);
    return u;
  }, [applySession]);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      setLastMember(next);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await memberAuthApi.logout();
    } catch {
      /* clear locally anyway */
    }
    setMemberToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, lastMember: getLastMember(), applySession, loginDemo, login, register, logout, updateUser }),
    [user, loading, applySession, loginDemo, login, register, logout, updateUser],
  );

  return <MemberAuthContext.Provider value={value}>{children}</MemberAuthContext.Provider>;
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error("useMemberAuth must be used within MemberAuthProvider");
  return ctx;
}
