import React, { createContext, useContext, useState } from 'react';

interface AuthContextValue {
  userId: string | null;
  userEmail: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function consumeOAuthParams(): { userId: string | null; email: string | null } {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const email = params.get('email');
  if (userId) {
    localStorage.setItem('ce_userId', userId);
    if (email) localStorage.setItem('ce_email', email);
    window.history.replaceState({}, '', window.location.pathname);
  }
  return { userId, email };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
    const { userId: fromUrl } = consumeOAuthParams();
    return fromUrl ?? localStorage.getItem('ce_userId');
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('ce_email'));

  async function login() {
    const res = await fetch('/oauth/google/login');
    const authUrl: string = await res.json();
    window.location.href = authUrl;
  }

  function logout() {
    localStorage.removeItem('ce_userId');
    localStorage.removeItem('ce_email');
    setUserId(null);
    setUserEmail(null);
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
