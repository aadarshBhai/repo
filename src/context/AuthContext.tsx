import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  });

  const login = useCallback((t: string) => {
    const v = String(t);
    setToken(v);
    try { localStorage.setItem('auth_token', v); } catch {}
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    try { localStorage.removeItem('auth_token'); } catch {}
  }, []);

  const value = useMemo(() => ({ token, isAuthenticated: Boolean(token), login, logout }), [token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
