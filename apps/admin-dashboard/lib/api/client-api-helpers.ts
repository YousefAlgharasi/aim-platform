const BACKEND_BASE_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? 'http://localhost:3000')
    : 'http://localhost:3000';

export function backendUrl(path: string): string {
  const base = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL.slice(0, -1) : BACKEND_BASE_URL;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getAuthHeaders(): HeadersInit {
  const token = document.cookie
    .split('; ')
    .find((c) => c.startsWith('aim_admin_access_token='))
    ?.split('=')
    .slice(1)
    .join('=');
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = { ...getAuthHeaders(), ...(init?.headers ?? {}) };
  return fetch(backendUrl(path), { ...init, headers, credentials: 'omit' });
}

export async function backendGet<T>(path: string): Promise<T> {
  const res = await backendFetch(path);
  if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return (json?.data ?? json) as T;
}

export async function backendFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await backendFetch(path, init);
  if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return (json?.data ?? json) as T;
}
