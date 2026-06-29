import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient } from '../../api/client';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ user: User }>('/auth/me')
      .then(({ user: u }) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, accessToken } = await apiClient.post<{ user: User; accessToken: string }>('/auth/login', { email, password });
    apiClient.setAccessToken(accessToken);
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { user: u, accessToken } = await apiClient.post<{ user: User; accessToken: string }>('/auth/register', { email, password, name });
    apiClient.setAccessToken(accessToken);
    setUser(u);
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
