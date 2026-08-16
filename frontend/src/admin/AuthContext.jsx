import { useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "../lib/api";
import { AuthContext } from "./authContextInstance";
import { MOCK_AUTH, MOCK_USER } from "./authFlags";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (MOCK_AUTH ? MOCK_USER : null));
  const [loading, setLoading] = useState(() => !MOCK_AUTH && !!getToken());

  useEffect(() => {
    if (MOCK_AUTH || !getToken()) return;
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    if (MOCK_AUTH) {
      setUser(MOCK_USER);
      return;
    }
    const { token, user } = await api.login(email, password);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    if (MOCK_AUTH) {
      setUser(null);
      return;
    }
    try {
      await api.logout();
    } catch {
      // token may already be invalid — clear locally regardless
    }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
