import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const syncFromStorage = useCallback(() => {
    const ut = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    const at = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    setIsAuthenticated(Boolean(ut || at));
  }, []);

  useEffect(() => {
    syncFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'userToken' || e.key === 'adminToken') {
        syncFromStorage();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  }, [syncFromStorage]);

  const login = useCallback((token?: string) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('userToken', token);
    }
    syncFromStorage();
  }, [syncFromStorage]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminToken');
    }
    syncFromStorage();
  }, [syncFromStorage]);

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
