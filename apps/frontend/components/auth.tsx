'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextValue {
  accessToken: string | null;
  orgId: string | null;
  setAuth: (token: string, orgId: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ff_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setAccessToken(parsed.accessToken);
      setOrgId(parsed.orgId);
    }
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      orgId,
      setAuth: (token: string, org: string) => {
        setAccessToken(token);
        setOrgId(org);
        localStorage.setItem('ff_auth', JSON.stringify({ accessToken: token, orgId: org }));
      },
      clearAuth: () => {
        setAccessToken(null);
        setOrgId(null);
        localStorage.removeItem('ff_auth');
      },
    }),
    [accessToken, orgId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
