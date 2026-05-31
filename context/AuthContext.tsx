'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { auth, type User, ApiError } from '@/lib/api';
import { storeSession, clearSession, getStoredToken, getStoredUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Validate stored session on mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) { setLoading(false); return; }

    // Use stored user immediately for fast paint
    setUser(getStoredUser());

    // Then validate with backend
    auth.me()
      .then(setUser)
      .catch((e: ApiError) => {
        if (e.status === 401 || e.status === 403) {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await auth.login({ email, password });
    storeSession(res.access_token, res.user);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    await auth.register({ email, password, full_name: fullName });
    // Register doesn't return a token — auto-login immediately
    const res = await auth.login({ email, password });
    storeSession(res.access_token, res.user);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
