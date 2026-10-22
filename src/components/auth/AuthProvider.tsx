"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, AuthSession, AuthUser, clearAuthSession, getRefreshToken, requestAuthSession, restoreAuthSession, saveAuthSession } from "@/lib/axios";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  acceptSession: (session: AuthSession) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    restoreAuthSession()
      .then(async () => {
        const response = await api.get<{ data: { user: AuthUser } }>("/auth/me");
        if (mounted) setUser(response.data.data.user);
      })
      .catch(() => clearAuthSession())
      .finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  const acceptSession = useCallback((session: AuthSession) => {
    saveAuthSession(session);
    setUser(session.user);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await requestAuthSession(email, password);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } finally {
      clearAuthSession();
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, ready, acceptSession, signIn, signOut }), [user, ready, acceptSession, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
