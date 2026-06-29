import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient } from '../../api/client';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ user: User }>('/auth/me')
      .then(async ({ user: u }) => {
        await apiClient.post('/auth/bootstrap', {});
        setUser(u);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, accessToken } = await apiClient.post<{ user: User; accessToken: string }>('/auth/login', { email, password });
    apiClient.setAccessToken(accessToken);
    await apiClient.post('/auth/bootstrap', {});
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await apiClient.post<{ requiresEmailConfirmation: boolean; user?: User; accessToken?: string }>('/auth/register', {
      email,
      password,
      redirectUrl: `${window.location.origin}/login`,
    });
    if (result.requiresEmailConfirmation || !result.accessToken || !result.user) {
      return { requiresEmailConfirmation: true };
    }
    apiClient.setAccessToken(result.accessToken);
    await apiClient.post('/auth/bootstrap', {});
    if (name) {
      await apiClient.patch('/profile/me', { displayName: name });
    }
    setUser(result.user);
    return { requiresEmailConfirmation: false };
  }, []);

  const logout = useCallback(async () => {
    await apiClient.post('/auth/logout', {});
    apiClient.setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
