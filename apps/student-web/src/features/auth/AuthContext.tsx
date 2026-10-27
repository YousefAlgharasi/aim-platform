import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient, type SessionTokens } from '../../api/client';
import type { User } from '../../types';

// Mirrors the Flutter sign-in sequence: POST /auth/login → POST /auth/bootstrap → GET /auth/me.

interface AuthMeResponse {
  user: { id: string; email?: string; userType?: string; status?: string };
  profile?: {
    id: string;
    profileType: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    preferredLanguage?: string | null;
  } | null;
  roles: string[];
}

interface LoginResponse extends SessionTokens {
  user: { id: string; email: string | null };
}

interface RegisterResponse extends Partial<SessionTokens> {
  requiresEmailConfirmation: boolean;
  user?: { id: string; email: string | null };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  /** True after the session ended because the refresh token was rejected. */
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  /** Re-reads /auth/me, e.g. after the profile was edited. */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

function toUser(me: AuthMeResponse): User {
  const email = me.user.email ?? '';
  const studentProfile = me.profile?.profileType === 'student_profile' ? me.profile : null;
  return {
    id: me.user.id,
    email,
    name: me.profile?.displayName?.trim() || email.split('@')[0] || 'Student',
    locale: me.profile?.preferredLanguage === 'ar' ? 'ar' : 'en',
    avatarUrl: me.profile?.avatarUrl ?? undefined,
    userType: me.user.userType,
    roles: me.roles ?? [],
    studentProfileId: studentProfile?.id,
  };
}

async function loadUser(): Promise<User> {
  return toUser(await apiClient.get<AuthMeResponse>('/auth/me'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!apiClient.hasSession()) {
      setLoading(false);
      return;
    }
    loadUser()
      .then(setUser)
      .catch(() => {
        apiClient.setSession(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(
    () =>
      apiClient.onSessionExpired(() => {
        setUser(null);
        setSessionExpired(true);
      }),
    [],
  );

  const startSession = useCallback(async (tokens: SessionTokens) => {
    apiClient.setSession(tokens);
    try {
      await apiClient.post('/auth/bootstrap');
      setUser(await loadUser());
      setSessionExpired(false);
    } catch (err) {
      apiClient.setSession(null);
      throw err;
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiClient.post<LoginResponse>(
        '/auth/login',
        { email: email.trim(), password },
        { auth: false },
      );
      await startSession(result);
    },
    [startSession],
  );

  const googleLogin = useCallback(
    async (idToken: string) => {
      const result = await apiClient.post<LoginResponse>('/auth/google', { idToken }, { auth: false });
      await startSession(result);
    },
    [startSession],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await apiClient.post<RegisterResponse>(
        '/auth/register',
        { email: email.trim(), password, redirectUrl: `${window.location.origin}/login` },
        { auth: false },
      );
      if (result.requiresEmailConfirmation || !result.accessToken || !result.refreshToken) {
        return { requiresEmailConfirmation: true };
      }
      await startSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt ?? 0,
      });
      if (name.trim()) {
        await apiClient.patch('/profile/me', { displayName: name.trim() });
        setUser(await loadUser());
      }
      return { requiresEmailConfirmation: false };
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Local tokens are discarded regardless of the server outcome.
    }
    apiClient.setSession(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await loadUser());
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, sessionExpired, login, googleLogin, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
