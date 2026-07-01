import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  userId: string | null;
  userEmail: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtClaims(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

function consumeOAuthParams(): string | null {
  const params = new URLSearchParams(window.location.search);
  const authToken = params.get('authToken');
  const refreshToken = params.get('refreshToken');
  if (authToken) {
    localStorage.setItem('ce_authToken', authToken);
    if (refreshToken) localStorage.setItem('ce_refreshToken', refreshToken);
    window.history.replaceState({}, '', window.location.pathname);
    return authToken;
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return consumeOAuthParams() ?? localStorage.getItem('ce_authToken');
  });

  const claims = authToken ? decodeJwtClaims(authToken) : null;
  const userId = claims ? (claims['sub'] as string) : null;
  const userEmail = claims ? (claims['email'] as string) : null;

  useEffect(() => {
    const onExpired = () => {
      localStorage.removeItem('ce_authToken');
      localStorage.removeItem('ce_refreshToken');
      setAuthToken(null);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  async function login() {
    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    const res = await fetch(`${base}/oauth/google/login`);
    const authUrl: string = await res.json();
    window.location.href = authUrl;
  }

  function logout() {
    localStorage.removeItem('ce_authToken');
    localStorage.removeItem('ce_refreshToken');
    setAuthToken(null);
  }

  return (
    <AuthContext.Provider value={{ userId, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
