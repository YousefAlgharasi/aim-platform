import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { apiClient } from '../api/client';
import { AuthProvider } from '../features/auth/AuthContext';
import { useAuth } from '../hooks/useAuth';

jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));

const TOKENS = { accessToken: 'old-access', refreshToken: 'old-refresh', expiresAt: 1 };
const json = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, statusText: String(status), json: async () => body }) as Response;
const ok = (data: unknown) => json(200, { success: true, data });
const unauthorised = () => json(401, { success: false, error: { code: 'UNAUTHORIZED', statusCode: 401, message: 'Expired' } });

type Route = (url: string, init?: RequestInit) => Response | Promise<Response>;
function mockFetch(route: Route) {
  const fn = jest.fn(async (url: string, init?: RequestInit) => route(url, init));
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}
const calls = (fn: jest.Mock, part: string) => fn.mock.calls.filter(([u]) => String(u).includes(part)).length;

const originalFetch = global.fetch;
let expired: jest.Mock;
let unsubscribe: () => void;

beforeEach(() => {
  apiClient.setSession(TOKENS);
  expired = jest.fn();
  unsubscribe = apiClient.onSessionExpired(expired);
});
afterEach(() => {
  unsubscribe();
  apiClient.setSession(null);
  global.fetch = originalFetch;
});

describe('apiClient — expired access token', () => {
  it('renews the session and repeats the request', async () => {
    let attempt = 0;
    const fetchFn = mockFetch((url) => {
      if (url.includes('/auth/refresh')) return ok({ accessToken: 'new-access', refreshToken: 'new-refresh', expiresAt: 2 });
      return ++attempt === 1 ? unauthorised() : ok({ hello: 'world' });
    });
    await expect(apiClient.get('/student/courses')).resolves.toEqual({ hello: 'world' });
    expect(calls(fetchFn, '/auth/refresh')).toBe(1);
    expect(localStorage.getItem('aim_access_token')).toBe('new-access');
    expect(expired).not.toHaveBeenCalled();
  });

  it('shares ONE refresh between requests that expire together', async () => {
    const seen: string[] = [];
    const fetchFn = mockFetch((url, init) => {
      if (url.includes('/auth/refresh')) return ok({ accessToken: 'new-access', refreshToken: 'new-refresh', expiresAt: 2 });
      const auth = (init?.headers as Record<string, string>).Authorization;
      seen.push(auth);
      return auth === 'Bearer old-access' ? unauthorised() : ok({});
    });
    await Promise.all([apiClient.get('/a'), apiClient.get('/b'), apiClient.get('/c')]);
    expect(calls(fetchFn, '/auth/refresh')).toBe(1);
    expect(seen.filter((a) => a === 'Bearer new-access')).toHaveLength(3);
  });

  it('keeps the student signed in when the connection drops during the renewal', async () => {
    mockFetch((url) => {
      if (url.includes('/auth/refresh')) throw new TypeError('Failed to fetch');
      return unauthorised();
    });
    await expect(apiClient.get('/student/courses')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(apiClient.hasSession()).toBe(true);
    expect(localStorage.getItem('aim_refresh_token')).toBe('old-refresh');
    expect(expired).not.toHaveBeenCalled();
  });

  it.each([502, 503, 500, 429])('keeps the student signed in when the server answers %i to the renewal (restarting / busy)', async (status) => {
    mockFetch((url) => (url.includes('/auth/refresh') ? json(status, {}) : unauthorised()));
    await expect(apiClient.get('/student/courses')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(apiClient.hasSession()).toBe(true);
    expect(expired).not.toHaveBeenCalled();
  });

  it('signs the student out only when the server rejects the refresh token', async () => {
    mockFetch((url) => (url.includes('/auth/refresh') ? json(401, { success: false, error: { code: 'INVALID', message: 'bad' } }) : unauthorised()));
    await expect(apiClient.get('/student/courses')).rejects.toMatchObject({ statusCode: 401 });
    expect(expired).toHaveBeenCalledTimes(1);
    expect(apiClient.hasSession()).toBe(false);
  });
});

function Probe() {
  const { user, loading } = useAuth();
  return <p data-testid="state">{loading ? 'loading' : user ? `user:${user.email}` : 'signed-out'}</p>;
}
const profile = { user: { id: 'u1', email: 'a@b.c', status: 'active', userType: 'student' }, profile: { id: 'p1', profileType: 'student_profile', displayName: 'A', preferredLanguage: 'en' }, roles: ['student'] };

describe('AuthProvider — restoring a saved session on load', () => {
  it('signs the student back in', async () => {
    mockFetch(() => ok(profile));
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('user:a@b.c'));
  });

  it('keeps the saved session when the server cannot be reached (offline or restarting)', async () => {
    mockFetch(() => { throw new TypeError('Failed to fetch'); });
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('signed-out'));
    expect(apiClient.hasSession()).toBe(true);
    expect(localStorage.getItem('aim_refresh_token')).toBe('old-refresh');
  });

  it('keeps the saved session when the server answers 503', async () => {
    mockFetch(() => json(503, {}));
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('signed-out'));
    expect(apiClient.hasSession()).toBe(true);
  });

  it('clears the session when the server really rejects it', async () => {
    mockFetch((url) => (url.includes('/auth/refresh') ? json(401, { success: false, error: { code: 'INVALID', message: 'bad' } }) : unauthorised()));
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('signed-out'));
    expect(apiClient.hasSession()).toBe(false);
  });
});
